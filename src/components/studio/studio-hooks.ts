import { useEffect, useState, type RefObject } from 'react'

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    media.addEventListener('change', update)
    update()
    return () => media.removeEventListener('change', update)
  }, [query])
  return matches
}

/** Trap focus in an open drawer panel and return it to the opener when the drawer closes. */
export function useDrawerFocus(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  initialFocusRef?: RefObject<string | null>,
  returnFocusRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open || !ref.current) return
    const panel = ref.current
    const previous =
      returnFocusRef?.current ??
      (document.activeElement instanceof HTMLElement ? document.activeElement : null)
    const focusable = () =>
      [
        ...panel.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], textarea:not(:disabled), [tabindex="0"]',
        ),
      ].filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0)
    const frame = requestAnimationFrame(() => {
      const target = initialFocusRef?.current
        ? document.getElementById(initialFocusRef.current)
        : null
      const initial = target && panel.contains(target) ? target : focusable()[0]
      initial?.focus()
    })
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const elements = focusable()
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (
        event.shiftKey &&
        (document.activeElement === first || !panel.contains(document.activeElement))
      ) {
        event.preventDefault()
        last?.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !panel.contains(document.activeElement))
      ) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', trap)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', trap)
      previous?.focus()
    }
  }, [open, ref, initialFocusRef, returnFocusRef])
}
