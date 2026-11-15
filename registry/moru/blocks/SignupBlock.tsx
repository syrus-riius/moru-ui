'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useBlockI18n } from '../_lib/block-i18n'
import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { Button } from '../button'
import { Card } from '../card'
import { Checkbox } from '../checkbox'
import { Field } from '../field'
import { Input } from '../input'
import { InputOTP } from '../input-otp'
import { PasswordInput } from '../password-input'
import { validateOTPBlock } from './OTPBlock'

export interface SignupDetails {
  name: string
  email: string
  password: string
  accepted: boolean
}

export function validateSignupBlock(details: SignupDetails) {
  return {
    name:
      details.name.trim().length > 0 && details.name.trim().length <= 40
        ? ''
        : '이름을 1~40자로 입력해 주세요.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())
      ? ''
      : '올바른 이메일 주소를 입력해 주세요.',
    password:
      details.password.length >= 8 && details.password.length <= 128
        ? ''
        : '비밀번호를 8~128자로 입력해 주세요.',
    accepted: details.accepted ? '' : '필수 동의 항목을 확인해 주세요.',
  }
}

type SignupStep = 'account' | 'verify' | 'complete'
const emptyDetails: SignupDetails = { name: '', email: '', password: '', accepted: false }
const emptyErrors = { name: '', email: '', password: '', accepted: '' }
const stack: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  minWidth: 0,
  gap: 'var(--ui-form-gap, 20px)',
}
const hint: CSSProperties = {
  margin: 0,
  color: 'var(--ui-muted)',
  fontSize: 'var(--ui-type-caption-size, 12px)',
  lineHeight: 'var(--ui-type-caption-line-height, 1.5)',
  overflowWrap: 'anywhere',
}

