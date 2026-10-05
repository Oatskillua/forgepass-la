// @vitest-environment node
import { readdir } from 'node:fs/promises'
import { expect, it } from 'vitest'

it('keeps intake exports and database dumps outside public assets', async () => {
  const files = await readdir(new URL('../../public/', import.meta.url), { recursive: true })
  expect(files.filter((name) => /\.(csv|tsv|sql|sqlite|db)$/i.test(name))).toEqual([])
})
