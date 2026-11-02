'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { cn } from './_lib/cn'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './overlays.css'

export interface PopoverProps {
  trigger: ReactElement
  title?: string
  description?: string
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: ComponentPropsWithoutRef<typeof BasePopover.Positioner>['side']
  align?: ComponentPropsWithoutRef<typeof BasePopover.Positioner>['align']
  sideOffset?: number
  className?: string
  /** Override focus when opened; omitted values retain Base UI's touch-safe default. */
  initialFocus?: ComponentPropsWithoutRef<typeof BasePopover.Popup>['initialFocus']
  /** Override the return target when the trigger is removed or the workflow moves elsewhere. */
  finalFocus?: ComponentPropsWithoutRef<typeof BasePopover.Popup>['finalFocus']
  'aria-label'?: string
}

export function Popover({
  trigger, title, description, children, open, defaultOpen, onOpenChange,
  side = 'bottom', align = 'start', sideOffset = 8, className, initialFocus, finalFocus,
  'aria-label': ariaLabel = '추가 정보',
}: PopoverProps) {
  const portalContainer = useThemePortalContainer()
  return (
    <BasePopover.Root open={open} defaultOpen={defaultOpen} onOpenChange={(nextOpen) => onOpenChange?.(nextOpen)}>
      <BasePopover.Trigger render={trigger} />
      <OverlayPortal portal={BasePopover.Portal} kind="popover" container={portalContainer}>
        <BasePopover.Positioner
          className="ui-popover-positioner"
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={12}
          collisionAvoidance={{ side: 'flip', align: 'shift', fallbackAxisSide: 'end' }}
        >
          <BasePopover.Popup className={cn('ui-popover', className)} aria-label={title ? undefined : ariaLabel} initialFocus={initialFocus} finalFocus={finalFocus}>
            {(title || description) && (
              <div className="ui-popover-header">
                {title && <BasePopover.Title className="ui-popover-title">{title}</BasePopover.Title>}
                {description && <BasePopover.Description className="ui-popover-description">{description}</BasePopover.Description>}
              </div>
            )}
            <div className="ui-popover-content">{children}</div>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </OverlayPortal>
    </BasePopover.Root>
  )
}
