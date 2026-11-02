/** A deliberate pull or a short, quick downward gesture dismisses the drawer. */
export function shouldDismissDrawer(distance: number, elapsedMs: number): boolean {
  if (!Number.isFinite(distance) || !Number.isFinite(elapsedMs) || distance < 0 || elapsedMs < 0) return false
  return distance >= 88 || (distance >= 28 && distance / Math.max(elapsedMs, 1) >= 0.55)
}

/** Ignore a drag's synthesized pointer click, never a keyboard/assistive activation. */
export function shouldSuppressDrawerClick(dragged: boolean, clickDetail: number): boolean {
  return dragged && clickDetail > 0
}
