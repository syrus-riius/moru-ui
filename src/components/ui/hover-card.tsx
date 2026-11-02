import { useId, useState, type ReactElement, type ReactNode } from 'react'
import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card'
import { cn } from '../../lib/cn'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './navigation-completion.css'

export interface HoverCardProps {
  trigger: ReactElement
  title: string
  description?: string
  children?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  side?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}
export function HoverCard({ trigger, title, description, children, open, defaultOpen = false, onOpenChange, disabled, size = 'md', side = 'bottom', delay = 250, className }: HoverCardProps) {
  const portalContainer = useThemePortalContainer()
  const titleId = useId()
  const descriptionId = useId()
  const popupId = useId()
  const [localOpen, setLocalOpen] = useState(defaultOpen)
  const shown = !disabled && (open ?? localOpen)
  const existingDescription = (trigger.props as { 'aria-describedby'?: string })['aria-describedby']
  const describedBy = [existingDescription, shown ? popupId : undefined].filter(Boolean).join(' ') || undefined
  return <BasePreviewCard.Root open={shown} onOpenChange={(next, details) => { if (disabled && next) { details.cancel(); return }; if (open === undefined) setLocalOpen(next); onOpenChange?.(next) }}>
    <BasePreviewCard.Trigger render={trigger} delay={delay} closeDelay={150} aria-describedby={describedBy} aria-expanded={shown} aria-controls={shown ? popupId : undefined} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : undefined} onClick={(event) => { if (disabled) event.preventDefault() }} />
    <OverlayPortal portal={BasePreviewCard.Portal} kind="menu" container={portalContainer}><BasePreviewCard.Positioner className="ui-navigation-positioner" side={side} align="start" sideOffset={8} collisionPadding={12}><BasePreviewCard.Popup id={popupId} role="group" className={cn('ui-hover-card', className)} data-size={size} aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}>
      <h3 id={titleId}>{title}</h3>{description ? <p id={descriptionId}>{description}</p> : null}{children ? <div className="ui-hover-card-content">{children}</div> : null}
    </BasePreviewCard.Popup></BasePreviewCard.Positioner></OverlayPortal>
  </BasePreviewCard.Root>
}
