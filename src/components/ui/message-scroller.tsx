import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react'
import { ArrowDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from './button'
import './content-completion.css'

export function isMessageScrollerAtEnd(scrollTop: number, scrollHeight: number, clientHeight: number, threshold = 24) {
  return scrollHeight - clientHeight - Math.max(0, scrollTop) <= Math.max(0, threshold)
}
export interface MessageScrollerHandle {
  scrollToLatest: () => void
  scrollToMessage: (id: string) => boolean
}
export interface MessageScrollerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onScroll'> {
  height?: CSSProperties['height']
  initialPosition?: 'start' | 'end'
  followOutput?: boolean
  disabled?: boolean
  'aria-label'?: string
}
/** Follows new output only at the live edge; reading and selection pause following. */
export const MessageScroller = forwardRef<MessageScrollerHandle, MessageScrollerProps>(function MessageScroller({
  children, height = 320, initialPosition = 'end', followOutput = true, disabled, className, style, 'aria-label': label = '대화 내용', 'aria-live': live = 'polite', ...props
}, ref) {
  const viewport = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const following = useRef(initialPosition === 'end')
  const lastHeight = useRef(0)
  const lastFirst = useRef<string | undefined>(undefined)
  const showLatestRef = useRef(false)
  const [showLatest, setShowLatest] = useState(false)
  const [hasNew, setHasNew] = useState(false)
  const options = useRef({ initialPosition, followOutput })
  options.current.followOutput = followOutput
  function updateLatest(visible: boolean) {
    if (showLatestRef.current !== visible) { showLatestRef.current = visible; setShowLatest(visible) }
    if (!visible) setHasNew(false)
  }
  function scrollToLatest() {
    const element = viewport.current
    if (!element) return
    element.scrollTop = element.scrollHeight
    following.current = true
    updateLatest(false)
  }
  useImperativeHandle(ref, () => ({
    scrollToLatest,
    scrollToMessage(id) {
      const element = viewport.current
      const target = [...(content.current?.querySelectorAll<HTMLElement>('[data-message-id]') ?? [])].find((item) => item.dataset.messageId === id)
      if (!element || !target) return false
      following.current = false
      element.scrollTop += target.getBoundingClientRect().top - element.getBoundingClientRect().top
      updateLatest(!isMessageScrollerAtEnd(element.scrollTop, element.scrollHeight, element.clientHeight))
      return true
    },
  }))
  useLayoutEffect(() => {
    const element = viewport.current
    const inner = content.current
    if (!element || !inner) return
    if (options.current.initialPosition === 'end') element.scrollTop = element.scrollHeight
    lastHeight.current = element.scrollHeight
    lastFirst.current = inner.querySelector<HTMLElement>('[data-message-id]')?.dataset.messageId
    function resized() {
      if (!element || !inner) return
      const nextHeight = element.scrollHeight
      const first = inner.querySelector<HTMLElement>('[data-message-id]')?.dataset.messageId
      const selected = document.getSelection()?.isCollapsed === false
      if (following.current && options.current.followOutput && !selected) element.scrollTop = nextHeight
      else if (lastFirst.current && first && lastFirst.current !== first && nextHeight > lastHeight.current) element.scrollTop += nextHeight - lastHeight.current
      else if (nextHeight > lastHeight.current) setHasNew(true)
      lastHeight.current = nextHeight
      lastFirst.current = first
      updateLatest(!isMessageScrollerAtEnd(element.scrollTop, nextHeight, element.clientHeight))
    }
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resized)
    observer?.observe(inner); observer?.observe(element)
    const mutation = typeof MutationObserver === 'undefined' ? null : new MutationObserver(resized)
    mutation?.observe(inner, { childList: true, subtree: true, characterData: true })
    function pauseSelection() { if (element?.contains(document.getSelection()?.anchorNode ?? null) && !document.getSelection()?.isCollapsed) following.current = false }
    document.addEventListener('selectionchange', pauseSelection)
    resized()
    return () => { observer?.disconnect(); mutation?.disconnect(); document.removeEventListener('selectionchange', pauseSelection) }
  }, [])
  return <div {...props} className={cn('ui-message-scroller', className)} style={{ ...style, '--message-scroller-height': typeof height === 'number' ? `${height}px` : height } as CSSProperties}>
    <div ref={viewport} className="ui-message-scroller-viewport" role="log" aria-label={label} aria-live={live} aria-relevant="additions text" tabIndex={0}
      onScroll={() => {
        const element = viewport.current
        if (!element) return
        const atEnd = isMessageScrollerAtEnd(element.scrollTop, element.scrollHeight, element.clientHeight)
        following.current = atEnd && document.getSelection()?.isCollapsed !== false
        updateLatest(!atEnd)
      }}
      onPointerDown={() => { following.current = false }}
      onKeyDown={(event) => { if (['ArrowUp', 'PageUp', 'Home'].includes(event.key) || event.shiftKey) following.current = false }}>
      <div ref={content} className="ui-message-scroller-content">{children}</div>
    </div>
    {showLatest && <Button className="ui-message-scroller-latest" variant="secondary" size="sm" disabled={disabled} onClick={scrollToLatest}><ArrowDown size={14} aria-hidden="true" />{hasNew ? '새 메시지 보기' : '최신 메시지로'}</Button>}
  </div>
})
export function MessageScrollerItem({ messageId, className, ...props }: HTMLAttributes<HTMLDivElement> & { messageId: string }) { return <div {...props} className={cn('ui-message-scroller-item', className)} data-message-id={messageId} /> }
