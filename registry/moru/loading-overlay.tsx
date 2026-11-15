'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useId, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from './_lib/cn'
import { useI18n } from './_lib/i18n'
import { Spinner, type SpinnerProps } from './spinner'
import './loading-overlay.css'

export interface LoadingOverlayProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  loading: boolean
  label?: string
  description?: string
  spinnerVariant?: SpinnerProps['variant']
  paused?: boolean
  children: ReactNode
}

/** A local loading boundary. Keep portaled popups closed while their source region is busy. */
export function LoadingOverlay({
  loading,
  label: labelProp,
  description,
  spinnerVariant = 'ring',
  paused = false,
  children,
  className,
  tabIndex = -1,
  ...props
}: LoadingOverlayProps) {
  const { t } = useI18n()
  const label = labelProp ?? t('불러오는 중')
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const focusedChildRef = useRef<HTMLElement | null>(null)
  const restoreTargetRef = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    const content = contentRef.current
    const status = statusRef.current
    if (!content || !status) return
    const document = content.ownerDocument
    if (loading) {
      const active = document.activeElement
      // Applying inert can move focus to body before this layout effect runs.
      // The capture handlers retain only a child that was focused at that transition.
      const candidate =
        active instanceof HTMLElement && content.contains(active)
          ? active
          : active === document.body
            ? focusedChildRef.current
            : null
      if (candidate && content.contains(candidate)) {
        restoreTargetRef.current = candidate
        status.focus({ preventScroll: true })
      }
      return
    }
    const target = restoreTargetRef.current
    restoreTargetRef.current = null
    if (document.activeElement !== status) return
    if (
      target?.isConnected &&
      !target.matches(':disabled') &&
      !target.closest('[inert], [hidden]')
    ) {
      target.focus({ preventScroll: true })
    }
    // The caller may replace or disable the triggering control when work finishes.
    // Leave the empty status region without taking focus back from another control.
    if (document.activeElement === status) rootRef.current?.focus({ preventScroll: true })
  }, [loading])

  return (
    <div
      {...props}
      ref={rootRef}
      tabIndex={tabIndex}
      className={cn('ui-loading-overlay', className)}
      data-loading={loading || undefined}
    >
      <div
        ref={contentRef}
        className="ui-loading-overlay-content"
        inert={loading || undefined}
        aria-busy={loading}
        onFocusCapture={(event) => {
          if (event.target instanceof HTMLElement) focusedChildRef.current = event.target
        }}
        onBlurCapture={(event) => {
          if (
            !loading ||
            (event.relatedTarget instanceof Node &&
              !event.currentTarget.contains(event.relatedTarget))
          ) {
            focusedChildRef.current = null
          }
        }}
      >
        {children}
      </div>
      <div
        ref={statusRef}
        className="ui-loading-overlay-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-labelledby={loading ? `${id}-label` : undefined}
        aria-describedby={loading && description ? `${id}-description` : undefined}
        tabIndex={-1}
      >
        {loading && (
          <div className="ui-loading-overlay-message">
            <Spinner variant={spinnerVariant} paused={paused} decorative size="lg" />
            <span id={`${id}-label`} className="ui-loading-overlay-label">
              {label}
            </span>
            {description && (
              <span id={`${id}-description`} className="ui-loading-overlay-description">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
