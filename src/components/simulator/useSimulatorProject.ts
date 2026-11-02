import { useCallback, useEffect, useEffectEvent, useState } from 'react'
import { createStarterProject, parseSimProject, serializeSimProject, SIM_STORAGE_KEY } from './simulator-model'
import type { SimProject } from './simulator-types'

interface History { past: SimProject[]; present: SimProject; future: SimProject[]; dirty: boolean }
function loadProject() {
  try {
    const saved = localStorage.getItem(SIM_STORAGE_KEY)
    return { project: saved ? parseSimProject(saved) : createStarterProject(), issue: '', saved: Boolean(saved) }
  } catch {
    return { project: createStarterProject(), issue: '저장된 기획을 읽지 못했어요. 파일을 불러오거나 변경 내용을 새로 저장할 수 있어요.', saved: false }
  }
}
export function useSimulatorProject() {
  const [initial] = useState(loadProject)
  const [history, setHistory] = useState<History>(() => ({ past: [], present: initial.project, future: [], dirty: false }))
  const [saveState, setSaveState] = useState<'ready' | 'saved' | 'error'>(initial.issue ? 'error' : initial.saved ? 'saved' : 'ready')
  const flush = useEffectEvent(() => {
    if (!history.dirty) return
    try { localStorage.setItem(SIM_STORAGE_KEY, serializeSimProject(history.present)) }
    catch { /* Keep the last valid saved document; the export control remains available. */ }
  })
  useEffect(() => {
    const onPageHide = () => flush()
    window.addEventListener('pagehide', onPageHide)
    return () => { window.removeEventListener('pagehide', onPageHide); flush() }
  }, [])
  useEffect(() => {
    // Preserve an unreadable previous file until the user explicitly changes the document.
    if (!history.dirty) return
    const timer = setTimeout(() => {
      try { localStorage.setItem(SIM_STORAGE_KEY, serializeSimProject(history.present)); setSaveState('saved') }
      catch { setSaveState('error') }
    }, 250)
    return () => clearTimeout(timer)
  }, [history.present, history.dirty])
  const commit = useCallback((change: SimProject | ((project: SimProject) => SimProject)) => {
    setHistory((current) => {
      const next = typeof change === 'function' ? change(current.present) : change
      if (next === current.present || JSON.stringify(next) === JSON.stringify(current.present)) return current
      return { past: [...current.past.slice(-49), current.present], present: next, future: [], dirty: true }
    })
  }, [])
  const undo = useCallback(() => setHistory((current) => current.past.length ? {
    past: current.past.slice(0, -1), present: current.past[current.past.length - 1], future: [current.present, ...current.future].slice(0, 50), dirty: true,
  } : current), [])
  const redo = useCallback(() => setHistory((current) => current.future.length ? {
    past: [...current.past.slice(-49), current.present], present: current.future[0], future: current.future.slice(1), dirty: true,
  } : current), [])
  return { project: history.present, commit, undo, redo, canUndo: history.past.length > 0, canRedo: history.future.length > 0, saveState, initialIssue: initial.issue }
}
