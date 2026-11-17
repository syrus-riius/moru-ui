import { blockHash, blockIdFromHash } from '../blocks/block-route'
import {
  componentPageHash,
  parseComponentPage,
  type ComponentPage,
} from '../catalog/component-pages'

/** Lab views and their hash routes. */
export type View =
  | 'home'
  | 'playground'
  | 'blocks'
  | 'components'
  | 'examples'
  | 'project-template'
  | 'tokens'
  | 'guide'
  | 'token-guide'
  | 'comparison'
  | 'states'
  | 'brand'
  | 'simulator'
  | 'mobile'
export const views: readonly View[] = [
  'home',
  'playground',
  'blocks',
  'components',
  'examples',
  'project-template',
  'tokens',
  'guide',
  'token-guide',
  'comparison',
  'states',
  'brand',
  'simulator',
  'mobile',
]
export function viewFromHash(hash: string): View {
  if (!hash || hash === '#home') return 'home'
  if (hash === '#guide/tokens') return 'token-guide'
  if (hash === '#blocks' || hash.startsWith('#blocks/')) return 'blocks'
  if (parseComponentPage(hash)) return 'components'
  const candidate = hash.slice(1) as View
  return views.includes(candidate) ? candidate : 'components'
}
export function isStandaloneView(view: View) {
  return view === 'simulator' || view === 'examples' || view === 'project-template'
}
export function viewUrl(view: View, page: ComponentPage = { kind: 'index' }) {
  const hash =
    view === 'home'
      ? ''
      : view === 'token-guide'
        ? '#guide/tokens'
        : view === 'components'
          ? componentPageHash(page)
          : view === 'blocks'
            ? blockHash(blockIdFromHash(window.location.hash))
            : `#${view}`
  return `${window.location.pathname}${window.location.search}${hash}`
}
export function libraryReturn() {
  const value = window.history.state?.moruStudioReturn
  if (
    !value ||
    !views.includes(value.view) ||
    isStandaloneView(value.view) ||
    !Number.isFinite(value.scroll)
  )
    return null
  return { view: value.view as View, scroll: Math.max(0, value.scroll as number) }
}
