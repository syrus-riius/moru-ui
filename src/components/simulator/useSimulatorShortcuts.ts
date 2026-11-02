import { useEffect, useEffectEvent, type RefObject } from 'react'
import { SIM_CLIPBOARD_MIME } from './simulator-selection'

interface Options {
  root: RefObject<HTMLElement | null>
  enabled: boolean
  selectionCount: number
  onSelectAll: () => void
  onDeselect: () => void
  onClipboard: () => string | null
  onCopied: (cut: boolean) => void
  onPaste: (text: string) => boolean
  onDuplicate: () => void
  onDelete: () => void
  onMove: (dx: number, dy: number) => void
  onUndo: () => void
  onRedo: () => void
  onHelp: () => void
  onClipboardError: () => void
}

/** Native clipboard events work without requesting clipboard-read permissions. */
export function useSimulatorShortcuts(options: Options) {
  const handles = useEffectEvent((event: Event) => {
    if (!options.enabled || event.defaultPrevented || !options.root.current) return false
    const target = event.target
    if (!(target instanceof HTMLElement)) return false
    if (target.isContentEditable || target.closest('input, textarea, select, [role="textbox"], [contenteditable]:not([contenteditable="false"])')) return false
    if (document.querySelector('[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]')) return false
    // A freshly opened workspace focuses its main landmark; a direct link may focus body.
    const standalone = options.root.current.closest('.studio-shell-standalone')
    return options.root.current.contains(target) || target === document.body || target === options.root.current.closest('main') || Boolean(standalone?.contains(target))
  })
  const keydown = useEffectEvent((event: KeyboardEvent) => {
    if (!handles(event) || event.isComposing || event.altKey) return
    const modifier = event.metaKey || event.ctrlKey
    const key = event.key.toLowerCase()
    if (modifier) {
      if (key === 'a') { event.preventDefault(); options.onSelectAll() }
      else if (key === 'd') { event.preventDefault(); if (options.selectionCount) options.onDuplicate() }
      else if (key === 'z') { event.preventDefault(); event.shiftKey ? options.onRedo() : options.onUndo() }
      else if (key === 'y') { event.preventDefault(); options.onRedo() }
      // C/X/V keep their native default so the browser dispatches clipboard events.
      return
    }
    if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); if (options.selectionCount) options.onDelete() }
    else if (event.key === 'Escape') { event.preventDefault(); options.onDeselect() }
    else if (event.key === '?') { event.preventDefault(); options.onHelp() }
    else if (options.selectionCount && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      const step = event.shiftKey ? 8 : 1
      event.preventDefault()
      options.onMove(event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0, event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0)
    }
  })
  const copy = useEffectEvent((event: ClipboardEvent) => {
    if (!handles(event) || !options.selectionCount || !event.clipboardData) return
    try {
      const text = options.onClipboard()
      if (!text) return
      event.clipboardData.setData('text/plain', text)
      try { event.clipboardData.setData(SIM_CLIPBOARD_MIME, text) } catch { /* The versioned plain-text payload also works in browsers without custom clipboard formats. */ }
      event.preventDefault()
      options.onCopied(event.type === 'cut')
    } catch { event.preventDefault(); options.onClipboardError() }
  })
  const paste = useEffectEvent((event: ClipboardEvent) => {
    if (!handles(event) || !event.clipboardData) return
    const text = event.clipboardData.getData(SIM_CLIPBOARD_MIME) || event.clipboardData.getData('text/plain')
    if (options.onPaste(text)) event.preventDefault()
  })
  useEffect(() => {
    document.addEventListener('keydown', keydown)
    document.addEventListener('copy', copy)
    document.addEventListener('cut', copy)
    document.addEventListener('paste', paste)
    return () => {
      document.removeEventListener('keydown', keydown)
      document.removeEventListener('copy', copy)
      document.removeEventListener('cut', copy)
      document.removeEventListener('paste', paste)
    }
  }, [])
}
