import { useI18n } from '../../lib/i18n'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, Copy, FileText, RotateCcw, Sparkles } from 'lucide-react'
import {
  aiExpoPath,
  buildAiContext,
  canonicalAiItemId,
  loadAiCatalog,
  loadAiDocument,
  type AiCatalog,
  type AiSelectedItem,
  type AiTarget,
} from '../../lib/ai-context'
import { cn } from '../../lib/cn'
import type { ThemeMode, ThemeTokens } from '../../theme/tokens'
import { Button } from '../ui/button'
import { Dialog } from '../ui/dialog'
import { Field } from '../ui/field'
import { Input } from '../ui/input'
import { NativeSelect } from '../ui/native-select'
import { Textarea } from '../ui/textarea'
import './ai-context.css'

export interface AiContextButtonProps {
  tokens: ThemeTokens
  mode: ThemeMode
  initialItems?: readonly string[]
  defaultTarget?: AiTarget
  className?: string
}

const emptyItems: readonly string[] = []
const itemLimit = 6
const targetOptions = [
  { value: 'web-registry', label: 'React 웹 · 선택 설치' },
  { value: 'web-starter', label: 'React 웹 · 스타터' },
  { value: 'expo-starter', label: 'React Native · Expo' },
]

type CatalogState =
  { status: 'loading' | 'error'; error?: string } | { status: 'ready'; catalog: AiCatalog }
type DocumentState =
  | { key: string; status: 'loading' | 'error'; error?: string }
  | { key: string; status: 'ready'; items: AiSelectedItem[]; platformGuide: string }

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : 'AI 안내를 불러오지 못했어요. 다시 시도해 주세요.'
}

