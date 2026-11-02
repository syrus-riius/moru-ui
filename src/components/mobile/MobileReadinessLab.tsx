import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowDownToLine, ArrowRight, ArrowUpRight, BatteryFull, Check, Code2,
  ExternalLink, ListChecks, RotateCcw, ShieldCheck, Signal, Wallet, Wifi,
} from 'lucide-react'
import { createNativeThemeExport } from '../../theme/native-theme'
import type { ThemeMode, ThemeTokens } from '../../theme/tokens'
import {
  mobileCoverage, nativeComponentSources, nativeCrossPlatformComponents, nativeMobileComponents,
  nativeOSComponents, nativePlatformCapabilities, type NativeMobileComponent,
} from './mobile-coverage'
import {
  isNativePreviewSender, nativePreviewPath, nativePreviewVersion, readNativePreviewMessage,
  type NativePreviewConfiguration, type NativePreviewScreen, type NativePreviewTabStyle,
} from './native-preview-bridge'
import './mobile-readiness-lab.css'

export type MobileReadinessLabProps = { tokens: ThemeTokens; mode: ThemeMode; onModeChange?: (mode: ThemeMode) => void; onOpenNativeSource?: () => void; onExportNative?: () => void }
const tabs = [{ id: 'examples', label: '모바일 예제' }, { id: 'coverage', label: '컴포넌트 점검' }, { id: 'platforms', label: '플랫폼 지원' }, { id: 'expo', label: 'Expo 시작' }] as const
const screens = [{ id: 'wallet', label: '지갑', icon: Wallet }, { id: 'tasks', label: '작업', icon: ListChecks }, { id: 'activity', label: '활동', icon: Activity }] as const
const groupLabels = { pattern: '공통 UI · 모바일 패턴', system: '탐색 · 시스템 컨트롤', device: '기기 기능 · 권한' }
const scopeLabels = { shared: '공통 구현', 'platform-specific': '플랫폼별 동작', 'native-only': '기기 OS 전용 동작' }
const expoCode = `import { SafeAreaProvider } from 'react-native-safe-area-context'
import { MoruNativeProvider, AppScreen, NavigationBar,
  NativeButton, MetricCard } from '@moru/native'

export default function App() {
  return (
    <SafeAreaProvider>
      <MoruNativeProvider>
        <AppScreen>
          <NavigationBar title="내 작업실" />
          <MetricCard label="이번 달" value="24개" />
          <NativeButton onPress={() => {}}>시작하기</NativeButton>
        </AppScreen>
      </MoruNativeProvider>
    </SafeAreaProvider>
  )
}`

