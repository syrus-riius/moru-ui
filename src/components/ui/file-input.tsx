import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState, type ChangeEvent, type InputHTMLAttributes } from 'react'
import { X } from 'lucide-react'
import { Input as BaseInput } from '@base-ui/react/input'
import { cn } from '../../lib/cn'
import { formatFileSize } from './attachment'
import { mergeDescriptionIds, useFieldContext } from './field-context'
import { validateFiles } from './file-input-utils'
import type { UIState } from './state'
import './file-input.css'

export interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'size'> {
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  previewState?: UIState
  maxSize?: number
  maxFiles?: number
  onFilesChange?: (files: File[]) => void
}

/** Real file selection only. Uploading and server-side validation remain the consumer's responsibility. */
export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(function FileInput({
  className, id, size = 'md', maxSize, maxFiles, onFilesChange, onChange, disabled, loading = false, previewState,
  'aria-describedby': describedBy, 'aria-invalid': invalid, ...props
}, ref) {
  const field = useFieldContext()
  const generatedId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const busy = loading || previewState === 'loading'
  const unavailable = disabled || busy || previewState === 'disabled'
  useImperativeHandle(ref, () => inputRef.current!, [])
  useEffect(() => {
    const form = inputRef.current?.form
    if (!form) return
    let subscribed = true
    function reset(event: Event) { queueMicrotask(() => { if (subscribed && !event.defaultPrevented) { setFiles([]); setError(null) } }) }
    form.addEventListener('reset', reset)
    return () => { subscribed = false; form.removeEventListener('reset', reset) }
  }, [props.form])
  const errorId = `${generatedId}-file-error`
  function change(event: ChangeEvent<HTMLInputElement>) {
    if (unavailable) return
    const selected = Array.from(event.currentTarget.files ?? [])
    const message = validateFiles(selected, { accept: props.accept, maxSize, maxFiles })
    setError(message)
    if (message) event.currentTarget.value = ''
    const next = message ? [] : selected
    setFiles(next)
    onFilesChange?.(next)
    onChange?.(event)
  }
  return <div className={cn('ui-file-input', className)} data-size={size} data-disabled={unavailable || undefined} data-loading={busy || undefined}>
    <span className="ui-control-loading-wrap" data-size={size}>
      <BaseInput {...props} ref={inputRef} id={id ?? field?.controlId ?? generatedId} type="file" disabled={unavailable} aria-busy={busy || undefined}
        aria-invalid={previewState === 'error' ? true : (invalid ?? (Boolean(error) || field?.invalid || undefined))}
        aria-describedby={mergeDescriptionIds(describedBy, field?.describedBy, error ? errorId : undefined)} onChange={change} />
      {busy && <span className="ui-control-loading-indicator ui-loading-indicator" aria-hidden="true" />}
    </span>
    {files.length ? <div className="ui-file-input-selection"><ul aria-label="선택한 파일">{files.map((file, index) => <li key={`${file.name}-${index}`}><span>{file.name}</span><small>{formatFileSize(file.size)}</small></li>)}</ul><button type="button" disabled={unavailable} aria-label="선택한 파일 모두 지우기" onClick={() => {
      if (unavailable) return
      if (inputRef.current) inputRef.current.value = ''
      setFiles([]); setError(null); onFilesChange?.([]); inputRef.current?.focus()
    }}><X size={14} aria-hidden="true" /></button></div> : null}
    {error ? <p className="ui-file-input-error" role="alert" id={errorId}>{error}</p> : null}
  </div>
})
