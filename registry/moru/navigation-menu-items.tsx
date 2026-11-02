'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import type { ReactNode } from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { ChevronRight } from 'lucide-react'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'

export interface NavigationAction {
  id: string
  label: string
  icon?: ReactNode
  shortcut?: string
  disabled?: boolean
  destructive?: boolean
  onSelect?: () => void
  children?: NavigationAction[]
}

export function NavigationMenuActions({ items, size }: { items: NavigationAction[]; size: 'sm' | 'md' | 'lg' }) {
  const portalContainer = useThemePortalContainer()
  return items.map((item) => item.children?.length ? <BaseMenu.SubmenuRoot key={item.id}>
    <BaseMenu.SubmenuTrigger className="ui-navigation-action" disabled={item.disabled} label={item.label}>
      {item.icon ? <span className="ui-navigation-action-icon" aria-hidden="true">{item.icon}</span> : null}<span>{item.label}</span><ChevronRight className="ui-navigation-action-end" size={14} aria-hidden="true" />
    </BaseMenu.SubmenuTrigger>
    <OverlayPortal portal={BaseMenu.Portal} kind="menu" container={portalContainer}><BaseMenu.Positioner positionMethod="fixed" className="ui-navigation-positioner" side="right" align="start" sideOffset={4} collisionPadding={12}><BaseMenu.Popup className="ui-navigation-popup" data-size={size}>
      <NavigationMenuActions items={item.children} size={size} />
    </BaseMenu.Popup></BaseMenu.Positioner></OverlayPortal>
  </BaseMenu.SubmenuRoot> : <BaseMenu.Item key={item.id} className="ui-navigation-action" disabled={item.disabled} label={item.label} data-destructive={item.destructive || undefined} onClick={item.onSelect}>
    {item.icon ? <span className="ui-navigation-action-icon" aria-hidden="true">{item.icon}</span> : null}<span>{item.label}</span>{item.shortcut ? <kbd className="ui-navigation-shortcut">{item.shortcut}</kbd> : null}
  </BaseMenu.Item>)
}
