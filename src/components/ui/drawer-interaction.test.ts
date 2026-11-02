import { describe, expect, it } from 'vitest'
import { shouldDismissDrawer, shouldSuppressDrawerClick } from './drawer-utils'

describe('Drawer handle activation after a gesture', () => {
  it('keeps an incomplete pull open when its synthesized click arrives', () => {
    expect(shouldDismissDrawer(20, 300)).toBe(false)
    expect(shouldSuppressDrawerClick(true, 1)).toBe(true)
  })

  it('allows Enter, Space, and assistive clicks after an interrupted pull', () => {
    expect(shouldSuppressDrawerClick(true, 0)).toBe(false)
  })

  it('allows a fresh tap to close without requiring a drag', () => {
    expect(shouldDismissDrawer(0, 100)).toBe(false)
    expect(shouldSuppressDrawerClick(false, 1)).toBe(false)
  })

  it('suppresses a completed pull’s trailing click so it cannot dismiss twice', () => {
    expect(shouldDismissDrawer(100, 300)).toBe(true)
    expect(shouldSuppressDrawerClick(true, 1)).toBe(true)
  })
})
