import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Field } from './field'
import { FileInput } from './file-input'
import { Input } from './input'
import { InputOTP } from './input-otp'
import { subscribeOTPFormReset } from './input-otp-utils'
import { NativeSelect } from './native-select'
import { PasswordInput } from './password-input'
import { Textarea } from './textarea'

const controls = [
  { name: 'Input', Control: Input }, { name: 'Textarea', Control: Textarea },
  { name: 'PasswordInput', Control: PasswordInput }, { name: 'InputOTP', Control: InputOTP },
  { name: 'NativeSelect', Control: NativeSelect }, { name: 'FileInput', Control: FileInput },
] as const

describe('Text and native input interaction states', () => {
  it.each(controls)('$name locks the actual control and announces loading', ({ Control }) => {
    const markup = renderToStaticMarkup(<Field label="입력" error="확인해 주세요."><Control loading name="entry" /></Field>)
    const control = markup.match(/<(?:input|textarea|select)\b[^>]*>/)?.[0] ?? ''
    expect(control).toContain('disabled=""')
    expect(control).toContain('aria-busy="true"')
    expect(control).toContain('aria-invalid="true"')
    expect(control).toContain('aria-describedby=')
    expect(markup).toContain('ui-loading-indicator')
    expect(markup).not.toContain(' loading=')
    expect(markup).not.toContain(' previewState=')
  })

  it.each(controls)('$name distinguishes disabled controls from pending controls', ({ Control }) => {
    const markup = renderToStaticMarkup(<Control disabled aria-label="입력" />)
    const control = markup.match(/<(?:input|textarea|select)\b[^>]*>/)?.[0] ?? ''
    expect(control).toContain('disabled=""')
    expect(control).not.toContain('aria-busy="true"')
    expect(markup).not.toContain('ui-loading-indicator')
  })

  it.each([false, 'false'] as const)('does not paint an OTP error for aria-invalid=%s', (invalid) => {
    const markup = renderToStaticMarkup(<InputOTP aria-invalid={invalid} />)
    expect(markup).toContain('aria-invalid="false"')
    expect(markup).not.toContain('data-invalid=')
  })

  it.each([true, 'true', 'grammar', 'spelling'] as const)('preserves an explicit OTP error state %s', (invalid) => {
    const markup = renderToStaticMarkup(<InputOTP aria-invalid={invalid} />)
    expect(markup).toContain('data-invalid="true"')
  })

  it('keeps an OTP external form association for native submission and reset', () => {
    const markup = renderToStaticMarkup(<Field label="인증 번호"><InputOTP form="verification" name="code" defaultValue="012345" /></Field>)
    expect(markup.match(/<input\b[^>]*>/)?.[0]).toContain('form="verification"')
    expect(markup.match(/<input\b[^>]*>/)?.[0]).toContain('name="code"')
  })
})

describe('OTP native form reset', () => {
  it('resets an uncontrolled value after native reset handlers have run', async () => {
    const form = new EventTarget()
    let value = '123456'
    const unsubscribe = subscribeOTPFormReset(form, () => { value = '000000' }, () => false)
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    expect(value).toBe('123456')
    await Promise.resolve()
    expect(value).toBe('000000')
    unsubscribe()
  })

  it('keeps parent-controlled values when a form is reset', async () => {
    const form = new EventTarget()
    let value = '123456'
    const unsubscribe = subscribeOTPFormReset(form, () => { value = '' }, () => true)
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    await Promise.resolve()
    expect(value).toBe('123456')
    unsubscribe()
  })

  it('honors reset cancelation and discards callbacks after unmount', async () => {
    const form = new EventTarget()
    let resets = 0
    const unsubscribe = subscribeOTPFormReset(form, () => resets++, () => false)
    form.addEventListener('reset', (event) => event.preventDefault(), { once: true })
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    await Promise.resolve()
    expect(resets).toBe(0)
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    unsubscribe()
    await Promise.resolve()
    expect(resets).toBe(0)
  })
})