/** A complete local signup flow. Replace its demo handlers with server-side signup and verification. */
export function SignupBlock() {
  const { t } = useBlockI18n()
  const id = useId()
  const [step, setStep] = useState<SignupStep>('account')
  const [details, setDetails] = useState<SignupDetails>(emptyDetails)
  const [errors, setErrors] = useState(emptyErrors)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [status, setStatus] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const consentRef = useRef<HTMLDivElement>(null)
  const codeRef = useRef<HTMLInputElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const focusAfterStep = useRef<'name' | 'email' | 'code' | 'heading' | null>(null)

  useEffect(() => {
    const target = focusAfterStep.current
    focusAfterStep.current = null
    if (target === 'name') nameRef.current?.focus()
    if (target === 'email') emailRef.current?.focus()
    if (target === 'code') codeRef.current?.focus()
    if (target === 'heading') headingRef.current?.focus()
  }, [step])

  function change<K extends keyof SignupDetails>(key: K, value: SignupDetails[K]) {
    setDetails((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
    setStatus('')
  }

  function startVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = validateSignupBlock(details)
    setErrors(next)
    if (next.name) return nameRef.current?.focus()
    if (next.email) return emailRef.current?.focus()
    if (next.password) return passwordRef.current?.focus()
    if (next.accepted) {
      consentRef.current?.querySelector<HTMLElement>('[role="checkbox"]')?.focus()
      return
    }
    setDetails((current) => ({
      ...current,
      name: current.name.trim(),
      email: current.email.trim(),
    }))
    setCode('')
    setCodeError('')
    setStatus('')
    focusAfterStep.current = 'code'
    setStep('verify')
  }

  function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = validateOTPBlock(code)
    setCodeError(next)
    if (next) {
      codeRef.current?.focus()
      return
    }
    // Only local React state changes. Do not persist or transmit the preview password.
    setDetails((current) => ({ ...current, password: '' }))
    setCode('')
    setStatus('')
    focusAfterStep.current = 'heading'
    setStep('complete')
  }

  function reset() {
    setDetails(emptyDetails)
    setErrors(emptyErrors)
    setCode('')
    setCodeError('')
    setStatus('')
    focusAfterStep.current = 'name'
    setStep('account')
  }

  const stepIndex = step === 'account' ? 0 : step === 'verify' ? 1 : 2
  return (
    <Card
      style={{
        width: '100%',
        maxWidth: 480,
        minWidth: 0,
        margin: '0 auto',
        padding: 'min(var(--ui-card-padding, 24px), 6%)',
        boxSizing: 'border-box',
        overflowWrap: 'anywhere',
      }}
    >
      <div style={stack}>
        <ol
          aria-label={t('회원가입 진행 단계')}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--ui-control-gap, 8px)',
            margin: 0,
            padding: 0,
            listStyle: 'none',
          }}
        >
          {['계정 정보', '이메일 인증', '완료'].map((label, index) => (
            <li
              key={t(label)}
              aria-current={stepIndex === index ? 'step' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ui-space, 4px)',
                color: index <= stepIndex ? 'var(--ui-text)' : 'var(--ui-muted)',
                fontSize: 'var(--ui-type-caption-size, 12px)',
                lineHeight: 'var(--ui-type-caption-line-height, 1.5)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-grid',
                  placeItems: 'center',
                  width: 24,
                  height: 24,
                  flex: 'none',
                  borderRadius: 'var(--ui-radius, 6px)',
                  background: stepIndex === index ? 'var(--ui-primary)' : 'var(--ui-input-bg)',
                  color: stepIndex === index ? 'var(--ui-primary-foreground)' : 'inherit',
                }}
              >
                {index < stepIndex ? '✓' : index + 1}
              </span>
              {t(label)}
            </li>
          ))}
        </ol>

        <header style={{ display: 'grid', gap: 'var(--ui-field-gap, 8px)' }}>
          <span style={{ ...hint, letterSpacing: '.12em' }}>MORU WORKSPACE</span>
          <h3
            id={`${id}-title`}
            ref={headingRef}
            tabIndex={-1}
            style={{
              margin: 0,
              fontSize: 'var(--ui-type-heading-size, 24px)',
              fontWeight: 'var(--ui-type-heading-weight, 600)',
              lineHeight: 'var(--ui-type-heading-line-height, 1.35)',
              letterSpacing: 'var(--ui-type-heading-letter-spacing, -.025em)',
            }}
          >
            {step === 'account'
              ? t('함께 시작해 볼까요?')
              : step === 'verify'
                ? t('이메일을 확인해 주세요')
                : t('{name}님, 준비됐어요', { name: details.name })}
          </h3>
          <p
            style={{
              ...hint,
              fontSize: 'var(--ui-type-body-size, 14px)',
              lineHeight: 'var(--ui-type-body-line-height, 1.6)',
            }}
          >
            {step === 'account'
              ? t('계정을 만들고 나만의 작업 공간을 시작하세요.')
              : step === 'verify'
                ? t('{email} 주소로 가입을 진행하고 있어요.', { email: details.email })
                : t('계정 정보 입력부터 이메일 인증까지 모두 확인했어요.')}
          </p>
        </header>

        {step === 'account' ? (
          <form
            onSubmit={startVerification}
            noValidate
            aria-labelledby={`${id}-title`}
            style={stack}
          >
            <Field label={t('이름')} error={t(errors.name)}>
              <Input
                ref={nameRef}
                name="name"
                autoComplete="name"
                value={details.name}
                maxLength={40}
                required
                placeholder={t('어떻게 불러 드릴까요?')}
                onChange={(event) => change('name', event.target.value)}
              />
            </Field>
            <Field label={t('이메일')} error={t(errors.email)}>
              <Input
                ref={emailRef}
                name="email"
                type="email"
                autoComplete="email"
                value={details.email}
                required
                placeholder="you@example.com"
                onChange={(event) => change('email', event.target.value)}
              />
            </Field>
            <Field
              label={t('비밀번호')}
              error={t(errors.password)}
              description={t('8자 이상 입력하세요.')}
            >
              <PasswordInput
                ref={passwordRef}
                name="password"
                autoComplete="new-password"
                value={details.password}
                required
                maxLength={128}
                placeholder={t('비밀번호 만들기')}
                onChange={(event) => change('password', event.target.value)}
              />
            </Field>
            <div ref={consentRef} style={{ display: 'grid', gap: 'var(--ui-field-gap, 8px)' }}>
              <Checkbox
                name="accepted"
                label={t('이용약관 및 개인정보 처리방침 동의 (필수)')}
                checked={details.accepted}
                onCheckedChange={(value) => change('accepted', value)}
                aria-invalid={!!errors.accepted || undefined}
                aria-describedby={`${id}-consent-note${errors.accepted ? ` ${id}-consent-error` : ''}`}
              />
              <p id={`${id}-consent-note`} style={hint}>
                {t('미리보기용 동의 항목입니다. 실제 약관 동의는 이루어지지 않아요.')}
              </p>
              {errors.accepted ? (
                <p
                  id={`${id}-consent-error`}
                  role="alert"
                  style={{ ...hint, color: 'var(--ui-danger-surface-text)' }}
                >
                  {t(errors.accepted)}
                </p>
              ) : null}
            </div>
            <Button type="submit" style={{ width: '100%' }}>
              {t('이메일 인증으로 계속')}
            </Button>
          </form>
        ) : step === 'verify' ? (
          <form onSubmit={verify} noValidate aria-labelledby={`${id}-title`} style={stack}>
            <Field
              label={t('인증번호')}
              error={t(codeError)}
              description={t('미리보기 인증번호는 123456입니다.')}
            >
              <InputOTP
                ref={codeRef}
                name="verificationCode"
                length={6}
                value={code}
                required
                style={{ width: '100%', minWidth: 0 }}
                onValueChange={(value) => {
                  setCode(value)
                  setCodeError('')
                  setStatus('')
                }}
              />
            </Field>
            <Button type="submit" style={{ width: '100%' }}>
              {t('인증하고 가입 완료')}
            </Button>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--ui-control-gap, 8px)',
              }}
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatus('')
                  setCodeError('')
                  focusAfterStep.current = 'email'
                  setStep('account')
                }}
              >
                {t('가입 정보 수정')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCode('')
                  setCodeError('')
                  setStatus(
                    '재전송을 체험했어요. 실제 메일은 전송하지 않으며, 인증번호는 123456입니다.',
                  )
                  codeRef.current?.focus()
                }}
              >
                {t('인증번호 다시 받기')}
              </Button>
            </div>
            {status ? (
              <p role="status" style={hint}>
                {t(status)}
              </p>
            ) : null}
          </form>
        ) : (
          <div style={stack}>
            <div
              style={{
                display: 'grid',
                gap: 'var(--ui-field-gap, 8px)',
                padding: 'var(--ui-card-padding, 24px)',
                borderRadius: 'var(--ui-radius, 6px)',
                background: 'var(--ui-input-bg)',
              }}
            >
              <strong
                style={{
                  color: 'var(--ui-success-surface-text)',
                  fontSize: 'var(--ui-type-label-size, 14px)',
                }}
              >
                {t('가입 흐름 체험 완료')}
              </strong>
              <span style={hint}>{details.email}</span>
              <p style={hint}>
                {t(
                  '실제 계정은 생성되지 않았어요. 이 화면 뒤에 온보딩이나 대시보드를 연결해 보세요.',
                )}
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={reset}>
              {t('처음부터 다시 체험')}
            </Button>
          </div>
        )}
        <p style={hint}>
          {t('로컬 미리보기 · 입력값은 전송하거나 저장하지 않으며 실제 이메일을 보내지 않습니다.')}
        </p>
      </div>
    </Card>
  )
}
