import { useEffect, useId, useRef, useState } from 'react'
import { ArrowRight, Check, Code2, Copy, Layers3, Monitor, RotateCcw, Smartphone } from 'lucide-react'
import { Button } from '../ui/button'
import { useToast } from '../ui/toast'
import { BlockPreview } from './BlockPreview'
import { BLOCKS, getBlockSource, type BlockId } from './block-catalog'
import './blocks-page.css'

export interface BlocksPageProps {
  onInsert: (id: BlockId, device: 'mobile' | 'web') => void
  onExamples: () => void
  initialBlockId?: BlockId
  onBlockChange?: (id: BlockId) => void
}

const categories = ['전체', '인증', '탐색', '설정'] as const
const sourceFiles: Record<BlockId, string> = {
  login: 'LoginBlock.tsx', otp: 'OTPBlock.tsx', 'search-filters': 'SearchFiltersBlock.tsx', settings: 'SettingsBlock.tsx',
}
const blockNumbers: Record<BlockId, string> = { login: '01', otp: '02', 'search-filters': '03', settings: '04' }

/** A reusable composition can be tried, inspected, and carried into a prototype. */
export function BlocksPage({ onInsert, onExamples, initialBlockId, onBlockChange }: BlocksPageProps) {
  const { toast } = useToast()
  const id = useId()
  const [category, setCategory] = useState<typeof categories[number]>('전체')
  const [localSelectedId, setSelectedId] = useState<BlockId>(() => initialBlockId ?? 'login')
  const [device, setDevice] = useState<'mobile' | 'web'>(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches ? 'mobile' : 'web')
  const [view, setView] = useState<'preview' | 'code'>('preview')
  const [revision, setRevision] = useState(0)
  const [copiedId, setCopiedId] = useState<BlockId | null>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mounted = useRef(true)
  const viewButtons = useRef<(HTMLButtonElement | null)[]>([])
  const selectedId = initialBlockId ?? localSelectedId
  const selected = BLOCKS.find((block) => block.id === selectedId) ?? BLOCKS[0]
  const effectiveCategory = category !== '전체' && selected.category !== category ? '전체' : category
  const visible = BLOCKS.filter((block) => effectiveCategory === '전체' || block.category === effectiveCategory)
  const source = getBlockSource(selected.id)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false; clearTimeout(copyTimer.current) }
  }, [])

  function chooseCategory(next: typeof category) {
    setCategory(next)
    if (next !== '전체' && selected.category !== next) {
      const first = BLOCKS.find((block) => block.category === next)
      if (first) chooseBlock(first.id)
    }
  }

  function chooseBlock(next: BlockId) {
    setSelectedId(next)
    onBlockChange?.(next)
  }

  async function copySource() {
    try {
      await navigator.clipboard.writeText(source)
      if (!mounted.current) return
      setCopiedId(selected.id)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopiedId(null), 2200)
      toast({ title: `${selected.title} 코드를 복사했어요.`, tone: 'success' })
    } catch {
      if (!mounted.current) return
      setView('code')
      toast({ title: '코드를 복사하지 못했어요.', description: '코드 보기에서 직접 선택해 복사해 주세요.', tone: 'danger' })
    }
  }

  return <div className="blocks-page">
    <header className="catalog-intro blocks-intro">
      <span className="eyebrow">MORU UI / BLOCKS & PATTERNS</span>
      <h1>블록·패턴</h1>
      <p>좋은 부품을, 자주 쓰는 조합으로. 직접 동작을 확인하고 내 화면의 시작점으로 가져가세요.</p>
      <div className="catalog-meta"><span>{BLOCKS.length} BLOCKS</span><span>실제 Moru 컴포넌트 · 반응형 미리보기 · TSX 소스</span></div>
    </header>

    <div className="blocks-discovery-bar">
      <div className="blocks-category-picker" role="group" aria-label="블록 카테고리">
        {categories.map((item) => <button type="button" key={item} aria-pressed={effectiveCategory === item} onClick={() => chooseCategory(item)}>{item}<span>{item === '전체' ? BLOCKS.length : BLOCKS.filter((block) => block.category === item).length}</span></button>)}
      </div>
      <span className="blocks-result-count" role="status">{visible.length}개 블록</span>
    </div>

    <div className="blocks-selector-grid" role="group" aria-label="사용할 블록 선택">
      {visible.map((block) => <button type="button" key={block.id} className="blocks-selector" aria-pressed={selected.id === block.id} onClick={() => chooseBlock(block.id)}>
        <span className="blocks-selector-meta"><span>{blockNumbers[block.id]} / {block.category}</span><span className="blocks-selector-check" aria-hidden="true">{selected.id === block.id ? <Check size={13} /> : <ArrowRight size={13} />}</span></span>
        <strong>{block.title}</strong>
        <span className="blocks-selector-description">{block.description}</span>
        <span className="blocks-selector-components">{block.components.slice(0, 3).join(' · ')}</span>
      </button>)}
    </div>

    <section className="blocks-workbench" aria-labelledby={`${id}-title`}>
      <header className="blocks-workbench-heading">
        <div><span className="blocks-section-label">{selected.category} / {blockNumbers[selected.id]}</span><h2 id={`${id}-title`}>{selected.title}</h2><p>{selected.description}</p></div>
        <Button variant="primary" size="sm" onClick={() => onInsert(selected.id, device)}><Layers3 size={14} aria-hidden="true" />시뮬레이터에 넣기</Button>
      </header>

      <div className="blocks-preview-toolbar">
        <div className="blocks-view-picker" role="tablist" aria-label="블록 보기 방식">
          {(['preview', 'code'] as const).map((item, index) => <button type="button" key={item} ref={(node) => { viewButtons.current[index] = node }} role="tab" id={`${id}-tab-${item}`} aria-selected={view === item} aria-controls={`${id}-panel`} tabIndex={view === item ? 0 : -1} onClick={() => setView(item)} onKeyDown={(event) => {
            const next = event.key === 'ArrowRight' || event.key === 'ArrowLeft' ? (index + 1) % 2 : event.key === 'Home' ? 0 : event.key === 'End' ? 1 : null
            if (next === null) return
            event.preventDefault(); setView(next === 0 ? 'preview' : 'code'); viewButtons.current[next]?.focus()
          }}>{item === 'preview' ? <><Layers3 size={13} aria-hidden="true" />미리보기</> : <><Code2 size={13} aria-hidden="true" />코드</>}</button>)}
        </div>
        <div className="blocks-preview-tools">
          {view === 'preview' ? <><div className="blocks-device-picker" role="group" aria-label="블록 미리보기 화면 크기"><button type="button" aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}><Smartphone size={14} aria-hidden="true" /><span>모바일</span></button><button type="button" aria-pressed={device === 'web'} onClick={() => setDevice('web')}><Monitor size={14} aria-hidden="true" /><span>웹</span></button></div><button type="button" className="blocks-icon-action" onClick={() => setRevision((previous) => previous + 1)} aria-label="블록 미리보기 초기화" title="미리보기 초기화"><RotateCcw size={14} aria-hidden="true" /></button></> : <code className="blocks-source-filename">{sourceFiles[selected.id]}</code>}
          <button type="button" className="blocks-copy-button" onClick={() => { void copySource() }}>{copiedId === selected.id ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}<span>{copiedId === selected.id ? '복사 완료' : '코드 복사'}</span></button>
        </div>
      </div>

      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${view}`} className="blocks-workbench-panel" tabIndex={0}>
        {view === 'preview' ? <>
          <div className="blocks-preview-stage" data-device={device} role="region" aria-label={`${selected.title} ${device === 'mobile' ? '모바일' : '웹'} 미리보기`} tabIndex={0}>
            <div className="blocks-preview-frame" data-device={device}>
              <div className="blocks-frame-chrome" aria-hidden="true"><span className="blocks-frame-dots"><i /><i /><i /></span><span>{device === 'mobile' ? 'Moru / Mobile' : 'Moru / Web'}</span><span>{device === 'mobile' ? '390' : '880'} px</span></div>
              <div className="blocks-preview-content"><BlockPreview key={`${selected.id}-${revision}`} blockId={selected.id} /></div>
            </div>
          </div>
          <div className="blocks-preview-caption"><span>{device === 'web' ? '880px 웹 프레임 · 좁은 화면에서는 가로로 스크롤하세요.' : '최대 390px · 현재 화면 폭에 맞춰 표시합니다.'}</span><span>입력과 동작은 이 미리보기 안에서 실행됩니다.</span></div>
        </> : <div className="blocks-source-panel"><p>아래 소스를 프로젝트의 <code>src/{sourceFiles[selected.id]}</code>에 추가하세요. Moru 웹 스타터의 공통 컴포넌트를 사용합니다.</p><pre tabIndex={0} aria-label={`${selected.title} TSX 소스 코드`}><code>{source}</code></pre></div>}
      </div>

      <p className="blocks-insertion-note">시뮬레이터에는 새 화면의 편집 가능한 요소로 추가됩니다. 필터·저장은 위 미리보기에서 체험하고, 가져간 화면에서는 이동과 동작을 연결하세요.</p>
      <footer className="blocks-workbench-footer"><span>함께 쓰는 컴포넌트</span><ul aria-label={`${selected.title}에 사용하는 Moru 컴포넌트`}>{selected.components.map((component) => <li key={component}>{component}</li>)}</ul></footer>
    </section>

    <aside className="blocks-examples-invitation" aria-label="블록에서 전체 예제로">
      <div><span className="blocks-section-label">BLOCKS TO SCREENS</span><h2>조합을 골랐다면, 하나의 화면으로.</h2><p>예제 허브에서 실제 작업 흐름을 살펴보고 시뮬레이터에서 나만의 화면으로 연결해 보세요.</p></div>
      <Button variant="secondary" onClick={onExamples}>예제 허브 열기<ArrowRight size={14} aria-hidden="true" /></Button>
    </aside>
  </div>
}
