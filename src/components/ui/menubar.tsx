import { useEffect, useRef, useState } from 'react'
import { Menubar as BaseMenubar } from '@base-ui/react/menubar'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { cn } from '../../lib/cn'
import { NavigationMenuActions, type NavigationAction } from './navigation-menu-items'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './navigation-completion.css'

export interface MenubarMenu { id: string; label: string; disabled?: boolean; items: NavigationAction[] }
export interface MenubarProps {
  menus: MenubarMenu[]
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}
export function Menubar({ menus, disabled, size = 'md', className, 'aria-label': label = '애플리케이션 메뉴' }: MenubarProps) {
  const portalContainer = useThemePortalContainer()
  const rootRef = useRef<HTMLDivElement>(null)
  const popupRefs = useRef(new Map<string, HTMLDivElement>())
  const [openId, setOpenId] = useState<string | null>(null)
  const available = !disabled && menus.some((menu) => menu.id === openId && !menu.disabled)
  useEffect(() => {
    if (openId !== null && !available) setOpenId(null)
  }, [openId, available])
  return <BaseMenubar ref={rootRef} tabIndex={-1} className={cn('ui-menubar', className)} aria-label={label} disabled={disabled} data-size={size}>
    {menus.map((menu) => <BaseMenu.Root key={menu.id} disabled={disabled || menu.disabled} open={available && openId === menu.id} onOpenChange={(next) => {
      if (next && (disabled || menu.disabled)) return
      setOpenId((current) => next ? menu.id : current === menu.id ? null : current)
    }}>
      <BaseMenu.Trigger className="ui-menubar-trigger">{menu.label}</BaseMenu.Trigger>
      <OverlayPortal portal={BaseMenu.Portal} kind="menu" container={portalContainer}><BaseMenu.Positioner className="ui-navigation-positioner" positionMethod="fixed" align="start" sideOffset={6} collisionPadding={12}><BaseMenu.Popup ref={(node) => { if (node) popupRefs.current.set(menu.id, node); else popupRefs.current.delete(menu.id) }} className="ui-navigation-popup" data-size={size} finalFocus={disabled || menu.disabled ? () => {
        const root = rootRef.current
        if (!root) return false
        const active = root.ownerDocument.activeElement
        if (active !== root.ownerDocument.body && !popupRefs.current.get(menu.id)?.contains(active)) return false
        const triggers = Array.from(root.querySelectorAll<HTMLButtonElement>('.ui-menubar-trigger'))
        const index = menus.findIndex((candidate) => candidate.id === menu.id)
        return [...triggers.slice(index + 1), ...triggers.slice(0, index)].find((trigger) => !trigger.disabled) ?? root
      } : undefined}>
        <NavigationMenuActions items={menu.items} size={size} />
      </BaseMenu.Popup></BaseMenu.Positioner></OverlayPortal>
    </BaseMenu.Root>)}
  </BaseMenubar>
}
