import { describe, expect, it } from 'vitest'
import { createExampleSession, exampleSessionReducer, type ConversationMessage, type ExampleProject, type ExampleRelease, type ExampleSessionAction, type ExampleSessionState } from './example-session-state'

const session = () => createExampleSession(new Date(2026, 9, 25, 12))
const project = (patch: Partial<ExampleProject> = {}): ExampleProject => ({ id: 'new-project', name: '새 프로젝트', description: '다음 실험', ownerId: 'minji', status: 'planning', progress: 0, dueDate: '2026-11-02', priority: 'normal', favorite: false, ...patch })
const message = (patch: Partial<ConversationMessage> = {}): ConversationMessage => ({ id: 'new-message', authorId: 'me', authorName: '나', text: '점검을 마쳤어요.', time: '오전 10:00', files: [], liked: false, pinned: false, ...patch })
function completedRelease(): ExampleSessionState {
  const state = session()
  return { ...state, release: { ...state.release, otp: '123456', verified: true, readiness: ['content', 'accessibility'], traceStatus: 'success', traceStep: 4, report: '지난 점검 결과', error: '' } }
}
function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze)
    Object.freeze(value)
  }
  return value
}

describe('Example session ownership and navigation', () => {
  it('creates independent projects, messages, attachments, code, release checks, and wizard answers for each session', () => {
    const first = session()
    const second = session()
    expect(first).toEqual(second)
    expect(first.projects).not.toBe(second.projects)
    expect(first.projects[0]).not.toBe(second.projects[0])
    expect(first.conversation.messages[0]).not.toBe(second.conversation.messages[0])
    expect(first.conversation.messages[1].files[0]).not.toBe(second.conversation.messages[1].files[0])
    expect(first.conversation.messages[2].code).not.toBe(second.conversation.messages[2].code)
    expect(first.release.readiness).not.toBe(second.release.readiness)
    expect(first.wizardAnswers).not.toBe(second.wizardAnswers)
    first.projects[0].name = '다른 세션'
    first.conversation.messages[1].files[0].name = '다른 파일.pdf'
    first.release.readiness.push('extra')
    expect(second.projects[0].name).toBe('Moru UI 첫 번째 릴리스')
    expect(second.conversation.messages[1].files[0].name).toBe('brand-guidelines.pdf')
    expect(second.release.readiness).toEqual([])
  })

  it('keeps shared domain data, draft attachments, and release inputs while moving between all four views', () => {
    let state = exampleSessionReducer(session(), { type: 'project/add', project: project() })
    state = exampleSessionReducer(state, { type: 'conversation/patch', patch: { draft: '아직 작성 중', pendingFiles: [{ id: 'draft-file', name: 'draft.pdf', size: 24 }], activeTab: 'files', direction: 'rtl' } })
    state = exampleSessionReducer(state, { type: 'release/patch', patch: { version: '0.5.0', notes: '새 점검 메모' } })
    const projects = state.projects
    const conversation = state.conversation
    const release = state.release
    for (const scene of ['conversation', 'release', 'settings', 'projects'] as const) {
      state = exampleSessionReducer(state, { type: 'scene/set', scene })
      expect(state.scene).toBe(scene)
      expect(state.projects).toBe(projects)
      expect(state.conversation).toBe(conversation)
      expect(state.release).toBe(release)
      expect(state.selectedProjectId).toBe('new-project')
    }
  })
})

