// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
/** Join optional classes without coupling the component source to a utility package. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
