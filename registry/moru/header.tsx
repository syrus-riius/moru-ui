'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useI18n } from './_lib/i18n'
import { forwardRef, useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from './_lib/cn'
import './header.css'

export type HeaderProps = HTMLAttributes<HTMLElement> & {
  brand: ReactNode
  navigation?: ReactNode
  actions?: ReactNode
  variant?: 'navigation' | 'centered' | 'app'
  size?: 'sm' | 'md' | 'lg'
  navigationLabel?: string
  menuLabel?: string
  /** Control the narrow-screen navigation disclosure, for example when opening search. */
  menuOpen?: boolean
  defaultMenuOpen?: boolean
  onMenuOpenChange?: (open: boolean) => void
}

/** A page header with an inline, keyboard-accessible navigation disclosure on small screens. */
export const Header = forwardRef<HTMLElement, HeaderProps>(function Header(
  {
    brand,
    navigation,
    actions,
    variant = 'navigation',
    size = 'md',
    navigationLabel: navigationLabelProp,
    menuLabel: menuLabelProp,
    menuOpen,
    defaultMenuOpen = false,
    onMenuOpenChange,
    children,
    className,
    onKeyDown,
    ...props
  },
  ref,
) {
  const { t } = useI18n()
  const navigationLabel = navigationLabelProp ?? t('주요 탐색')
  const menuLabel = menuLabelProp ?? t('메뉴')

  const navigationId = useId()
  const menuRef = useRef<HTMLButtonElement>(null)
  const [localMenuOpen, setLocalMenuOpen] = useState(defaultMenuOpen)
  const expanded = menuOpen ?? localMenuOpen

  function changeMenuOpen(next: boolean) {
    if (menuOpen === undefined) setLocalMenuOpen(next)
    onMenuOpenChange?.(next)
  }

  return (
    <header
      {...props}
      ref={ref}
      className={cn('ui-header', className)}
      data-variant={variant}
      data-size={size}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (
          event.defaultPrevented ||
          event.key !== 'Escape' ||
          !expanded ||
          !menuRef.current?.getClientRects().length
        )
          return
        event.preventDefault()
        event.stopPropagation()
        changeMenuOpen(false)
        menuRef.current?.focus()
      }}
    >
      <div className="ui-header-row">
        <div className="ui-header-brand">{brand}</div>
        {navigation ? (
          <>
            <button
              ref={menuRef}
              type="button"
              className="ui-header-menu"
              aria-label={`${menuLabel} ${expanded ? t('닫기') : t('열기')}`}
              aria-controls={navigationId}
              aria-expanded={expanded}
              onClick={() => changeMenuOpen(!expanded)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d={expanded ? 'm6 6 12 12M18 6 6 18' : 'M4 6h16M4 12h16M4 18h16'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <nav
              id={navigationId}
              className="ui-header-navigation"
              aria-label={navigationLabel}
              data-expanded={expanded || undefined}
              onClick={(event) => {
                const target = event.target as HTMLElement
                const action = target.closest('a[href], button:not(:disabled)')
                if (!expanded || !action) return
                changeMenuOpen(false)
                if (event.detail === 0 && menuRef.current?.getClientRects().length) {
                  menuRef.current.focus()
                }
              }}
            >
              {navigation}
            </nav>
          </>
        ) : null}
        {actions ? <div className="ui-header-actions">{actions}</div> : null}
      </div>
      {children ? <div className="ui-header-content">{children}</div> : null}
    </header>
  )
})