describe('Project operations', () => {
  it('adds a selected project once and rejects a repeated ID without replacing the saved project', () => {
    const original = session()
    const added = exampleSessionReducer(original, { type: 'project/add', project: project({ name: '  새 프로젝트  ', description: '  정리할 내용  ', progress: 46.6 }) })
    expect(added.projects[0]).toMatchObject({ id: 'new-project', name: '새 프로젝트', description: '정리할 내용', progress: 47 })
    expect(added.selectedProjectId).toBe('new-project')
    expect(original.projects).toHaveLength(6)
    expect(exampleSessionReducer(added, { type: 'project/add', project: project({ name: '덮어쓰기' }) })).toBe(added)
  })

  it('normalizes edited text and keeps the previous name when an edit is empty', () => {
    const original = session()
    const edited = exampleSessionReducer(original, { type: 'project/update', id: 'brand', patch: { name: '  다음 브랜드  ', description: `  ${'설'.repeat(600)}  ` } })
    expect(edited.projects.find((item) => item.id === 'brand')).toMatchObject({ name: '다음 브랜드', description: '설'.repeat(500) })
    const emptyName = exampleSessionReducer(edited, { type: 'project/update', id: 'brand', patch: { name: ' \n\t ', description: '' } })
    expect(emptyName.projects.find((item) => item.id === 'brand')).toMatchObject({ name: '다음 브랜드', description: '' })
    expect(original.projects.find((item) => item.id === 'brand')?.name).toBe('브랜드 리뉴얼')
  })

  it.each([{ input: -12, expected: 0 }, { input: 140, expected: 100 }, { input: 46.6, expected: 47 }, { input: Number.NaN, expected: 0 }, { input: Number.POSITIVE_INFINITY, expected: 0 }])('keeps edited progress in a valid range for $input', ({ input, expected }) => {
    const state = exampleSessionReducer(session(), { type: 'project/update', id: 'brand', patch: { progress: input } })
    expect(state.projects.find((item) => item.id === 'brand')?.progress).toBe(expected)
  })

  it('marks a completed project as 100 percent even when a smaller progress value is supplied', () => {
    const state = exampleSessionReducer(session(), { type: 'project/update', id: 'library', patch: { status: 'done', progress: 12 } })
    expect(state.projects.find((item) => item.id === 'library')).toMatchObject({ status: 'done', progress: 100 })
  })

  it('duplicates with a unique identity and reset work status while preserving the source project', () => {
    const original = session()
    const source = original.projects.find((item) => item.id === 'brand')!
    const duplicated = exampleSessionReducer(original, { type: 'project/duplicate', id: source.id, newId: 'brand-copy' })
    expect(duplicated.projects[0]).toMatchObject({ ...source, id: 'brand-copy', name: '브랜드 리뉴얼 사본', status: 'planning', progress: 0, favorite: false })
    expect(duplicated.selectedProjectId).toBe('brand-copy')
    expect(duplicated.projects.find((item) => item.id === source.id)).toEqual(source)
    expect(exampleSessionReducer(duplicated, { type: 'project/duplicate', id: source.id, newId: 'brand-copy' })).toBe(duplicated)
    expect(exampleSessionReducer(duplicated, { type: 'project/duplicate', id: 'missing', newId: 'missing-copy' })).toBe(duplicated)
  })

  it('undoes one removal without rolling back later edits, additions, removals, or selection', () => {
    const original = session()
    const index = original.projects.findIndex((item) => item.id === 'brand')
    const removed = original.projects[index]
    let state = exampleSessionReducer(original, { type: 'project/remove', id: removed.id })
    state = exampleSessionReducer(state, { type: 'project/update', id: 'library', patch: { name: '업데이트한 라이브러리', progress: 80 } })
    state = exampleSessionReducer(state, { type: 'project/add', project: project() })
    state = exampleSessionReducer(state, { type: 'project/remove', id: 'research' })
    const restored = exampleSessionReducer(state, { type: 'project/restore', project: removed, index })
    expect(restored.projects[index]).toEqual(removed)
    expect(restored.projects.find((item) => item.id === 'library')).toMatchObject({ name: '업데이트한 라이브러리', progress: 80 })
    expect(restored.projects.some((item) => item.id === 'new-project')).toBe(true)
    expect(restored.projects.some((item) => item.id === 'research')).toBe(false)
    expect(restored.selectedProjectId).toBe('new-project')
    expect(exampleSessionReducer(restored, { type: 'project/restore', project: removed, index })).toBe(restored)
  })

  it('chooses another valid project when removing the selected project and clears unknown selections', () => {
    const removed = exampleSessionReducer(session(), { type: 'project/remove', id: 'library' })
    expect(removed.selectedProjectId).toBe(removed.projects[0].id)
    expect(exampleSessionReducer(removed, { type: 'project/select', id: 'missing' }).selectedProjectId).toBeNull()
  })
})

