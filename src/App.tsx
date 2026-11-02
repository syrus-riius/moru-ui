import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import {
  ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Box, Check, CheckCheck,
  ChevronRight, Code2, Copy,
  FileJson, LayoutGrid, LayoutPanelTop, Menu as MenuIcon, Monitor, Moon,
  MoreHorizontal, Palette, Plus, Search, Settings2, SlidersHorizontal,
  Sparkles, Sun, Trash2, Upload, X, Columns2, MousePointer2, Smartphone,
} from 'lucide-react'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Checkbox } from './components/ui/checkbox'
import { Command } from './components/ui/command'
import { Dialog } from './components/ui/dialog'
import { Field } from './components/ui/field'
import { Input } from './components/ui/input'
import { Menu } from './components/ui/menu'
import { Select } from './components/ui/select'
import { Tabs } from './components/ui/tabs'
import { Textarea } from './components/ui/textarea'
import { ToastProvider, useToast } from './components/ui/toast'
import { TokenEditor } from './components/TokenEditor'
import { components, snippets, type ComponentId } from './components/component-catalog'
import { componentGroupFor, componentPageHash, componentPageKey, componentPageTitle, parseComponentPage, type ComponentPage } from './components/component-pages'
import { ComponentCatalogPage } from './components/ComponentCatalogPage'
import { ComponentCategoryNavigation } from './components/ComponentCategoryNavigation'
import { ExtendedComponentDemo, type DemoSize } from './components/ExtendedComponentDemo'
import { AdvancedComponentDemo } from './components/AdvancedComponentDemo'
import { WorkspaceMembersProvider, useWorkspaceMembers } from './components/WorkspaceMembersContext'
import type { SemanticTone } from './components/ui'
import { WorkspaceExample } from './components/WorkspaceExample'
import { ExampleSessionProvider } from './components/examples/ExampleSessionContext'
import { ExamplesPage } from './components/examples/ExamplesPage'
import { blockHash, blockIdFromHash } from './components/blocks/block-route'
import type { BlockId } from './components/blocks/block-catalog'
import { requestBlockInsertion } from './components/simulator/block-simulator'
import { createProjectPlanSettings } from './components/WorkspaceProjectPlan'
import { createWorkspacePreferences } from './components/workspace-example-settings'
import { DesignTokensPage } from './components/DesignTokensPage'
import { GettingStartedGuide } from './components/GettingStartedGuide'
import { MoruLogo, MoruMark } from './components/brand'
import { useTheme } from './theme/useTheme'
import { registryRelease } from './lib/registry-install'
import { createNativeThemeExport } from './theme/native-theme'
import './components/studio-content.css'
import './components/component-gallery.css'
import './components/studio-navigation.css'
import './components/studio-topbar.css'
import './components/comparison-workspace.css'
import './components/reference-workspace.css'
import './components/standalone-workspace.css'

const CompletionComponentDemo = lazy(() => import('./components/CompletionComponentDemo').then((module) => ({ default: module.CompletionComponentDemo })))

const FoundationComparison = lazy(() => import('./components/FoundationComparison').then((module) => ({ default: module.FoundationComparison })))

const StateComparison = lazy(() => import('./components/StateComparison').then((module) => ({ default: module.StateComparison })))

const MoruSimulator = lazy(() => import('./components/simulator/MoruSimulator').then((module) => ({ default: module.MoruSimulator })))

const MobileReadinessLab = lazy(() => import('./components/mobile/MobileReadinessLab').then((module) => ({ default: module.MobileReadinessLab })))

const BlocksPage = lazy(() => import('./components/blocks/BlocksPage').then((module) => ({ default: module.BlocksPage })))

const ProjectTasksApp = lazy(() => import('./components/project-template/ProjectTasksApp').then((module) => ({ default: module.ProjectTasksApp })))

const BrandStory = lazy(() => import('./components/BrandStory').then((module) => ({ default: module.BrandStory })))

type View = 'blocks' | 'components' | 'examples' | 'project-template' | 'tokens' | 'guide' | 'comparison' | 'states' | 'brand' | 'simulator' | 'mobile'
const views: readonly View[] = ['blocks', 'components', 'examples', 'project-template', 'tokens', 'guide', 'comparison', 'states', 'brand', 'simulator', 'mobile']
function viewFromHash(hash: string): View {
  if (hash === '#blocks' || hash.startsWith('#blocks/')) return 'blocks'
  if (parseComponentPage(hash)) return 'components'
  const candidate = hash.slice(1) as View
  return views.includes(candidate) ? candidate : 'components'
}
function isStandaloneView(view: View) { return view === 'simulator' || view === 'examples' || view === 'project-template' }
function viewUrl(view: View, page: ComponentPage = { kind: 'index' }) { return `${window.location.pathname}${window.location.search}${view === 'components' ? componentPageHash(page) : view === 'blocks' ? blockHash(blockIdFromHash(window.location.hash)) : `#${view}`}` }
function libraryReturn() {
  const value = window.history.state?.moruStudioReturn
  if (!value || !views.includes(value.view) || isStandaloneView(value.view) || !Number.isFinite(value.scroll)) return null
  return { view: value.view as View, scroll: Math.max(0, value.scroll as number) }
}
function Mark({ small = false }: { small?: boolean }) {
  return <MoruMark className={`brand-mark ${small ? 'brand-mark-small' : ''}`} />
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    media.addEventListener('change', update)
    update()
    return () => media.removeEventListener('change', update)
  }, [query])
  return matches
}

function useDrawerFocus(open: boolean, ref: RefObject<HTMLElement | null>, initialFocusRef?: RefObject<string | null>, returnFocusRef?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open || !ref.current) return
    const panel = ref.current
    const previous = returnFocusRef?.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
    const focusable = () => [...panel.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], textarea:not(:disabled), [tabindex="0"]')].filter((element) => element.getClientRects().length > 0)
    const frame = requestAnimationFrame(() => {
      const target = initialFocusRef?.current ? document.getElementById(initialFocusRef.current) : null
      const initial = target && panel.contains(target) ? target : focusable()[0]
      initial?.focus()
    })
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const elements = focusable()
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', trap)
    return () => { cancelAnimationFrame(frame); document.removeEventListener('keydown', trap); previous?.focus() }
  }, [open, ref, initialFocusRef, returnFocusRef])
}

