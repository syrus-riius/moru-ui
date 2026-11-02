/** A bounded length avoids accidental, unrenderable slot counts. */
export function normalizeOTPLength(length: number) { return Number.isFinite(length) ? Math.max(1, Math.min(12, Math.trunc(length))) : 6 }
export function normalizeOTP(value: string, length = 6) { return value.replace(/[^0-9]/g, '').slice(0, normalizeOTPLength(length)) }
/** Paste replaces the browser selection, keeping digits beyond separators. */
export function insertOTP(current: string, pasted: string, selectionStart: number, selectionEnd: number, length = 6) {
  const start = Math.max(0, Math.min(current.length, selectionStart))
  const end = Math.max(start, Math.min(current.length, selectionEnd))
  const digits = normalizeOTP(pasted, length)
  const value = normalizeOTP(current.slice(0, start) + digits + current.slice(end), length)
  return { value, caret: Math.min(value.length, start + digits.length) }
}

/** Uncontrolled OTP state follows uncanceled native resets, including external forms. */
export function subscribeOTPFormReset(form: EventTarget, onReset: () => void, isControlled: () => boolean) {
  let subscribed = true
  function reset(event: Event) {
    queueMicrotask(() => { if (subscribed && !event.defaultPrevented && !isControlled()) onReset() })
  }
  form.addEventListener('reset', reset)
  return () => { subscribed = false; form.removeEventListener('reset', reset) }
}
