// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { calendarDateKey, createCalendarDate } from './calendar-utils'

/** Parse the date input's calendar fields without UTC conversion. */
export function parseDatePickerFormValue(value: string): Date | null {
  const match = /^(\d{4,})-(\d{2})-(\d{2})$/.exec(value)
  if (!match || Number(match[1]) < 1) return null
  const date = createCalendarDate(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return calendarDateKey(date) === value ? date : null
}

/** @internal Wait for ancestor reset handlers; unmount and preventDefault cancel restoration. */
export function subscribeDatePickerFormReset(form: EventTarget, onReset: () => void) {
  let subscribed = true
  function reset(event: Event) {
    queueMicrotask(() => { if (subscribed && !event.defaultPrevented) onReset() })
  }
  form.addEventListener('reset', reset)
  return () => { subscribed = false; form.removeEventListener('reset', reset) }
}