function DemoCard({ id, children, selected, onSelect, code, copied, onCopy }: {
  id: ComponentId; children: ReactNode; selected: boolean; onSelect: () => void;
  code: boolean; copied: boolean; onCopy: () => void;
}) {
  const meta = components.find((component) => component.id === id)!
  return (
    <section id={`component-${id}`} tabIndex={-1} className={`specimen ${selected ? 'is-selected' : ''}`} aria-label={`${meta.name} 컴포넌트`}>
      <div className="specimen-heading">
        <h2 className="specimen-title"><button className="specimen-name" onClick={onSelect} aria-pressed={selected}>
          <span className="specimen-number">{String(components.indexOf(meta) + 1).padStart(2, '0')}</span>
          <span className="specimen-label"><span className="specimen-component-name">{meta.name}{meta.generation === 'completion' ? <span className="component-new-marker">NEW</span> : null}</span><span className="specimen-subtitle">{meta.subtitle}</span></span>
        </button></h2>
        <button className="icon-button specimen-code" aria-label={`${meta.name} 코드 복사`} onClick={onCopy}>{copied ? <Check size={14} /> : <Copy size={14} />}</button>
      </div>
      {code ? <pre className="specimen-source" tabIndex={0} role="region" aria-label={`${meta.name} 사용 예시 코드`}><code>{snippets[id]}</code></pre> : <div className={`specimen-content specimen-${id}`}>{children}</div>}
      <div className="specimen-footer"><span><i />{code ? 'TSX · 코드' : '미리보기'}</span><button onClick={onSelect} aria-label={`${meta.name} 세부 조정`}>세부 조정 <ArrowUpRight size={13} /></button></div>
    </section>
  )
}

export default function App() {
  return <ToastProvider><WorkspaceMembersProvider><ExampleSessionProvider><Studio /></ExampleSessionProvider></WorkspaceMembersProvider></ToastProvider>
}