describe('Conversation composition', () => {
  it('rejects an empty message without clearing an unfinished draft or adding a log entry', () => {
    const state = exampleSessionReducer(session(), { type: 'conversation/patch', patch: { draft: '未完 메시지', pendingFiles: [{ id: 'pending', name: 'pending.txt', size: 12 }] } })
    expect(exampleSessionReducer(state, { type: 'conversation/send', message: message({ text: ' \n\t ' }) })).toBe(state)
  })

  it('accepts attachments without text and clears only the sent draft and pending files', () => {
    const attached = { id: 'file', name: 'handoff.pdf', size: 1536, type: 'application/pdf' }
    const state = exampleSessionReducer(session(), { type: 'conversation/patch', patch: { draft: '', pendingFiles: [attached], activeTab: 'files', direction: 'rtl' } })
    const sent = exampleSessionReducer(state, { type: 'conversation/send', message: message({ text: '  ', files: [attached] }) })
    expect(sent.conversation.messages.at(-1)).toMatchObject({ id: 'new-message', text: '', files: [attached] })
    expect(sent.conversation.draft).toBe('')
    expect(sent.conversation.pendingFiles).toEqual([])
    expect(sent.conversation.activeTab).toBe('files')
    expect(sent.conversation.direction).toBe('rtl')
    expect(state.conversation.pendingFiles).toEqual([attached])
  })

  it('trims message text, prevents duplicate send IDs, and owns its saved attachment metadata', () => {
    const file = { id: 'file', name: 'notes.txt', size: 32 }
    const incoming = message({ text: `  ${'메'.repeat(2100)}  `, files: [file] })
    const state = exampleSessionReducer(session(), { type: 'conversation/send', message: incoming })
    expect(state.conversation.messages.at(-1)?.text).toBe('메'.repeat(2000))
    expect(state.conversation.messages.at(-1)?.files[0]).not.toBe(file)
    file.name = '외부 수정.txt'
    expect(state.conversation.messages.at(-1)?.files[0].name).toBe('notes.txt')
    expect(exampleSessionReducer(state, { type: 'conversation/send', message: message({ text: '다시 보냄' }) })).toBe(state)
  })

  it('toggles pin and reaction independently for a single message without editing another message or draft', () => {
    const original = exampleSessionReducer(session(), { type: 'conversation/patch', patch: { draft: '작성 중인 의견' } })
    const welcome = original.conversation.messages[0]
    let state = exampleSessionReducer(original, { type: 'conversation/react', id: welcome.id })
    expect(state.conversation.messages[0]).toMatchObject({ liked: true, pinned: welcome.pinned })
    state = exampleSessionReducer(state, { type: 'conversation/pin', id: welcome.id })
    expect(state.conversation.messages[0]).toMatchObject({ liked: true, pinned: !welcome.pinned })
    state = exampleSessionReducer(state, { type: 'conversation/react', id: welcome.id })
    expect(state.conversation.messages[0]).toMatchObject({ liked: false, pinned: !welcome.pinned })
    expect(state.conversation.messages[1]).toBe(original.conversation.messages[1])
    expect(state.conversation.draft).toBe('작성 중인 의견')
    expect(original.conversation.messages[0]).toMatchObject({ liked: false, pinned: true })
  })
})

