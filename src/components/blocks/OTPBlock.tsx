import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Field } from '../ui/field'
import { InputOTP } from '../ui/input-otp'

export function validateOTPBlock(value: string) {
  if (!/^[0-9]{6}$/.test(value)) return '인증번호 6자리를 입력해 주세요.'
  return value === '123456' ? '' : '인증번호가 일치하지 않아요. 다시 확인해 주세요.'
}

/** Replace the demo verification and resend handlers with your service. */
export function OTPBlock() {
  const id = useId()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [complete, setComplete] = useState(false)
  const [status, setStatus] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const next = validateOTPBlock(code)
    setError(next)
    if (next) { setStatus(''); inputRef.current?.focus(); return }
    setBusy(true)
    setStatus('인증번호를 확인하고 있어요.')
    statusRef.current?.focus({ preventScroll: true })
    timer.current = setTimeout(() => {
      setBusy(false)
      setComplete(true)
      setStatus('이메일 인증이 완료됐어요.')
    }, 600)
  }

  return <Card style={{ width: '100%', maxWidth: 420, minWidth: 0, margin: '0 auto', padding: 'min(var(--ui-card-padding, 24px), 6%)', boxSizing: 'border-box', overflowWrap: 'anywhere' }}>
    <form onSubmit={submit} noValidate aria-labelledby={`${id}-title`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', minWidth: 0, gap: 'var(--ui-form-gap, 20px)' }}>
      <header style={{ display: 'grid', gap: 'var(--ui-field-gap, 8px)' }}>
        <span style={{ color: 'var(--ui-muted)', fontSize: 'var(--ui-type-caption-size, 12px)', letterSpacing: '.12em' }}>VERIFY YOUR EMAIL</span>
        <h3 id={`${id}-title`} style={{ margin: 0, fontSize: 'var(--ui-type-heading-size, 24px)', fontWeight: 'var(--ui-type-heading-weight, 600)', lineHeight: 'var(--ui-type-heading-line-height, 1.35)', letterSpacing: 'var(--ui-type-heading-letter-spacing, -.025em)' }}>인증번호를 입력하세요</h3>
        <p style={{ margin: 0, color: 'var(--ui-muted)', fontSize: 'var(--ui-type-body-size, 14px)', lineHeight: 'var(--ui-type-body-line-height, 1.6)' }}>이메일로 받은 6자리 번호로 계속하세요.</p>
      </header>
      <Field label="인증번호" error={error} description="미리보기 인증번호는 123456입니다.">
        <InputOTP ref={inputRef} name="verificationCode" length={6} value={code} disabled={busy || complete} required style={{ width: '100%', minWidth: 0 }} onValueChange={(value) => { setCode(value); setError(''); setStatus('') }} />
      </Field>
      <Button type="submit" loading={busy} disabled={complete} style={{ width: '100%' }}>{complete ? '인증 완료' : '인증하기'}</Button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--ui-control-gap, 8px)' }}>
        <span style={{ color: 'var(--ui-muted)', fontSize: 'var(--ui-type-caption-size, 12px)' }}>번호를 받지 못했나요?</span>
        <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => {
          setCode(''); setError(''); setComplete(false)
          setStatus('새 인증번호를 요청했어요. 미리보기에서는 123456을 사용하세요.')
          requestAnimationFrame(() => inputRef.current?.focus())
        }}>다시 보내기</Button>
      </div>
      <p ref={statusRef} tabIndex={-1} role="status" aria-live="polite" style={{ minHeight: '1.6em', margin: 0, color: 'var(--ui-muted)', fontSize: 'var(--ui-type-caption-size, 12px)', lineHeight: 'var(--ui-type-caption-line-height, 1.5)', overflowWrap: 'anywhere' }}>{status}</p>
    </form>
  </Card>
}
