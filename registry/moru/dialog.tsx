'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { cn } from './_lib/cn'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'

export interface DialogProps {
  trigger?: ReactElement
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  /** Choose the initial target for forms or long content; Base UI keeps its touch-safe default when omitted. */
  initialFocus?: ComponentPropsWithoutRef<typeof BaseDialog.Popup>['initialFocus']
  /** Restore focus to a stable destination when the opener is removed or the dialog has no trigger. */
  finalFocus?: ComponentPropsWithoutRef<typeof BaseDialog.Popup>['finalFocus']
}

export function Dialog({ trigger, title, description, children, footer, open, onOpenChange, className, initialFocus, finalFocus }: DialogProps) {
  const portalContainer = useThemePortalContainer()
  return (
    <BaseDialog.Root open={open} onOpenChange={(nextOpen) => onOpenChange?.(nextOpen)}>
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <OverlayPortal portal={BaseDialog.Portal} kind="modal" container={portalContainer}>
        <BaseDialog.Backdrop className="ui-dialog-backdrop" />
        <BaseDialog.Popup className={cn('ui-dialog', className)} initialFocus={initialFocus} finalFocus={finalFocus}>
          <div className="ui-dialog-header">
            <BaseDialog.Title className="ui-dialog-title">{title}</BaseDialog.Title>
            {description && <BaseDialog.Description className="ui-dialog-description">{description}</BaseDialog.Description>}
          </div>
          <BaseDialog.Close className="ui-dialog-close inline-flex items-center justify-center" aria-label="닫기">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </BaseDialog.Close>
          {children && <div className="ui-dialog-content">{children}</div>}
          {footer && <div className="ui-dialog-footer flex items-center justify-end gap-2">{footer}</div>}
        </BaseDialog.Popup>
      </OverlayPortal>
    </BaseDialog.Root>
  )
}
