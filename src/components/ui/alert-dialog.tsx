import { useEffect, useLayoutEffect, useRef, useState, type ComponentPropsWithoutRef, type ReactElement } from 'react'
import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'
import { CircleAlert } from 'lucide-react'
import { Button } from './button'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './advanced-overlays.css'

export interface AlertDialogProps {
  trigger?: ReactElement
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  open?: boolean
  onOpenChange?: (open: boolean) => void
  destructive?: boolean
  loading?: boolean
  /** Focus a stable destination after confirmation removes the original trigger. */
  finalFocus?: ComponentPropsWithoutRef<typeof BaseAlertDialog.Popup>['finalFocus']
}

/** Explicit confirmation with safe initial focus and recoverable async errors. */
export function AlertDialog({
  trigger, title, description, confirmLabel = '확인', cancelLabel = '취소', onConfirm,
  open, onOpenChange, destructive = false, loading = false, finalFocus,
}: AlertDialogProps) {
  const portalContainer = useThemePortalContainer()
  const [internalOpen, setInternalOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const pendingRef = useRef(false)
  const mountedRef = useRef(true)
  const sessionRef = useRef(0)
  const isOpen = open ?? internalOpen
  const busy = loading || confirming

  useLayoutEffect(() => {
    const popup = popupRef.current
    if (!isOpen || !busy || !popup) return
    // Disabling the focused action can move browser focus to body. Keep it in
    // the confirmation while all actions are unavailable, including on error.
    const active = popup.ownerDocument.activeElement
    if (active === popup.ownerDocument.body || (active && popup.contains(active))) {
      popup.focus({ preventScroll: true })
    }
  }, [isOpen, busy])

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      sessionRef.current += 1
      pendingRef.current = false
      setConfirming(false)
      setError(null)
    }
  }, [isOpen])

  function changeOpen(nextOpen: boolean) {
    if (!nextOpen && (pendingRef.current || loading)) return
    if (open === undefined) setInternalOpen(nextOpen)
    if (nextOpen) setError(null)
    onOpenChange?.(nextOpen)
  }

  async function confirm() {
    if (pendingRef.current || loading) return
    pendingRef.current = true
    setConfirming(true)
    setError(null)
    const session = sessionRef.current
    try {
      await onConfirm()
      if (!mountedRef.current || session !== sessionRef.current) return
      pendingRef.current = false
      setConfirming(false)
      changeOpen(false)
    } catch (reason) {
      if (!mountedRef.current || session !== sessionRef.current) return
      pendingRef.current = false
      setConfirming(false)
      setError(reason instanceof Error && reason.message.trim() ? reason.message : '처리하지 못했습니다. 다시 시도해 주세요.')
    }
  }

  return (
    <BaseAlertDialog.Root open={isOpen} onOpenChange={(nextOpen, details) => {
      if (!nextOpen && (pendingRef.current || loading)) { details.cancel(); return }
      changeOpen(nextOpen)
    }}>
      {trigger && <BaseAlertDialog.Trigger render={trigger} />}
      <OverlayPortal portal={BaseAlertDialog.Portal} kind="modal" container={portalContainer}>
        <BaseAlertDialog.Backdrop className="ui-overlay-backdrop" />
        <BaseAlertDialog.Popup ref={popupRef} className="ui-alert-dialog" initialFocus={() => cancelRef.current && !cancelRef.current.disabled ? cancelRef.current : popupRef.current} finalFocus={finalFocus} aria-busy={busy || undefined}>
          <div className="ui-alert-dialog-mark" data-destructive={destructive || undefined}>
            <CircleAlert size={20} aria-hidden="true" />
          </div>
          <BaseAlertDialog.Title className="ui-overlay-title">{title}</BaseAlertDialog.Title>
          {description && <BaseAlertDialog.Description className="ui-overlay-description">{description}</BaseAlertDialog.Description>}
          {error && <p className="ui-confirmation-error" role="alert">{error}</p>}
          <div className="ui-alert-dialog-actions">
            <BaseAlertDialog.Close render={<Button ref={cancelRef} variant="secondary" disabled={busy} />}>{cancelLabel}</BaseAlertDialog.Close>
            <Button variant={destructive ? 'danger' : 'primary'} loading={busy} onClick={() => { void confirm() }}>
              {confirmLabel}
            </Button>
          </div>
        </BaseAlertDialog.Popup>
      </OverlayPortal>
    </BaseAlertDialog.Root>
  )
}
