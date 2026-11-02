import type { CSSProperties, ReactNode } from 'react'
import type { SimScreen } from './simulator-types'
import './simulator-device-frame.css'

export type DeviceFrameKind = 'mobile' | 'tablet' | 'desktop'

export interface DeviceFrameMetrics {
  kind: DeviceFrameKind
  insetX: number
  insetY: number
  outerWidth: number
  outerHeight: number
  screenRadius: number
}

/** Frame geometry includes the physical bezel while preserving screen coordinates. */
export function getDeviceFrameMetrics(screen: Pick<SimScreen, 'width' | 'height'>): DeviceFrameMetrics {
  const kind: DeviceFrameKind = screen.width <= 600 ? 'mobile' : screen.width < 1024 ? 'tablet' : 'desktop'
  const inset = kind === 'mobile' ? 12 : kind === 'tablet' ? 16 : 0
  return {
    kind,
    insetX: inset,
    insetY: inset,
    outerWidth: screen.width + inset * 2,
    outerHeight: screen.height + inset * 2,
    screenRadius: kind === 'mobile' ? 28 : kind === 'tablet' ? 12 : 10,
  }
}

interface SimulatorDeviceFrameProps {
  screen: SimScreen
  zoom: number
  children: ReactNode
}

export function SimulatorDeviceFrame({ screen, zoom, children }: SimulatorDeviceFrameProps) {
  const metrics = getDeviceFrameMetrics(screen)
  const style = {
    width: metrics.outerWidth,
    height: metrics.outerHeight,
    transform: `scale(${zoom})`,
    '--sim-device-inset-x': `${metrics.insetX}px`,
    '--sim-device-inset-y': `${metrics.insetY}px`,
    '--sim-device-screen-width': `${screen.width}px`,
    '--sim-device-screen-height': `${screen.height}px`,
    '--sim-device-screen-radius': `${metrics.screenRadius}px`,
  } as CSSProperties

  return <div className="sim-frame-stage sim-device-stage" style={{ width: metrics.outerWidth * zoom, height: metrics.outerHeight * zoom }}>
    <div className="sim-device-frame" data-device={metrics.kind} style={style}>
      {metrics.kind !== 'desktop' && <div className="sim-device-hardware" aria-hidden="true">
        <div className="sim-device-shell" />
        <span className="sim-device-camera" />
        <span className="sim-device-home-indicator" />
        <span className="sim-device-button sim-device-button-volume" />
        <span className="sim-device-button sim-device-button-power" />
      </div>}
      <div className="sim-device-viewport">{children}</div>
    </div>
  </div>
}
