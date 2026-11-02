import { describe, expect, it } from 'vitest'
import { createWorkspaceMembers, membersReducer, type WorkspaceMember } from './workspace-members-state'

function invitedMember(patch: Partial<WorkspaceMember> = {}): WorkspaceMember {
  return { id: 'haneul', name: '하늘', email: 'haneul@studio.example', title: '콘텐츠 디자인', role: 'member', status: 'invited', ...patch }
}

describe('Workspace member deletion and undo', () => {
  it('restores only the removed member while preserving subsequent edits, removals, and invitations', () => {
    const original = createWorkspaceMembers()
    const removedIndex = original.findIndex((member) => member.id === 'minji')
    const removedMember = original[removedIndex]
    let current = membersReducer(original, { type: 'remove', id: removedMember.id })
    current = membersReducer(current, { type: 'update', id: 'suhyeon', patch: { name: '김수현', title: '개발 리드', role: 'admin' } })
    current = membersReducer(current, { type: 'add', member: invitedMember() })
    current = membersReducer(current, { type: 'remove', id: 'jae' })
    const restored = membersReducer(current, { type: 'restore', member: removedMember, index: removedIndex })

    expect(restored.map((member) => member.id)).toEqual(['me', 'minji', 'suhyeon', 'seoyeon', 'haneul'])
    expect(restored[removedIndex]).toEqual(removedMember)
    expect(restored.find((member) => member.id === 'suhyeon')).toMatchObject({ name: '김수현', title: '개발 리드', role: 'admin' })
    expect(restored.find((member) => member.id === 'haneul')).toEqual(invitedMember())
    expect(restored.some((member) => member.id === 'jae')).toBe(false)
    expect(current.some((member) => member.id === 'minji')).toBe(false)
  })

  it('does not roll back intervening changes if the same undo is invoked again', () => {
    const original = createWorkspaceMembers()
    const removed = original[1]
    const without = membersReducer(original, { type: 'remove', id: removed.id })
    const restored = membersReducer(without, { type: 'restore', member: removed, index: 1 })
    const edited = membersReducer(restored, { type: 'update', id: removed.id, patch: { name: '수정한 민지', title: '디자인 리드', role: 'member' } })

    expect(membersReducer(edited, { type: 'restore', member: removed, index: 1 })).toBe(edited)
    expect(edited.find((member) => member.id === removed.id)).toMatchObject({ name: '수정한 민지', title: '디자인 리드', role: 'member' })
  })

  it.each([{ index: -5, expected: 0 }, { index: 999, expected: 4 }])('clamps restore index $index without losing another member', ({ index, expected }) => {
    const original = createWorkspaceMembers()
    const removed = original[1]
    const without = membersReducer(original, { type: 'remove', id: removed.id })
    const restored = membersReducer(without, { type: 'restore', member: removed, index })

    expect(restored).toHaveLength(original.length)
    expect(restored[expected]).toEqual(removed)
    expect(new Set(restored.map((member) => member.id)).size).toBe(original.length)
  })
})

describe('Workspace member identity', () => {
  it('rejects an invitation with an existing ID even if its email differs', () => {
    const original = createWorkspaceMembers()
    const result = membersReducer(original, { type: 'add', member: invitedMember({ id: 'minji', email: 'another@studio.example' }) })
    expect(result).toBe(original)
    expect(result.find((member) => member.id === 'minji')?.name).toBe('민지')
  })

  it.each(['minji@studio.example', 'MINJI@STUDIO.EXAMPLE', 'MinJi@Studio.Example'])('rejects duplicate email %s independently of ID or letter case', (email) => {
    const original = createWorkspaceMembers()
    expect(membersReducer(original, { type: 'add', member: invitedMember({ email }) })).toBe(original)
  })

  it('does not restore an older identity over a newly invited member with the same email', () => {
    const original = createWorkspaceMembers()
    const removed = original[1]
    const without = membersReducer(original, { type: 'remove', id: removed.id })
    const newIdentity = invitedMember({ id: 'new-minji', name: '새 초대', email: removed.email.toUpperCase() })
    const afterInvitation = membersReducer(without, { type: 'add', member: newIdentity })

    expect(membersReducer(afterInvitation, { type: 'restore', member: removed, index: 1 })).toBe(afterInvitation)
    expect(afterInvitation.find((member) => member.id === newIdentity.id)).toEqual(newIdentity)
    expect(afterInvitation.some((member) => member.id === removed.id)).toBe(false)
  })
})

