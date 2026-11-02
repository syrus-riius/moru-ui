import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes } from 'react'
import { Check, Copy, WrapText } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from './button'
import './content-completion.css'

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onCopy'> {
  value: string
  language?: string
  filename?: string
  lineNumbers?: boolean
  defaultWrap?: boolean
  copyable?: boolean
  disabled?: boolean
  highlightLines?: number[]
  onCopy?: () => void
  onCopyError?: (error: unknown) => void
  size?: 'sm' | 'md' | 'lg'
}
export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock({
  value, language = 'text', filename, lineNumbers = false, defaultWrap = false, copyable = true, disabled, highlightLines = [], onCopy, onCopyError, size = 'md', className, ...props
}, ref) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const [wrap, setWrap] = useState(defaultWrap)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mounted = useRef(true)
  const id = useId()
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; if (timer.current) clearTimeout(timer.current) } }, [])
  async function copy() {
    if (disabled) return
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(value)
      if (!mounted.current) return
      setCopied(true); setCopyError(false); onCopy?.()
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch (error) { if (mounted.current) { setCopyError(true); setCopied(false); onCopyError?.(error) } }
  }
  const lines = value.split('\n')
  return <div {...props} ref={ref} className={cn('ui-code-block', className)} data-size={size}>
    <div className="ui-code-block-header">
      <span id={`${id}-title`} className="ui-code-block-title">{filename ?? language}</span>
      {filename && <span className="ui-code-block-language">{language}</span>}
      <div className="ui-code-block-actions">
        <Button variant="ghost" size="sm" aria-label="코드 줄바꿈" aria-pressed={wrap} disabled={disabled} onClick={() => setWrap(!wrap)}><WrapText size={14} aria-hidden="true" /></Button>
        {copyable && <Button variant="ghost" size="sm" aria-label={copied ? '코드 복사 완료' : '코드 복사'} disabled={disabled} onClick={copy}>{copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}</Button>}
      </div>
    </div>
    <pre tabIndex={0} role="region" aria-labelledby={`${id}-title`} className="ui-code-block-pre" dir="ltr" data-wrap={wrap} data-line-numbers={lineNumbers}>
      <code>{lines.map((line, index) => <span key={index} className="ui-code-block-line" data-highlighted={highlightLines.includes(index + 1) || undefined}>{lineNumbers && <span className="ui-code-block-number" aria-hidden="true">{index + 1}</span>}<span>{line}</span></span>)}</code>
    </pre>
    <span className="ui-content-sr-only" role="status">{copied ? '코드를 복사했어요.' : copyError ? '복사하지 못했어요. 코드를 선택해서 복사해 주세요.' : ''}</span>
  </div>
})
