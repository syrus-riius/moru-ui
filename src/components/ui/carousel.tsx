import { useCallback, useEffect, useId, useState, type ReactNode } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../lib/cn'
import './data-completion.css'

export interface CarouselItem { id: string; content: ReactNode; label?: string }
export interface CarouselProps {
  items: CarouselItem[]
  loop?: boolean
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  direction?: 'ltr' | 'rtl'
  onValueChange?: (index: number) => void
  className?: string
  'aria-label': string
}

export function Carousel({ items, loop = false, disabled = false, orientation = 'horizontal', direction = 'ltr', onValueChange, className, 'aria-label': label }: CarouselProps) {
  const id = useId()
  const [viewportRef, api] = useEmblaCarousel({ loop, axis: orientation === 'vertical' ? 'y' : 'x', direction, watchDrag: !disabled })
  const [selection, setSelection] = useState({ index: 0, previous: false, next: false })
  const update = useCallback(() => {
    if (!api) return
    setSelection({ index: api.selectedScrollSnap(), previous: api.canScrollPrev(), next: api.canScrollNext() })
  }, [api])
  useEffect(() => {
    if (!api) return
    update()
    const select = () => { update(); onValueChange?.(api.selectedScrollSnap()) }
    api.on('select', select).on('reInit', update)
    return () => { api.off('select', select).off('reInit', update) }
  }, [api, update, onValueChange])
  return <section className={cn('ui-carousel', className)} role="region" aria-roledescription="캐러셀" aria-label={label} data-orientation={orientation} dir={direction} onKeyDown={(event) => {
    if (disabled || event.defaultPrevented || (event.target instanceof HTMLElement && event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="combobox"],[role="slider"],[role="tab"],[role="menuitem"],[role="radio"]'))) return
    const previous = orientation === 'vertical' ? 'ArrowUp' : direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
    const next = orientation === 'vertical' ? 'ArrowDown' : direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
    if (event.key === previous) { event.preventDefault(); api?.scrollPrev() }
    else if (event.key === next) { event.preventDefault(); api?.scrollNext() }
  }}>
    <div ref={viewportRef} className="ui-carousel-viewport" id={`${id}-viewport`} tabIndex={disabled ? -1 : 0}>
      <div className="ui-carousel-track">{items.map((item, index) => <div className="ui-carousel-slide" key={item.id} role="group" aria-roledescription="슬라이드" aria-label={item.label ?? `${index + 1} / ${items.length}`} inert={index !== selection.index}>{item.content}</div>)}</div>
    </div>
    <div className="ui-carousel-controls"><Button size="sm" variant="secondary" aria-label="이전 슬라이드" aria-controls={`${id}-viewport`} disabled={disabled || !selection.previous} onClick={() => api?.scrollPrev()}><ArrowLeft size={15} /></Button><span role="status" aria-live="polite">{items.length ? selection.index + 1 : 0} / {items.length}</span><Button size="sm" variant="secondary" aria-label="다음 슬라이드" aria-controls={`${id}-viewport`} disabled={disabled || !selection.next} onClick={() => api?.scrollNext()}><ArrowRight size={15} /></Button></div>
  </section>
}