export function MobileReadinessLab({ tokens, mode, onModeChange, onOpenNativeSource, onExportNative }: MobileReadinessLabProps) {
  const id = useId()
  const [tab, setTab] = useState<typeof tabs[number]['id']>('examples')
  const [screen, setScreen] = useState<NativePreviewScreen>('wallet')
  const [tabStyle, setTabStyle] = useState<NativePreviewTabStyle>('floating')
  const [centerAction, setCenterAction] = useState(true)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [runtimeKey, setRuntimeKey] = useState(0)
  const [runtimeRoute, setRuntimeRoute] = useState('/')
  const [runtimeComponentIds, setRuntimeComponentIds] = useState<string[]>([])
  const [sourceName, setSourceName] = useState<NativeMobileComponent>('Amount')
  const [coverageFilter, setCoverageFilter] = useState<'all' | 'source' | 'adapter'>('all')
  const [platformFilter, setPlatformFilter] = useState<'all' | keyof typeof groupLabels>('all')
  const [codeCopied, setCodeCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const frame = useRef<HTMLIFrameElement>(null)
  const ready = useRef(false)
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([])
  const nativeTheme = useMemo(() => createNativeThemeExport(tokens, mode), [tokens, mode])
  const configuration = useMemo<NativePreviewConfiguration>(() => ({ screen, tabStyle, centerAction }), [screen, tabStyle, centerAction])
  const screenSources = runtimeComponentIds.length ? nativeComponentSources.filter((item) => runtimeComponentIds.includes(item.name) || item.name === 'NativeDatePicker' && runtimeComponentIds.includes('BrowserDatePicker')) : nativeComponentSources.filter((item) => item.examples.includes(screen))
  const source = screenSources.find((item) => item.name === sourceName) ?? screenSources[0] ?? nativeComponentSources[0]
  const coverage = mobileCoverage.filter((item) => coverageFilter === 'all' || item.status === coverageFilter)
  const capabilities = nativePlatformCapabilities.filter((item) => platformFilter === 'all' || item.group === platformFilter)
  const pendingCapabilities = nativePlatformCapabilities.filter((item) => item.implementationStatus === 'pending').length

  function send(type: string, payload?: unknown) {
    frame.current?.contentWindow?.postMessage({ type, version: nativePreviewVersion, ...(payload === undefined ? {} : { payload }) }, window.location.origin)
  }
  useEffect(() => {
    function receive(event: MessageEvent) {
      if (!isNativePreviewSender(event, window.location.origin, frame.current?.contentWindow ?? null)) return
      const message = readNativePreviewMessage(event.data)
      if (!message) return
      if (message.type === 'moru-native:ready') { ready.current = true; setStatus('ready') }
      else if (message.type === 'moru-native:mode') onModeChange?.(message.payload.mode)
      else {
        setScreen(message.payload.screen); setTabStyle(message.payload.tabStyle); setCenterAction(message.payload.centerAction)
        if (message.payload.route) setRuntimeRoute(message.payload.route)
        if (message.payload.componentIds) setRuntimeComponentIds(message.payload.componentIds)
      }
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [onModeChange])
  useEffect(() => {
    if (status !== 'ready') return
    send('moru-native:theme', { mode: nativeTheme.mode, tokens: nativeTheme.tokens })
    send('moru-native:configure', configuration)
  }, [status, nativeTheme, configuration, runtimeKey])
  useEffect(() => {
    const timeout = window.setTimeout(() => { if (!ready.current) setStatus('error') }, 20000)
    return () => window.clearTimeout(timeout)
  }, [runtimeKey])
  function resetRuntime() { ready.current = false; setStatus('loading'); setRuntimeKey((value) => value + 1) }
  function selectScreen(value: NativePreviewScreen) {
    setScreen(value)
    if (ready.current) send('moru-native:configure', { ...configuration, screen: value, resetRoute: true })
  }
  function sectionProps(value: typeof tab) { return { role: 'tabpanel' as const, id: `${id}-panel-${value}`, 'aria-labelledby': `${id}-tab-${value}`, hidden: tab !== value, tabIndex: 0 } }
  async function copyCode() {
    try { await navigator.clipboard.writeText(expoCode); setCodeCopied(true); setCopyError(false) }
    catch { setCopyError(true) }
  }

  return <div className="mobile-readiness-lab" data-mode={mode}>
    <header className="catalog-intro mobile-lab-intro">
      <span className="eyebrow">MORU UI / SHARED COMPONENTS</span><h1>모바일 UI 랩</h1>
      <p>Expo 앱과 같은 Moru Native 소스를 브라우저에서 실행하고, 공통 디자인을 다듬어 보세요.</p>
      <div className="catalog-meta"><span>{nativeMobileComponents.length} NATIVE COMPONENTS / 3 SCREENS</span><span>공통 UI {nativeCrossPlatformComponents.length}종 · 시스템 컨트롤 {nativeOSComponents.length}종</span></div>
    </header>
    <div className="mobile-lab-tabs" role="tablist" aria-label="모바일 UI 랩 작업 영역">{tabs.map((item, index) => <button type="button" role="tab" key={item.id} ref={(element) => { tabButtons.current[index] = element }} id={`${id}-tab-${item.id}`} aria-controls={`${id}-panel-${item.id}`} aria-selected={tab === item.id} tabIndex={tab === item.id ? 0 : -1} onClick={() => setTab(item.id)} onKeyDown={(event) => {
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null
      if (next === null) return
      event.preventDefault(); setTab(tabs[next].id); tabButtons.current[next]?.focus({ preventScroll: true })
    }}>{item.label}</button>)}</div>

    <section {...sectionProps('examples')} className="mobile-lab-panel">
      <div className="mobile-runtime-banner"><Code2 size={17} aria-hidden="true" /><div><strong>실제 Moru Native 컴포넌트 실행</strong><p>앱의 NativeLabHome와 @moru/native를 React Native Web으로 렌더링합니다. 오른쪽 디자인 토큰을 바꾸면 이 화면에도 반영됩니다.</p></div><span className="mobile-runtime-status" data-status={status} role="status">{status === 'ready' ? '실행 중' : status === 'error' ? '연결 확인 필요' : '불러오는 중'}</span></div>
      <div className="mobile-lab-stage">
        <div className="mobile-lab-phone-column">
          <div className="mobile-lab-screen-picker" role="group" aria-label="모바일 조합 예제">{screens.map(({ id: value, label, icon: Icon }) => <button type="button" key={value} aria-pressed={screen === value && runtimeRoute === '/'} onClick={() => selectScreen(value)}><Icon size={13} aria-hidden="true" />{label}</button>)}</div>
          <div className="mobile-runtime-device" aria-label="Moru Native 모바일 실행 프레임">
            <div className="mobile-runtime-statusbar" aria-hidden="true"><strong>9:41</strong><span className="mobile-runtime-island" /><span><Signal size={12} /><Wifi size={13} /><BatteryFull size={17} /></span></div>
            <iframe key={runtimeKey} ref={frame} className="mobile-native-frame" src={`${nativePreviewPath}?embedded=1`} title="실제 Moru Native 모바일 예제" onLoad={() => send('moru-native:ping')} onError={() => setStatus('error')} />
            <div className="mobile-runtime-home" aria-hidden="true"><i /></div>
            {status === 'error' ? <div className="mobile-runtime-error" role="alert"><strong>모바일 예제를 불러오지 못했어요.</strong><p>연결을 다시 시도하거나 새 창에서 열어 보세요.</p><button type="button" onClick={resetRuntime}><RotateCcw size={13} />다시 불러오기</button><a href={nativePreviewPath} target="_blank" rel="noreferrer">새 창에서 열기<ExternalLink size={13} /></a></div> : null}
          </div>
          <div className="mobile-runtime-tools"><button type="button" onClick={resetRuntime}><RotateCcw size={12} />예제 초기화</button><a href={nativePreviewPath} target="_blank" rel="noreferrer">새 창에서 실행<ExternalLink size={12} /></a></div>
          <p className="mobile-lab-preview-caption">React Native Web 실행 · 폰 테두리와 상태 바는 목업입니다.</p>
        </div>
        <aside className="mobile-lab-controls">
          <header><span>COMPOSE & INSPECT</span><h2>하나의 소스, 이어지는 화면</h2><p>지갑·작업·활동을 직접 조작하고, 실행하는 컴포넌트의 소스를 확인하세요.</p></header>
          <section><h3>하단 탐색 형태</h3><div className="mobile-control-options" role="group" aria-label="하단 탐색 디자인">{([{ value: 'standard', label: '기본' }, { value: 'floating', label: '플로팅' }, { value: 'pill', label: '필 강조' }] as const).map((item) => <button type="button" key={item.value} aria-pressed={tabStyle === item.value} onClick={() => setTabStyle(item.value)}>{item.label}</button>)}</div><label className="mobile-control-checkbox"><input type="checkbox" checked={centerAction} onChange={(event) => setCenterAction(event.target.checked)} />가운데 만들기 버튼</label></section>
          <section><h3>이 화면에서 사용하는 소스</h3><p className="mobile-runtime-route">{runtimeRoute.startsWith('/controls') ? '시스템 컨트롤' : runtimeRoute.startsWith('/system-tabs') ? '시스템 탭' : runtimeRoute.startsWith('/task/') ? '작업 상세' : runtimeRoute.startsWith('/transaction/') ? '거래 상세' : screens.find((item) => item.id === screen)?.label}</p><div className="mobile-source-chips" aria-label="선택한 화면의 Moru 컴포넌트">{screenSources.map((item) => <button type="button" key={item.name} aria-pressed={source.name === item.name} onClick={() => setSourceName(item.name)}>{item.name}</button>)}</div><div className="mobile-source-detail"><strong>{source.name}</strong><code>{source.entryPoint}</code><code>{source.sourceFile}</code>{source.browserSourceFile ? <code>웹: {source.browserSourceFile}</code> : null}<span>{source.browserImplementation === 'shared' ? '웹·앱 공통 소스' : '브라우저 대체 구현'}</span><small>iOS·Android 기기 동작은 추가 검증이 필요합니다.</small></div></section>
          <section><h3>토큰 연동 확인</h3><p>색상·모서리·역할별 글자·공통 크기·간격을 수정해 보세요. 모바일 조작 영역은 최소 48을 유지합니다.</p><p>웹 글꼴은 이 미리보기에 적용됩니다. 앱의 사용자 지정 글꼴은 폰트 파일 등록이 필요합니다.</p></section>
          <button type="button" className="mobile-control-link" onClick={() => setTab('platforms')}>모바일 전용 동작과 지원 범위<ArrowRight size={13} /></button>
        </aside>
      </div>
    </section>

    <section {...sectionProps('coverage')} className="mobile-lab-panel">
      <div className="mobile-audit-summary"><div><span>공통 UI</span><strong>{nativeCrossPlatformComponents.length}<small>개 컴포넌트</small></strong><p>앱과 같은 소스를 웹 렌더러로 확인합니다.</p></div><div><span>시스템 컨트롤</span><strong>{nativeOSComponents.length}<small>개 컴포넌트</small></strong><p>Picker·Slider는 공통 API, 날짜 선택은 웹 대체입니다.</p></div><div><span>추가 연결 대상</span><strong>{pendingCapabilities}<small>개 기능 영역</small></strong><p>OS 메뉴·기기 API의 구현 상태를 구분합니다.</p></div></div>
      <div className="mobile-audit-heading"><div><h2>컴포넌트와 실행 범위</h2><p>소스 공유와 실제 OS 동작 검증은 별개의 단계입니다. 아래 목록은 전체 {nativeMobileComponents.length}종의 구현 위치입니다.</p></div></div>
      <div className="mobile-component-source-grid">{nativeComponentSources.map((item) => <article key={item.name}><header><strong>{item.name}</strong><span>{item.browserImplementation === 'shared' ? '공통 소스' : '웹 대체'}</span></header><code>{item.entryPoint}</code><code>{item.sourceFile}</code>{item.browserSourceFile ? <code>웹: {item.browserSourceFile}</code> : null}<p>예제: {item.examples.map((value) => ({ wallet: '지갑', tasks: '작업', activity: '활동', controls: '컨트롤', details: '상세', 'system-tabs': '시스템 탭' })[value]).join(' · ')}</p></article>)}</div>
      <div className="mobile-audit-heading"><div><h2>SwiftUI 패턴 대응</h2><p>어떤 구현으로 연결하는지, 기기에서 무엇을 확인해야 하는지 살펴보세요.</p></div><div className="mobile-control-options" role="group" aria-label="모바일 커버리지 필터">{([{ value: 'all', label: '전체' }, { value: 'source', label: '구현 있음' }, { value: 'adapter', label: '추가 연결' }] as const).map((item) => <button type="button" key={item.value} aria-pressed={coverageFilter === item.value} onClick={() => setCoverageFilter(item.value)}>{item.label}</button>)}</div></div>
      <div className="mobile-audit-table-scroll" tabIndex={0} role="region" aria-label="모바일 컴포넌트 구현 범위 표"><table className="mobile-audit-table"><thead><tr><th scope="col">화면 패턴 / SwiftUI</th><th scope="col">브라우저 실행</th><th scope="col">React Native · Expo</th><th scope="col">기기에서 확인</th></tr></thead><tbody>{coverage.map((item) => <tr key={item.id}><th scope="row"><strong>{item.pattern}</strong><code>{item.swiftUI}</code></th><td>{item.web}</td><td><span className="mobile-coverage-status" data-status={item.status}>{item.status === 'source' ? '구현 있음' : '추가 연결'}</span><code>{item.native}</code></td><td>{item.check}</td></tr>)}</tbody></table></div>
    </section>

    <section {...sectionProps('platforms')} className="mobile-lab-panel">
      <div className="mobile-platform-note"><ShieldCheck size={20} /><div><strong>모바일 패턴과 기기 전용 기능을 구분합니다.</strong><p>하단 시트·탭·스와이프는 웹에서도 구현할 수 있습니다. OS 탭 바·기기 생체 인증처럼 플랫폼에 묶인 동작, 권한이 필요한 사진·카메라·알림은 별도로 확인합니다. 현재 기기 검증은 완료 전입니다.</p></div></div>
      <div className="mobile-platform-filter mobile-control-options" role="group" aria-label="플랫폼 지원 분류">{([{ value: 'all', label: '전체' }, ...Object.entries(groupLabels).map(([value, label]) => ({ value: value as keyof typeof groupLabels, label }))] as const).map((item) => <button type="button" key={item.value} aria-pressed={platformFilter === item.value} onClick={() => setPlatformFilter(item.value)}>{item.label}</button>)}</div>
      <div className="mobile-capabilities">{capabilities.map((item) => <article className="mobile-capability" key={item.id}><header><span>{groupLabels[item.group]}</span><h2>{item.name}</h2><div><span className="mobile-coverage-status">{scopeLabels[item.scope]}</span><span className="mobile-coverage-status" data-status={item.implementationStatus === 'implemented' ? 'source' : 'adapter'}>{item.implementationStatus === 'implemented' ? 'Moru 구현 있음' : '추가 연결 필요'}</span></div></header><dl><div><dt>웹</dt><dd>{item.web}</dd></div><div><dt>iOS</dt><dd>{item.ios}</dd></div><div><dt>Android</dt><dd>{item.android}</dd></div></dl>{item.componentNames.length ? <p className="mobile-capability-components">{item.componentNames.join(' · ')}</p> : null}<p className="mobile-capability-note">{item.verificationNote}</p><footer>{item.docs.map((doc) => <a key={doc.url} href={doc.url} target="_blank" rel="noreferrer">{doc.label}<ArrowUpRight size={11} /></a>)}</footer></article>)}</div>
    </section>

    <section {...sectionProps('expo')} className="mobile-lab-panel">
      <div className="mobile-expo-intro"><div><span className="eyebrow">FROM BROWSER TO DEVICE</span><h2>같은 컴포넌트로 이어 만들기</h2><p>이 랩의 화면은 Expo 앱의 실제 소스를 실행합니다. 스타터에는 같은 화면·Moru Native 패키지와 플랫폼별 연결이 들어 있습니다.</p></div>{onExportNative ? <button type="button" onClick={onExportNative}><ArrowDownToLine size={14} />현재 네이티브 토큰 내보내기</button> : null}{onOpenNativeSource ? <button type="button" onClick={onOpenNativeSource}><Code2 size={14} />네이티브 소스 보기</button> : null}<a href="/downloads/moru-native-starter.zip" download="moru-native-starter.zip"><ArrowDownToLine size={14} />Expo 스타터 다운로드</a></div>
      <div className="mobile-expo-grid"><section className="mobile-expo-card"><span>01 / START</span><h3>Expo 앱 실행</h3><pre tabIndex={0}><code>cd apps/moru-expo{'\n'}npm install{'\n'}npx expo start</code></pre><p>실제 OS 컨트롤·제스처·키보드 확인은 SDK에 맞는 개발 빌드와 기기에서 진행합니다.</p></section><section className="mobile-expo-card"><span>02 / SHARED SOURCE</span><h3>같은 소스의 연결</h3><dl><div><dt>재사용 컴포넌트</dt><dd>packages/moru-native/src</dd></div><div><dt>웹·앱 공통 예제</dt><dd>apps/moru-expo/src/components/NativeLabHome.tsx</dd></div><div><dt>브라우저 실행</dt><dd>Expo Web · React Native Web</dd></div></dl></section></div>
      <section className="mobile-expo-code"><header><h3>Moru Native 시작 코드</h3><button type="button" onClick={() => void copyCode()}>{codeCopied ? <Check size={13} /> : <Code2 size={13} />}{codeCopied ? '복사됨' : '예시 코드 복사'}</button></header><pre tabIndex={0} role="region" aria-label="Moru 네이티브 시작 예시 코드"><code>{expoCode}</code></pre>{copyError ? <p role="status">코드를 선택해 직접 복사해 주세요.</p> : null}</section>
      <div className="mobile-expo-notes"><section><h3>테마를 함께 적용</h3><p>내보낸 JSON의 mode와 tokens를 MoruNativeProvider에 전달합니다. 역할별 타이포·크기·간격이 공유되며, 앱의 사용자 지정 폰트는 별도 등록합니다.</p></section><section><h3>OS 컨트롤 확인</h3><p>Picker·Slider는 같은 Universal API를 사용합니다. 날짜 선택의 브라우저 대체와 기기의 OS 컨트롤을 구분합니다.</p><a href="https://docs.expo.dev/versions/v58.0.0/sdk/ui/" target="_blank" rel="noreferrer">Expo UI 문서<ArrowUpRight size={12} /></a></section><section><h3>기기에서 마무리</h3><p>노치·소프트 키보드·뒤로가기 제스처·VoiceOver·TalkBack·권한 요청은 실제 iOS·Android에서 확인해야 합니다.</p><a href="https://docs.expo.dev/workflow/web/" target="_blank" rel="noreferrer">웹·앱 코드 공유<ArrowUpRight size={12} /></a></section></div>
    </section>
  </div>
}
