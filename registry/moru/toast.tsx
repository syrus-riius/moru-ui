'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useCallback, useMemo, type ReactNode } from 'react'
import { Toast as BaseToast } from '@base-ui/react/toast'
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import type { SemanticTone } from './state'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './advanced-overlays.css'

export interface ToastOptions {
  title: string
  description?: string
  tone?: SemanticTone
  action?: { label: string; onClick: () => void }
  /** Time in milliseconds. Zero keeps the notification until it is dismissed. */
  duration?: number
}

interface ToastData { tone: SemanticTone }

/** Wrap inside ThemeScope to carry the active design tokens into notifications. */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <BaseToast.Provider limit={3} timeout={5000}>
      {children}
      <ToastViewport />
    </BaseToast.Provider>
  )
}

export function useToast() {
  const { add, close } = BaseToast.useToastManager<ToastData>()
  const toast = useCallback(({ title, description, tone = 'info', action, duration = 5000 }: ToastOptions) => {
    let toastId = ''
    toastId = add({
      title,
      description,
      data: { tone },
      type: tone,
      priority: tone === 'danger' ? 'high' : 'low',
      timeout: Number.isFinite(duration) && duration >= 0 ? duration : 5000,
      actionProps: action ? {
        children: action.label,
        onClick: () => { action.onClick(); close(toastId) },
      } : undefined,
    })
    return toastId
  }, [add, close])
  return useMemo(() => ({ toast, dismiss: close }), [toast, close])
}

const toneIcons = { success: CircleCheck, warning: TriangleAlert, info: Info, danger: CircleAlert }

function ToastViewport() {
  const { toasts } = BaseToast.useToastManager<ToastData>()
  const portalContainer = useThemePortalContainer()
  return (
    <OverlayPortal portal={BaseToast.Portal} kind="toast" container={portalContainer}>
      <BaseToast.Viewport className="ui-toast-viewport" aria-label="알림 · F6 키로 이동">
        {toasts.map((toast) => {
          const tone = toast.data?.tone ?? 'info'
          const Icon = toneIcons[tone]
          return (
            <BaseToast.Root key={toast.id} toast={toast} className="ui-toast" data-tone={tone}>
              <Icon className="ui-toast-icon" size={18} aria-hidden="true" />
              <BaseToast.Content className="ui-toast-content">
                <BaseToast.Title className="ui-toast-title">{toast.title}</BaseToast.Title>
                {toast.description && <BaseToast.Description className="ui-toast-description">{toast.description}</BaseToast.Description>}
                {toast.actionProps && <BaseToast.Action className="ui-toast-action" />}
              </BaseToast.Content>
              <BaseToast.Close className="ui-overlay-close ui-toast-close" aria-label="알림 닫기">
                <X size={16} aria-hidden="true" />
              </BaseToast.Close>
            </BaseToast.Root>
          )
        })}
      </BaseToast.Viewport>
    </OverlayPortal>
  )
}
