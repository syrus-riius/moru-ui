import { BLOCKS, type BlockId } from './block-metadata'

/** Old pattern bookmarks now open the screen that contains that pattern. */
const legacyBlocks = new Map<string, BlockId>([
  ['otp', 'signup'],
  ['search-filters', 'dashboard'],
])
export function blockIdFromHash(hash: string): BlockId | undefined {
  const path = hash.replace(/^#/, '')
  if (!path.startsWith('blocks/')) return undefined
  const value = path.split('/')[1]?.split('?')[0]
  return BLOCKS.find((block) => block.id === value)?.id ?? legacyBlocks.get(value)
}
export function blockHash(id?: BlockId) {
  return id ? `#blocks/${id}` : '#blocks'
}
