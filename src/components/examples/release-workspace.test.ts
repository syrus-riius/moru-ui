import { describe, expect, it } from 'vitest'
import { validateReleaseStage } from './ReleaseWorkspace'
import { createExampleSession, exampleSessionReducer, type ExampleRelease } from './example-session-state'

function readyRelease(patch: Partial<ExampleRelease> = {}): ExampleRelease {
  return { ...createExampleSession().release, otp: '123456', verified: true, readiness: ['content', 'keyboard', 'responsive'], ...patch }
}

describe('release preparation checks', () => {
  it('requires an existing project even when the rest of the settings are ready', () => {
    expect(validateReleaseStage(readyRelease(), false, 0)).toMatch('프로젝트')
    expect(validateReleaseStage(readyRelease(), true, 0)).toBeUndefined()
  })

  it.each([
    '', '  ', '0.4', 'v0.4.0', 'release-next', '1.0.0-', '1.0.0 beta',
    '01.0.0', '1.01.0', '1.0.01', '1.0.0-01', '1.0.0-alpha.01',
    '1.0.0-beta..1', '1.0.0-.', '1.0.0+','1.0.0+build..1', '1.0.0+build.',
    '1.0.0-beta+meta++x', '1.0.0-한글', '1.0.0-alpha_beta',
  ])('rejects a version that cannot identify the release: %j', (version) => {
    expect(validateReleaseStage(readyRelease({ version }), true, 0)).toMatch('버전')
  })

  it.each([
    '0.0.0', '0.4.0', '1.0.0-beta.1', ' 2.3.4 ', '1.0.0-0.3.7', '1.0.0-x-y-z.--',
    '1.0.0-01alpha', '1.0.0+build.1', '1.0.0-alpha+001', '1.0.0+20130313144700',
    '1.0.0-beta+exp.sha.5114f85', '1.0.0+01',
  ])('accepts a complete version, including preview and build identifiers: %j', (version) => {
    expect(validateReleaseStage(readyRelease({ version }), true, 0)).toBeUndefined()
  })

  it.each(['preview', 'beta', 'stable'])('accepts a selectable release channel: %j', (channel) => {
    expect(validateReleaseStage(readyRelease({ channel }), true, 0)).toBeUndefined()
  })

  it('rejects a missing or unsupported channel', () => {
    expect(validateReleaseStage(readyRelease({ channel: '' }), true, 0)).toMatch('공개 채널')
    expect(validateReleaseStage(readyRelease({ channel: 'production' }), true, 0)).toMatch('공개 채널')
  })

  it('requires both the correct code and the explicit verification step', () => {
    expect(validateReleaseStage(readyRelease({ otp: '123456', verified: false }), true, 1)).toMatch('코드 확인')
    expect(validateReleaseStage(readyRelease({ otp: '654321', verified: true }), true, 1)).toMatch('123456')
    expect(validateReleaseStage(readyRelease({ otp: '', verified: false }), true, 1)).toMatch('123456')
    expect(validateReleaseStage(readyRelease(), true, 1)).toBeUndefined()
  })

  it.each([
    ['content', 'keyboard'],
    ['content', 'responsive'],
    ['keyboard', 'responsive'],
    [],
  ])('requires every distinct preparation item: %j', (...readiness) => {
    expect(validateReleaseStage(readyRelease({ readiness }), true, 2)).toBeTruthy()
  })

  it('does not count duplicate or unknown preparation values as completed checks', () => {
    expect(validateReleaseStage(readyRelease({ readiness: ['content', 'content', 'unknown'] }), true, 2)).toMatch('키보드')
    expect(validateReleaseStage(readyRelease({ readiness: ['content', 'content', 'unknown'] }), true, 2)).toMatch('모바일')
    expect(validateReleaseStage(readyRelease({ readiness: ['responsive', 'content', 'keyboard'] }), true, 2)).toBeUndefined()
  })

  it('keeps release notes optional while checking authentication separately', () => {
    const withoutNotes = readyRelease({ notes: '' })
    const withNotes = readyRelease({ notes: '버튼과 입력창의 포커스를 정리했습니다.\n모바일에서도 확인했습니다.' })
    for (let stage = 0; stage < 3; stage += 1) {
      expect(validateReleaseStage(withoutNotes, true, stage)).toBeUndefined()
      expect(validateReleaseStage(withNotes, true, stage)).toBeUndefined()
    }
    expect(validateReleaseStage(readyRelease({ notes: '확인 코드: 123456', otp: '', verified: false }), true, 1)).toBeTruthy()
  })

  it('preserves a successful result after moving the checked project into review', () => {
    let state = createExampleSession()
    state = exampleSessionReducer(state, { type: 'release/patch', patch: readyRelease({ traceStatus: 'running', traceStep: 2 }) })
    state = exampleSessionReducer(state, { type: 'project/update', id: 'library', patch: { status: 'review' } })
    state = exampleSessionReducer(state, { type: 'release/patch', patch: { traceStatus: 'success', traceStep: 3, report: '로컬 준비 점검 통과', error: '' } })
    expect(state.projects.find((project) => project.id === 'library')?.status).toBe('review')
    expect(state.release.traceStatus).toBe('success')
    expect(state.release.report).toBe('로컬 준비 점검 통과')
  })

  it('clears the previous result when a checked project changes, then allows a fresh check', () => {
    let state = createExampleSession()
    state = exampleSessionReducer(state, { type: 'release/patch', patch: readyRelease({ traceStatus: 'success', traceStep: 3, report: '이전 점검' }) })
    state = exampleSessionReducer(state, { type: 'scene/set', scene: 'projects' })
    state = exampleSessionReducer(state, { type: 'project/update', id: 'library', patch: { name: 'Moru 두 번째 릴리스' } })
    state = exampleSessionReducer(state, { type: 'scene/set', scene: 'release' })
    expect(state.release.traceStatus).toBe('idle')
    expect(state.release.report).toBe('')
    expect(state.release.traceStep).toBe(0)
    expect(validateReleaseStage(state.release, true, 0)).toBeUndefined()
  })
})