describe('Workspace owner and display-name protection', () => {
  it('keeps the owner when removal is requested while allowing another member to be removed', () => {
    const original = createWorkspaceMembers()
    expect(membersReducer(original, { type: 'remove', id: 'me' })).toEqual(original)
    expect(membersReducer(original, { type: 'remove', id: 'minji' }).map((member) => member.id)).toEqual(['me', 'suhyeon', 'jae', 'seoyeon'])
  })

  it('keeps ownership while allowing the owner to update their name and title', () => {
    const original = createWorkspaceMembers()
    const result = membersReducer(original, { type: 'update', id: 'me', patch: { name: '  내 이름  ', title: '제품 책임자', role: 'member' } })
    expect(result.find((member) => member.id === 'me')).toMatchObject({ name: '내 이름', title: '제품 책임자', role: 'owner' })
    expect(original.find((member) => member.id === 'me')).toMatchObject({ name: '나의 계정', title: '워크스페이스 관리', role: 'owner' })
  })

  it.each(['', '   ', '\t\n  '])('preserves an existing name when edited to whitespace %j', (name) => {
    const original = createWorkspaceMembers()
    const result = membersReducer(original, { type: 'update', id: 'minji', patch: { name, title: '새 직함', role: 'member' } })
    expect(result.find((member) => member.id === 'minji')).toMatchObject({ name: '민지', title: '새 직함', role: 'member' })
  })

  it('trims surrounding whitespace while retaining meaningful spaces in the display name', () => {
    const original = createWorkspaceMembers()
    const result = membersReducer(original, { type: 'update', id: 'minji', patch: { name: '  민지 김  ', title: '디자이너', role: 'admin' } })
    expect(result.find((member) => member.id === 'minji')?.name).toBe('민지 김')
  })
})

describe('Workspace state isolation', () => {
  it('creates independent member arrays and independent member objects for every workspace', () => {
    const first = createWorkspaceMembers()
    const second = createWorkspaceMembers()
    expect(first).not.toBe(second)
    expect(first).toEqual(second)
    first.forEach((member, index) => expect(member).not.toBe(second[index]))
    first[0].name = '다른 워크스페이스 이름'
    first.pop()
    expect(second).toHaveLength(5)
    expect(second[0].name).toBe('나의 계정')
  })

  it('does not mutate a frozen previous state or its members when applying updates', () => {
    const original = createWorkspaceMembers()
    original.forEach(Object.freeze)
    Object.freeze(original)
    const updated = membersReducer(original, { type: 'update', id: 'minji', patch: { name: '새 민지', title: '디자인 리드', role: 'member' } })
    expect(updated).not.toBe(original)
    expect(updated[1]).not.toBe(original[1])
    expect(updated[0]).toBe(original[0])
    expect(original[1].name).toBe('민지')
    expect(updated[1].name).toBe('새 민지')
  })

  it.each(['add', 'restore'] as const)('copies the incoming member on %s so outside changes cannot alter saved state', (type) => {
    const original = createWorkspaceMembers()
    const incoming = invitedMember()
    const next = membersReducer(original, type === 'add' ? { type, member: incoming } : { type, member: incoming, index: 1 })
    expect(next.find((member) => member.id === incoming.id)).not.toBe(incoming)
    incoming.name = '외부에서 수정한 이름'
    expect(next.find((member) => member.id === incoming.id)?.name).toBe('하늘')
    expect(original.some((member) => member.id === incoming.id)).toBe(false)
  })
})
