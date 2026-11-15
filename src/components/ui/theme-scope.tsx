import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { getCssVariables, type ThemeMode, type ThemeTokens } from '../../theme/tokens'
import { getComponentSpacingCss } from '../../theme/component-spacing'
import { resolveAppearance } from '../../theme/style-packs'
import { cn } from '../../lib/cn'
import './style-packs.css'

export type ThemeScopeProps = HTMLAttributes<HTMLDivElement> & {
  tokens: ThemeTokens
  mode: ThemeMode
}

const ThemePortalContext = createContext<HTMLDivElement | null | undefined>(undefined)

export function useThemePortalContainer() {
  return useContext(ThemePortalContext)
}

/** Theme values also follow popups into a body-level host, outside clipped preview cards. */
export function ThemeScope({
  tokens,
  mode,
  className,
  style,
  children,
  ...props
}: ThemeScopeProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null)
  const spacingScope = useId()
  // Server markup and the first client render must match. An explicit null
  // container also makes initially open popups wait for their themed host.
  useEffect(() => {
    setPortalTarget(document.body)
  }, [])
  // Deriving the variables walks every token and runs contrast searches. A parent
  // re-render with the same tokens reuses the previous result.
  const variables = useMemo(() => getCssVariables(tokens, mode), [tokens, mode])
  const scopedStyle = useMemo(
    () => ({ ...variables, ...style }) as CSSProperties,
    [variables, style],
  )
  const portalStyle = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(scopedStyle).filter(([key]) => key.startsWith('--')),
      ) as CSSProperties,
    [scopedStyle],
  )
  const attributes = {
    'data-mode': mode,
    'data-density': tokens.density,
    'data-font-family': tokens.fontFamily,
    'data-style-pack': resolveAppearance(tokens.appearance).preset,
    'data-moru-spacing-scope': spacingScope,
  }
  const componentCss = useMemo(
    () =>
      getComponentSpacingCss(
        tokens.componentSpacing,
        `[data-moru-spacing-scope=${JSON.stringify(spacingScope)}]`,
      ),
    [tokens.componentSpacing, spacingScope],
  )

  return (
    <ThemePortalContext.Provider value={portalContainer}>
      <div
        {...props}
        {...attributes}
        className={cn('ui-theme-scope', className)}
        style={scopedStyle}
      >
        {componentCss ? <style>{componentCss}</style> : null}
        {children}
      </div>
      {portalTarget &&
        createPortal(
          <div
            {...attributes}
            ref={setPortalContainer}
            className="ui-theme-scope ui-theme-portal"
            style={portalStyle}
          />,
          portalTarget,
        )}
    </ThemePortalContext.Provider>
  )
}
