'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from './_lib/cn'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './advanced-overlays.css'

export interface SheetProps {
  trigger?: ReactElement
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'left' | 'right' | 'bottom'
  className?: string
  initialFocus?: ComponentPropsWithoutRef<typeof BaseDialog.Popup>['initialFocus']
  finalFocus?: ComponentPropsWithoutRef<typeof BaseDialog.Popup>['finalFocus']
}

/** A modal edge panel; Base UI handles focus trapping, Escape, and scroll locking. */
export function Sheet({
  trigger, title, description, children, footer, open, defaultOpen,
  onOpenChange, side = 'right', className, initialFocus, finalFocus,
}: SheetProps) {
  const portalContainer = useThemePortalContainer()
  return (
    <BaseDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={(nextOpen) => onOpenChange?.(nextOpen)}>
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <OverlayPortal portal={BaseDialog.Portal} kind="modal" container={portalContainer}>
        <BaseDialog.Backdrop className="ui-overlay-backdrop" />
        <BaseDialog.Popup className={cn('ui-sheet', className)} data-side={side} initialFocus={initialFocus} finalFocus={finalFocus}>
          <div className="ui-sheet-header">
            <BaseDialog.Title className="ui-overlay-title">{title}</BaseDialog.Title>
            {description && <BaseDialog.Description className="ui-overlay-description">{description}</BaseDialog.Description>}
          </div>
          <BaseDialog.Close className="ui-overlay-close ui-sheet-close" aria-label="패널 닫기">
            <X size={18} aria-hidden="true" />
          </BaseDialog.Close>
          <div className="ui-sheet-content">{children}</div>
          {footer && <div className="ui-sheet-footer">{footer}</div>}
        </BaseDialog.Popup>
      </OverlayPortal>
    </BaseDialog.Root>
  )
}
