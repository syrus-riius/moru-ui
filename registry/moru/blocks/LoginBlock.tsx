'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Button } from '../button'
import { Card } from '../card'
import { Checkbox } from '../checkbox'
import { Field } from '../field'
import { Input } from '../input'
import { PasswordInput } from '../password-input'

export function validateLoginBlock(email: string, password: string) {
  return {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? '' : '올바른 이메일 주소를 입력해 주세요.',
    password: password.length >= 8 ? '' : '비밀번호를 8자 이상 입력해 주세요.',
  }
}

/** A local interaction example. Connect your authentication request in submit. */
export function LoginBlock() {
  const id = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const next = validateLoginBlock(email, password)
    setErrors(next)
    setStatus('')
    if (next.email || next.password) {
      const target = next.email ? emailRef : passwordRef
      target.current?.focus()
      return
    }
    setBusy(true)
    setStatus('로그인 정보를 확인하고 있어요.')
    statusRef.current?.focus({ preventScroll: true })
    // Simulate a local result; no credentials are sent or stored.
    timer.current = setTimeout(() => {
      setBusy(false)
      setPassword('')
      setStatus('로그인 정보를 확인했어요. 다음 화면을 연결할 준비가 됐어요.')
    }, 600)
  }

  return <Card style={{ width: '100%', maxWidth: 420, margin: '0 auto', padding: 'var(--ui-card-padding, 24px)', boxSizing: 'border-box' }}>
    <form onSubmit={submit} noValidate aria-labelledby={`${id}-title`} style={{ display: 'grid', gap: 'var(--ui-form-gap, 20px)' }}>
      <header style={{ display: 'grid', gap: 'var(--ui-field-gap, 8px)' }}>
        <span style={{ color: 'var(--ui-muted)', fontSize: 'var(--ui-type-caption-size, 12px)', letterSpacing: '.12em' }}>MORU WORKSPACE</span>
        <h3 id={`${id}-title`} style={{ margin: 0, fontSize: 'var(--ui-type-heading-size, 24px)', fontWeight: 'var(--ui-type-heading-weight, 600)', lineHeight: 'var(--ui-type-heading-line-height, 1.35)', letterSpacing: 'var(--ui-type-heading-letter-spacing, -.025em)' }}>다시 만나 반가워요</h3>
        <p style={{ margin: 0, color: 'var(--ui-muted)', fontSize: 'var(--ui-type-body-size, 14px)', lineHeight: 'var(--ui-type-body-line-height, 1.6)' }}>이메일로 나의 작업 공간을 이어가세요.</p>
      </header>
      <Field label="이메일" error={errors.email}>
        <Input ref={emailRef} name="email" type="email" autoComplete="username" placeholder="you@example.com" value={email} disabled={busy} required onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: '' })); setStatus('') }} />
      </Field>
      <Field label="비밀번호" error={errors.password} description="8자 이상 입력하세요.">
        <PasswordInput ref={passwordRef} name="password" autoComplete="current-password" placeholder="비밀번호 입력" value={password} disabled={busy} required onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: '' })); setStatus('') }} />
      </Field>
      <Checkbox label="로그인 상태 유지" checked={remember} disabled={busy} onCheckedChange={setRemember} />
      <Button type="submit" loading={busy} style={{ width: '100%' }}>로그인</Button>
      <p ref={statusRef} tabIndex={-1} role="status" aria-live="polite" style={{ minHeight: '1.6em', margin: 0, color: 'var(--ui-muted)', fontSize: 'var(--ui-type-caption-size, 12px)', lineHeight: 'var(--ui-type-caption-line-height, 1.5)', overflowWrap: 'anywhere' }}>{status}</p>
    </form>
  </Card>
}
