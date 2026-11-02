import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LoginBlock, validateLoginBlock } from './LoginBlock'
import { OTPBlock, validateOTPBlock } from './OTPBlock'
import { SearchFiltersBlock, filterBlockItems } from './SearchFiltersBlock'
import { SettingsBlock, saveSettingsBlock, validateSettingsBlock, type WorkspaceSettingsValue } from './SettingsBlock'
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

  it('filters application records and custom statuses using the actual current owner', () => {
    const items = [
      { id: 'task-1', name: '예약 개선', summary: '예약 시간 입력', status: 'backlog', owner: 'member-2' },
      { id: 'task-2', name: '예약 테스트', summary: '모바일 키보드 확인', status: 'ready', owner: 'member-2' },
      { id: 'task-3', name: '예약 리뷰', summary: '기간 검증', status: 'ready', owner: 'member-1' },
    ]
    expect(filterBlockItems(' 예약 ', 'ready', true, items, 'member-2').map((item) => item.id)).toEqual(['task-2'])
    const html = renderToStaticMarkup(<SearchFiltersBlock items={items} currentOwner="member-2" filters={{ query: '예약', status: 'ready', mineOnly: true }} defaultFilters={{ query: 'ignored' }} statusOptions={[{ value: 'ready', label: '검토 대기' }]} title="할 일 찾기" resultsLabel="할 일 검색 결과" />)
    expect(html).toContain('할 일 검색 결과')
    expect(html).toContain('예약 테스트')
    expect(html).not.toContain('예약 개선')
    expect(html).not.toContain('예약 리뷰')
    expect(html).not.toContain('브랜드 가이드')
    expect(html).toContain('검토 대기')
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

  it('initializes reusable settings from application data without mixing in the demo', () => {
    const workspace: WorkspaceSettingsValue = { name: '우리 작업 공간', email: 'work@example.com', visibility: 'team', updates: false, digest: true }
    const html = renderToStaticMarkup(<SettingsBlock defaultValue={workspace} title="팀 기본 설정" />)
    expect(html).toContain('value="우리 작업 공간"')
    expect(html).toContain('value="work@example.com"')
    expect(html).toContain('팀 기본 설정')
    expect(html).not.toContain('Moru Studio')
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled=""/)
  })

  it('waits for the settings persistence callback and returns an immutable normalized save', async () => {
    const draft: WorkspaceSettingsValue = { name: '  우리 팀  ', email: '  work@example.com  ', visibility: 'team', updates: false, digest: true }
    const seen: WorkspaceSettingsValue[] = []
    let finish!: () => void
    let settled = false
    const result = saveSettingsBlock(draft, async (next) => {
      seen.push({ ...next })
      next.name = 'consumer mutation'
      await new Promise<void>((resolve) => { finish = resolve })
    }).then((next) => { settled = true; return next })
    await Promise.resolve()
    expect(settled).toBe(false)
    expect(seen).toEqual([{ name: '우리 팀', email: 'work@example.com', visibility: 'team', updates: false, digest: true }])
    expect(draft.name).toBe('  우리 팀  ')
    finish()
    expect(await result).toEqual(seen[0])
  })

  it('propagates save failures without changing the draft and never persists invalid fields', async () => {
    const draft: WorkspaceSettingsValue = { name: '작업 공간', email: 'work@example.com', visibility: 'private', updates: true, digest: false }
    const failed = new Error('저장 연결을 확인해 주세요.')
    await expect(saveSettingsBlock(draft, async () => { throw failed })).rejects.toBe(failed)
    expect(draft).toEqual({ name: '작업 공간', email: 'work@example.com', visibility: 'private', updates: true, digest: false })
    let called = false
    await expect(saveSettingsBlock({ ...draft, email: 'invalid' }, () => { called = true })).rejects.toThrow('올바른 이메일')
    expect(called).toBe(false)
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
