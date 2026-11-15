import { useI18n } from '../../i18n'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useToast } from '../ui/toast'
import { type ComponentId, components } from '../catalog/component-catalog'
import {
  type ComponentPage,
  componentGroupFor,
  componentPageKey,
  componentPageTitle,
  parseComponentPage,
} from '../catalog/component-pages'
import { blockHash, blockIdFromHash } from '../blocks/block-route'
import type { BlockId } from '../blocks/block-catalog'
import { requestBlockInsertion } from '../simulator/block-simulator'
import type { MoruSiteSection } from '../site/MoruSiteHeader'
import { useTheme } from '../../theme/useTheme'
import { createNativeThemeExport } from '../../theme/native-theme'
import { useDrawerFocus, useMediaQuery } from './studio-hooks'
import { type View, isStandaloneView, libraryReturn, viewFromHash, viewUrl } from './studio-route'
import { useWorkspaceInvite } from './useWorkspaceInvite'

/**
 * Everything the lab shell knows and can do: the current route, which drawers and dialogs
 * are open, the gallery's search and selection, and the actions that move between them.
 * One hook owns it because navigation resets most of these values together.
 */
export function useStudioController() {
  const { t } = useI18n()
  const theme = useTheme()
  const { toast } = useToast()
  function setNotice(title: string) {
    toast({ title: t(title) })
  }
  const [view, setView] = useState<View>(() => viewFromHash(window.location.hash))
  const [blockId, setBlockId] = useState<BlockId | undefined>(() =>
    blockIdFromHash(window.location.hash),
  )
  const [componentPage, setComponentPage] = useState<ComponentPage>(
    () => parseComponentPage(window.location.hash) ?? { kind: 'index' },
  )
  const componentRouteKey = componentPageKey(componentPage)
  const standalone = isStandaloneView(view)
  const publicView =
    view === 'home' ||
    view === 'guide' ||
    view === 'token-guide' ||
    view === 'components' ||
    view === 'blocks' ||
    view === 'brand'
  const siteSection: MoruSiteSection =
    view === 'guide' || view === 'token-guide' || view === 'brand'
      ? 'docs'
      : view === 'home' || view === 'components' || view === 'blocks'
        ? view
        : 'studio'
  const inputDoc =
    view === 'components' && componentPage.kind === 'detail' && componentPage.component === 'input'
  const navigationTarget = useRef<{
    scroll: number
    search?: boolean
    component?: ComponentId
  } | null>(
    componentPage.kind === 'detail' ? { scroll: 0, component: componentPage.component } : null,
  )
  const catalogTitle = componentPageTitle(
    componentPage.kind === 'detail'
      ? { kind: 'category', group: componentPage.group }
      : componentPage,
  )
  const [newOnly, setNewOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ComponentId>(() => {
    const page = parseComponentPage(window.location.hash)
    return page?.kind === 'detail' ? page.component : 'button'
  })
  const [code, setCode] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [copied, setCopied] = useState('')
  const [commandOpen, setCommandOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [componentDetailsOpen, setComponentDetailsOpen] = useState(false)
  const [tokenFocusRequest, setTokenFocusRequest] = useState<{ id: string; serial: number }>()
  const invite = useWorkspaceInvite(setNotice)
  const searchRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const sidebarReturnTarget = useRef<HTMLElement | null>(null)
  const inspectorRef = useRef<HTMLElement>(null)
  const editorFocusTarget = useRef<string | null>(null)
  const editorReturnTarget = useRef<HTMLElement | null>(null)
  const mobileViewport = useMediaQuery('(max-width: 760px)')
  const compactViewport = useMediaQuery('(max-width: 1100px)')
  const compactDocs = useMediaQuery('(max-width: 860px)')
  const compactInspectorWorkspace = useMediaQuery('(max-width: 1279px)')
  const componentInspectorDocked = view === 'components' && editorOpen
  const navDrawerOpen = !publicView && !standalone && mobileViewport && mobileNav
  const editorDrawerOpen =
    (compactViewport || standalone || publicView) &&
    !componentInspectorDocked &&
    editorOpen &&
    view !== 'brand' &&
    view !== 'simulator'
  const drawerOpen = navDrawerOpen || editorDrawerOpen
  useDrawerFocus(
    navDrawerOpen && !exportOpen && !invite.open && !commandOpen,
    sidebarRef,
    undefined,
    sidebarReturnTarget,
  )
  useDrawerFocus(
    editorDrawerOpen && !exportOpen && !invite.open && !commandOpen,
    inspectorRef,
    editorFocusTarget,
    editorReturnTarget,
  )
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        if (
          document.querySelector(
            ':is([role="dialog"], [role="alertdialog"]):not([aria-modal="false"]):not([aria-hidden="true"]):not(.sidebar):not(.inspector)',
          )
        )
          return
        if (event.shiftKey || publicView) {
          event.preventDefault()
          setMobileNav(false)
          setEditorOpen(false)
          setCommandOpen(true)
          return
        }
        event.preventDefault()
        go('components', true)
      }
      if (event.key === 'Escape' && !event.defaultPrevented) {
        setMobileNav(false)
        if (editorDrawerOpen) setEditorOpen(false)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [view, componentRouteKey, publicView, editorDrawerOpen])
  useEffect(() => () => clearTimeout(copyTimer.current), [])

  useEffect(() => {
    function restoreLocation() {
      if (window.location.hash === '#main-content') return
      const scroll = window.history.state?.moruStudioScroll
      const page =
        parseComponentPage(window.location.hash) ??
        (viewFromHash(window.location.hash) === 'components' ? ({ kind: 'index' } as const) : null)
      navigationTarget.current = {
        scroll: typeof scroll === 'number' && Number.isFinite(scroll) ? Math.max(0, scroll) : 0,
        ...(page?.kind === 'detail' && typeof scroll !== 'number'
          ? { component: page.component }
          : {}),
      }
      if (page) {
        setComponentPage(page)
        if (page.kind === 'detail') {
          setSelected(page.component)
          setQuery('')
          setNewOnly(false)
        }
      }
      setBlockId(blockIdFromHash(window.location.hash))
      setView(viewFromHash(window.location.hash))
      setMobileNav(false)
      if (!page) setEditorOpen(false)
      setCommandOpen(false)
      invite.close()
      setExportOpen(false)
    }
    window.addEventListener('popstate', restoreLocation)
    window.addEventListener('hashchange', restoreLocation)
    return () => {
      window.removeEventListener('popstate', restoreLocation)
      window.removeEventListener('hashchange', restoreLocation)
    }
  }, [])
  useEffect(() => {
    const target = navigationTarget.current
    if (!target) return
    const frame = requestAnimationFrame(() => {
      if (navigationTarget.current !== target) return
      navigationTarget.current = null
      if (target.component) {
        focusComponent(target.component)
        return
      }
      const element = target.search ? searchRef.current : document.getElementById('main-content')
      element?.focus({ preventScroll: true })
      window.scrollTo({ top: target.scroll, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [view, componentRouteKey, blockId])

  useEffect(() => {
    document.title =
      view === 'simulator'
        ? `${t('시뮬레이터')} · BETA · Moru UI`
        : view === 'project-template'
          ? t('프로젝트·할 일 템플릿 · Moru UI')
          : view === 'blocks'
            ? t('화면 블록 · Moru UI')
            : view === 'examples'
              ? t('예제 허브 · Moru UI')
              : view === 'guide'
                ? t('시작하기 · Moru UI')
                : view === 'token-guide'
                  ? `${t('내 프로젝트에 적용')} · Moru UI`
                  : view === 'components'
                    ? `${t(componentPageTitle(componentPage))} · Moru UI`
                    : t('Moru UI — 단단한 기본, 당신만의 UI.')
  }, [view, componentRouteKey, t])

  function navigateComponentPage(next: ComponentPage, search = false) {
    setMobileNav(false)
    if (!componentInspectorDocked) setEditorOpen(false)
    setCommandOpen(false)
    setQuery('')
    setNewOnly(false)
    if (next.kind === 'detail') setSelected(next.component)
    if (view === 'components' && componentPageKey(next) === componentRouteKey) {
      requestAnimationFrame(() => {
        if (search) searchRef.current?.focus()
        else if (next.kind === 'detail') focusComponent(next.component)
        else {
          document.getElementById('main-content')?.focus({ preventScroll: true })
          window.scrollTo({ top: 0, behavior: 'instant' })
        }
      })
      return
    }
    window.history.replaceState(
      { ...window.history.state, moruStudioScroll: window.scrollY },
      '',
      view === 'components' ? viewUrl(view, componentPage) : window.location.href,
    )
    if (standalone)
      window.history.replaceState({ moruStudioScroll: 0 }, '', viewUrl('components', next))
    else window.history.pushState({ moruStudioScroll: 0 }, '', viewUrl('components', next))
    navigationTarget.current = {
      scroll: 0,
      search,
      ...(next.kind === 'detail' ? { component: next.component } : {}),
    }
    setComponentPage(next)
    setView('components')
  }

  function go(next: View, search = false) {
    if (next === 'components') {
      setQuery('')
      setNewOnly(false)
      navigateComponentPage({ kind: 'index' }, search)
      return
    }
    if (next === view) {
      setMobileNav(false)
      setEditorOpen(false)
      setQuery('')
      requestAnimationFrame(() => {
        if (search) searchRef.current?.focus()
        else window.scrollTo({ top: 0, behavior: 'instant' })
      })
      return
    }
    if (next !== view && isStandaloneView(next)) {
      const returnTo = standalone ? libraryReturn() : { view, scroll: window.scrollY }
      if (!standalone) {
        window.history.replaceState(
          { moruStudioScroll: window.scrollY },
          '',
          viewUrl(view, componentPage),
        )
        window.history.pushState({ moruStudioReturn: returnTo }, '', viewUrl(next))
      } else window.history.replaceState({ moruStudioReturn: returnTo }, '', viewUrl(next))
    } else if (standalone) window.history.replaceState({ moruStudioScroll: 0 }, '', viewUrl(next))
    else {
      window.history.replaceState(
        { ...window.history.state, moruStudioScroll: window.scrollY },
        '',
        viewUrl(view, componentPage),
      )
      window.history.pushState({ moruStudioScroll: 0 }, '', viewUrl(next))
    }
    navigationTarget.current = { scroll: 0, search }
    setView(next)
    setMobileNav(false)
    setEditorOpen(false)
    setQuery('')
  }
  function navigateSite(section: MoruSiteSection) {
    if (section === 'blocks') openBlocks()
    else go(section === 'docs' ? 'guide' : section === 'studio' ? 'tokens' : section)
  }
  function openBlocks(id?: BlockId) {
    go('blocks')
    window.history.replaceState({ ...window.history.state, moruStudioScroll: 0 }, '', blockHash(id))
    setBlockId(id)
  }
  function chooseBlock(id: BlockId) {
    window.history.replaceState({ ...window.history.state }, '', blockHash(id))
    setBlockId(id)
  }
  function insertBlock(id: BlockId, device: 'mobile' | 'web') {
    requestBlockInsertion(id, device)
    go('simulator')
  }
  function returnToLibrary() {
    if (libraryReturn()) window.history.back()
    else go('components')
  }
  function openNavigation() {
    sidebarReturnTarget.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    setMobileNav(true)
  }
  function openEditor(tokenId: string | null = null) {
    editorReturnTarget.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    editorFocusTarget.current = tokenId
    if (tokenId?.startsWith('token-'))
      setTokenFocusRequest((previous) => ({ id: tokenId, serial: (previous?.serial ?? 0) + 1 }))
    if (tokenId === 'component-details') setComponentDetailsOpen(true)
    setEditorOpen(true)
    if (!compactViewport && !standalone && !publicView && tokenId)
      document.getElementById(tokenId)?.focus()
  }
  function closeEditor() {
    setEditorOpen(false)
    if (componentInspectorDocked)
      requestAnimationFrame(() => document.getElementById('component-design-toggle')?.focus())
  }
  function focusComponent(id: ComponentId) {
    const element = document.getElementById(`component-${id}`)
    element?.focus({ preventScroll: true })
    if (id === 'input') {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    element?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
  function selectComponent(id: ComponentId) {
    navigateComponentPage({ kind: 'detail', group: componentGroupFor(id).id, component: id })
  }
  function inspectComponent(id: ComponentId) {
    setSelected(id)
    openEditor('component-details')
    requestAnimationFrame(() => {
      const details = inspectorRef.current?.querySelector<HTMLElement>('#component-details')
      const panel = details?.closest<HTMLElement>('.token-editor-tabs > .ui-tabs-panel')
      if (!panel || !details) return
      panel.scrollTo({
        top:
          panel.scrollTop +
          details.getBoundingClientRect().top -
          panel.getBoundingClientRect().top -
          20,
        behavior: 'instant',
      })
      details.focus({ preventScroll: true })
    })
  }
  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(''), 2000)
    } catch {
      setNotice(t('복사하지 못했어요. 내보내기 창에서 직접 선택해 복사해 주세요.'))
    }
  }
  function exportNativeTheme() {
    const blob = new Blob(
      [JSON.stringify(createNativeThemeExport(theme.tokens, theme.mode), null, 2)],
      { type: 'application/json' },
    )
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'moru-native-theme.json'
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice(t('현재 모드의 네이티브 테마를 내보냈어요.'))
  }
  const selectedMeta = components.find((item) => item.id === selected)!
  return {
    theme,
    setNotice,
    view,
    blockId,
    componentPage,
    standalone,
    publicView,
    siteSection,
    inputDoc,
    catalogTitle,
    newOnly,
    setNewOnly,
    query,
    setQuery,
    selected,
    setSelected,
    code,
    setCode,
    exportOpen,
    setExportOpen,
    copied,
    commandOpen,
    setCommandOpen,
    mobileNav,
    setMobileNav,
    editorOpen,
    setEditorOpen,
    componentDetailsOpen,
    setComponentDetailsOpen,
    tokenFocusRequest,
    invite,
    searchRef,
    sidebarRef,
    inspectorRef,
    mobileViewport,
    compactViewport,
    compactDocs,
    compactInspectorWorkspace,
    componentInspectorDocked,
    navDrawerOpen,
    editorDrawerOpen,
    drawerOpen,
    navigateComponentPage,
    go,
    navigateSite,
    openBlocks,
    chooseBlock,
    insertBlock,
    returnToLibrary,
    openNavigation,
    openEditor,
    closeEditor,
    selectComponent,
    inspectComponent,
    copy,
    exportNativeTheme,
    selectedMeta,
  }
}

export type StudioController = ReturnType<typeof useStudioController>
const StudioContext = createContext<StudioController | null>(null)
export const StudioProvider = StudioContext.Provider

/** The controller of the surrounding Studio, for the shell's own parts. */
export function useStudio() {
  const value = useContext(StudioContext)
  if (!value) throw new Error('StudioProvider is missing')
  return value
}