/** The picker and its requests exist only while the review dialog is open. */
function AiContextContent({
  tokens,
  mode,
  initialItems = emptyItems,
  defaultTarget = 'web-registry',
}: AiContextButtonProps) {
  const { t } = useI18n()

  const id = useId()
  const [target, setTarget] = useState<AiTarget>(defaultTarget)
  const [goal, setGoal] = useState('')
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    [...new Set(initialItems.map(canonicalAiItemId))].slice(0, itemLimit),
  )
  const [catalogState, setCatalogState] = useState<CatalogState>({ status: 'loading' })
  const [documentState, setDocumentState] = useState<DocumentState>({ key: '', status: 'loading' })
  const [revision, setRevision] = useState(0)
  const [copyState, setCopyState] = useState<{
    packet: string
    status: 'success' | 'error'
  } | null>(null)
  const [copying, setCopying] = useState(false)
  const preview = useRef<HTMLTextAreaElement>(null)
  const mounted = useRef(true)
  const native = target === 'expo-starter'
  const catalog = catalogState.status === 'ready' ? catalogState.catalog : null
  const selectionKey = selectedIds.join(',')
  const requestKey = `${catalog?.sourceHash ?? ''}:${target}:${native ? '' : selectionKey}:${revision}`

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setCatalogState({ status: 'loading' })
    loadAiCatalog(controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return
        setCatalogState({ status: 'ready', catalog: next })
        setSelectedIds((current) =>
          current.filter((item) => next.entries.some((entry) => entry.id === item)),
        )
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setCatalogState({ status: 'error', error: messageFrom(error) })
      })
    return () => controller.abort()
  }, [revision])

  useEffect(() => {
    if (!catalog) return
    const controller = new AbortController()
    const selected = native
      ? []
      : selectedIds
          .map((item) => catalog.entries.find((entry) => entry.id === item))
          .filter((entry) => entry !== undefined)
    setDocumentState({ key: requestKey, status: 'loading' })
    Promise.all([
      native ? loadAiDocument(aiExpoPath(), controller.signal) : Promise.resolve(''),
      Promise.all(
        selected.map(async (entry) => ({
          entry,
          documentation: await loadAiDocument(entry.docPath, controller.signal),
        })),
      ),
    ])
      .then(([platformGuide, items]) => {
        if (!controller.signal.aborted)
          setDocumentState({ key: requestKey, status: 'ready', platformGuide, items })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setDocumentState({ key: requestKey, status: 'error', error: messageFrom(error) })
      })
    return () => controller.abort()
  }, [catalog, native, requestKey, selectionKey])

  const prepared = useMemo(() => {
    if (!catalog || documentState.key !== requestKey || documentState.status !== 'ready')
      return { packet: '', error: '' }
    try {
      return {
        packet: buildAiContext({
          target,
          mode,
          tokens,
          goal,
          items: documentState.items,
          platformGuide: documentState.platformGuide,
        }),
        error: '',
      }
    } catch (error) {
      return { packet: '', error: messageFrom(error) }
    }
  }, [catalog, documentState, requestKey, target, mode, tokens, goal])
  const packet = prepared.packet
  const packetRef = useRef(packet)
  packetRef.current = packet
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const visibleEntries =
    catalog?.entries.filter(
      (entry) =>
        canonicalAiItemId(entry.id) === entry.id &&
        `${entry.id} ${entry.title} ${entry.description}`
          .toLocaleLowerCase()
          .includes(normalizedQuery),
    ) ?? []
  const fetchError =
    catalogState.status === 'error'
      ? catalogState.error
      : documentState.key === requestKey && documentState.status === 'error'
        ? documentState.error
        : ''
  const error = fetchError || prepared.error
  const copyResult = copyState?.packet === packet ? copyState.status : null
  const ready = Boolean(packet) && !error

  function toggleItem(item: string, checked: boolean) {
    setSelectedIds((current) =>
      checked
        ? current.length < itemLimit
          ? [...current, item]
          : current
        : current.filter((value) => value !== item),
    )
  }

  async function copyPacket() {
    if (!ready || copying) return
    const snapshot = packet
    setCopying(true)
    try {
      await navigator.clipboard.writeText(snapshot)
      if (mounted.current && packetRef.current === snapshot)
        setCopyState({ packet: snapshot, status: 'success' })
    } catch {
      if (mounted.current && packetRef.current === snapshot)
        setCopyState({ packet: snapshot, status: 'error' })
    } finally {
      if (mounted.current) setCopying(false)
    }
  }

  function selectPacket() {
    preview.current?.focus()
    preview.current?.select()
  }

  return (
    <div className="moru-ai-content">
      <div className="moru-ai-context-summary">
        <FileText size={16} aria-hidden="true" />
        <span>
          {t('현재 {mode} 토큰 + 사용 명세', { mode: t(mode === 'dark' ? '다크' : '라이트') })}
        </span>
        {catalog ? <span className="moru-ai-version">v{catalog.version}</span> : null}
      </div>

      <div className="moru-ai-context-fields">
        <Field label={t('만들 프로젝트')}>
          <NativeSelect
            value={target}
            items={targetOptions.map((option) => ({ ...option, label: t(option.label) }))}
            onValueChange={(value) => setTarget(value as AiTarget)}
          />
        </Field>
        <Field label={t('만들 화면 (선택)')}>
          <Textarea
            rows={2}
            maxLength={2000}
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder={t('예: 프로젝트 목록과 검색 필터가 있는 반응형 화면')}
          />
        </Field>
      </div>

      {native ? (
        <p className="moru-ai-context-note">
          {t(
            'Expo 스타터의 네이티브 API와 토큰 안내를 담습니다. 모바일 웹 화면은 ‘React 웹’을 선택하세요.',
          )}
        </p>
      ) : (
        <fieldset className="moru-ai-picker" aria-describedby={`${id}-selection-help`}>
          <legend>
            {t('사용할 컴포넌트·블록')}{' '}
            <span>
              {selectedIds.length} / {itemLimit}
            </span>
          </legend>
          <p id={`${id}-selection-help`}>
            {t('최대 6개를 고르세요. 필요한 의존성은 각 명세에서 안내합니다.')}
          </p>
          <Input
            type="search"
            size="sm"
            aria-label={t('AI 안내에 넣을 컴포넌트 검색')}
            placeholder={t('Input, OTP, 설정…')}
            value={query}
            onValueChange={setQuery}
            disabled={!catalog}
          />
          <div className="moru-ai-picker-list" aria-busy={catalogState.status === 'loading'}>
            {catalogState.status === 'loading' ? (
              <p className="moru-ai-picker-empty" role="status">
                {t('컴포넌트 목록을 준비하고 있어요.')}
              </p>
            ) : null}
            {catalog
              ? visibleEntries.map((entry) => (
                  <label
                    key={entry.id}
                    className="moru-ai-picker-option"
                    data-selected={selectedIds.includes(entry.id) || undefined}
                  >
                    <input
                      type="checkbox"
                      aria-labelledby={`${id}-${entry.id}-title`}
                      aria-describedby={`${id}-${entry.id}-description`}
                      checked={selectedIds.includes(entry.id)}
                      disabled={selectedIds.length >= itemLimit && !selectedIds.includes(entry.id)}
                      onChange={(event) => toggleItem(entry.id, event.target.checked)}
                    />
                    <span>
                      <strong id={`${id}-${entry.id}-title`}>{entry.title}</strong>
                      <small id={`${id}-${entry.id}-description`}>{entry.description}</small>
                    </span>
                    <span className="moru-ai-item-kind">
                      {entry.kind === 'block'
                        ? t('블록')
                        : entry.kind === 'foundation'
                          ? t('기반')
                          : 'UI'}
                    </span>
                  </label>
                ))
              : null}
            {catalog && !visibleEntries.length ? (
              <p className="moru-ai-picker-empty" role="status">
                {t('일치하는 항목이 없어요.')}
              </p>
            ) : null}
          </div>
        </fieldset>
      )}

      {error ? (
        <div className="moru-ai-context-error" role="alert">
          <span>{t(error)}</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setRevision((current) => current + 1)}
          >
            <RotateCcw size={14} aria-hidden="true" />
            {t('다시 불러오기')}
          </Button>
        </div>
      ) : null}

      <div className="moru-ai-preview">
        <div className="moru-ai-preview-heading">
          <label htmlFor={`${id}-packet`}>{t('AI에 전달할 내용')}</label>
          <span>
            {ready
              ? t('{v0}자', { v0: packet.length.toLocaleString() })
              : error
                ? t('다시 불러와 주세요')
                : t('준비 중')}
          </span>
        </div>
        <Textarea
          id={`${id}-packet`}
          ref={preview}
          className="moru-ai-packet"
          rows={10}
          value={packet}
          readOnly
          spellCheck={false}
          aria-busy={!ready && !error}
          placeholder={
            error
              ? t('안내를 불러온 뒤 내용을 확인할 수 있어요.')
              : t('선택한 사용 명세와 현재 디자인 토큰을 준비하고 있어요.')
          }
        />
      </div>

      <div className="moru-ai-context-actions">
        <p role="status" aria-live="polite">
          {copyResult === 'success'
            ? t('복사했어요. 사용하는 AI에 붙여넣으세요.')
            : copyResult === 'error'
              ? t('복사하지 못했어요. 직접 선택한 뒤 복사해 주세요.')
              : t('내용을 확인하고 사용하는 AI에 붙여넣으세요.')}
        </p>
        <div>
          <Button type="button" variant="ghost" size="sm" onClick={selectPacket} disabled={!ready}>
            {t('직접 선택')}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              void copyPacket()
            }}
            disabled={!ready}
            loading={copying}
          >
            {copyResult === 'success' ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <Copy size={14} aria-hidden="true" />
            )}
            {copyResult === 'success' ? t('복사 완료') : t('AI용 안내 복사')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AiContextButton(props: AiContextButtonProps) {
  const { t } = useI18n()

  const [open, setOpen] = useState(false)
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      className="moru-ai-context-dialog"
      title={t('AI에 전달')}
      description={t('현재 디자인과 필요한 사용법을 한 번에 가져가세요.')}
      trigger={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className={cn('moru-ai-context-trigger', props.className)}
        >
          <Sparkles size={14} aria-hidden="true" />
          {t('AI에 전달')}
        </Button>
      }
    >
      {open ? <AiContextContent {...props} /> : null}
    </Dialog>
  )
}
