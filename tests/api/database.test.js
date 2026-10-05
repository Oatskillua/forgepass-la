// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'
import { beforeAll, afterAll, describe, expect, it } from 'vitest'

let db
const userA = '00000000-0000-0000-0000-000000000001'
const userB = '00000000-0000-0000-0000-000000000002'
const trip = '00000000-0000-0000-0000-000000000003'
const stopA = '00000000-0000-0000-0000-000000000004'
const stopB = '00000000-0000-0000-0000-000000000005'

beforeAll(async () => {
  db = new PGlite({ extensions: { pgcrypto } })
  // Minimal Auth schema and Supabase-style default grants. No hosted Auth is mocked into SQL.
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth, public to anon, authenticated;
    grant usage on schema public to service_role;
    grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    insert into auth.users(id) values ('00000000-0000-0000-0000-000000000009');
  `)
  const folder = new URL('../../supabase/migrations/', import.meta.url)
  for (const file of (await readdir(folder)).filter((file) => file.endsWith('.sql')).sort()) {
    await db.exec(await readFile(new URL(file, folder), 'utf8'))
  }
  await db.exec(`
    insert into auth.users(id) values ('${userA}'), ('${userB}');
    insert into public.itineraries(id,user_id,name) values ('${trip}','${userA}','Trip');
    insert into public.itinerary_items(id,itinerary_id,item_type,title,position)
      values ('${stopA}','${trip}','custom','First',0), ('${stopB}','${trip}','custom','Second',1);
    insert into public.notifications(user_id,category,title,body) values ('${userA}','system','Notice','Original');
  `)
}, 30000)
afterAll(async () => { await db?.close() })

async function asUser(id, callback, role = 'authenticated') {
  return db.transaction(async (tx) => {
    await tx.exec(`set local role ${role}`)
    await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [id])
    return callback(tx)
  })
}
function reorder(tx, expected, desired) {
  return tx.query('select public.reorder_itinerary_stops($1, $2::uuid[], $3::uuid[])', [trip, expected, desired])
}

describe('real SQL migration and permission checks', () => {
  it('supports server intake with defaults, unique waitlist email and feedback constraints', async () => {
    try {
      const entry = await asUser('', (tx) => tx.query("insert into waitlist(email) values ('test@example.com') returning id,created_at"), 'service_role')
      expect(entry.rows[0].id).toMatch(/^[0-9a-f-]{36}$/)
      expect(entry.rows[0].created_at).toBeTruthy()
      await expect(asUser('', (tx) => tx.query("insert into waitlist(email) values ('TEST@example.com')"), 'service_role')).rejects.toThrow('duplicate key')
      const feedback = await asUser('', (tx) => tx.query("insert into feedback(name,email,message) values ('Tester','test@example.com','Feedback') returning id,status"), 'service_role')
      expect(feedback.rows[0].status).toBe('new')
      await expect(asUser('', (tx) => tx.query("update feedback set status='invalid' where id=$1", [feedback.rows[0].id]), 'service_role')).rejects.toThrow('check constraint')
      await expect(asUser('', (tx) => tx.query("insert into feedback(name,email,message) values ('Tester','invalid','Feedback')"), 'service_role')).rejects.toThrow('check constraint')
      await expect(asUser('', (tx) => tx.query("insert into feedback(name,email,message) values ('Tester','test@example.com',$1)", ['x'.repeat(5001)]), 'service_role')).rejects.toThrow('check constraint')
    } finally { await db.exec('delete from waitlist; delete from feedback') }
  })
  it.each(['anon', 'authenticated'])('denies direct intake reads and writes to %s', async (role) => {
    for (const table of ['waitlist', 'feedback']) {
      for (const statement of [`select * from ${table}`, `delete from ${table}`, `update ${table} set email='other@example.com'`, `insert into ${table}(email) values ('test@example.com')`]) {
        await expect(asUser(userA, (tx) => tx.query(statement), role)).rejects.toThrow('permission denied')
      }
    }
  })
  it('refuses to overwrite existing intake tables when a legacy schema is encountered', async () => {
    const migration = await readFile(new URL('../../supabase/migrations/202609210001_intake_foundation.sql', import.meta.url), 'utf8')
    await expect(db.exec(migration)).rejects.toThrow('Existing intake tables detected')
    await db.exec('rollback')
    expect((await db.query("select to_regclass('public.waitlist') as name")).rows[0].name).toBe('waitlist')
  })
  it('shares only allowed fields and invalidates replaced and revoked links', async () => {
    const token = (await db.query('select share_token from itineraries where id=$1', [trip])).rows[0].share_token
    const read = (value) => asUser('', (tx) => tx.query('select get_shared_itinerary($1) as trip', [value]), 'anon')
    const change = (value, enabled, user = userA) => asUser(user, (tx) => tx.query('select set_itinerary_sharing($1,$2,$3) as trip', [trip, value, enabled]))
    try {
      expect((await read(token)).rows[0].trip).toBeNull()
      await expect(change(token, true, userB)).rejects.toThrow('Sharing changed')
      const enabled = (await change(token, true)).rows[0].trip
      const shared = (await read(enabled.share_token)).rows[0].trip
      expect(Object.keys(shared).sort()).toEqual(['ends_on', 'name', 'starts_on', 'stops'])
      expect(shared.stops).toHaveLength(2)
      expect(Object.keys(shared.stops[0]).sort()).toEqual(['starts_at', 'title'])
      const direct = await asUser('', (tx) => tx.query('select * from itineraries where id=$1', [trip]), 'anon')
      expect(direct.rows).toHaveLength(0)
      await expect(change(token, false)).rejects.toThrow('Sharing changed')
      const replacement = (await change(enabled.share_token, true)).rows[0].trip
      expect((await read(enabled.share_token)).rows[0].trip).toBeNull()
      expect((await read(replacement.share_token)).rows[0].trip.name).toBe('Trip')
      await change(replacement.share_token, false)
      expect((await read(replacement.share_token)).rows[0].trip).toBeNull()
      await expect(asUser('', (tx) => tx.query('select set_itinerary_sharing($1,$2,true)', [trip, token]), 'anon')).rejects.toThrow('permission denied')
    } finally { await db.query('update itineraries set is_public=false where id=$1', [trip]) }
  })
  it('persists owned visit times, rejects stale updates, and hides schedules from other users', async () => {
    try {
      const saved = await asUser(userA, (tx) => tx.query('update itinerary_items set starts_at=$1 where id=$2 and starts_at is null returning id', ['2026-10-10T18:30:00Z', stopA]))
      expect(saved.rows).toHaveLength(1)
      const stale = await asUser(userA, (tx) => tx.query('update itinerary_items set starts_at=null where id=$1 and starts_at is null returning id', [stopA]))
      expect(stale.rows).toHaveLength(0)
      const foreign = await asUser(userB, (tx) => tx.query('update itinerary_items set starts_at=null where id=$1 returning id', [stopA]))
      expect(foreign.rows).toHaveLength(0)
      const read = await asUser(userB, (tx) => tx.query('select starts_at from itinerary_items where id=$1', [stopA]))
      expect(read.rows).toHaveLength(0)
      const cleared = await asUser(userA, (tx) => tx.query('update itinerary_items set starts_at=null where id=$1 and starts_at=$2 returning id', [stopA, '2026-10-10T18:30:00Z']))
      expect(cleared.rows).toHaveLength(1)
    } finally { await db.query('update itinerary_items set starts_at=null where id=$1', [stopA]) }
  })
  it.each(['notifications', 'reward_transactions'])('pages %s across timestamp ties and new arrivals without exposing another account', async (table) => {
    const owner = '00000000-0000-0000-0000-000000000061'
    const rowId = (i) => '10000000-0000-0000-0000-' + String(i).padStart(12, '0')
    await db.query('insert into auth.users(id) values ($1)', [owner])
    const insert = (i, time) => table === 'notifications'
      ? db.query('insert into notifications(id,user_id,category,title,body,created_at) values($1,$2,\'system\',\'Test\',\'Body\',$3)', [rowId(i), owner, time])
      : db.query('insert into reward_transactions(id,user_id,transaction_type,points,description,created_at) values($1,$2,\'earn\',1,\'Test\',$3)', [rowId(i), owner, time])
    try {
      await insert(0, '2026-09-18T10:00:00Z')
      for (const i of [1, 2, 3]) await insert(i, '2026-09-19T10:00:00Z')
      const first = await asUser(owner, (tx) => tx.query(`select id from ${table} where user_id=$1 order by created_at desc,id desc limit 2`, [owner]))
      expect(first.rows.map((row) => row.id)).toEqual([rowId(3), rowId(2)])
      await insert(4, '2026-09-19T10:00:00Z')
      await insert(5, '2026-09-20T10:00:00Z')
      const next = (user) => asUser(user, (tx) => tx.query(`select id from ${table} where user_id=$1 and
        (created_at < $2::timestamptz or (created_at = $2::timestamptz and id < $3::uuid))
        order by created_at desc,id desc limit 2`, [owner, '2026-09-19T10:00:00Z', rowId(2)]))
      expect((await next(owner)).rows.map((row) => row.id)).toEqual([rowId(1), rowId(0)])
      expect((await next(userB)).rows).toEqual([])
    } finally { await db.query('delete from auth.users where id=$1', [owner]) }
  })
  it('saves account settings together and rolls back if preferences are missing', async () => {
    const account = '00000000-0000-0000-0000-000000000031'
    await db.query('insert into auth.users(id) values ($1)', [account])
    const save = (name) => asUser(account, (tx) => tx.query('select save_account_settings($1,$2,false,true,false,true,false)', [name, ' LA ']))
    await save(' Owner ')
    expect((await db.query('select full_name, home_city from profiles where id=$1', [account])).rows[0]).toEqual({ full_name: 'Owner', home_city: 'LA' })
    expect((await db.query('select event_reminders from notification_preferences where user_id=$1', [account])).rows[0].event_reminders).toBe(false)
    await db.query('delete from notification_preferences where user_id=$1', [account])
    await expect(save('Must roll back')).rejects.toThrow('Preferences unavailable')
    expect((await db.query('select full_name from profiles where id=$1', [account])).rows[0].full_name).toBe('Owner')
    await db.query('delete from auth.users where id=$1', [account])
  })
  it('denies anonymous account settings saves', async () => {
    await expect(asUser('', (tx) => tx.query("select save_account_settings('Name','City',true,true,true,true,false)"), 'anon')).rejects.toThrow(/permission denied/)
  })
  it('allows owned stop notes, denies cross-user writes and enforces the note limit', async () => {
    const edit = (user, notes) => asUser(user, (tx) => tx.query('update itinerary_items set notes=$1 where id=$2 returning id, notes', [notes, stopA]))
    expect((await edit(userB, 'Unauthorized')).rows).toEqual([])
    expect((await edit(userA, 'Bring tickets')).rows).toEqual([{ id: stopA, notes: 'Bring tickets' }])
    await expect(edit(userA, 'x'.repeat(2001))).rejects.toThrow(/check constraint/)
    expect((await edit(userA, null)).rows).toEqual([{ id: stopA, notes: null }])
  })
  it('duplicates dates and stop details with fresh identities and private visibility', async () => {
    const source = '00000000-0000-0000-0000-000000000021'
    await db.exec(`insert into itineraries(id,user_id,name,starts_on,ends_on,is_public)
      values('${source}','${userA}','Saved trip','2026-10-10','2026-10-12',true);
      insert into itinerary_items(itinerary_id,item_type,title,notes,position,external_id,location_snapshot)
      values('${source}','place','Museum','Bring tickets',5,'museum-1','{"address":"LA"}'),
        ('${source}','custom','Lunch','',9,null,'{}');`)
    const result = await asUser(userA, (tx) => tx.query('select duplicate_itinerary($1) as trip', [source]))
    const copy = result.rows[0].trip
    expect(copy.id).not.toBe(source)
    expect(copy.name).toBe('Saved trip (copy)')
    expect(copy.starts_on).toBe('2026-10-10')
    expect(copy.ends_on).toBe('2026-10-12')
    expect(copy.is_public).toBe(false)
    expect(copy.itinerary_items.map((stop) => stop.title)).toEqual(['Museum', 'Lunch'])
    expect(copy.itinerary_items.map((stop) => stop.position)).toEqual([0, 1])
    expect(copy.itinerary_items[0].location_snapshot).toEqual({ address: 'LA' })
    expect(copy.itinerary_items[0].notes).toBe('Bring tickets')
    await asUser(userA, (tx) => tx.query('delete from itinerary_items where itinerary_id=$1', [copy.id]))
    expect((await db.query('select count(*)::int as count from itinerary_items where itinerary_id=$1', [source])).rows[0].count).toBe(2)
    await db.query('delete from itineraries where id in ($1,$2)', [source, copy.id])
  })
  it('denies copying another account’s trip or anonymous duplication', async () => {
    await expect(asUser(userB, (tx) => tx.query('select duplicate_itinerary($1)', [trip]))).rejects.toThrow('Itinerary unavailable')
    await expect(asUser('', (tx) => tx.query('select duplicate_itinerary($1)', [trip]), 'anon')).rejects.toThrow(/permission denied/)
  })
  it('redeems once, preserves lifetime points and rejects changed retry payloads', async () => {
    const reward = '00000000-0000-0000-0000-000000000010'
    const key = '00000000-0000-0000-0000-000000000011'
    await db.exec(`update reward_accounts set available_points=100, lifetime_points=100 where user_id='${userB}';
      insert into rewards(id,title,points_cost,inventory) values('${reward}','Test perk',25,1);`)
    const call = (cost = 25) => asUser(userB, (tx) => tx.query('select redeem_reward($1,$2,$3) as receipt', [reward, cost, key]))
    const first = await call()
    expect((await call()).rows).toEqual(first.rows)
    await expect(call(26)).rejects.toThrow('different redemption')
    expect((await db.query(`select available_points, lifetime_points from reward_accounts where user_id='${userB}'`)).rows).toEqual([{ available_points: 75, lifetime_points: 100 }])
    expect((await db.query(`select inventory from rewards where id='${reward}'`)).rows).toEqual([{ inventory: 0 }])
    expect((await db.query(`select count(*)::int as count from reward_transactions where reward_id='${reward}'`)).rows).toEqual([{ count: 1 }])
  })
  it('rejects insufficient points and price changes without consuming inventory', async () => {
    const reward = '00000000-0000-0000-0000-000000000012'
    const key = '00000000-0000-0000-0000-000000000013'
    await db.exec(`insert into rewards(id,title,points_cost,inventory) values('${reward}','Costly perk',500,2)`)
    const call = (cost) => asUser(userA, (tx) => tx.query('select redeem_reward($1,$2,$3)', [reward, cost, key]))
    await expect(call(1)).rejects.toThrow('price changed')
    await expect(call(500)).rejects.toThrow('Insufficient points')
    expect((await db.query(`select inventory from rewards where id='${reward}'`)).rows).toEqual([{ inventory: 2 }])
  })
  it('supports zero-point rewards and denies anonymous redemption', async () => {
    const reward = '00000000-0000-0000-0000-000000000014'
    const key = '00000000-0000-0000-0000-000000000015'
    await db.exec(`insert into rewards(id,title,points_cost,inventory) values('${reward}','Free perk',0,1)`)
    await expect(asUser('', (tx) => tx.query('select redeem_reward($1,0,$2)', [reward, key]), 'anon')).rejects.toThrow(/permission denied/)
    await asUser(userA, (tx) => tx.query('select redeem_reward($1,0,$2)', [reward, key]))
    await expect(asUser(userB, (tx) => tx.query('select redeem_reward($1,0,$2)', [reward, key]))).rejects.toThrow('sold out')
  })
  it('backfills pre-existing Auth users with account records', async () => {
    const result = await asUser('00000000-0000-0000-0000-000000000009', (tx) => tx.query('select available_points from reward_accounts'))
    expect(result.rows).toEqual([{ available_points: 0 }])
  })
  it('permits profile editing but blocks cascading deletion', async () => {
    await asUser(userA, (tx) => tx.exec("update profiles set full_name='Visitor' where id=auth.uid()"))
    await expect(asUser(userA, (tx) => tx.exec('delete from profiles where id=auth.uid()'))).rejects.toThrow(/permission denied/)
  })
  it('initializes profiles, preferences and rewards for new accounts', async () => {
    const result = await asUser(userA, (tx) => tx.query('select available_points from reward_accounts where user_id=auth.uid()'))
    expect(result.rows).toEqual([{ available_points: 0 }])
  })
  it('hides another user’s itineraries and denies reordering them', async () => {
    expect((await asUser(userB, (tx) => tx.query('select * from itineraries'))).rows).toEqual([])
    await expect(asUser(userB, (tx) => reorder(tx, [stopA, stopB], [stopB, stopA]))).rejects.toThrow('Itinerary unavailable')
  })
  it('denies anonymous RPC access', async () => {
    await expect(asUser('', (tx) => reorder(tx, [stopA, stopB], [stopB, stopA]), 'anon')).rejects.toThrow(/permission denied/)
  })
  it('rejects duplicate IDs without modifying positions', async () => {
    await expect(asUser(userA, (tx) => reorder(tx, [stopA, stopB], [stopA, stopA]))).rejects.toThrow('Invalid stop order')
    const result = await asUser(userA, (tx) => tx.query('select id from itinerary_items order by position'))
    expect(result.rows.map((row) => row.id)).toEqual([stopA, stopB])
  })
  it('reorders atomically and rejects an outdated expected order', async () => {
    await asUser(userA, (tx) => reorder(tx, [stopA, stopB], [stopB, stopA]))
    await expect(asUser(userA, (tx) => reorder(tx, [stopA, stopB], [stopB, stopA]))).rejects.toThrow('Trip changed')
    expect((await asUser(userA, (tx) => tx.query('select id from itinerary_items order by position'))).rows.map((row) => row.id)).toEqual([stopB, stopA])
  })
  it('allows read status but denies notification content tampering', async () => {
    await asUser(userA, (tx) => tx.exec('update notifications set read_at=now()'))
    await expect(asUser(userA, (tx) => tx.exec("update notifications set body='Forged'"))).rejects.toThrow(/permission denied/)
  })
  it('denies self-assigned admin roles and reward balance writes', async () => {
    await expect(asUser(userA, (tx) => tx.exec(`insert into admin_roles(user_id,role) values ('${userA}','administrator')`))).rejects.toThrow(/row-level security/)
    const result = await asUser(userA, (tx) => tx.query('update reward_accounts set available_points=100 returning *'))
    expect(result.rows).toEqual([])
  })
})
