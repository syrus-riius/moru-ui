// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
export type InputFormat =
  | 'card-number'
  | 'card-expiry'
  | 'card-cvc'
  | 'phone'
  | 'email'
  | 'url'
  | 'ipv4'
  | 'ipv6'
  | 'postal-code'

const maskedFormats = new Set<InputFormat>([
  'card-number',
  'card-expiry',
  'card-cvc',
  'phone',
  'postal-code',
])

export function isMaskedInputFormat(format: InputFormat) {
  return maskedFormats.has(format)
}

function asciiDigits(value: string) {
  return value.replace(/[０-９]/g, (character) => String(character.charCodeAt(0) - 0xff10))
}

function digits(value: string) {
  return asciiDigits(value).replace(/\D/g, '')
}

function groups(value: string, lengths: number[], separator: string) {
  const result: string[] = []
  let offset = 0
  for (const length of lengths) {
    if (offset >= value.length) break
    result.push(value.slice(offset, offset + length))
    offset += length
  }
  if (offset < value.length) result.push(value.slice(offset))
  return result.join(separator)
}

/** Formatting is intentionally separate from validation; incomplete edits remain editable. */
export function formatInputValue(format: InputFormat, value: string): string {
  if (!isMaskedInputFormat(format)) return value
  const numeric = digits(value)
  switch (format) {
    case 'card-number': {
      const card = numeric.slice(0, 19)
      return groups(card, /^3[47]/.test(card) ? [4, 6, 5, 4] : [4, 4, 4, 4, 3], ' ')
    }
    case 'card-expiry': {
      const pastedYear = asciiDigits(value).match(/^\s*(\d{1,2})\s*[/.-]\s*(\d{4})\s*$/)
      const expiry = pastedYear
        ? pastedYear[1].padStart(2, '0') + pastedYear[2].slice(-2)
        : numeric.slice(0, 4)
      return groups(expiry, [2, 2], '/')
    }
    case 'card-cvc':
      return numeric.slice(0, 4)
    case 'postal-code':
      return numeric.slice(0, 5)
    case 'phone': {
      if (value.trimStart().startsWith('+')) return '+' + numeric.slice(0, 15)
      const phone = numeric.slice(0, 12)
      if (/^1[568]/.test(phone)) return groups(phone.slice(0, 8), [4, 4], '-')
      if (phone.startsWith('02'))
        return groups(phone.slice(0, 10), phone.length > 9 ? [2, 4, 4] : [2, 3, 4], '-')
      if (phone.startsWith('050')) return groups(phone, [4, 4, 4], '-')
      return groups(phone.slice(0, 11), phone.length > 10 ? [3, 4, 4] : [3, 3, 4], '-')
    }
    default:
      return value
  }
}

function significant(character: string, format: InputFormat) {
  return /[0-9０-９]/.test(character) || (format === 'phone' && character === '+')
}

/** Map a native edit's caret by digit count, rather than jumping to the end after formatting. */
export function formatInputEdit(format: InputFormat, value: string, caret: number) {
  const formatted = formatInputValue(format, value)
  const offset = Math.max(0, Math.min(value.length, caret))
  if (!isMaskedInputFormat(format)) return { value: formatted, caret: offset }
  const count = [...value.slice(0, offset)].filter((character) =>
    significant(character, format),
  ).length
  if (count === 0) return { value: formatted, caret: 0 }
  let seen = 0
  let nextCaret = formatted.length
  for (let index = 0; index < formatted.length; index++) {
    if (significant(formatted[index], format)) seen++
    if (seen === count) {
      nextCaret = index + 1
      break
    }
  }
  return { value: formatted, caret: nextCaret }
}

/** Delete the adjacent digit when Backspace/Delete lands on an automatically inserted separator. */
export function deleteInputSeparator(
  format: InputFormat,
  value: string,
  start: number,
  end: number,
  direction: 'backward' | 'forward',
) {
  if (!isMaskedInputFormat(format) || start !== end) return null
  const separator = direction === 'backward' ? start - 1 : start
  if (separator < 0 || separator >= value.length || significant(value[separator], format))
    return null
  let target = separator
  const step = direction === 'backward' ? -1 : 1
  while (target >= 0 && target < value.length && !significant(value[target], format)) target += step
  if (target < 0 || target >= value.length) return null
  const next = value.slice(0, target) + value.slice(target + 1)
  return formatInputEdit(format, next, direction === 'backward' ? target : start)
}

export function isValidIPv4(value: string) {
  const parts = value.split('.')
  return (
    parts.length === 4 &&
    parts.every((part) => /^(?:0|[1-9]\d{0,2})$/.test(part) && Number(part) <= 255)
  )
}

