import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { Input, type InputProps } from './input'
import {
  deleteInputSeparator,
  formatInputEdit,
  formatInputValue,
  isMaskedInputFormat,
  subscribeFormattedInputReset,
  type InputFormat,
} from './formatted-input-utils'

export type { InputFormat } from './formatted-input-utils'
export { validateFormattedInput } from './formatted-input-utils'

export type FormattedInputProps = Omit<
  InputProps,
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'onChange'
  | 'type'
  | 'inputMode'
  | 'render'
  | 'maxLength'
> & {
  format: InputFormat
  /** The displayed string, including formatting separators. Native FormData uses this string too. */
  value?: string
  defaultValue?: string
  /** Canonical value callback, including formatted separator deletion and completed IME edits. */
  onValueChange?: (value: string) => void
  /** Native change-event hook before formatting. Use onValueChange to control the displayed value. */
  onChange?: InputProps['onChange']
}

const inputDefaults = {
  'card-number': { type: 'text', inputMode: 'numeric', autoComplete: 'cc-number' },
  'card-expiry': { type: 'text', inputMode: 'numeric', autoComplete: 'cc-exp' },
  'card-cvc': { type: 'text', inputMode: 'numeric', autoComplete: 'cc-csc' },
  phone: { type: 'tel', inputMode: 'tel', autoComplete: 'tel' },
  email: { type: 'email', inputMode: 'email', autoComplete: 'email' },
  url: { type: 'url', inputMode: 'url', autoComplete: 'url' },
  ipv4: { type: 'text', inputMode: 'decimal', autoComplete: 'off' },
  ipv6: { type: 'text', inputMode: 'text', autoComplete: 'off' },
  'postal-code': { type: 'text', inputMode: 'numeric', autoComplete: 'postal-code' },
} as const

/** Opt-in formatting on Moru's existing Input. Validation is explicit via Field + the helper. */
export const FormattedInput = forwardRef<HTMLInputElement, FormattedInputProps>(
  function FormattedInput(
    {
      format,
      value,
      defaultValue = '',
      onValueChange,
      onChange,
      onKeyDown,
      onCompositionStart,
      onCompositionEnd,
      onBlur,
      autoComplete,
      readOnly,
      disabled,
      loading,
      previewState,
      ...props
    },
    ref,
  ) {
    const [internalValue, setInternalValue] = useState(() => formatInputValue(format, defaultValue))
    const [compositionValue, setCompositionValue] = useState<string | null>(null)
    const [editVersion, setEditVersion] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const composing = useRef(false)
    const caret = useRef<number | null>(null)
    const unavailable =
      disabled || loading || previewState === 'disabled' || previewState === 'loading'
    const current = formatInputValue(format, value ?? internalValue)
    const displayed = unavailable || readOnly ? current : (compositionValue ?? current)
    const resetState = useRef({ value, defaultValue, format })
    resetState.current = { value, defaultValue, format }

    useImperativeHandle(ref, () => inputRef.current!, [])

    useEffect(() => {
      if (!unavailable && !readOnly) return
      composing.current = false
      caret.current = null
      setCompositionValue(null)
    }, [unavailable, readOnly])

    useEffect(() => {
      const form = inputRef.current?.form
      if (!form) return
      return subscribeFormattedInputReset(
        form,
        () => {
          composing.current = false
          setCompositionValue(null)
          setInternalValue(
            formatInputValue(resetState.current.format, resetState.current.defaultValue),
          )
          caret.current = null
        },
        () => resetState.current.value !== undefined,
      )
    }, [props.form])

    useLayoutEffect(() => {
      const input = inputRef.current
      if (caret.current === null || !input) return
      // Email inputs do not support selectionStart/setSelectionRange. Only masked text/tel
      // controls need caret restoration; other types retain the browser's native editing.
      if (isMaskedInputFormat(format) && input.ownerDocument.activeElement === input) {
        const position = Math.min(input.value.length, caret.current)
        input.setSelectionRange(position, position)
      }
      caret.current = null
    }, [editVersion, format, displayed])

    function commit(next: { value: string; caret: number }) {
      if (unavailable || readOnly) return
      if (value === undefined) setInternalValue(next.value)
      caret.current = isMaskedInputFormat(format) ? next.caret : null
      setEditVersion((version) => version + 1)
      if (next.value !== current) onValueChange?.(next.value)
    }

    return (
      <Input
        {...props}
        {...inputDefaults[format]}
        ref={inputRef}
        value={displayed}
        autoComplete={autoComplete ?? inputDefaults[format].autoComplete}
        autoCapitalize={props.autoCapitalize ?? 'none'}
        spellCheck={props.spellCheck ?? false}
        readOnly={readOnly}
        disabled={disabled}
        loading={loading}
        previewState={previewState}
        data-input-format={format}
        onChange={(event) => {
          onChange?.(event)
          if (event.defaultPrevented || unavailable || readOnly) return
          const input = event.currentTarget
          if (composing.current || (event.nativeEvent as InputEvent).isComposing) {
            setCompositionValue(input.value)
            return
          }
          commit(formatInputEdit(format, input.value, input.selectionStart ?? input.value.length))
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (
            event.defaultPrevented ||
            unavailable ||
            readOnly ||
            composing.current ||
            event.ctrlKey ||
            event.metaKey ||
            event.altKey ||
            (event.key !== 'Backspace' && event.key !== 'Delete')
          )
            return
          const input = event.currentTarget
          const next = deleteInputSeparator(
            format,
            input.value,
            input.selectionStart ?? 0,
            input.selectionEnd ?? 0,
            event.key === 'Backspace' ? 'backward' : 'forward',
          )
          if (next) {
            event.preventDefault()
            commit(next)
          }
        }}
        onCompositionStart={(event) => {
          onCompositionStart?.(event)
          if (unavailable || readOnly) return
          composing.current = true
          setCompositionValue(event.currentTarget.value)
        }}
        onCompositionEnd={(event) => {
          onCompositionEnd?.(event)
          composing.current = false
          setCompositionValue(null)
          commit(
            formatInputEdit(
              format,
              event.currentTarget.value,
              event.currentTarget.selectionStart ?? event.currentTarget.value.length,
            ),
          )
        }}
        onBlur={(event) => {
          // Some input methods finish when focus moves. Do not leave an unfinished draft visible.
          if (composing.current) {
            composing.current = false
            setCompositionValue(null)
            commit(
              formatInputEdit(format, event.currentTarget.value, event.currentTarget.value.length),
            )
          }
          onBlur?.(event)
        }}
      />
    )
  },
)
