import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { useI18n } from '../../i18n'
import { normalizeColor } from '../../theme/tokens'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import './palette-role-color-editor.css'

export type PaletteRoleColorEditorProps = {
  label: string
  /** The currently displayed HEX color, including when automatic foreground is enabled. */
  value: string
  onChange: (color: string) => void
  disabled?: boolean
  auto?: { enabled: boolean; onReset: () => void }
  children?: ReactNode
}

/** Inline editing keeps the chosen role in view in narrow, scrolling token panels. */
export function PaletteRoleColorEditor({
  label,
  value,
  onChange,
  disabled = false,
  auto,
  children,
}: PaletteRoleColorEditorProps) {
  const { t } = useI18n()
  const id = useId()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const [invalid, setInvalid] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const emittedColor = useRef<string | null>(null)
  const skipBlur = useRef(false)
  const dirty = useRef(false)

  useEffect(() => {
    // Preserve the user's spelling while their own live update returns through
    // props; wheel edits, reverts and other external values replace the draft.
    if (value === emittedColor.current && document.activeElement === input.current) return
    emittedColor.current = null
    dirty.current = false
    setDraft(value)
    setInvalid(false)
  }, [value])

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  function publish(color: string) {
    if (disabled) return
    dirty.current = false
    emittedColor.current = color
    onChange(color)
  }

  function commit() {
    if (!dirty.current || disabled) return
    const normalized = normalizeColor(draft.startsWith('#') ? draft : `#${draft}`)
    if (!normalized) {
      setInvalid(true)
      return
    }
    setDraft(normalized)
    setInvalid(false)
    publish(normalized)
  }

  function cancelDraft() {
    skipBlur.current = true
    dirty.current = false
    setDraft(value)
    setInvalid(false)
    setOpen(false)
    trigger.current?.focus({ preventScroll: true })
  }

  return (
    <div className="palette-role-editor" data-disabled={disabled || undefined}>
      <Button
        ref={trigger}
        variant="ghost"
        size="sm"
        textWrap="wrap"
        className="palette-role-editor__trigger"
        aria-label={t('{role} 색상 편집', { role: label })}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        disabled={disabled}
        focusableWhenDisabled
        onClick={() => {
          skipBlur.current = false
          setOpen((previous) => !previous)
        }}
      >
        <span className="palette-role-editor__swatch" style={{ backgroundColor: value }} />
        <span className="palette-role-editor__summary">
          <span className="palette-role-editor__label">{label}</span>
          <span className="palette-role-editor__value">
            <code>{value.toUpperCase()}</code>
            {auto?.enabled && <span>{t('자동')}</span>}
          </span>
        </span>
        <ChevronDown size={13} aria-hidden="true" />
      </Button>
      {open && !disabled && (
        <div
          id={`${id}-panel`}
          className="palette-role-editor__panel"
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return
            event.preventDefault()
            event.stopPropagation()
            cancelDraft()
          }}
        >
          <div className="palette-role-editor__fields">
            <input
              type="color"
              value={value}
              aria-label={t('{role} 색상 선택기', { role: label })}
              onChange={(event) => {
                const color = normalizeColor(event.target.value)
                if (!color) return
                setDraft(color)
                setInvalid(false)
                publish(color)
              }}
            />
            <Input
              ref={input}
              size="sm"
              value={draft.toUpperCase()}
              aria-label={t('{role} HEX 편집', { role: label })}
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? `${id}-error` : undefined}
              autoComplete="off"
              spellCheck={false}
              maxLength={7}
              onFocus={() => {
                skipBlur.current = false
              }}
              onChange={(event) => {
                const next = event.target.value
                dirty.current = true
                setDraft(next)
                setInvalid(false)
                // Three-digit colors commit on Enter/blur, so typing a six-digit
                // value never expands a partial draft halfway through the edit.
                if (/^#?[\da-f]{6}$/i.test(next)) {
                  const color = normalizeColor(next.startsWith('#') ? next : `#${next}`)
                  if (color) publish(color)
                }
              }}
              onBlur={() => {
                if (skipBlur.current) {
                  skipBlur.current = false
                  return
                }
                commit()
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return
                event.preventDefault()
                commit()
              }}
            />
          </div>
          {invalid && (
            <p id={`${id}-error`} className="palette-role-editor__error" role="status">
              {t('#RGB 또는 #RRGGBB 형식으로 입력해 주세요.')}
            </p>
          )}
          {auto && (
            <Button
              size="sm"
              variant="ghost"
              textWrap="wrap"
              className="palette-role-editor__auto"
              disabled={auto.enabled}
              focusableWhenDisabled
              onClick={() => {
                dirty.current = false
                setDraft(value)
                setInvalid(false)
                auto.onReset()
              }}
            >
              <RotateCcw size={13} aria-hidden="true" />
              {t('자동으로')}
            </Button>
          )}
          {children}
        </div>
      )}
    </div>
  )
}
