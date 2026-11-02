'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useId, useRef, useState, type KeyboardEvent, type ReactElement } from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { cn } from './_lib/cn'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './advanced-controls.css'

export interface CommandItem {
  id: string
  label: string
  description?: string
  keywords?: string[]
  group?: string
  disabled?: boolean
  onSelect: () => void
}

export interface CommandProps {
  items: CommandItem[]
  trigger?: ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  placeholder?: string
  className?: string
}

export function Command({ items, trigger, open, onOpenChange, title = '빠른 작업', placeholder = '이름이나 작업을 검색하세요', className }: CommandProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const optionRefs = useRef(new Map<string, HTMLButtonElement>())
  const portalContainer = useThemePortalContainer()
  const [internalOpen, setInternalOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const isOpen = open ?? internalOpen
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const results = items.filter((item) => `${item.label} ${item.description ?? ''} ${(item.keywords ?? []).join(' ')}`.toLocaleLowerCase().includes(normalizedQuery))
  const groups = new Map<string, CommandItem[]>()
  for (const item of results) {
    const name = item.group ?? ''
    const group = groups.get(name) ?? []
    group.push(item)
    groups.set(name, group)
  }
  const enabled = [...groups.values()].flat().filter((item) => !item.disabled)
  const active = enabled.find((item) => item.id === activeId) ?? enabled[0]
  const optionIndices = new Map(items.map((item, index) => [item.id, index]))
  const optionId = (item: CommandItem) => `${id}-option-${optionIndices.get(item.id)}`
  const changeOpen = (nextOpen: boolean) => {
    if (open === undefined) setInternalOpen(nextOpen)
    if (!nextOpen) { setQuery(''); setActiveId(null) }
    onOpenChange?.(nextOpen)
  }
  const selectItem = (item: CommandItem) => {
    if (item.disabled) return
    changeOpen(false)
    item.onSelect()
  }
  const highlight = (item: CommandItem | undefined) => {
    if (!item) return
    setActiveId(item.id)
    optionRefs.current.get(item.id)?.scrollIntoView({ block: 'nearest' })
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return
    const index = enabled.findIndex((item) => item.id === active?.id)
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (enabled.length) highlight(enabled[(index + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length])
    } else if (event.key === 'Home' || event.key === 'End') {
      if (event.ctrlKey || event.metaKey) return
      event.preventDefault()
      highlight(event.key === 'Home' ? enabled[0] : enabled.at(-1))
    } else if (event.key === 'Enter' && active) {
      event.preventDefault()
      selectItem(active)
    }
  }
  return <BaseDialog.Root open={isOpen} onOpenChange={changeOpen} onOpenChangeComplete={(nextOpen) => { if (!nextOpen) { setQuery(''); setActiveId(null) } }}>
    {trigger && <BaseDialog.Trigger render={trigger} />}
    <OverlayPortal portal={BaseDialog.Portal} kind="command" container={portalContainer}>
      <BaseDialog.Backdrop className="ui-command-backdrop" />
      <BaseDialog.Popup className={cn('ui-command', className)} initialFocus={inputRef}>
        <div className="ui-command-heading"><BaseDialog.Title className="ui-command-title">{title}</BaseDialog.Title><BaseDialog.Close className="ui-command-close" aria-label="빠른 작업 닫기"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></BaseDialog.Close></div>
        <div className="ui-command-search">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" /><path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <input ref={inputRef} className="ui-command-input" role="combobox" aria-label={placeholder} aria-autocomplete="list" aria-expanded="true" aria-controls={`${id}-list`} aria-activedescendant={active ? optionId(active) : undefined} value={query} placeholder={placeholder} autoComplete="off" onChange={(event) => { setQuery(event.target.value); setActiveId(null) }} onKeyDown={handleKeyDown} />
        </div>
        <div className="ui-command-results" id={`${id}-list`} role="listbox" aria-label={`${title} 검색 결과`}>
          {[...groups].map(([name, group], groupIndex) => <div key={name} role="group" aria-labelledby={name ? `${id}-group-${groupIndex}` : undefined}>
            {name && <div className="ui-command-group-label" id={`${id}-group-${groupIndex}`}>{name}</div>}
            {group.map((item) => <button key={item.id} ref={(element) => { if (element) optionRefs.current.set(item.id, element); else optionRefs.current.delete(item.id) }} type="button" role="option" tabIndex={-1} id={optionId(item)} aria-label={item.label} aria-describedby={item.description ? `${optionId(item)}-description` : undefined} aria-selected={item.id === active?.id} aria-disabled={item.disabled || undefined} data-highlighted={item.id === active?.id || undefined} disabled={item.disabled} className="ui-command-item" onPointerMove={() => { if (!item.disabled) setActiveId(item.id) }} onMouseDown={(event) => event.preventDefault()} onClick={() => selectItem(item)}>
              <span>{item.label}</span>{item.description && <span className="ui-command-item-description" id={`${optionId(item)}-description`}>{item.description}</span>}
            </button>)}
          </div>)}
        </div>
        {results.length === 0 && <p className="ui-command-empty">검색 결과가 없습니다. 다른 검색어를 입력해보세요.</p>}
        <span className="ui-advanced-sr-only" role="status" aria-live="polite" aria-atomic="true">검색 결과 {results.length}개</span>
        <BaseDialog.Description className="ui-command-hint">↑ ↓ 이동 · Enter 실행 · Esc 닫기</BaseDialog.Description>
      </BaseDialog.Popup>
    </OverlayPortal>
  </BaseDialog.Root>
}
