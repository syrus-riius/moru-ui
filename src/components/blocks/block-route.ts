import type { BlockId } from './block-catalog'

const ids: readonly BlockId[] = ['login', 'otp', 'search-filters', 'settings']
export function blockIdFromHash(hash: string): BlockId | undefined {
  const path = hash.replace(/^#/, '')
  if (!path.startsWith('blocks/')) return undefined
  const value = path.split('/')[1]
  return ids.find((id) => id === value)
}
export function blockHash(id?: BlockId) { return id ? `#blocks/${id}` : '#blocks' }
