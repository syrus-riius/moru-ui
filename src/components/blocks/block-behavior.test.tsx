import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LoginBlock, validateLoginBlock } from './LoginBlock'
import { OTPBlock, validateOTPBlock } from './OTPBlock'
import { SearchFiltersBlock, filterBlockItems } from './SearchFiltersBlock'
import { SettingsBlock, validateSettingsBlock } from './SettingsBlock'
import { BLOCKS, getBlockSource } from './block-catalog'

describe('Reusable Moru block behavior', () => {
  it('rejects missing or malformed login fields and accepts a valid local example', () => {
    expect(validateLoginBlock('', '').email).not.toBe('')
    expect(validateLoginBlock('person@', 'short').password).not.toBe('')
    expect(validateLoginBlock('  person@example.com  ', 'moru2026!')).toEqual({ email: '', password: '' })
  })

  it('distinguishes incomplete OTP, incorrect OTP and the correct demo code', () => {
    expect(validateOTPBlock('12345')).toContain('6자리')
    expect(validateOTPBlock('abcdef')).toContain('6자리')
    expect(validateOTPBlock('654321')).toContain('일치하지')
    expect(validateOTPBlock('123456')).toBe('')
  })

  it('combines search, status and owner filters instead of replacing earlier filters', () => {
    expect(filterBlockItems('', 'all', false)).toHaveLength(4)
    expect(filterBlockItems('  브랜드  ', 'active', true).map((item) => item.id)).toEqual(['brand'])
    expect(filterBlockItems('브랜드', 'done', true)).toEqual([])
    expect(filterBlockItems('모바일', 'all', true)).toEqual([])
    expect(filterBlockItems('.*', 'all', false)).toEqual([])
  })

  it('validates settings before a save can replace the last saved draft', () => {
    expect(validateSettingsBlock('   ', 'invalid')).toEqual({ name: '작업 공간 이름을 입력해 주세요.', email: '올바른 이메일 주소를 입력해 주세요.' })
    expect(validateSettingsBlock('우리 팀', ' team@example.com ')).toEqual({ name: '', email: '' })
  })

  it('exposes named forms and native autofill semantics without prefilling credentials', () => {
    const html = renderToStaticMarkup(<LoginBlock />)
    expect(html).toContain('aria-labelledby=')
    expect(html).toContain('autoComplete="username"')
    expect(html).toContain('autoComplete="current-password"')
    expect(html).not.toContain('value="moru2026!"')
    expect(html).toContain('role="status"')
  })

  it('keeps OTP a real one-time-code input and publishes the demo code as a field hint', () => {
    const html = renderToStaticMarkup(<OTPBlock />)
    expect(html).toContain('autoComplete="one-time-code"')
    expect(html).toContain('pattern="[0-9]{6}"')
    expect(html).toContain('미리보기 인증번호는 123456입니다.')
  })

  it('names the search region and initializes all example results', () => {
    const html = renderToStaticMarkup(<SearchFiltersBlock />)
    expect(html).toContain('role="search"')
    expect(html).toContain('aria-label="프로젝트 검색 결과"')
    expect(html).toContain('브랜드 가이드')
    expect(html).toContain('모바일 앱 리서치')
  })

  it('keeps clean settings non-submittable and groups notification switches', () => {
    const html = renderToStaticMarkup(<SettingsBlock />)
    expect(html).toContain('<legend')
    expect(html).toContain('알림 설정')
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled=""/)
  })

  it('copies actual self-contained implementations with portable UI import paths', () => {
    expect(new Set(BLOCKS.map((block) => block.id)).size).toBe(4)
    for (const block of BLOCKS) {
      const source = getBlockSource(block.id)
      expect(source).toContain("from './components/ui/")
      expect(source).not.toContain("from '../ui/")
      expect(source).not.toContain('?raw')
      expect(source).toContain('export function ')
      expect(source).not.toContain("from './block-catalog'")
    }
  })
})
