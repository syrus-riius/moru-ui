'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { cn } from './_lib/cn'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'

export interface MenuProps {
  trigger: ReactElement
  items: Array<{
    label: string
    onClick?: () => void
    destructive?: boolean
    disabled?: boolean
    icon?: ReactNode
  }>
  className?: string
  disabled?: boolean
  finalFocus?: ComponentPropsWithoutRef<typeof BaseMenu.Popup>['finalFocus']
  size?: 'sm' | 'md' | 'lg'
}

export function Menu({ trigger, items, className, disabled, finalFocus, size = 'md' }: MenuProps) {
  const portalContainer = useThemePortalContainer()
  const anchorRef = useRef<HTMLSpanElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  useEffect(() => { if (disabled) setOpen(false) }, [disabled])
  return (
    <BaseMenu.Root disabled={disabled} open={!disabled && open} onOpenChange={(next) => {
      if (!disabled || !next) setOpen(next)
    }}>
      <span ref={anchorRef} className="ui-menu-anchor" tabIndex={-1}>
        <BaseMenu.Trigger render={trigger} disabled={disabled} />
      </span>
      <OverlayPortal portal={BaseMenu.Portal} kind="menu" container={portalContainer}>
        <BaseMenu.Positioner className="ui-menu-positioner" positionMethod="fixed" sideOffset={6} align="end" collisionPadding={12}>
          <BaseMenu.Popup ref={popupRef} className={cn('ui-menu', className)} data-size={size} finalFocus={finalFocus ?? (disabled ? () => {
            const anchor = anchorRef.current
            const active = anchor?.ownerDocument.activeElement
            if (active && active !== anchor?.ownerDocument.body && !popupRef.current?.contains(active)) return false
            return anchor
          } : undefined)}>
            {items.map((item, index) => (
              <BaseMenu.Item
                key={`${item.label}-${index}`}
                className="ui-menu-item flex items-center gap-2"
                disabled={item.disabled}
                label={item.label}
                data-destructive={item.destructive || undefined}
                onClick={item.onClick}
              >
                {item.icon && <span className="ui-menu-icon inline-flex items-center" aria-hidden="true">{item.icon}</span>}
                {item.label}
              </BaseMenu.Item>
            ))}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </OverlayPortal>
    </BaseMenu.Root>
  )
}
