import { describe, expect, it } from 'vitest'
import { getDeviceFrameMetrics } from './SimulatorDeviceFrame'

describe('simulator device frame geometry', () => {
  it.each([
    { width: 600, kind: 'mobile', inset: 12 },
    { width: 601, kind: 'tablet', inset: 16 },
    { width: 1023, kind: 'tablet', inset: 16 },
    { width: 1024, kind: 'desktop', inset: 0 },
  ] as const)('uses the correct bezel at a $width px device boundary', ({ width, kind, inset }) => {
    const metrics = getDeviceFrameMetrics({ width, height: 844 })
    expect(metrics.kind).toBe(kind)
    expect(metrics.insetX).toBe(inset)
    expect(metrics.insetY).toBe(inset)
    expect(metrics.outerWidth - metrics.insetX * 2).toBe(width)
    expect(metrics.outerHeight - metrics.insetY * 2).toBe(844)
  })

  it('adds a bezel without changing the saved screen dimensions or content origin', () => {
    const screen = Object.freeze({ width: 390, height: 844 })
    const metrics = getDeviceFrameMetrics(screen)
    expect(metrics).toEqual({ kind: 'mobile', insetX: 12, insetY: 12, outerWidth: 414, outerHeight: 868, screenRadius: 28 })
    expect(screen).toEqual({ width: 390, height: 844 })
    // The inner screen starts after exactly one bezel on each axis.
    expect(metrics.outerWidth - screen.width - metrics.insetX).toBe(metrics.insetX)
    expect(metrics.outerHeight - screen.height - metrics.insetY).toBe(metrics.insetY)
  })

  it('keeps desktop canvas dimensions unchanged', () => {
    expect(getDeviceFrameMetrics({ width: 1280, height: 800 })).toEqual({ kind: 'desktop', insetX: 0, insetY: 0, outerWidth: 1280, outerHeight: 800, screenRadius: 10 })
  })
})