function Studio() {
  const theme = useTheme()
  const { toast } = useToast()
  const { members, dispatch } = useWorkspaceMembers()
  function setNotice(title: string) { toast({ title }) }
  const [view, setView] = useState<View>(() => viewFromHash(window.location.hash))
  const [blockId, setBlockId] = useState<BlockId | undefined>(() => blockIdFromHash(window.location.hash))
  const [componentPage, setComponentPage] = useState<ComponentPage>(() => parseComponentPage(window.location.hash) ?? { kind: 'index' })
  const componentRouteKey = componentPageKey(componentPage)
  const standalone = isStandaloneView(view)
  const navigationTarget = useRef<{ scroll: number; search?: boolean; component?: ComponentId } | null>(componentPage.kind === 'detail' ? { scroll: 0, component: componentPage.component } : null)
  const catalogTitle = componentPageTitle(componentPage.kind === 'detail' ? { kind: 'category', group: componentPage.group } : componentPage)
  const [newOnly, setNewOnly] = useState(false)
  const [demoSize, setDemoSize] = useState<DemoSize>('md')
  const [demoTone, setDemoTone] = useState<SemanticTone>('info')
  const [demoProgress, setDemoProgress] = useState(60)
  const [demoLoading, setDemoLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ComponentId>(() => {
    const page = parseComponentPage(window.location.hash)
    return page?.kind === 'detail' ? page.component : 'button'
  })
  const [code, setCode] = useState(false)
  const [buttonLabel, setButtonLabel] = useState('시작하기')
  const [buttonSize, setButtonSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [disabled, setDisabled] = useState(false)
  const [fieldError, setFieldError] = useState(false)
  const [description, setDescription] = useState('')
  const [emailOptIn, setEmailOptIn] = useState(true)
  const [updatesOptIn, setUpdatesOptIn] = useState(false)
  const [visibility, setVisibility] = useState('private')
  const [tab, setTab] = useState('overview')
  const [exportOpen, setExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'css' | 'json'>('css')
  const [copied, setCopied] = useState('')
  const [commandOpen, setCommandOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [componentDetailsOpen, setComponentDetailsOpen] = useState(false)
  const [tokenFocusRequest, setTokenFocusRequest] = useState<{ id: string; serial: number }>()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteTarget, setInviteTarget] = useState<'preview' | 'workspace'>('preview')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [workspaceName, setWorkspaceName] = useState('Moru Studio')
  const [workspaceDesc, setWorkspaceDesc] = useState('좋은 아이디어가 자연스럽게 자라는 곳.')
  const [workspaceType, setWorkspaceType] = useState('design')
  const [workspaceNotifications, setWorkspaceNotifications] = useState(true)
  const [workspaceVisibility, setWorkspaceVisibility] = useState('private')
  const [projectPlan, setProjectPlan] = useState(createProjectPlanSettings)
  const [workspacePreferences, setWorkspacePreferences] = useState(createWorkspacePreferences)
  const searchRef = useRef<HTMLInputElement>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const sidebarReturnTarget = useRef<HTMLElement | null>(null)
  const inspectorRef = useRef<HTMLElement>(null)
  const editorFocusTarget = useRef<string | null>(null)
  const editorReturnTarget = useRef<HTMLElement | null>(null)
  const mobileViewport = useMediaQuery('(max-width: 760px)')
  const compactViewport = useMediaQuery('(max-width: 1100px)')
  const navDrawerOpen = !standalone && mobileViewport && mobileNav
  const editorDrawerOpen = (compactViewport || standalone) && editorOpen && view !== 'brand' && view !== 'simulator'
  const drawerOpen = navDrawerOpen || editorDrawerOpen
  useDrawerFocus(navDrawerOpen && !exportOpen && !inviteOpen && !commandOpen, sidebarRef, undefined, sidebarReturnTarget)
  useDrawerFocus(editorDrawerOpen && !exportOpen && !inviteOpen && !commandOpen, inspectorRef, editorFocusTarget, editorReturnTarget)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        if (document.querySelector(':is([role="dialog"], [role="alertdialog"]):not([aria-modal="false"]):not([aria-hidden="true"]):not(.sidebar):not(.inspector)')) return
        if (event.shiftKey) { event.preventDefault(); setMobileNav(false); setEditorOpen(false); setCommandOpen(true); return }
        event.preventDefault(); go('components', true)
      }
      if (event.key === 'Escape') { setMobileNav(false); setEditorOpen(false) }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [view, componentRouteKey])
  useEffect(() => () => clearTimeout(copyTimer.current), [])

  useEffect(() => {
    function restoreLocation() {
      if (window.location.hash === '#main-content') return
      const scroll = window.history.state?.moruStudioScroll
      const page = parseComponentPage(window.location.hash) ?? (viewFromHash(window.location.hash) === 'components' ? { kind: 'index' } as const : null)
      navigationTarget.current = { scroll: typeof scroll === 'number' && Number.isFinite(scroll) ? Math.max(0, scroll) : 0, ...(page?.kind === 'detail' && typeof scroll !== 'number' ? { component: page.component } : {}) }
      if (page) {
        setComponentPage(page)
        if (page.kind === 'detail') { setSelected(page.component); setQuery(''); setNewOnly(false) }
      }
      setBlockId(blockIdFromHash(window.location.hash)); setView(viewFromHash(window.location.hash)); setMobileNav(false); setEditorOpen(false); setCommandOpen(false); setInviteOpen(false); setExportOpen(false)
    }
    window.addEventListener('popstate', restoreLocation)
    window.addEventListener('hashchange', restoreLocation)
    return () => { window.removeEventListener('popstate', restoreLocation); window.removeEventListener('hashchange', restoreLocation) }
  }, [])
  useEffect(() => {
    const target = navigationTarget.current
    if (!target) return
    const frame = requestAnimationFrame(() => {
      if (navigationTarget.current !== target) return
      navigationTarget.current = null
      if (target.component) { focusComponent(target.component); return }
      const element = target.search ? searchRef.current : document.getElementById('main-content')
      element?.focus({ preventScroll: true })
      window.scrollTo({ top: target.scroll, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [view, componentRouteKey, blockId])

  useEffect(() => {
    document.title = view === 'project-template' ? '프로젝트·할 일 템플릿 · Moru UI' : view === 'blocks' ? '블록·패턴 · Moru UI' : view === 'examples' ? '예제 허브 · Moru UI' : view === 'components' ? `${catalogTitle} · Moru UI` : 'Moru UI — 단단한 기본, 당신만의 UI.'
  }, [view, componentRouteKey])

  function navigateComponentPage(next: ComponentPage, search = false) {
    setMobileNav(false); setEditorOpen(false); setCommandOpen(false)
    setQuery(''); setNewOnly(false)
    if (next.kind === 'detail') setSelected(next.component)
    if (view === 'components' && componentPageKey(next) === componentRouteKey) {
      requestAnimationFrame(() => {
        if (search) searchRef.current?.focus()
        else if (next.kind === 'detail') focusComponent(next.component)
        else { document.getElementById('main-content')?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }) }
      })
      return
    }
    window.history.replaceState({ ...window.history.state, moruStudioScroll: window.scrollY }, '', view === 'components' ? viewUrl(view, componentPage) : window.location.href)
    if (standalone) window.history.replaceState({ moruStudioScroll: 0 }, '', viewUrl('components', next))
    else window.history.pushState({ moruStudioScroll: 0 }, '', viewUrl('components', next))
    navigationTarget.current = { scroll: 0, search, ...(next.kind === 'detail' ? { component: next.component } : {}) }
    setComponentPage(next); setView('components')
  }

  function go(next: View, search = false) {
    if (next === 'components') {
      setQuery(''); setNewOnly(false)
      navigateComponentPage({ kind: 'index' }, search)
      return
    }
    if (next === view) {
      setMobileNav(false); setEditorOpen(false); setQuery('')
      requestAnimationFrame(() => { if (search) searchRef.current?.focus(); else window.scrollTo({ top: 0, behavior: 'instant' }) })
      return
    }
    if (next !== view && isStandaloneView(next)) {
      const returnTo = standalone ? libraryReturn() : { view, scroll: window.scrollY }
      if (!standalone) {
        window.history.replaceState({ moruStudioScroll: window.scrollY }, '', viewUrl(view, componentPage))
        window.history.pushState({ moruStudioReturn: returnTo }, '', viewUrl(next))
      } else window.history.replaceState({ moruStudioReturn: returnTo }, '', viewUrl(next))
    } else if (standalone) window.history.replaceState({ moruStudioScroll: 0 }, '', viewUrl(next))
    else {
      window.history.replaceState({ ...window.history.state, moruStudioScroll: window.scrollY }, '', viewUrl(view, componentPage))
      window.history.pushState({ moruStudioScroll: 0 }, '', viewUrl(next))
    }
    navigationTarget.current = { scroll: 0, search }
    setView(next); setMobileNav(false); setEditorOpen(false); setQuery('')
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
    sidebarReturnTarget.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setMobileNav(true)
  }
  function openEditor(tokenId: string | null = null) {
    editorReturnTarget.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    editorFocusTarget.current = tokenId
    if (tokenId?.startsWith('token-')) setTokenFocusRequest((previous) => ({ id: tokenId, serial: (previous?.serial ?? 0) + 1 }))
    if (tokenId === 'component-details') setComponentDetailsOpen(true)
    setEditorOpen(true)
    if (!compactViewport && !standalone && tokenId) document.getElementById(tokenId)?.focus()
  }
  function focusComponent(id: ComponentId) {
    const element = document.getElementById(`component-${id}`)
    element?.focus({ preventScroll: true })
    element?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
  function selectComponent(id: ComponentId) {
    navigateComponentPage({ kind: 'detail', group: componentGroupFor(id).id, component: id })
  }
  function inspectComponent(id: ComponentId) {
    setSelected(id)
    openEditor('component-details')
    requestAnimationFrame(() => {
      const panel = inspectorRef.current
      const details = document.getElementById('component-details')
      if (!panel || !details) return
      panel.scrollTo({ top: panel.scrollTop + details.getBoundingClientRect().top - panel.getBoundingClientRect().top - 20, behavior: 'instant' })
      details.focus({ preventScroll: true })
    })
  }
  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key); clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(''), 2000)
    } catch { setNotice('복사하지 못했어요. 내보내기 창에서 직접 선택해 복사해 주세요.') }
  }
  function download() {
    const blob = new Blob([exportFormat === 'css' ? theme.exportCss() : theme.exportJson()], { type: exportFormat === 'css' ? 'text/css' : 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `moru-tokens.${exportFormat}`
    anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('디자인 토큰을 내보냈어요.')
  }
  function exportNativeTheme() {
    const blob = new Blob([JSON.stringify(createNativeThemeExport(theme.tokens, theme.mode), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'moru-native-theme.json'; anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('현재 모드의 네이티브 테마를 내보냈어요.')
  }
  function openInvite(target: 'preview' | 'workspace' = 'preview') { setInviteTarget(target); setInviteEmail(''); setInviteError(''); setInviteOpen(true) }
  function invite() {
    const email = inviteEmail.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setInviteError('올바른 이메일 주소를 입력해 주세요.'); return }
    if (inviteTarget === 'workspace') {
      if (members.some((member) => member.email.toLocaleLowerCase() === email.toLocaleLowerCase())) { setInviteError('이미 명단에 있는 이메일 주소예요.'); return }
      dispatch({ type: 'add', member: { id: crypto.randomUUID(), name: email.split('@')[0], email, title: '새 팀원', role: 'member', status: 'invited' } })
      toast({ title: '팀원 명단에 추가했어요.', description: `${email} · 초대 대기`, tone: 'success' })
    } else setNotice(`${email} 초대 미리보기를 완료했어요.`)
    setInviteOpen(false); setInviteError('')
  }
  const selectedMeta = components.find((item) => item.id === selected)!
  const exportText = exportFormat === 'css' ? theme.exportCss() : theme.exportJson()
  const inviteDialog = <Dialog open={inviteOpen} onOpenChange={setInviteOpen} title="함께할 팀원 초대" description={inviteTarget === 'workspace' ? '예제 명단에 초대 대기 상태로 추가합니다. 실제 이메일은 발송되지 않아요.' : '초대 폼의 동작을 확인하는 예제입니다. 실제 이메일은 발송되지 않아요.'} footer={<><Button variant="secondary" onClick={() => setInviteOpen(false)}>취소</Button><Button onClick={invite}>{inviteTarget === 'workspace' ? '명단에 추가' : '초대 미리보기'} <ArrowRight size={14} /></Button></>}><Field label="이메일 주소" error={inviteError}><Input type="email" value={inviteEmail} onChange={(event) => { setInviteEmail(event.target.value); setInviteError('') }} placeholder="colleague@studio.com" onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); invite() } }} /></Field></Dialog>

  function specimen(id: ComponentId, children: ReactNode) {
    return <DemoCard key={id} id={id} selected={selected === id} onSelect={() => inspectComponent(id)} code={code} copied={copied === id} onCopy={() => void copy(snippets[id], id)}>{children}</DemoCard>
  }

  const demos: Record<string, ReactNode> = {
    button: <><div className="demo-row"><Button size={buttonSize} disabled={disabled} onClick={() => setNotice('첫 번째 인터랙션, 잘 작동해요.')} >{buttonLabel || '시작하기'} <ArrowRight size={14} /></Button><Button variant="secondary" size={buttonSize} disabled={disabled} onClick={() => setNotice('보조 버튼을 눌렀어요.')}>보조 버튼</Button><Button variant="ghost" size={buttonSize} disabled={disabled} onClick={() => setNotice('다음 단계를 열었어요.')}>더 알아보기 <ArrowUpRight size={14} /></Button></div><div className="demo-row demo-row-secondary"><Button variant="secondary" size="sm" onClick={() => setNotice('새 항목을 추가했어요.')}><Plus size={13} /> 새로 만들기</Button><Button size="sm" disabled>비활성 버튼</Button><span className="demo-annotation">하나의 규칙, 다양한 역할</span></div></>,
    field: <div className="demo-form"><Field label="프로젝트 이름" description="나중에 언제든 변경할 수 있어요." error={fieldError ? '프로젝트 이름을 입력해 주세요.' : undefined}><Input placeholder="새로운 프로젝트" disabled={disabled} /></Field><button className="text-action" onClick={() => setFieldError((current) => !current)}>{fieldError ? '기본 상태 보기' : '오류 상태 확인하기'} <ArrowRight size={12} /></button></div>,
    input: <div className="demo-form"><div className="input-with-icon"><Search size={16} /><Input aria-label="예제 검색" placeholder="무엇을 찾고 있나요?" disabled={disabled} /></div><Input aria-label="이메일 예제" type="email" placeholder="hello@moru.design" disabled={disabled} /></div>,
    textarea: <div className="demo-form"><Textarea aria-label="프로젝트 소개" placeholder="어떤 프로젝트를 만들고 있나요?" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={200} disabled={disabled} rows={3} /><div className="textarea-caption"><span>좋은 이야기는 작은 한 줄에서 시작돼요.</span><span>{description.length}/200</span></div></div>,
    checkbox: <div className="demo-checklist"><Checkbox label="이메일 알림 받기" description="프로젝트의 새로운 소식을 알려드려요." checked={emailOptIn} onCheckedChange={setEmailOptIn} disabled={disabled} /><Checkbox label="제품 업데이트 소식 받기" checked={updatesOptIn} onCheckedChange={setUpdatesOptIn} disabled={disabled} /><Checkbox label="사용할 수 없는 옵션" disabled /></div>,
    select: <div className="demo-form"><span className="demo-label">프로젝트 공개 범위</span><Select aria-label="프로젝트 공개 범위" value={visibility} onValueChange={setVisibility} disabled={disabled} items={[{ value: 'private', label: '나만 볼 수 있어요' }, { value: 'team', label: '팀과 공유해요' }, { value: 'public', label: '모두에게 공개해요' }]} /><span className="demo-annotation">선택한 값 · {visibility}</span></div>,
    dialog: <div className="dialog-demo-layout"><div className="mini-dialog" aria-hidden="true"><div className="mini-dialog-title" /><div className="mini-dialog-line" /><div className="mini-dialog-input" /><div className="mini-dialog-buttons"><i /><i /></div></div><div><strong>대화에 집중할 시간</strong><p>자연스러운 열림과 닫힘,<br />키보드 포커스까지 세심하게.</p><Button variant="secondary" size="sm" onClick={() => openInvite()}>다이얼로그 열기 <ArrowUpRight size={13} /></Button></div></div>,
    menu: <div className="demo-menu-layout"><div className="project-icon"><LayoutPanelTop size={20} /></div><div className="demo-project-meta"><strong>새로운 프로젝트</strong><span>방금 수정됨 · 비공개</span></div><Menu trigger={<Button variant="ghost" size="sm" aria-label="프로젝트 메뉴"><MoreHorizontal size={19} /></Button>} items={[{ label: '이름 변경', icon: <Settings2 size={14} />, onClick: () => setNotice('이름 변경 동작을 확인했어요.') }, { label: '복제하기', icon: <Copy size={14} />, onClick: () => setNotice('프로젝트를 복제했어요. (예제)') }, { label: '삭제하기', icon: <Trash2 size={14} />, destructive: true, onClick: () => setNotice('프로젝트 삭제 동작을 확인했어요. (예제)') }]} /></div>,
    tabs: <Tabs value={tab} onValueChange={setTab} items={[{ value: 'overview', label: '개요', content: <div className="tab-demo-content"><span className="small-leaf"><Sparkles size={16} /></span><div><strong>시작하기 좋은 상태예요.</strong><p>프로젝트에 필요한 모든 것을 한곳에서.</p></div></div> }, { value: 'activity', label: '활동', content: <div className="tab-demo-content"><span className="small-leaf"><CheckCheck size={16} /></span><div><strong>첫 번째 컴포넌트를 만들었어요.</strong><p>오늘 · 디자인 시스템을 향한 작은 시작</p></div></div> }, { value: 'settings', label: '설정', content: <div className="tab-demo-content"><span className="small-leaf"><Settings2 size={16} /></span><div><strong>우리에게 맞게 조절해 보세요.</strong><p>오른쪽 패널의 변경 사항이 바로 반영돼요.</p></div></div> }]} />,
    card: <Card className="project-demo-card"><div className="card-demo-top"><span className="card-demo-icon"><Box size={17} /></span><span className="demo-pill">개인 프로젝트</span></div><h3>아이디어를 모으는 공간</h3><p>작은 시작을 위한 새로운 프로젝트.</p><button className="card-demo-link" onClick={() => { go('examples'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>프로젝트 열기 <ArrowUpRight size={14} /></button></Card>,
  }

  function componentDemo(id: ComponentId): ReactNode {
    const item = components.find((component) => component.id === id)!
    if (item.generation === 'completion') return <Suspense fallback={<p className="completion-demo-caption" role="status">미리보기를 준비하고 있어요.</p>}><CompletionComponentDemo id={item.id} disabled={disabled} size={demoSize} onNotice={setNotice} /></Suspense>
    if (item.generation === 'advanced') return <AdvancedComponentDemo id={item.id} disabled={disabled} size={demoSize} />
    if (item.generation === 'foundation') return <ExtendedComponentDemo id={item.id} disabled={disabled} size={demoSize} tone={demoTone} progress={demoProgress} onProgressChange={setDemoProgress} loading={demoLoading} onLoadingChange={setDemoLoading} onNotice={setNotice} />
    return demos[id]
  }

  return <div className={`studio-shell ${standalone ? 'studio-shell-standalone' : ''}`}>
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus() }}>본문으로 이동</a>
    {!standalone ? <>
    {mobileNav ? <button className="nav-scrim" aria-label="메뉴 닫기" onClick={() => setMobileNav(false)} /> : null}
    <aside id="workspace-navigation" ref={sidebarRef} className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`} inert={(mobileViewport && !mobileNav) || editorDrawerOpen} role={navDrawerOpen ? 'dialog' : undefined} aria-modal={navDrawerOpen || undefined} aria-label="워크스페이스 탐색">
      <button className="sidebar-close icon-button" aria-label="탐색 메뉴 닫기" onClick={() => setMobileNav(false)}><X size={16} /></button>
      <button className="brand" onClick={() => go('components')} aria-label="Moru UI 홈"><MoruLogo aria-hidden="true" /></button>
      <div className="workspace-label"><span className="workspace-avatar" aria-hidden="true">M</span><div className="workspace-info"><span className="workspace-eyebrow">WORKSPACE</span><span className="workspace-name">Personal workspace</span></div></div>
      <div className="nav-section-label">NAVIGATION</div>
      <nav className="primary-nav" aria-label="워크스페이스">
        <button aria-current={view === 'components' ? 'page' : undefined} className={view === 'components' ? 'active' : ''} onClick={() => go('components')}><LayoutGrid size={17} />컴포넌트<span className="nav-count">{components.length}</span></button>
        <button aria-current={view === 'blocks' ? 'page' : undefined} className={view === 'blocks' ? 'active' : ''} onClick={() => openBlocks()}><Box size={17} />블록·패턴<span className="nav-new">NEW</span></button>
        <button aria-current={view === 'mobile' ? 'page' : undefined} className={view === 'mobile' ? 'active' : ''} onClick={() => go('mobile')}><Smartphone size={17} />모바일 UI<span className="nav-new">EXPO</span></button>
        <button aria-current={view === 'comparison' ? 'page' : undefined} className={view === 'comparison' ? 'active' : ''} onClick={() => go('comparison')}><Columns2 size={17} />디자인 비교</button>
        <button aria-current={view === 'states' ? 'page' : undefined} className={view === 'states' ? 'active' : ''} onClick={() => go('states')}><MousePointer2 size={17} />상태 표현<span className="nav-new">NEW</span></button>
        <button onClick={() => go('examples')}><Monitor size={17} />예제 화면<ArrowUpRight size={12} className="nav-end" /></button>
        <button onClick={() => go('simulator')}><LayoutPanelTop size={17} />시뮬레이터<span className="nav-new">NEW</span></button>
        <button aria-current={view === 'tokens' ? 'page' : undefined} className={view === 'tokens' ? 'active' : ''} onClick={() => go('tokens')}><Palette size={17} />디자인 토큰</button>
        <button aria-current={view === 'guide' ? 'page' : undefined} className={view === 'guide' ? 'active' : ''} onClick={() => go('guide')}><BookOpen size={17} />시작 가이드</button>
        <button aria-current={view === 'brand' ? 'page' : undefined} className={view === 'brand' ? 'active' : ''} onClick={() => go('brand')}><MoruMark width={17} height={17} />Moru 이야기</button>
      </nav>
      <div className="nav-section-label component-list-label">COMPONENTS <span>{components.length}</span></div>
      <ComponentCategoryNavigation page={componentPage} active={view === 'components'} onNavigate={navigateComponentPage} onSelect={selectComponent} />
      <div className="sidebar-bottom"><div className="sidebar-note"><span className="note-spark"><MoruMark width={19} height={19} /></span><strong>직접 다듬는 UI</strong><p>색상·글꼴·간격을 조절하며 나만의 UI를 만들어 보세요.</p><button onClick={() => go('brand')}>Moru의 이름에 담은 뜻 <ArrowRight size={12} /></button></div><div className="sidebar-status"><span><i />로컬 미리보기</span><span>v{registryRelease}</span></div></div>
    </aside></> : null}
    <div className="workspace-main">
      {standalone ? <header className="standalone-topbar" inert={drawerOpen}>
        <div className="standalone-location"><button className="standalone-back" onClick={returnToLibrary} aria-label="이전 · Moru UI로 돌아가기"><ArrowLeft size={15} aria-hidden="true" /><span>이전 <span className="standalone-back-name">· Moru UI</span></span></button><span className="standalone-divider" aria-hidden="true" /><div className="standalone-title">{view === 'simulator' ? <h1>시뮬레이터</h1> : <span>{view === 'project-template' ? '프로젝트·할 일 템플릿' : '예제 화면'}</span>}</div></div>
        <div className="standalone-actions">{view === 'project-template' ? <><button className="icon-button" aria-label="예제 허브로 돌아가기" onClick={() => go('examples')}><LayoutGrid size={16} aria-hidden="true" /></button><a className="icon-button" href="/downloads/moru-project-starter.zip" download aria-label="프로젝트·할 일 템플릿 다운로드"><ArrowDownToLine size={16} aria-hidden="true" /></a></> : <>{view === 'examples' ? <button className="icon-button" aria-label="디자인 편집 열기" title="디자인 편집" onClick={() => openEditor()}><SlidersHorizontal size={16} /></button> : null}<button className="icon-button theme-toggle" onClick={() => theme.setMode(theme.mode === 'light' ? 'dark' : 'light')} aria-label={theme.mode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}>{theme.mode === 'light' ? <Sun size={16} /> : <Moon size={16} />}</button></>}</div>
      </header> : <header className="topbar" inert={drawerOpen}>
        <nav className="breadcrumb" aria-label="현재 위치">
          <button className="icon-button mobile-nav-button" aria-label="탐색 메뉴 열기" aria-expanded={navDrawerOpen} aria-controls="workspace-navigation" onClick={openNavigation}><MenuIcon size={19} /></button>
          <span className="breadcrumb-root">Workspace</span><ChevronRight size={13} aria-hidden="true" />
          <span className="breadcrumb-current" aria-current="page">{({ blocks: '블록·패턴', components: catalogTitle, examples: '예제 화면', 'project-template': '프로젝트·할 일 템플릿', tokens: '디자인 토큰', guide: '시작 가이드', comparison: '디자인 비교', states: '상태 표현', brand: 'Moru 이야기', simulator: '시뮬레이터', mobile: '모바일 UI' })[view]}</span>
        </nav>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="빠른 실행 열기" title="빠른 실행 · ⌘⇧K / Ctrl+Shift+K" onClick={() => setCommandOpen(true)}><Search size={17} /></button>
          {view !== 'brand' ? <span className="saved-indicator"><i aria-hidden="true" />브라우저에 자동 저장</span> : null}
          <button className="icon-button theme-toggle" onClick={() => theme.setMode(theme.mode === 'light' ? 'dark' : 'light')} aria-label={theme.mode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'} title={theme.mode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}>{theme.mode === 'light' ? <Sun size={17} /> : <Moon size={17} />}</button>
          {view !== 'brand' ? <button className="toolbar-export" aria-label="토큰 내보내기" title="토큰 내보내기" onClick={() => setExportOpen(true)}><ArrowDownToLine size={14} /><span>토큰 내보내기</span></button> : null}
        </div>
      </header>}
      <div className={`workspace-body ${standalone ? 'workspace-body-standalone' : ''} ${view === 'brand' ? 'workspace-body-brand' : ''} ${view === 'simulator' ? 'workspace-body-simulator' : ''}`}>
        <main id="main-content" tabIndex={-1} className={`main-content ${standalone ? `standalone-workspace standalone-workspace-${view}` : ''} ${view === 'brand' ? 'main-content-brand' : ''} ${view === 'simulator' ? 'simulator-workspace' : ''} ${view === 'components' || view === 'blocks' ? 'component-workspace' : ''} ${view === 'examples' ? 'example-workspace' : ''} ${view === 'comparison' || view === 'states' ? 'comparison-workspace' : ''} ${view === 'tokens' || view === 'guide' || view === 'mobile' ? 'reference-workspace' : ''}`} inert={drawerOpen}>
          {view === 'tokens' || view === 'guide' ? <header className="catalog-intro">
            <span className="eyebrow">MORU UI / {view === 'tokens' ? 'TOKENS' : 'GUIDE'}</span>
            <h1>{view === 'tokens' ? '디자인 토큰' : '시작 가이드'}</h1>
            <p>{view === 'tokens' ? '컬러 스키마를 설계하고, 형태와 리듬을 조절해 제품의 기준을 만드세요.' : '디자인을 다듬고, 컴포넌트를 조합하고, 내 프로젝트로 가져가는 네 단계입니다.'}</p>
            <div className="catalog-meta"><span>{view === 'tokens' ? 'DESIGN WORKBENCH' : '4 STEPS'}</span><span>{view === 'tokens' ? '배색 · 대비 · 형태 · 간격 · 타이포그래피' : '디자인 편집 · 컴포넌트 사용 · 내보내기 · 예제'}</span></div>
          </header> : null}
          {view === 'comparison' || view === 'states' ? <header className="catalog-intro">
            <span className="eyebrow">MORU UI / {view === 'comparison' ? 'FOUNDATIONS' : 'STATES'}</span>
            <h1>{view === 'comparison' ? '디자인 비교' : '상태 표현'}</h1>
            <p>{view === 'comparison' ? 'Pretendard와 Noto Sans, 세 가지 밀도와 두 가지 모드를 나란히 비교해 보세요.' : '기본부터 로딩까지 일곱 가지 상태와 성공·경고·정보·오류 색상을 함께 살펴보세요.'}</p>
            <div className="catalog-meta"><span>{view === 'comparison' ? '12 COMBINATIONS' : '7 STATES / 4 COLORS'}</span><span>{view === 'comparison' ? '글꼴 · 역할별 타이포그래피 · 공통 크기' : '상태 비교 · 의미 색상 · 직접 조작'}</span></div>
          </header> : null}
          {view === 'components' ? <ComponentCatalogPage page={componentPage} query={query} onQueryChange={setQuery} newOnly={newOnly} onNewOnlyChange={setNewOnly}
            onNavigate={navigateComponentPage} renderComponent={(id) => specimen(id, componentDemo(id))} code={code} onCodeChange={setCode}
            onExamples={() => go('examples')} onSimulator={() => go('simulator')} searchRef={searchRef} /> : null}
          {view === 'blocks' ? <Suspense fallback={<p className="comparison-loading" role="status">블록·패턴을 준비하고 있어요.</p>}><BlocksPage initialBlockId={blockId} onBlockChange={chooseBlock} onInsert={insertBlock} onExamples={() => go('examples')} /></Suspense> : null}
          {view === 'mobile' ? <Suspense fallback={<p className="comparison-loading" role="status">모바일 UI 랩을 준비하고 있어요.</p>}><MobileReadinessLab tokens={theme.tokens} mode={theme.mode} onModeChange={theme.setMode} onExportNative={exportNativeTheme} /></Suspense> : null}
          {view === 'simulator' ? <Suspense fallback={<p className="comparison-loading" role="status">시뮬레이터를 준비하고 있어요.</p>}><MoruSimulator /></Suspense> : null}
          {view === 'brand' ? <Suspense fallback={<p className="comparison-loading" role="status">Moru 이야기를 준비하고 있어요.</p>}><BrandStory onExplore={() => go('components')} /></Suspense> : null}
          {view === 'comparison' ? <Suspense fallback={<p className="comparison-loading" role="status">비교 화면을 준비하고 있어요.</p>}><FoundationComparison themes={theme.themes} activeMode={theme.mode} onApply={(font, density, mode) => { theme.setToken('fontFamily', font); theme.setToken('density', density); theme.setMode(mode) }} /></Suspense> : null}
          {view === 'states' ? <Suspense fallback={<p className="comparison-loading" role="status">상태 비교 화면을 준비하고 있어요.</p>}><StateComparison themes={theme.themes} activeMode={theme.mode} /></Suspense> : null}
          {view === 'project-template' ? <Suspense fallback={<p className="comparison-loading" role="status">프로젝트 템플릿을 준비하고 있어요.</p>}><ProjectTasksApp embedded /></Suspense> : null}
          {view === 'examples' ? <ExamplesPage standalone onBlocks={openBlocks} onProjectTemplate={() => go('project-template')} name={workspaceName} workspace={<WorkspaceExample embedded
            projectPlan={projectPlan} onProjectPlanChange={setProjectPlan}
            name={workspaceName} onNameChange={setWorkspaceName}
            description={workspaceDesc} onDescriptionChange={setWorkspaceDesc}
            type={workspaceType} onTypeChange={setWorkspaceType}
            visibility={workspaceVisibility} onVisibilityChange={setWorkspaceVisibility}
            notifications={workspaceNotifications} onNotificationsChange={setWorkspaceNotifications}
            preferences={workspacePreferences} onPreferencesChange={(patch) => setWorkspacePreferences((current) => ({ ...current, ...patch }))}
            onExport={() => setExportOpen(true)} onInvite={() => openInvite('workspace')}
            onOpenEditor={() => openEditor()}
            onSave={() => setNotice('예제 설정을 적용했어요. 이 화면의 값은 새로고침하면 초기화됩니다.')}
          />} /> : null}
          {view === 'tokens' ? <DesignTokensPage
            tokens={theme.tokens} cssText={theme.exportCss()} copied={copied === 'all-css'}
            mode={theme.mode} onModeChange={theme.setMode} onChange={theme.setToken}
            onTokensChange={theme.setTokens} onTypographyChange={theme.setTypography}
            colorSchemeSettings={theme.colorSchemeSettings} onApplyScheme={theme.applyColorScheme}
            onCopy={() => void copy(theme.exportCss(), 'all-css')}
            onEditColor={(key) => openEditor(`token-${key}`)}
          /> : null}
          {view === 'guide' ? <GettingStartedGuide
            onExport={() => setExportOpen(true)} onImport={() => importRef.current?.click()}
            onExamples={() => go('examples')} onOpenEditor={() => openEditor()}
            onProjectTemplate={() => go('project-template')}
            onComparison={() => go('comparison')}
          /> : null}
          {!standalone ? <footer className="main-footer"><span><Mark small />Moru UI · 직접 다듬고, 오래 쓰는 UI.</span><span>Moru UI <i />v{registryRelease}</span></footer> : null}
        </main>
        {editorOpen ? <button className="editor-scrim" aria-label="토큰 편집 패널 닫기" onClick={() => setEditorOpen(false)} /> : null}
        {view !== 'simulator' && (!standalone || editorOpen) ? <aside ref={inspectorRef} className={`inspector ${editorOpen ? 'inspector-open' : ''}`} inert={((compactViewport || standalone) && !editorOpen) || navDrawerOpen} role={editorDrawerOpen ? 'dialog' : undefined} aria-modal={editorDrawerOpen || undefined} aria-label="디자인 편집 패널"><div className="inspector-mobile-header"><strong>디자인 편집</strong><button className="icon-button" onClick={() => setEditorOpen(false)} aria-label="편집 패널 닫기"><X size={18} /></button></div><TokenEditor tokens={theme.tokens} focusRequest={tokenFocusRequest} spacingTarget={selected} onSpacingTargetChange={(target) => setSelected(target)} onChange={theme.setToken} onTokensChange={theme.setTokens} onTypographyChange={theme.setTypography} mode={theme.mode} onModeChange={theme.setMode} presetId={theme.presetId} onPresetChange={theme.applyPreset} onReset={theme.reset} onExport={() => { setEditorOpen(false); setExportOpen(true) }} />{view !== 'mobile' && view !== 'blocks' ? <section className="component-inspector-dock" aria-label="컴포넌트 설정"><button type="button" className="component-inspector-toggle" aria-expanded={componentDetailsOpen} aria-controls="component-details" onClick={() => setComponentDetailsOpen(!componentDetailsOpen)}><span>컴포넌트 세부 조정</span><span>{selectedMeta.name}<ChevronRight size={13} aria-hidden="true" /></span></button><div id="component-details" className="component-inspector" hidden={!componentDetailsOpen} tabIndex={-1} role="group" aria-label={`${selectedMeta.name} 세부 조정`}><div className="inspector-section-title"><span>COMPONENT DETAILS</span><span>{selectedMeta.name}</span></div>{selected === 'button' ? <><label htmlFor="button-label">버튼 텍스트</label><input id="button-label" value={buttonLabel} maxLength={30} onChange={(event) => setButtonLabel(event.target.value)} /><label htmlFor="button-size">크기</label><select id="button-size" value={buttonSize} onChange={(event) => setButtonSize(event.target.value as 'sm' | 'md' | 'lg')}><option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option></select></> : <p>{selectedMeta.subtitle}. 예제에서 직접 조작해 보세요.</p>}{['switch', 'radio-group', 'slider', 'popover', 'tooltip', 'avatar', 'combobox', 'toggle-group', 'button-group', 'input-group', 'input-otp', 'item', 'native-select', 'spinner', 'toggle', 'breadcrumb', 'collapsible', 'context-menu', 'drawer', 'hover-card', 'menubar', 'navigation-menu', 'sidebar', 'attachment', 'questionnaire'].includes(selected) ? <><label htmlFor="demo-size">컴포넌트 크기</label><select id="demo-size" value={demoSize} onChange={(event) => setDemoSize(event.target.value as DemoSize)}><option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option></select></> : null}{selected === 'badge' || selected === 'alert' ? <><label htmlFor="demo-tone">의미 색상</label><select id="demo-tone" value={demoTone} onChange={(event) => setDemoTone(event.target.value as SemanticTone)}><option value="info">정보 · Info</option><option value="success">성공 · Success</option><option value="warning">경고 · Warning</option><option value="danger">오류 · Danger</option></select></> : null}{selected === 'progress' ? <><label htmlFor="demo-progress">진행률 · {demoProgress}%</label><input id="demo-progress" type="range" min={0} max={100} step={10} value={demoProgress} onChange={(event) => setDemoProgress(Number(event.target.value))} /></> : null}{selected === 'skeleton' ? <label className="inspector-checkbox"><input type="checkbox" checked={demoLoading} onChange={(event) => setDemoLoading(event.target.checked)} /><span>로딩 모습 표시</span></label> : null}<label className="inspector-checkbox"><input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.target.checked)} /><span>입력·버튼 비활성 상태</span></label><button className="inspector-copy" onClick={() => void copy(snippets[selected], 'inspector')}>{copied === 'inspector' ? <Check size={13} /> : <Code2 size={13} />}{copied === 'inspector' ? '복사했어요' : `${selectedMeta.name} 코드 복사`}</button></div></section> : null}<div className="inspector-footer"><span>작은 변화도, 바로 확인하세요.</span><MoruMark width={16} height={16} /></div></aside> : null}
      </div>
    </div>
    {!standalone && view !== 'brand' ? <button className="floating-editor-button" inert={drawerOpen} onClick={() => openEditor()}><SlidersHorizontal size={18} />디자인 편집</button> : null}
    <input ref={importRef} type="file" accept="application/json,.json" className="sr-only" aria-label="디자인 토큰 JSON 불러오기" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { if (file.size > 100_000) throw new Error('100KB 이하의 토큰 파일을 선택해 주세요.'); theme.importJson(await file.text()); setNotice('디자인 토큰을 불러왔어요.') } catch (error) { setNotice(error instanceof Error ? error.message : '토큰 파일을 확인해 주세요.') } event.target.value = '' }} />
    <Command open={commandOpen} onOpenChange={setCommandOpen} title="Moru 빠른 실행" placeholder="화면이나 작업을 검색하세요" items={[
      { id: 'components', label: '컴포넌트 둘러보기', group: '화면', keywords: ['components'], onSelect: () => go('components') },
      { id: 'blocks', label: '블록·패턴 둘러보기', group: '화면', keywords: ['blocks', 'patterns', '로그인', 'OTP', '검색', '설정'], onSelect: () => openBlocks() },
      { id: 'examples', label: '예제 화면 열기', group: '화면', keywords: ['workspace', 'team'], onSelect: () => go('examples') },
      { id: 'project-template', label: '프로젝트·할 일 템플릿 열기', group: '화면', keywords: ['template', 'tasks', 'starter'], onSelect: () => go('project-template') },
      { id: 'simulator', label: '시뮬레이터 열기', group: '화면', keywords: ['simulator', 'wireframe', '와이어프레임'], onSelect: () => go('simulator') },
      { id: 'mobile', label: '모바일 UI · Expo', group: '화면', keywords: ['mobile', 'native', 'SwiftUI', 'iOS', 'Android'], onSelect: () => go('mobile') },
      { id: 'tokens', label: '디자인 토큰 보기', group: '화면', keywords: ['tokens'], onSelect: () => go('tokens') },
      { id: 'states', label: '상태 표현 비교', group: '화면', keywords: ['states'], onSelect: () => go('states') },
      { id: 'brand', label: 'Moru 이야기', group: '화면', onSelect: () => go('brand') },
      { id: 'editor', label: '디자인 편집 열기', group: '작업', onSelect: () => { if (view === 'brand' || view === 'simulator') go('components'); requestAnimationFrame(() => openEditor()) } },
      { id: 'invite', label: '팀원 명단에 추가', group: '작업', keywords: ['invite'], onSelect: () => { go('examples'); openInvite('workspace') } },
      { id: 'export', label: '토큰 내보내기', group: '작업', onSelect: () => setExportOpen(true) },
      { id: 'mode', label: theme.mode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환', group: '작업', onSelect: () => theme.setMode(theme.mode === 'light' ? 'dark' : 'light') },
    ]} />
    {inviteDialog}
    <Dialog open={exportOpen} onOpenChange={setExportOpen} title="내 디자인을 가져가세요." description="조절한 토큰을 프로젝트에서 그대로 사용하세요." footer={<><Button variant="secondary" onClick={() => void copy(exportText, 'export')}>{copied === 'export' ? <Check size={14} /> : <Copy size={14} />}{copied === 'export' ? '복사했어요' : '클립보드에 복사'}</Button><Button onClick={download}><ArrowDownToLine size={14} />다운로드</Button></>}><div className="export-format-tabs" role="group" aria-label="내보내기 형식"><button className={exportFormat === 'css' ? 'active' : ''} aria-pressed={exportFormat === 'css'} onClick={() => setExportFormat('css')}><Code2 size={15} />CSS 변수</button><button className={exportFormat === 'json' ? 'active' : ''} aria-pressed={exportFormat === 'json'} onClick={() => setExportFormat('json')}><FileJson size={15} />JSON 설정</button><button className="import-button" onClick={() => importRef.current?.click()}><Upload size={13} />불러오기</button></div><textarea className="export-code" aria-label="내보내기 코드" value={exportText} readOnly spellCheck={false} /><p className="export-note">{exportFormat === 'css' ? '현재 모드의 CSS입니다. 프로젝트의 전역 스타일에 추가해 주세요.' : '라이트·다크 모드 설정을 포함합니다. JSON으로 다시 불러올 수 있어요.'}</p></Dialog>
  </div>
}
