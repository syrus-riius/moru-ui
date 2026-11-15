import { describe, expect, it } from 'vitest'
import {
  deleteInputSeparator,
  formatInputEdit,
  formatInputValue,
  isValidIPv4,
  isValidIPv6,
  subscribeFormattedInputReset,
  validateFormattedInput,
  type InputFormat,
} from './formatted-input-utils'

describe('Formatted input masks and native editing', () => {
  it.each<[InputFormat, string, string]>([
    ['card-number', '4242-4242 4242-4242', '4242 4242 4242 4242'],
    ['card-number', '378282246310005', '3782 822463 10005'],
    ['card-number', '１２３４５', '1234 5'],
    ['card-number', '12345678901234567890123', '1234 5678 9012 3456 789'],
    ['card-expiry', '1228', '12/28'],
    ['card-expiry', '1', '1'],
    ['card-expiry', '3 / 2028', '03/28'],
    ['card-cvc', '0012', '0012'],
    ['postal-code', '01234', '01234'],
    ['phone', '01012345678', '010-1234-5678'],
    ['phone', '0212345678', '02-1234-5678'],
    ['phone', '021234567', '02-123-4567'],
    ['phone', '050712345678', '0507-1234-5678'],
    ['phone', '15881234', '1588-1234'],
    ['phone', '+44 (20) 1234-5678', '+442012345678'],
    ['email', 'Ada.Lovelace+notes@Example.com', 'Ada.Lovelace+notes@Example.com'],
    ['url', 'https://example.com/새로운-경로?q=A', 'https://example.com/새로운-경로?q=A'],
    ['ipv4', '192.168.', '192.168.'],
    ['ipv6', '2001:DB8::', '2001:DB8::'],
  ])('%s formats %s without changing its meaning', (format, input, result) => {
    expect(formatInputValue(format, input)).toBe(result)
  })

  it('keeps the caret beside a middle insertion instead of moving it to the end', () => {
    expect(formatInputEdit('card-number', '1234 95678', 6)).toEqual({
      value: '1234 9567 8',
      caret: 6,
    })
    expect(formatInputEdit('card-number', '12345', 5)).toEqual({ value: '1234 5', caret: 6 })
    expect(formatInputEdit('email', 'Ada+notes@example.com', 4)).toEqual({
      value: 'Ada+notes@example.com',
      caret: 4,
    })
  })

  it('deletes a digit across a formatting separator in either direction', () => {
    expect(deleteInputSeparator('card-number', '1234 5678', 5, 5, 'backward')).toEqual({
      value: '1235 678',
      caret: 3,
    })
    expect(deleteInputSeparator('card-number', '1234 5678', 4, 4, 'forward')).toEqual({
      value: '1234 678',
      caret: 4,
    })
    expect(deleteInputSeparator('card-expiry', '12/28', 3, 3, 'backward')).toEqual({
      value: '12/8',
      caret: 1,
    })
  })

  it('leaves normal deletion and selection replacement to the browser', () => {
    expect(deleteInputSeparator('card-number', '1234 5678', 2, 2, 'backward')).toBeNull()
    expect(deleteInputSeparator('card-number', '1234 5678', 1, 6, 'backward')).toBeNull()
    expect(deleteInputSeparator('email', 'Ada+notes@example.com', 4, 4, 'backward')).toBeNull()
  })
})

