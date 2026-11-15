import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SignupBlock, validateSignupBlock, type SignupDetails } from './SignupBlock'

const validDetails: SignupDetails = {
  name: '민지',
  email: 'minji@example.com',
  password: 'moru2026!',
  accepted: true,
}

describe('Signup screen validation', () => {
  it('prevents advancing while required account details or consent are missing', () => {
    expect(
      validateSignupBlock({ name: '   ', email: 'invalid@', password: 'short', accepted: false }),
    ).toEqual({
      name: '이름을 1~40자로 입력해 주세요.',
      email: '올바른 이메일 주소를 입력해 주세요.',
      password: '비밀번호를 8~128자로 입력해 주세요.',
      accepted: '필수 동의 항목을 확인해 주세요.',
    })
  })

  it('accepts surrounding whitespace in name and email without modifying the draft', () => {
    const draft = { ...validDetails, name: '  민지  ', email: ' minji@example.com ' }
    expect(validateSignupBlock(draft)).toEqual({ name: '', email: '', password: '', accepted: '' })
    expect(draft.name).toBe('  민지  ')
    expect(draft.email).toBe(' minji@example.com ')
  })

  it('applies the same length limits when values are provided outside the text controls', () => {
    expect(validateSignupBlock({ ...validDetails, name: '가'.repeat(41) }).name).not.toBe('')
    expect(validateSignupBlock({ ...validDetails, password: 'a'.repeat(129) }).password).not.toBe(
      '',
    )
    expect(
      validateSignupBlock({ ...validDetails, name: '가'.repeat(40), password: 'a'.repeat(128) }),
    ).toEqual({ name: '', email: '', password: '', accepted: '' })
  })

  it('renders a named first-step form with new-account autofill and an explicit local-preview notice', () => {
    const html = renderToStaticMarkup(<SignupBlock />)
    expect(html).toContain('aria-label="회원가입 진행 단계"')
    expect(html).toContain('aria-current="step"')
    expect(html).toContain('aria-labelledby=')
    expect(html).toContain('autoComplete="name"')
    expect(html).toContain('autoComplete="email"')
    expect(html).toContain('autoComplete="new-password"')
    expect(html).toContain('이메일 인증으로 계속')
    expect(html).toContain('실제 이메일을 보내지 않습니다.')
    expect(html).not.toContain('name="verificationCode"')
  })
})
