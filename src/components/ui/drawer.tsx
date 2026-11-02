import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { shouldDismissDrawer, shouldSuppressDrawerClick } from './drawer-utils'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './navigation-completion.css'

export interface DrawerProps {
  trigger?: ReactElement
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  initialFocus?: ComponentPropsWithoutRef<typeof BaseDialog.Popup>['initialFocus']
  finalFocus?: ComponentPropsWithoutRef<typeof BaseDialog.Popup>['finalFocus']
}
/** A bottom modal with a keyboard-operable pull handle and downward pointer dismissal. */
export function Drawer({ trigger, title, description, children, footer, open, defaultOpen = false, onOpenChange, disabled, size = 'md', className, initialFocus, finalFocus }: DrawerProps) {
  const portalContainer = useThemePortalContainer()
  const [localOpen, setLocalOpen] = useState(defaultOpen)
  const [drag, setDrag] = useState(0)
  const gesture = useRef<{ y: number; started: number; pointerId: number } | null>(null)
  const suppressClick = useRef(false)
  const isOpen = open ?? localOpen
  useEffect(() => {
    if (isOpen) return
    // A controlled caller may close without going through changeOpen.
    gesture.current = null
    suppressClick.current = false
    setDrag(0)
  }, [isOpen])
  function changeOpen(next: boolean) {
    if (next && disabled) return
    gesture.current = null
    setDrag(0)
    if (open === undefined) setLocalOpen(next)
    onOpenChange?.(next)
  }
  return <BaseDialog.Root open={isOpen} onOpenChange={changeOpen}>
    {trigger ? <BaseDialog.Trigger render={trigger} disabled={disabled} /> : null}
    <OverlayPortal portal={BaseDialog.Portal} kind="modal" container={portalContainer}>
      <BaseDialog.Backdrop className="ui-navigation-backdrop" />
      <BaseDialog.Popup className={cn('ui-drawer', className)} data-size={size} data-dragging={gesture.current ? '' : undefined} style={{ '--ui-drawer-drag': `${drag}px` } as CSSProperties} initialFocus={initialFocus} finalFocus={finalFocus}>
        <button className="ui-drawer-handle" type="button" aria-label="아래로 끌거나 눌러 닫기" onClick={(event) => {
          const suppress = shouldSuppressDrawerClick(suppressClick.current, event.detail)
          suppressClick.current = false
          if (!suppress) changeOpen(false)
        }} onPointerDown={(event) => {
          if (event.button !== 0 || !event.isPrimary) return
          gesture.current = { y: event.clientY, started: event.timeStamp, pointerId: event.pointerId }
          suppressClick.current = false
          event.currentTarget.setPointerCapture(event.pointerId)
        }} onPointerMove={(event) => {
          if (gesture.current?.pointerId !== event.pointerId) return
          const distance = Math.max(0, event.clientY - gesture.current.y)
          if (distance > 5) suppressClick.current = true
          setDrag(distance)
        }} onPointerUp={(event) => {
          const current = gesture.current
          if (!current || current.pointerId !== event.pointerId) return
          const distance = Math.max(0, event.clientY - current.y)
          const dismiss = shouldDismissDrawer(distance, event.timeStamp - current.started)
          gesture.current = null
          setDrag(0)
          if (dismiss) changeOpen(false)
        }} onPointerCancel={() => { gesture.current = null; setDrag(0); suppressClick.current = false }} onLostPointerCapture={() => { gesture.current = null; setDrag(0) }}><span aria-hidden="true" /></button>
        <header className="ui-drawer-header"><BaseDialog.Title className="ui-navigation-heading">{title}</BaseDialog.Title>{description ? <BaseDialog.Description className="ui-navigation-description">{description}</BaseDialog.Description> : null}</header>
        <BaseDialog.Close className="ui-navigation-close" aria-label="드로어 닫기"><X size={18} aria-hidden="true" /></BaseDialog.Close>
        <div className="ui-drawer-content">{children}</div>{footer ? <footer className="ui-drawer-footer">{footer}</footer> : null}
      </BaseDialog.Popup>
    </OverlayPortal>
  </BaseDialog.Root>
}
