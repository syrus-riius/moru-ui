import { useI18n } from '../../lib/i18n'
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { CircleCheck, CircleHelp, TriangleAlert } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './modal.css'

export interface ModalProps {
  trigger?: ReactElement
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  /** Visual presentation; the caller owns confirmation actions and validation. */
  variant?: 'default' | 'confirmation' | 'form' | 'success' | 'danger'
  /** Override the decorative variant icon. Pass null to omit it. */
  icon?: ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  /** Choose the initial target for forms or long content; Base UI keeps its touch-safe default when omitted. */
  initialFocus?: ComponentPropsWithoutRef<typeof BaseDialog.Popup>['initialFocus']
  /** Restore focus to a stable destination when the opener is removed or the dialog has no trigger. */
  finalFocus?: ComponentPropsWithoutRef<typeof BaseDialog.Popup>['finalFocus']
}

export function Modal({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  defaultOpen,
  size = 'md',
  variant = 'default',
  icon,
  onOpenChange,
  className,
  initialFocus,
  finalFocus,
}: ModalProps) {
  const { t } = useI18n()

  const portalContainer = useThemePortalContainer()
  const mark =
    icon !== undefined ? (
      icon
    ) : variant === 'success' ? (
      <CircleCheck aria-hidden="true" />
    ) : variant === 'danger' ? (
      <TriangleAlert aria-hidden="true" />
    ) : variant === 'confirmation' ? (
      <CircleHelp aria-hidden="true" />
    ) : null
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(nextOpen) => onOpenChange?.(nextOpen)}
    >
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <OverlayPortal portal={BaseDialog.Portal} kind="modal" container={portalContainer}>
        <BaseDialog.Backdrop className="ui-dialog-backdrop" />
        <BaseDialog.Popup
          className={cn('ui-dialog ui-modal', className)}
          data-size={size}
          data-variant={variant}
          initialFocus={initialFocus}
          finalFocus={finalFocus}
        >
          <div className="ui-dialog-header">
            {mark != null && (
              <div className="ui-modal-mark" aria-hidden="true">
                {mark}
              </div>
            )}
            <BaseDialog.Title className="ui-dialog-title">{title}</BaseDialog.Title>
            {description && (
              <BaseDialog.Description className="ui-dialog-description">
                {description}
              </BaseDialog.Description>
            )}
          </div>
          <BaseDialog.Close
            className="ui-dialog-close inline-flex items-center justify-center"
            aria-label={t('닫기')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="m4 4 8 8m0-8-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </BaseDialog.Close>
          {children && <div className="ui-dialog-content">{children}</div>}
          {footer && (
            <div className="ui-dialog-footer flex items-center justify-end gap-2">{footer}</div>
          )}
        </BaseDialog.Popup>
      </OverlayPortal>
    </BaseDialog.Root>
  )
}