/** IPv6 address syntax, including one compression marker and an optional IPv4 tail. No CIDR/zone. */
export function isValidIPv6(value: string) {
  if (!value || /[^\da-f:.]/i.test(value)) return false
  let address = value
  if (address.includes('.')) {
    const separator = address.lastIndexOf(':')
    if (separator < 0 || !isValidIPv4(address.slice(separator + 1))) return false
    address = address.slice(0, separator + 1) + '0:0'
  }
  const halves = address.split('::')
  if (halves.length > 2) return false
  const validGroup = (group: string) => /^[\da-f]{1,4}$/i.test(group)
  if (halves.length === 1) {
    const parts = address.split(':')
    return parts.length === 8 && parts.every(validGroup)
  }
  const left = halves[0] ? halves[0].split(':') : []
  const right = halves[1] ? halves[1].split(':') : []
  return left.length + right.length < 8 && [...left, ...right].every(validGroup)
}

function passesLuhn(value: string) {
  let sum = 0
  let double = false
  for (let index = value.length - 1; index >= 0; index--) {
    let digit = Number(value[index])
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }
  return sum % 10 === 0
}

/** Optional client-side syntax checks. Empty values are valid; use `required` for required fields. */
export function validateFormattedInput(
  format: InputFormat,
  value: string,
  now = new Date(),
): string | null {
  if (!value.trim()) return null
  const numeric = digits(value)
  switch (format) {
    case 'card-number':
      return /^[\d\s-]+$/.test(value) &&
        numeric.length >= 13 &&
        numeric.length <= 19 &&
        !/^0+$/.test(numeric) &&
        (!/^3[47]/.test(numeric) || numeric.length === 15) &&
        passesLuhn(numeric)
        ? null
        : '카드번호의 자릿수와 숫자를 확인해 주세요.'
    case 'card-expiry': {
      const match = value.match(/^(\d{2})\/(\d{2})$/)
      if (!match || Number(match[1]) < 1 || Number(match[1]) > 12)
        return '유효기간을 MM/YY 형식으로 입력해 주세요.'
      const currentMonth = now.getFullYear() * 12 + now.getMonth()
      const expiryMonth = (2000 + Number(match[2])) * 12 + Number(match[1]) - 1
      return expiryMonth < currentMonth ? '이미 지난 유효기간이에요.' : null
    }
    case 'card-cvc':
      return /^\d{3,4}$/.test(value) ? null : '보안코드는 3자리 또는 4자리 숫자예요.'
    case 'postal-code':
      return /^\d{5}$/.test(value) ? null : '한국 우편번호는 5자리 숫자예요.'
    case 'phone': {
      const trimmed = value.trim()
      const international = /^\+[1-9]\d{6,14}$/.test(trimmed.replace(/[\s()-]/g, ''))
      const domestic =
        /^[\d\s()-]+$/.test(trimmed) &&
        /^(?:010\d{8}|01[16789]\d{7,8}|02\d{7,8}|0(?:31|32|33|41|42|43|44|51|52|53|54|55|61|62|63|64|70)\d{7,8}|050\d{9}|1[568]\d{6})$/.test(
          numeric,
        )
      return international || domestic ? null : '한국 전화번호 또는 +국가번호 형식을 확인해 주세요.'
    }
    case 'email': {
      const parts = value.split('@')
      const local = parts[0]
      const domain = parts[1]
      const valid =
        parts.length === 2 &&
        value.length <= 254 &&
        local.length <= 64 &&
        /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/i.test(local) &&
        !local.includes('..') &&
        !!domain &&
        domain.includes('.') &&
        domain.split('.').every((part) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(part))
      return valid ? null : '이메일 주소 형식을 확인해 주세요.'
    }
    case 'url': {
      try {
        const url = new URL(value)
        return /^https?:\/\//i.test(value) &&
          !/\s|[\u0000-\u001f\u007f]/.test(value) &&
          ['http:', 'https:'].includes(url.protocol) &&
          !!url.hostname &&
          !url.username &&
          !url.password
          ? null
          : 'http:// 또는 https://로 시작하는 주소를 입력해 주세요.'
      } catch {
        return 'http:// 또는 https://로 시작하는 주소를 입력해 주세요.'
      }
    }
    case 'ipv4':
      return isValidIPv4(value) ? null : 'IPv4 주소는 0~255 숫자 네 개를 점으로 구분해요.'
    case 'ipv6':
      return isValidIPv6(value) ? null : 'IPv6 주소의 그룹과 콜론 구분을 확인해 주세요.'
  }
}

/** Controlled values remain owned by the caller; native resets only restore local state. */
export function subscribeFormattedInputReset(
  form: EventTarget,
  onReset: () => void,
  isControlled: () => boolean,
) {
  let subscribed = true
  const reset = (event: Event) => {
    queueMicrotask(() => {
      if (subscribed && !event.defaultPrevented && !isControlled()) onReset()
    })
  }
  form.addEventListener('reset', reset)
  return () => {
    subscribed = false
    form.removeEventListener('reset', reset)
  }
}
