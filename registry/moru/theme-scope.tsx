'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { createContext, useContext, useId, useRef, type CSSProperties, type HTMLAttributes, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { getCssVariables, type ThemeMode, type ThemeTokens } from './_theme/tokens'
import { getComponentSpacingCss } from './_theme/component-spacing'
import { cn } from './_lib/cn'

export type ThemeScopeProps = HTMLAttributes<HTMLDivElement> & {
  tokens: ThemeTokens
  mode: ThemeMode
}

const ThemePortalContext = createContext<RefObject<HTMLDivElement | null> | undefined>(undefined)

export function useThemePortalContainer() {
  return useContext(ThemePortalContext)
}

/** Theme values also follow popups into a body-level host, outside clipped preview cards. */
export function ThemeScope({ tokens, mode, className, style, children, ...props }: ThemeScopeProps) {
  const portalContainer = useRef<HTMLDivElement>(null)
  const spacingScope = useId()
  const scopedStyle = { ...getCssVariables(tokens, mode), ...style } as CSSProperties
  const portalStyle = Object.fromEntries(Object.entries(scopedStyle).filter(([key]) => key.startsWith('--'))) as CSSProperties
  const attributes = { 'data-moru-registry': '', 'data-mode': mode, 'data-density': tokens.density, 'data-font-family': tokens.fontFamily, 'data-moru-spacing-scope': spacingScope }
  const componentCss = getComponentSpacingCss(tokens.componentSpacing, `[data-moru-spacing-scope=${JSON.stringify(spacingScope)}]`)

  return (
    <ThemePortalContext.Provider value={portalContainer}>
      <div {...props} {...attributes} className={cn('ui-theme-scope', className)} style={scopedStyle}>
        {componentCss ? <style>{componentCss}</style> : null}
        {children}
      </div>
      {typeof document !== 'undefined' && createPortal(
        <div {...attributes} ref={portalContainer} className="ui-theme-scope ui-theme-portal" style={portalStyle} />,
        document.body,
      )}
    </ThemePortalContext.Provider>
  )
}