describe('Release check invalidation', () => {
  it.each([
    { projectId: 'brand' }, { version: '0.4.1' }, { channel: 'stable' },
    { notes: '달라진 점검 메모' }, { otp: '654321' }, { readiness: ['content'] },
  ] satisfies Array<Partial<ExampleRelease>>)('clears an obsolete successful result after changing input %j', (patch) => {
    const original = completedRelease()
    const changed = exampleSessionReducer(original, { type: 'release/patch', patch })
    expect(changed.release).toMatchObject({ traceStatus: 'idle', traceStep: 0, report: '', error: '' })
    expect(original.release).toMatchObject({ traceStatus: 'success', report: '지난 점검 결과', traceStep: 4 })
  })

  it('revokes code verification only when the OTP actually changes', () => {
    const original = completedRelease()
    const unchanged = exampleSessionReducer(original, { type: 'release/patch', patch: { otp: original.release.otp } })
    expect(unchanged.release).toMatchObject({ verified: true, traceStatus: 'success', report: '지난 점검 결과' })
    const changed = exampleSessionReducer(original, { type: 'release/patch', patch: { otp: '000000', verified: true } })
    expect(changed.release.verified).toBe(false)
  })

  it('can record an explicit running step and its completion without invalidating its result', () => {
    const original = completedRelease()
    const running = exampleSessionReducer(original, { type: 'release/patch', patch: { traceStatus: 'running', traceStep: 1, report: '', error: '' } })
    const completed = exampleSessionReducer(running, { type: 'release/patch', patch: { traceStatus: 'success', traceStep: 4, report: '새 점검 결과' } })
    expect(completed.release).toMatchObject({ traceStatus: 'success', traceStep: 4, report: '새 점검 결과', verified: true })
  })

  it('clears a past failure when edited inputs make a new check necessary', () => {
    const original = completedRelease()
    original.release = { ...original.release, traceStatus: 'error', error: '지난 실패', report: '', traceStep: 2 }
    const changed = exampleSessionReducer(original, { type: 'release/patch', patch: { version: '0.5.0' } })
    expect(changed.release).toMatchObject({ traceStatus: 'idle', error: '', report: '', traceStep: 0 })
  })

  it('invalidates a finished check when its target project changes, while preserving the confirmed code', () => {
    const original = completedRelease()
    const changed = exampleSessionReducer(original, { type: 'project/update', id: 'library', patch: { name: '새 이름', progress: 85 } })
    expect(changed.release).toMatchObject({ projectId: 'library', verified: true, traceStatus: 'idle', traceStep: 0, report: '', error: '' })
  })

  it('keeps the result for favorites, unrelated projects, and equivalent normalized edits', () => {
    const original = completedRelease()
    const favorite = exampleSessionReducer(original, { type: 'project/update', id: 'library', patch: { favorite: false } })
    const unrelated = exampleSessionReducer(original, { type: 'project/update', id: 'brand', patch: { progress: 95 } })
    const equivalent = exampleSessionReducer(original, { type: 'project/update', id: 'library', patch: { name: '  Moru UI 첫 번째 릴리스  ', progress: 76.1 } })
    for (const state of [favorite, unrelated, equivalent]) expect(state.release).toBe(original.release)
  })

  it('clears target and verification on removal, and undo restores the project without reviving an obsolete report', () => {
    const original = completedRelease()
    const removedProject = original.projects[0]
    const removed = exampleSessionReducer(original, { type: 'project/remove', id: removedProject.id })
    expect(removed.release).toMatchObject({ projectId: null, verified: false, traceStatus: 'idle', traceStep: 0, report: '', error: '' })
    const restored = exampleSessionReducer(removed, { type: 'project/restore', project: removedProject, index: 0 })
    expect(restored.projects[0]).toEqual(removedProject)
    expect(restored.release).toBe(removed.release)
    expect(restored.release.report).toBe('')
  })

  it('cannot record verified status for any code other than the disclosed example code', () => {
    const original = exampleSessionReducer(session(), { type: 'release/patch', patch: { otp: '999999' } })
    expect(exampleSessionReducer(original, { type: 'release/patch', patch: { verified: true } }).release.verified).toBe(false)
  })
})

describe('Immutable example session updates', () => {
  const actions: ExampleSessionAction[] = [
    { type: 'scene/set', scene: 'conversation' },
    { type: 'project/add', project: project() },
    { type: 'project/update', id: 'brand', patch: { name: '새 브랜드', progress: 40 } },
    { type: 'project/duplicate', id: 'library', newId: 'new-copy' },
    { type: 'project/remove', id: 'brand' },
    { type: 'project/restore', project: project(), index: 1 },
    { type: 'conversation/patch', patch: { draft: '새 초안', pendingFiles: [{ id: 'a', name: 'a.txt', size: 1 }] } },
    { type: 'conversation/send', message: message() },
    { type: 'conversation/react', id: 'welcome' },
    { type: 'conversation/pin', id: 'welcome' },
    { type: 'release/patch', patch: { readiness: ['content'], notes: '새 메모' } },
    { type: 'wizard/answers', answers: { name: '온보딩', features: ['messages', 'files'] } },
  ]
  it.each(actions)('does not change frozen previous state for $type', (action) => {
    const original = deepFreeze(completedRelease())
    const snapshot = JSON.stringify(original)
    const next = exampleSessionReducer(original, deepFreeze(action))
    expect(next).not.toBe(original)
    expect(JSON.stringify(original)).toBe(snapshot)
  })

  it('copies answer lists and draft file metadata instead of retaining caller-owned nested arrays', () => {
    const features = ['messages']
    const file = { id: 'pending', name: 'draft.txt', size: 12 }
    let state = exampleSessionReducer(session(), { type: 'wizard/answers', answers: { features } })
    state = exampleSessionReducer(state, { type: 'conversation/patch', patch: { pendingFiles: [file] } })
    features.push('later')
    file.name = '변경.txt'
    expect(state.wizardAnswers.features).toEqual(['messages'])
    expect(state.conversation.pendingFiles[0].name).toBe('draft.txt')
  })
})
