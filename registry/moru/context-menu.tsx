'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu'
import { cn } from './_lib/cn'
import { NavigationMenuActions, type NavigationAction } from './navigation-menu-items'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './navigation-completion.css'

export type ContextMenuItem = NavigationAction
export interface ContextMenuProps {
  children: ReactNode
  items: ContextMenuItem[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}
export function ContextMenu({ children, items, open, defaultOpen = false, onOpenChange, disabled, size = 'md', className, 'aria-label': label = '컨텍스트 메뉴 영역' }: ContextMenuProps) {
  const portalContainer = useThemePortalContainer()
  const triggerRef = useRef<HTMLDivElement>(null)
  const [localOpen, setLocalOpen] = useState(defaultOpen)
  const [keyboardAnchor, setKeyboardAnchor] = useState<HTMLElement | null>(null)
  const shown = !disabled && (open ?? localOpen)
  useEffect(() => {
    if (disabled && open === undefined) setLocalOpen(false)
  }, [disabled, open])
  function changeOpen(next: boolean) {
    if (next && disabled) return
    if (open === undefined) setLocalOpen(next)
    onOpenChange?.(next)
  }
  return <BaseContextMenu.Root open={shown} onOpenChange={changeOpen} disabled={disabled}>
    <BaseContextMenu.Trigger ref={triggerRef} className={cn('ui-context-menu-trigger', className)} data-size={size} tabIndex={disabled ? -1 : 0} aria-disabled={disabled || undefined} aria-label={label} aria-haspopup="menu" aria-expanded={shown} onContextMenu={() => setKeyboardAnchor(null)} onKeyDown={(event) => {
      if (disabled || !(event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))) return
      event.preventDefault()
      setKeyboardAnchor(event.currentTarget)
      changeOpen(true)
    }}>{children}</BaseContextMenu.Trigger>
    <OverlayPortal portal={BaseContextMenu.Portal} kind="menu" container={portalContainer}><BaseContextMenu.Positioner positionMethod="fixed" className="ui-navigation-positioner" anchor={keyboardAnchor ?? undefined} align="start" sideOffset={4} collisionPadding={12}><BaseContextMenu.Popup className="ui-navigation-popup" data-size={size} aria-label={label} finalFocus={triggerRef}>
      <NavigationMenuActions items={items} size={size} />
    </BaseContextMenu.Popup></BaseContextMenu.Positioner></OverlayPortal>
  </BaseContextMenu.Root>
}
