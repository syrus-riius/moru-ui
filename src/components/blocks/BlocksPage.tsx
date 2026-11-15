import { useI18n } from '../../i18n'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  Layers3,
  Monitor,
  RotateCcw,
  Smartphone,
} from 'lucide-react'
import { Button } from '../ui/button'
import { useToast } from '../ui/toast'
import { BlockPreview } from './BlockPreview'
import { BLOCKS, getBlockSource, type BlockId } from './block-catalog'
import './blocks-page.css'

export interface BlocksPageProps {
  renderAiAction?: (id: BlockId) => ReactNode
  onInsert: (id: BlockId, device: 'mobile' | 'web') => void
  onExamples: () => void
  initialBlockId?: BlockId
  onBlockChange?: (id: BlockId) => void
}

const categories = ['전체', '업무', '인증', '설정'] as const
const blockNumbers = Object.fromEntries(
  BLOCKS.map((block, index) => [block.id, String(index + 1).padStart(2, '0')]),
)

/** A reusable composition can be tried, inspected, and carried into a prototype. */
export function BlocksPage({
  onInsert,
  onExamples,
  initialBlockId,
  onBlockChange,
  renderAiAction,
}: BlocksPageProps) {
  const { t } = useI18n()
  const { toast } = useToast()
  const id = useId()
  const [category, setCategory] = useState<(typeof categories)[number]>('전체')
  const [localSelectedId, setSelectedId] = useState<BlockId>(() => initialBlockId ?? 'dashboard')
  const [device, setDevice] = useState<'mobile' | 'web'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches
      ? 'mobile'
      : 'web',
  )
  const [view, setView] = useState<'preview' | 'code'>('preview')
  const [revision, setRevision] = useState(0)
  const [copiedId, setCopiedId] = useState<BlockId | null>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mounted = useRef(true)
  const viewButtons = useRef<(HTMLButtonElement | null)[]>([])
  const selectedId = initialBlockId ?? localSelectedId
  const selected = BLOCKS.find((block) => block.id === selectedId) ?? BLOCKS[0]
  const effectiveCategory =
    category !== '전체' && selected.category !== category ? '전체' : category
  const visible = BLOCKS.filter(
    (block) => effectiveCategory === '전체' || block.category === effectiveCategory,
  )
  const source = getBlockSource(selected.id)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      clearTimeout(copyTimer.current)
    }
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
      toast({ title: t('{name} 코드를 복사했어요.', { name: t(selected.title) }), tone: 'success' })
    } catch {
      if (!mounted.current) return
      setView('code')
      toast({
        title: t('코드를 복사하지 못했어요.'),
        description: t('코드 보기에서 직접 선택해 복사해 주세요.'),
        tone: 'danger',
      })
    }
  }

  return (
    <div className="blocks-page">
      <header className="catalog-intro blocks-intro">
        <span className="eyebrow">MORU UI / BLOCKS & PATTERNS</span>
        <h1>{t('화면 블록')}</h1>
        <p>
          {t('회원가입부터 업무 관리까지, 실제 제품에서 쓰는 화면을 Moru 컴포넌트로 조합했습니다.')}
        </p>
        <div className="catalog-meta">
          <span>{BLOCKS.length} BLOCKS</span>
          <span>{t('실제 Moru 컴포넌트 · 반응형 미리보기 · TSX 소스')}</span>
        </div>
      </header>

      <div className="blocks-discovery-bar">
        <div className="blocks-category-picker" role="group" aria-label={t('블록 카테고리')}>
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={effectiveCategory === item}
              onClick={() => chooseCategory(item)}
            >
              {t(item)}
              <span>
                {item === '전체'
                  ? BLOCKS.length
                  : BLOCKS.filter((block) => block.category === item).length}
              </span>
            </button>
          ))}
        </div>
        <span className="blocks-result-count" role="status">
          {t('{count}개 블록', { count: visible.length })}
        </span>
      </div>

      <div className="blocks-selector-grid" role="group" aria-label={t('사용할 블록 선택')}>
        {visible.map((block) => (
          <button
            type="button"
            key={block.id}
            className="blocks-selector"
            aria-pressed={selected.id === block.id}
            onClick={() => chooseBlock(block.id)}
          >
            <span className="blocks-selector-meta">
              <span>
                {blockNumbers[block.id]} / {t(block.category)}
              </span>
              <span className="blocks-selector-check" aria-hidden="true">
                {selected.id === block.id ? <Check size={13} /> : <ArrowRight size={13} />}
              </span>
            </span>
            <strong>{t(block.title)}</strong>
            <span className="blocks-selector-description">{t(block.description)}</span>
            <span className="blocks-selector-components">
              {block.flow.map((step) => t(step)).join(' → ')}
            </span>
          </button>
        ))}
      </div>

      <section className="blocks-workbench" aria-labelledby={`${id}-title`}>
        <header className="blocks-workbench-heading">
          <div>
            <span className="blocks-section-label">
              {t(selected.category)} / {blockNumbers[selected.id]}
            </span>
            <h2 id={`${id}-title`}>{t(selected.title)}</h2>
            <p>{t(selected.description)}</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => onInsert(selected.id, device)}>
            <Layers3 size={14} aria-hidden="true" />
            {t('시뮬레이터에 넣기')}
          </Button>
        </header>

        <div className="blocks-preview-toolbar">
          <div className="blocks-view-picker" role="tablist" aria-label={t('블록 보기 방식')}>
            {(['preview', 'code'] as const).map((item, index) => (
              <button
                type="button"
                key={item}
                ref={(node) => {
                  viewButtons.current[index] = node
                }}
                role="tab"
                id={`${id}-tab-${t(item)}`}
                aria-selected={view === item}
                aria-controls={`${id}-panel`}
                tabIndex={view === item ? 0 : -1}
                onClick={() => setView(item)}
                onKeyDown={(event) => {
                  const next =
                    event.key === 'ArrowRight' || event.key === 'ArrowLeft'
                      ? (index + 1) % 2
                      : event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? 1
                          : null
                  if (next === null) return
                  event.preventDefault()
                  setView(next === 0 ? 'preview' : 'code')
                  viewButtons.current[next]?.focus()
                }}
              >
                {item === 'preview' ? (
                  <>
                    <Layers3 size={13} aria-hidden="true" />
                    {t('미리보기')}
                  </>
                ) : (
                  <>
                    <Code2 size={13} aria-hidden="true" />
                    {t('코드')}
                  </>
                )}
              </button>
            ))}
          </div>
          <div className="blocks-preview-tools">
            {renderAiAction?.(selected.id)}
            {view === 'preview' ? (
              <>
                <div
                  className="blocks-device-picker"
                  role="group"
                  aria-label={t('블록 미리보기 화면 크기')}
                >
                  <button
                    type="button"
                    aria-pressed={device === 'mobile'}
                    onClick={() => setDevice('mobile')}
                  >
                    <Smartphone size={14} aria-hidden="true" />
                    <span>{t('모바일')}</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={device === 'web'}
                    onClick={() => setDevice('web')}
                  >
                    <Monitor size={14} aria-hidden="true" />
                    <span>{t('웹')}</span>
                  </button>
                </div>
                <button
                  type="button"
                  className="blocks-icon-action"
                  onClick={() => setRevision((previous) => previous + 1)}
                  aria-label={t('블록 미리보기 초기화')}
                  title={t('미리보기 초기화')}
                >
                  <RotateCcw size={14} aria-hidden="true" />
                </button>
              </>
            ) : (
              <code className="blocks-source-filename">{selected.fileName}</code>
            )}
            <button
              type="button"
              className="blocks-copy-button"
              onClick={() => {
                void copySource()
              }}
            >
              {copiedId === selected.id ? (
                <Check size={14} aria-hidden="true" />
              ) : (
                <Copy size={14} aria-hidden="true" />
              )}
              <span>{t(copiedId === selected.id ? '복사 완료' : '코드 복사')}</span>
            </button>
          </div>
        </div>

        <div
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${view}`}
          className="blocks-workbench-panel"
          tabIndex={0}
        >
          {view === 'preview' ? (
            <>
              <div
                className="blocks-preview-stage"
                data-device={device}
                role="region"
                aria-label={t('{name} {device} 미리보기', {
                  name: t(selected.title),
                  device: t(device === 'mobile' ? '모바일' : '웹'),
                })}
                tabIndex={0}
              >
                <div className="blocks-preview-frame" data-device={device}>
                  <div className="blocks-frame-chrome" aria-hidden="true">
                    <span className="blocks-frame-dots">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span>{device === 'mobile' ? 'Moru / Mobile' : 'Moru / Web'}</span>
                    <span>{device === 'mobile' ? '390' : '880'} px</span>
                  </div>
                  <div className="blocks-preview-content">
                    <BlockPreview key={`${selected.id}-${revision}`} blockId={selected.id} />
                  </div>
                </div>
              </div>
              <div className="blocks-preview-caption">
                <span>
                  {device === 'web'
                    ? t('880px 웹 프레임 · 좁은 화면에서는 가로로 스크롤하세요.')
                    : t('최대 390px · 현재 화면 폭에 맞춰 표시합니다.')}
                </span>
                <span>{t('입력과 동작은 이 미리보기 안에서 실행됩니다.')}</span>
              </div>
            </>
          ) : (
            <div className="blocks-source-panel">
              <p>
                {t(
                  '아래 소스를 프로젝트의 {file}에 추가하세요. Moru 웹 스타터의 공통 컴포넌트와 포함된 블록을 사용합니다.',
                  { file: `src/${selected.fileName}` },
                )}
              </p>
              <pre tabIndex={0} aria-label={t('{name} TSX 소스 코드', { name: t(selected.title) })}>
                <code>{source}</code>
              </pre>
            </div>
          )}
        </div>

        <p className="blocks-insertion-note">
          {t(
            '시뮬레이터에는 편집 가능한 화면 구성이 추가됩니다. 가입·인증·필터의 실제 예제 동작은 위 미리보기에서 확인하고, 시뮬레이터에서는 화면과 동작을 직접 연결하세요.',
          )}
        </p>
        <footer className="blocks-workbench-footer">
          <span>{t('함께 쓰는 컴포넌트')}</span>
          <ul aria-label={t('{name}에 사용하는 Moru 컴포넌트', { name: t(selected.title) })}>
            {selected.components.map((component) => (
              <li key={component}>{component}</li>
            ))}
          </ul>
        </footer>
      </section>

      <aside className="blocks-examples-invitation" aria-label={t('블록에서 전체 예제로')}>
        <div>
          <span className="blocks-section-label">SCREENS TO PRODUCT</span>
          <h2>{t('화면을 연결해, 하나의 제품으로.')}</h2>
          <p>
            {t(
              '예제 허브에서 실제 작업 흐름을 살펴보고 시뮬레이터에서 나만의 화면으로 연결해 보세요.',
            )}
          </p>
        </div>
        <Button variant="secondary" onClick={onExamples}>
          {t('예제 허브 열기')}
          <ArrowRight size={14} aria-hidden="true" />
        </Button>
      </aside>
    </div>
  )
}
