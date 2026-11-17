import { useI18n } from '../../lib/i18n'
import { useCallback, useMemo, type CSSProperties, type ReactNode } from 'react'
import { Toast as BaseToast } from '@base-ui/react/toast'
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import type { SemanticTone } from './state'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './overlay-shared.css'
import './toast.css'

export interface ToastOptions {
  title: string
  description?: string
  tone?: SemanticTone
  action?: { label: string; onClick: () => void }
  /** Time in milliseconds. Zero keeps the notification until it is dismissed. */
  duration?: number
}

interface ToastData {
  tone: SemanticTone
}

export interface ToastProviderProps {
  children: ReactNode
  /** Present notifications separately, or overlap them until hovered or focused. */
  layout?: 'list' | 'stack'
  /** Maximum visible notifications, clamped between 1 and 5. Defaults to 3. */
  limit?: number
}

/** Wrap inside ThemeScope to carry the active design tokens into notifications. */
export function ToastProvider({ children, layout = 'list', limit = 3 }: ToastProviderProps) {
  const visibleLimit = Number.isFinite(limit) ? Math.min(5, Math.max(1, Math.trunc(limit))) : 3
  return (
    <BaseToast.Provider limit={visibleLimit} timeout={5000}>
      {children}
      <ToastViewport layout={layout} />
    </BaseToast.Provider>
  )
}

export function useToast() {
  const { add, close } = BaseToast.useToastManager<ToastData>()
  const toast = useCallback(
    ({ title, description, tone = 'info', action, duration = 5000 }: ToastOptions) => {
      let toastId = ''
      toastId = add({
        title,
        description,
        data: { tone },
        type: tone,
        priority: tone === 'danger' ? 'high' : 'low',
        timeout: Number.isFinite(duration) && duration >= 0 ? duration : 5000,
        actionProps: action
          ? {
              children: action.label,
              onClick: () => {
                action.onClick()
                close(toastId)
              },
            }
          : undefined,
      })
      return toastId
    },
    [add, close],
  )
  return useMemo(() => ({ toast, dismiss: close }), [toast, close])
}

const toneIcons = { success: CircleCheck, warning: TriangleAlert, info: Info, danger: CircleAlert }

function ToastViewport({ layout }: { layout: NonNullable<ToastProviderProps['layout']> }) {
  const { t } = useI18n()

  const { toasts } = BaseToast.useToastManager<ToastData>()
  const portalContainer = useThemePortalContainer()
  const visibleToasts =
    layout === 'stack'
      ? toasts.filter((toast) => !toast.limited && toast.transitionStatus !== 'ending')
      : []
  const stackStyle = {
    '--ui-toast-stack-depth': Math.max(0, visibleToasts.length - 1),
    '--ui-toast-height-total': `${visibleToasts.reduce((total, toast) => total + (toast.height ?? 0), 0)}px`,
    '--ui-toast-head-height': visibleToasts[0]?.height ? `${visibleToasts[0].height}px` : undefined,
  } as CSSProperties
  return (
    <OverlayPortal portal={BaseToast.Portal} kind="toast" container={portalContainer}>
      <BaseToast.Viewport
        className="ui-toast-viewport"
        data-layout={layout}
        data-empty={toasts.length === 0 || undefined}
        aria-label={t('알림 · F6 키로 이동')}
      >
        {toasts.length > 0 && (
          <div className="ui-toast-items" style={layout === 'stack' ? stackStyle : undefined}>
            {toasts.map((toast) => {
              const tone = toast.data?.tone ?? 'info'
              const Icon = toneIcons[tone]
              return (
                <BaseToast.Root key={toast.id} toast={toast} className="ui-toast" data-tone={tone}>
                  <BaseToast.Content
                    className="ui-toast-content"
                    data-base-ui-swipe-ignore={layout === 'stack' ? '' : undefined}
                  >
                    <Icon className="ui-toast-icon" size={18} aria-hidden="true" />
                    <div className="ui-toast-copy">
                      <BaseToast.Title className="ui-toast-title">{toast.title}</BaseToast.Title>
                      {toast.description && (
                        <BaseToast.Description className="ui-toast-description">
                          {toast.description}
                        </BaseToast.Description>
                      )}
                      {toast.actionProps && <BaseToast.Action className="ui-toast-action" />}
                    </div>
                  </BaseToast.Content>
                  <BaseToast.Close
                    className="ui-overlay-close ui-toast-close"
                    aria-label={t('알림 닫기')}
                    {...(layout === 'stack' ? { 'aria-hidden': false } : undefined)}
                  >
                    <X size={16} aria-hidden="true" />
                  </BaseToast.Close>
                </BaseToast.Root>
              )
            })}
          </div>
        )}
      </BaseToast.Viewport>
    </OverlayPortal>
  )
}
