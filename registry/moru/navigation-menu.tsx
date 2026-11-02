'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NavigationMenu as BaseNavigationMenu } from '@base-ui/react/navigation-menu'
import { ChevronDown } from 'lucide-react'
import { cn } from './_lib/cn'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './navigation-completion.css'

export interface NavigationMenuLink { id: string; label: string; href: string; description?: string; disabled?: boolean; onSelect?: () => void }
export interface NavigationMenuItem {
  id: string
  label: string
  href?: string
  onSelect?: () => void
  disabled?: boolean
  active?: boolean
  links?: NavigationMenuLink[]
}
export interface NavigationMenuProps {
  items: NavigationMenuItem[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}
export function NavigationMenu({ items, value, defaultValue = null, onValueChange, disabled, size = 'md', className, 'aria-label': label = '주요 탐색' }: NavigationMenuProps) {
  const portalContainer = useThemePortalContainer()
  const rootRef = useRef<HTMLElement>(null)
  const popupRef = useRef<HTMLElement>(null)
  const lastOpenId = useRef<string | null>(null)
  const [localValue, setLocalValue] = useState<string | null>(defaultValue)
  const requestedValue = value === undefined ? localValue : value
  const available = !disabled && items.some((item) => item.id === requestedValue && !item.disabled && item.links?.length)
  const shownValue = available ? requestedValue : null
  useLayoutEffect(() => { if (shownValue !== null) lastOpenId.current = shownValue }, [shownValue])
  useEffect(() => {
    // Once an uncontrolled popup becomes unavailable, enabling it again must
    // not unexpectedly reopen the last menu.
    if (value === undefined && localValue !== null && !available) setLocalValue(null)
  }, [value, localValue, available])
  return <BaseNavigationMenu.Root ref={rootRef} tabIndex={-1} className={cn('ui-navigation-menu', className)} aria-label={label} data-size={size} value={shownValue} onValueChange={(next) => { if (disabled || (next !== null && !items.some((item) => item.id === next && !item.disabled && item.links?.length))) return; if (value === undefined) setLocalValue(next); onValueChange?.(next) }} onOpenChangeComplete={(open) => {
    if (open) return
    const previousId = lastOpenId.current
    lastOpenId.current = null
    if (previousId === null) return
    const previous = items.find((item) => item.id === previousId)
    if (!disabled && previous && !previous.disabled) return
    const root = rootRef.current
    // NavigationMenu has no finalFocus API. Its completion hook is the last
    // opportunity after Base UI's own return target became unavailable.
    if (!root) return
    const active = root.ownerDocument.activeElement
    if (active !== root.ownerDocument.body && !popupRef.current?.contains(active)) return
    const next = root.querySelector<HTMLElement>('.ui-navigation-trigger:not(:disabled):not([aria-disabled="true"])')
    const target = next ?? root
    target.focus({ preventScroll: true })
  }}>
    <BaseNavigationMenu.List className="ui-navigation-list">
      {items.map((item) => <BaseNavigationMenu.Item key={item.id} value={item.id}>
        {item.links?.length ? <><BaseNavigationMenu.Trigger className="ui-navigation-trigger" disabled={disabled || item.disabled}>{item.label}<ChevronDown size={14} aria-hidden="true" /></BaseNavigationMenu.Trigger><BaseNavigationMenu.Content className="ui-navigation-content">
          {item.links.map((link) => <BaseNavigationMenu.Link key={link.id} className="ui-navigation-link-card" href={link.href} closeOnClick aria-disabled={disabled || item.disabled || link.disabled || undefined} tabIndex={disabled || item.disabled || link.disabled ? -1 : undefined} onClick={(event) => {
            if (disabled || item.disabled || link.disabled) { event.preventDefault(); event.preventBaseUIHandler(); return }
            if (link.onSelect) { event.preventDefault(); link.onSelect() }
          }}><strong>{link.label}</strong>{link.description ? <span>{link.description}</span> : null}</BaseNavigationMenu.Link>)}
        </BaseNavigationMenu.Content></> : <BaseNavigationMenu.Link className="ui-navigation-trigger" href={item.href ?? '#'} active={item.active} aria-disabled={disabled || item.disabled || undefined} tabIndex={disabled || item.disabled ? -1 : undefined} onClick={(event) => {
          if (disabled || item.disabled) { event.preventDefault(); return }
          if (item.onSelect) { event.preventDefault(); item.onSelect() }
        }}>{item.label}</BaseNavigationMenu.Link>}
      </BaseNavigationMenu.Item>)}
    </BaseNavigationMenu.List>
    <OverlayPortal portal={BaseNavigationMenu.Portal} kind="menu" container={portalContainer}><BaseNavigationMenu.Positioner positionMethod="fixed" className="ui-navigation-positioner" sideOffset={8} align="start" collisionPadding={12}><BaseNavigationMenu.Popup ref={popupRef} className="ui-navigation-popup ui-navigation-menu-popup" data-size={size}><BaseNavigationMenu.Viewport /></BaseNavigationMenu.Popup></BaseNavigationMenu.Positioner></OverlayPortal>
  </BaseNavigationMenu.Root>
}
