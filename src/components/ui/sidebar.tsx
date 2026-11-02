import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './navigation-completion.css'

const mobileSidebarQuery = '(max-width: 640px)'
function subscribeToSidebarViewport(onChange: () => void) {
  const query = window.matchMedia(mobileSidebarQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
function isMobileSidebarViewport() {
  return typeof window !== 'undefined' && window.matchMedia(mobileSidebarQuery).matches
}
function serverSidebarViewport() { return false }

export interface SidebarItem { id: string; label: string; icon?: ReactNode; badge?: string | number; disabled?: boolean }
export interface SidebarProps {
  title: string
  items: SidebarItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
  footer?: ReactNode
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}

function SidebarItems({ items, value, onSelect, collapsed, disabled, label }: {
  items: SidebarItem[]; value?: string; onSelect: (id: string) => void; collapsed: boolean; disabled?: boolean; label: string
}) {
  return <nav aria-label={label} className="ui-sidebar-nav"><ul>{items.map((item) => <li key={item.id}><button type="button" className="ui-sidebar-item" aria-current={item.id === value ? 'page' : undefined} aria-label={collapsed ? item.label : undefined} title={collapsed ? item.label : undefined} disabled={disabled || item.disabled} onClick={() => onSelect(item.id)}>
    <span className="ui-sidebar-item-icon" aria-hidden="true">{item.icon ?? item.label.slice(0, 1)}</span><span className="ui-sidebar-item-label">{item.label}</span>{item.badge !== undefined ? <span className="ui-sidebar-badge" aria-hidden={collapsed || undefined}>{item.badge}</span> : null}
  </button></li>)}</ul></nav>
}

/** A controlled or self-contained navigation rail with a modal panel on narrow screens. */
export function Sidebar({ title, items, value, defaultValue, onValueChange, collapsed, defaultCollapsed = false, onCollapsedChange, mobileOpen, onMobileOpenChange, footer, disabled, size = 'md', className, 'aria-label': label }: SidebarProps) {
  const portalContainer = useThemePortalContainer()
  const [localValue, setLocalValue] = useState(defaultValue ?? items.find((item) => !item.disabled)?.id)
  const [localCollapsed, setLocalCollapsed] = useState(defaultCollapsed)
  const [localMobileOpen, setLocalMobileOpen] = useState(false)
  const isMobile = useSyncExternalStore(subscribeToSidebarViewport, isMobileSidebarViewport, serverSidebarViewport)
  const rootRef = useRef<HTMLDivElement>(null)
  const desktopRef = useRef<HTMLElement>(null)
  const invalidatedOpen = useRef(false)
  const requestedMobileOpen = mobileOpen ?? localMobileOpen
  const isMobileOpen = isMobile && !disabled && requestedMobileOpen
  useEffect(() => {
    // A CSS-only breakpoint leaves the hidden modal trapping focus on desktop.
    // Read the actual viewport here too, so hydration's server snapshot cannot
    // cancel a legitimate initially-open mobile panel.
    if (!requestedMobileOpen || (isMobileSidebarViewport() && !disabled)) {
      invalidatedOpen.current = false
      return
    }
    if (invalidatedOpen.current) return
    invalidatedOpen.current = true
    if (mobileOpen === undefined) setLocalMobileOpen(false)
    onMobileOpenChange?.(false)
  }, [isMobile, disabled, requestedMobileOpen, mobileOpen, onMobileOpenChange])
  const active = value ?? localValue
  const compact = collapsed ?? localCollapsed
  function changeMobileOpen(next: boolean) {
    if (next && disabled) return
    if (mobileOpen === undefined) setLocalMobileOpen(next)
    onMobileOpenChange?.(next)
  }
  function select(id: string) {
    if (disabled || items.find((item) => item.id === id)?.disabled) return
    if (value === undefined) setLocalValue(id)
    onValueChange?.(id)
    if (mobileOpen ?? localMobileOpen) changeMobileOpen(false)
  }
  const navLabel = label ?? `${title} 메뉴`
  return <div ref={rootRef} tabIndex={-1} className={cn('ui-sidebar-root', className)} data-size={size}>
    <aside ref={desktopRef} className="ui-sidebar" data-collapsed={compact || undefined}>
      <header className="ui-sidebar-header"><strong className="ui-sidebar-title">{title}</strong><button type="button" className="ui-sidebar-toggle" aria-label={compact ? '사이드바 펼치기' : '사이드바 접기'} aria-expanded={!compact} disabled={disabled} onClick={() => {
        if (collapsed === undefined) setLocalCollapsed(!compact)
        onCollapsedChange?.(!compact)
      }}>{compact ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}</button></header>
      <SidebarItems items={items} value={active} onSelect={select} collapsed={compact} disabled={disabled} label={navLabel} />
      {footer ? <footer className="ui-sidebar-footer" hidden={compact}>{footer}</footer> : null}
    </aside>
    <BaseDialog.Root open={isMobileOpen} onOpenChange={changeMobileOpen}>
      <BaseDialog.Trigger className="ui-sidebar-mobile-trigger" disabled={disabled}><Menu size={18} aria-hidden="true" /><span>{title} 메뉴</span></BaseDialog.Trigger>
      <OverlayPortal portal={BaseDialog.Portal} kind="modal" container={portalContainer}><BaseDialog.Backdrop className="ui-navigation-backdrop" /><BaseDialog.Popup className="ui-sidebar-mobile-panel" data-size={size} finalFocus={() => {
        if (!isMobileSidebarViewport()) return desktopRef.current?.querySelector<HTMLButtonElement>('.ui-sidebar-item[aria-current="page"]:not(:disabled)') ?? desktopRef.current?.querySelector<HTMLButtonElement>('.ui-sidebar-item:not(:disabled)') ?? rootRef.current
        if (disabled) return rootRef.current
        return true
      }}>
        <header className="ui-sidebar-header"><BaseDialog.Title className="ui-navigation-heading">{title}</BaseDialog.Title><BaseDialog.Close className="ui-sidebar-toggle" aria-label="메뉴 닫기"><X size={18} aria-hidden="true" /></BaseDialog.Close></header>
        <SidebarItems items={items} value={active} onSelect={select} collapsed={false} disabled={disabled} label={navLabel} />
        {footer ? <footer className="ui-sidebar-footer">{footer}</footer> : null}
      </BaseDialog.Popup></OverlayPortal>
    </BaseDialog.Root>
  </div>
}
