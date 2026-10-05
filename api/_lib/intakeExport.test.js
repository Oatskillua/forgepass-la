import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { intakeCount, loadIntakeExport } from './intakeExport.js'

const root = 'https://example.invalid'
function page(rows, total) {
  return { ok: true, headers: new Headers({ 'content-range': `0-${Math.max(0, rows.length - 1)}/${total}` }), json: async () => rows }
}
beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
afterEach(() => vi.unstubAllGlobals())

describe('intake export completeness', () => {
  it('continues through pages even if the server uses a smaller page limit', async () => {
    fetch.mockResolvedValueOnce(page([{ id: '1' }, { id: '2' }], 3))
      .mockResolvedValueOnce(page([{ id: '3' }], 3))
    expect(await loadIntakeExport(root, 'test-key', 'waitlist')).toEqual([{ id: '1' }, { id: '2' }, { id: '3' }])
    const first = new URL(fetch.mock.calls[0][0])
    const second = new URL(fetch.mock.calls[1][0])
    expect(second.searchParams.get('offset')).toBe('2')
    expect(first.searchParams.get('created_at')).toBe(second.searchParams.get('created_at'))
    expect(first.searchParams.get('order')).toBe('id.asc')
  })
  it('fails without returning partial data when a later page fails', async () => {
    fetch.mockResolvedValueOnce(page([{ id: '1' }], 2)).mockResolvedValueOnce({ ok: false })
    await expect(loadIntakeExport(root, 'test-key', 'feedback')).rejects.toThrow('No partial export')
  })
  it('rejects changing totals and duplicate rows', async () => {
    fetch.mockResolvedValueOnce(page([{ id: '1' }], 2)).mockResolvedValueOnce(page([{ id: '2' }], 3))
    await expect(loadIntakeExport(root, 'test-key', 'feedback')).rejects.toThrow('Records changed')
    fetch.mockResolvedValueOnce(page([{ id: '1' }], 2)).mockResolvedValueOnce(page([{ id: '1' }], 2))
    await expect(loadIntakeExport(root, 'test-key', 'feedback')).rejects.toThrow('repeated record IDs')
  })
  it('rejects incomplete pages and unconfirmed counts', async () => {
    fetch.mockResolvedValueOnce(page([], 2))
    await expect(loadIntakeExport(root, 'test-key', 'waitlist')).rejects.toThrow('incomplete')
    fetch.mockResolvedValueOnce({ ok: true, headers: new Headers({ 'content-range': '0-1/*' }) })
    await expect(loadIntakeExport(root, 'test-key', 'waitlist')).rejects.toThrow('did not confirm')
  })
  it('handles an empty collection', async () => {
    fetch.mockResolvedValueOnce(page([], 0))
    expect(await loadIntakeExport(root, 'test-key', 'feedback')).toEqual([])
  })
  it('fails explicitly when an export exceeds the bounded download size', async () => {
    fetch.mockResolvedValueOnce(page([], 10001))
    await expect(loadIntakeExport(root, 'test-key', 'waitlist')).rejects.toThrow('10,000')
    fetch.mockResolvedValueOnce(page([{ id: '1', message: 'x'.repeat(3_000_001) }], 1))
    await expect(loadIntakeExport(root, 'test-key', 'feedback')).rejects.toThrow('too large')
  })
  it('retrieves exact counts without downloading private records', async () => {
    const response = page([], 2345)
    response.json = vi.fn()
    fetch.mockResolvedValueOnce(response)
    expect(await intakeCount(root, 'test-key', 'waitlist')).toBe(2345)
    expect(fetch.mock.calls[0][1].method).toBe('HEAD')
    expect(response.json).not.toHaveBeenCalled()
  })
  it('rejects unapproved table names before requests', async () => {
    await expect(loadIntakeExport(root, 'test-key', 'admin_roles')).rejects.toThrow('Unsupported')
    expect(fetch).not.toHaveBeenCalled()
  })
})
