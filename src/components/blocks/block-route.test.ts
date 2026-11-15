import { describe, expect, it } from 'vitest'
import { BLOCKS } from './block-metadata'
import { blockHash, blockIdFromHash } from './block-route'

describe('screen block navigation', () => {
  it('offers complete screens and round-trips their links', () => {
    expect(BLOCKS.map((block) => block.id)).toEqual(['dashboard', 'login', 'signup', 'settings'])
    for (const block of BLOCKS) expect(blockIdFromHash(blockHash(block.id))).toBe(block.id)
  })

  it('keeps old pattern bookmarks connected to their containing screens', () => {
    expect(blockIdFromHash('#blocks/otp')).toBe('signup')
    expect(blockIdFromHash('#blocks/search-filters')).toBe('dashboard')
    expect(blockIdFromHash('#blocks/signup?view=code')).toBe('signup')
  })

  it.each([
    '#blocks',
    '#blocks/missing',
    '#components/input-otp',
    '#blocks/__proto__',
    '#blocks/constructor',
  ])('does not treat %s as a screen', (hash) => expect(blockIdFromHash(hash)).toBeUndefined())
})