describe('Explicit optional validation', () => {
  const now = new Date(2026, 10, 12)
  it.each<[InputFormat, string]>([
    ['card-number', '4242 4242 4242 4242'],
    ['card-number', '3782 822463 10005'],
    ['card-number', '4222 2222 2222 2'],
    ['card-expiry', '11/26'],
    ['card-expiry', '12/28'],
    ['card-cvc', '000'],
    ['card-cvc', '1234'],
    ['postal-code', '01234'],
    ['phone', '010-1234-5678'],
    ['phone', '02-123-4567'],
    ['phone', '031-1234-5678'],
    ['phone', '0507-1234-5678'],
    ['phone', '1588-1234'],
    ['phone', '+442012345678'],
    ['email', 'Ada.Lovelace+notes@Example.com'],
    ['url', 'https://example.com/경로?q=value#section'],
    ['url', 'http://localhost:5173/'],
  ])('%s accepts a complete value: %s', (format, value) => {
    expect(validateFormattedInput(format, value, now)).toBeNull()
  })

  it.each<[InputFormat, string]>([
    ['card-number', '4242 4242 4242 4241'],
    ['card-number', '0000 0000 0000 0000'],
    ['card-number', '4242'],
    ['card-number', 'a4242 4242 4242 4242'],
    ['card-expiry', '10/26'],
    ['card-expiry', '00/28'],
    ['card-expiry', '13/28'],
    ['card-expiry', '12/'],
    ['card-cvc', '12'],
    ['card-cvc', '12345'],
    ['postal-code', '0123'],
    ['phone', '010-123-4567'],
    ['phone', '+0123456789'],
    ['phone', 'not a telephone number'],
    ['email', 'name@'],
    ['email', '.name@example.com'],
    ['email', 'name..tag@example.com'],
    ['email', '<name>@example.com'],
    ['email', '"name"@example.com'],
    ['email', 'name\\tag@example.com'],
    ['email', 'name@-example.com'],
    ['email', 'name@exam_ple.com'],
    ['url', 'https:example.com'],
    ['url', 'https:/example.com'],
    ['url', 'https://exam\nple.com'],
    ['url', 'https://example.com/a b'],
    ['url', 'javascript:alert(1)'],
    ['url', 'https://user:secret@example.com'],
  ])('%s rejects incomplete or invalid syntax: %s', (format, value) => {
    expect(validateFormattedInput(format, value, now)).toEqual(expect.any(String))
  })

  it.each<InputFormat>([
    'card-number',
    'card-expiry',
    'card-cvc',
    'phone',
    'email',
    'url',
    'ipv4',
    'ipv6',
    'postal-code',
  ])('leaves required validation to the caller for %s', (format) => {
    expect(validateFormattedInput(format, '')).toBeNull()
  })
})

describe('IP address syntax', () => {
  it.each(['0.0.0.0', '127.0.0.1', '192.168.1.1', '255.255.255.255'])(
    'accepts IPv4 %s',
    (value) => {
      expect(isValidIPv4(value)).toBe(true)
      expect(validateFormattedInput('ipv4', value)).toBeNull()
    },
  )
  it.each(['256.0.0.1', '1.2.3', '1.2.3.4.5', '1..2.3', '01.2.3.4', '-1.2.3.4', '1e2.2.3.4'])(
    'rejects IPv4 %s',
    (value) => {
      expect(isValidIPv4(value)).toBe(false)
    },
  )
  it.each(['::', '::1', '2001:DB8::1', '2001:db8:0:1:2:3:4:5', '::ffff:192.0.2.128'])(
    'accepts IPv6 %s',
    (value) => {
      expect(isValidIPv6(value)).toBe(true)
      expect(validateFormattedInput('ipv6', value)).toBeNull()
    },
  )
  it.each([
    '1:2:3',
    '1::2::3',
    '2001:gggg::1',
    ':::1',
    ':1:2:3:4:5:6:7',
    '1:2:3:4:5:6:7:8::',
    '::ffff:256.0.0.1',
    'fe80::1%eth0',
    '2001:db8::/64',
  ])('rejects IPv6 %s', (value) => {
    expect(isValidIPv6(value)).toBe(false)
  })
})

describe('Formatted input native form reset', () => {
  it('restores an uncontrolled value after uncanceled reset processing', async () => {
    const form = new EventTarget()
    let current = '4242 4242'
    const unsubscribe = subscribeFormattedInputReset(
      form,
      () => {
        current = '0000'
      },
      () => false,
    )
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    expect(current).toBe('4242 4242')
    await Promise.resolve()
    expect(current).toBe('0000')
    unsubscribe()
  })
  it('preserves controlled values and canceled or unmounted reset requests', async () => {
    const form = new EventTarget()
    let calls = 0
    let controlled = true
    const unsubscribe = subscribeFormattedInputReset(
      form,
      () => calls++,
      () => controlled,
    )
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    await Promise.resolve()
    expect(calls).toBe(0)
    controlled = false
    form.addEventListener('reset', (event) => event.preventDefault(), { once: true })
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    await Promise.resolve()
    expect(calls).toBe(0)
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    unsubscribe()
    await Promise.resolve()
    expect(calls).toBe(0)
  })
})
