'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { createContext, useContext, type ComponentType, type CSSProperties, type ReactNode, type RefObject } from 'react'

// Keep the existing order of unrelated overlays. A nested overlay always sits
// above its parent, even when its default kind normally has a lower priority.
const rootLayers = {
  modal: 71,
  popover: 82,
  menu: 86,
  combobox: 90,
  tooltip: 90,
  command: 96,
  toast: 96,
} as const

type OverlayKind = keyof typeof rootLayers
type PortalContainer = HTMLElement | ShadowRoot | RefObject<HTMLElement | ShadowRoot | null> | null

interface PortalElementProps {
  children?: ReactNode
  container?: PortalContainer
  className?: string
  style?: CSSProperties
  'data-moru-overlay-layer'?: number
}

interface OverlayPortalProps {
  portal: ComponentType<PortalElementProps>
  kind: OverlayKind
  container?: PortalContainer
  children: ReactNode
}

const OverlayLayerContext = createContext(0)

/**
 * Apply the stacking context to the original Base UI portal, including its
 * internal backdrop and focus guards. React context follows nested portals
 * even when ThemeScope sends their DOM to separate body-level theme hosts.
 */
export function OverlayPortal({ portal: Portal, kind, container, children }: OverlayPortalProps) {
  const parentLayer = useContext(OverlayLayerContext)
  const layer = Math.max(rootLayers[kind], parentLayer + 1)

  return (
    <OverlayLayerContext.Provider value={layer}>
      <Portal
        container={container}
        className="ui-overlay-portal"
        style={{ position: 'relative', isolation: 'isolate', zIndex: layer }}
        data-moru-overlay-layer={layer}
      >
        {children}
      </Portal>
    </OverlayLayerContext.Provider>
  )
}
