import { describe, expect, it } from 'vitest'
import { createDemoProjectState, dateKey, decodeProjectStore, isDateKey, isProjectAppState, projectProgress, readProjectStore, removeProject, removeTask, restoreDeleted, saveProject, saveTask, taskIsOverdue, toggleTask, writeProjectStore, PROJECT_STORE_KEY } from './project-model'

const demo = () => createDemoProjectState(new Date(2026, 10, 2))
describe('Moru project starter domain and persistence', () => {
  it('starts with coherent projects, tasks and date-only deadlines', () => {
    const state = demo()
    expect(isProjectAppState(state)).toBe(true)
    expect(state.tasks.every((task) => state.projects.some(({ id }) => id === task.projectId))).toBe(true)
    expect(dateKey(new Date(2026, 10, 2))).toBe('2026-11-02')
  })
  it('accepts optional dates and leap days but rejects rollover and malformed dates', () => {
    for (const date of ['', '2024-02-29', '2026-11-02']) expect(isDateKey(date)).toBe(true)
    for (const date of ['2025-02-29', '2026-02-31', '2026-13-01', '2026-1-1', 'tomorrow', null]) expect(isDateKey(date)).toBe(false)
  })
  it('validates names and deadlines before adding or replacing a project', () => {
    const state = demo(), original = state.projects[0]
    const invalid = saveProject(state, { ...original, name: '  ', due: '2026-02-31' })
    expect(invalid.state).toBe(state)
    expect(invalid.errors.name).toBeTruthy(); expect(invalid.errors.due).toBeTruthy()
    const created = saveProject(state, { ...original, name: '  실제 프로젝트  ', summary: '  설명  ' }, undefined, () => 'new-project')
    expect(created.errors).toEqual({})
    expect(created.state.projects[0]).toMatchObject({ id: 'new-project', name: '실제 프로젝트', summary: '설명' })
    const edited = saveProject(created.state, { ...original, name: '이름 수정' }, 'new-project')
    expect(edited.state.projects.find(({ id }) => id === 'new-project')?.name).toBe('이름 수정')
    expect(edited.state.projects).toHaveLength(state.projects.length + 1)
  })
  it('prevents orphan tasks, duplicate generated IDs and editing missing records', () => {
    const state = demo(), task = state.tasks[0]
    expect(saveTask(state, { ...task, projectId: 'missing' }).errors.projectId).toBeTruthy()
    expect(saveTask(state, task, undefined, () => task.id).errors.name).toBeTruthy()
    expect(saveTask(state, task, 'missing').state).toBe(state)
    expect(saveProject(state, state.projects[0], 'missing').state).toBe(state)
  })
  it('creates tasks with trimmed text and derives completion without storing stale totals', () => {
    const state = demo()
    const created = saveTask(state, { ...state.tasks[0], name: '  새 할일  ', notes: ' 메모 ' }, undefined, () => 'new-task')
    expect(created.state.tasks[0]).toMatchObject({ id: 'new-task', name: '새 할일', notes: '메모' })
    const before = projectProgress(created.state.tasks, state.projects[0].id)
    const completed = toggleTask(created.state, 'new-task')
    expect(projectProgress(completed.tasks, state.projects[0].id).completed).toBe(before.completed + 1)
    expect(toggleTask(completed, 'new-task').tasks[0].status).toBe('todo')
    expect(projectProgress([], 'empty')).toEqual({ total: 0, completed: 0, percent: 0 })
  })
  it('cascade-deletes a project and restores its tasks while preserving later edits', () => {
    const state = demo(), id = state.projects[0].id
    const removed = removeProject(state, id)
    expect(removed.state.projects.some((project) => project.id === id)).toBe(false)
    expect(removed.state.tasks.some((task) => task.projectId === id)).toBe(false)
    const later = saveProject(removed.state, { ...state.projects[1], name: '삭제 뒤 수정한 이름' }, state.projects[1].id).state
    const restored = restoreDeleted(later, removed.deleted)
    expect(restored.projects.find((project) => project.id === id)).toEqual(state.projects[0])
    expect(restored.projects.find((project) => project.id === state.projects[1].id)?.name).toBe('삭제 뒤 수정한 이름')
    expect(restored.tasks).toHaveLength(state.tasks.length)
    expect(restoreDeleted(restored, removed.deleted)).toEqual(restored)
  })
  it('does not restore an orphan task after its parent was also deleted', () => {
    const state = demo(), task = state.tasks[0]
    const removed = removeTask(state, task.id)
    const noParent = removeProject(removed.state, task.projectId).state
    expect(restoreDeleted(noParent, removed.deleted).tasks.some(({ id }) => id === task.id)).toBe(false)
  })
  it('uses date-only comparisons and excludes completed tasks from overdue counts', () => {
    const task = demo().tasks[0]
    expect(taskIsOverdue({ ...task, due: '2026-11-01' }, '2026-11-02')).toBe(true)
    expect(taskIsOverdue({ ...task, due: '2026-11-02' }, '2026-11-02')).toBe(false)
    expect(taskIsOverdue({ ...task, status: 'done', due: '2026-11-01' }, '2026-11-02')).toBe(false)
  })
  it('round-trips saved data and rejects corrupt, future and inconsistent documents', () => {
    const state = demo()
    expect(decodeProjectStore(JSON.stringify(state)).state).toEqual(state)
    expect(decodeProjectStore(null, state)).toEqual({ state, status: 'empty' })
    expect(decodeProjectStore('{broken', state).status).toBe('corrupt')
    expect(decodeProjectStore(JSON.stringify({ ...state, schemaVersion: 2 }), state).status).toBe('unsupported')
    expect(decodeProjectStore(JSON.stringify({ ...state, tasks: [{ ...state.tasks[0], projectId: 'orphan' }] }), state).status).toBe('corrupt')
    expect(isProjectAppState({ ...state, projects: [...state.projects, state.projects[0]] })).toBe(false)
    expect(isProjectAppState({ ...state, workspace: { ...state.workspace, updates: 'yes' } })).toBe(false)
    expect(decodeProjectStore('x'.repeat(2_000_001), state).status).toBe('corrupt')
  })
  it('handles denied or full storage without crashing or overwriting on read', () => {
    const state = demo(), writes: string[] = []
    const storage = { getItem: () => '{broken', setItem: (key: string, value: string) => { writes.push(key + value) } }
    expect(readProjectStore(storage, state).status).toBe('corrupt'); expect(writes).toEqual([])
    expect(writeProjectStore(storage, state)).toBe(true); expect(writes[0]).toContain(PROJECT_STORE_KEY)
    const denied = { getItem: () => { throw new Error('denied') }, setItem: () => { throw new Error('full') } }
    expect(readProjectStore(denied, state).status).toBe('unavailable')
    expect(writeProjectStore(denied, state)).toBe(false)
    expect(writeProjectStore(undefined, state)).toBe(false)
    expect(writeProjectStore(storage, { ...state, tasks: [{ ...state.tasks[0], projectId: 'missing' }] })).toBe(false)
  })
})
