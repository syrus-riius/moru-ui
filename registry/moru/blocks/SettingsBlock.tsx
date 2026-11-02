'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Button } from '../button'
import { Card } from '../card'
import { Field } from '../field'
import { Input } from '../input'
import { Select } from '../select'
import { Switch } from '../switch'

export interface WorkspaceSettingsValue {
  name: string
  email: string
  visibility: 'private' | 'team' | 'public'
  updates: boolean
  digest: boolean
}

export interface SettingsBlockProps {
  value?: WorkspaceSettingsValue
  defaultValue?: WorkspaceSettingsValue
  onValueChange?: (value: WorkspaceSettingsValue) => void
  onSave?: (value: WorkspaceSettingsValue) => void | Promise<void>
  onCancel?: (saved: WorkspaceSettingsValue) => void
  title?: string
  description?: string
}

const initialSettings: WorkspaceSettingsValue = { name: 'Moru Studio', email: 'hello@moru.example', visibility: 'private', updates: true, digest: false }

export function validateSettingsBlock(name: string, email: string) {
  return {
    name: name.trim() ? '' : '작업 공간 이름을 입력해 주세요.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? '' : '올바른 이메일 주소를 입력해 주세요.',
  }
}

/** A save only succeeds after the consumer's persistence callback has completed. */
export async function saveSettingsBlock(draft: WorkspaceSettingsValue, onSave: (value: WorkspaceSettingsValue) => void | Promise<void>) {
  const errors = validateSettingsBlock(draft.name, draft.email)
  if (errors.name || errors.email) throw new Error(errors.name || errors.email)
  const next = { ...draft, name: draft.name.trim(), email: draft.email.trim() }
  await onSave({ ...next })
  return next
}

/** Controlled values represent the draft; the last successful save is the cancel baseline. */
export function SettingsBlock({ value, defaultValue = initialSettings, onValueChange, onSave, onCancel, title = '작업 공간 설정', description = '기본 정보와 팀에 필요한 알림을 정하세요.' }: SettingsBlockProps = {}) {
  const id = useId()
  const [saved, setSaved] = useState<WorkspaceSettingsValue>(() => ({ ...(value ?? defaultValue) }))
  const [internalDraft, setInternalDraft] = useState<WorkspaceSettingsValue>(() => ({ ...(value ?? defaultValue) }))
  const draft = value ?? internalDraft
  const [errors, setErrors] = useState({ name: '', email: '' })
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [saveError, setSaveError] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mounted = useRef(true)
  const saving = useRef(false)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; if (timer.current) clearTimeout(timer.current) } }, [])
  const dirty = Object.keys(draft).some((key) => draft[key as keyof WorkspaceSettingsValue] !== saved[key as keyof WorkspaceSettingsValue])
  function updateDraft(next: WorkspaceSettingsValue) { if (value === undefined) setInternalDraft(next); onValueChange?.(next) }
  function change(patch: Partial<WorkspaceSettingsValue>) { updateDraft({ ...draft, ...patch }); setStatus(''); setSaveError('') }
  function complete(next: WorkspaceSettingsValue) {
    if (!mounted.current) return
    setSaved(next); updateDraft(next); setBusy(false); saving.current = false
    setStatus('변경한 설정을 저장했어요.')
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving.current) return
    const next = validateSettingsBlock(draft.name, draft.email)
    setErrors(next)
    if (next.name || next.email) { (next.name ? nameRef : emailRef).current?.focus(); return }
    if (!dirty) return
    const nextSaved = { ...draft, name: draft.name.trim(), email: draft.email.trim() }
    saving.current = true
    setBusy(true)
    setSaveError('')
    setStatus('변경한 설정을 저장하고 있어요.')
    statusRef.current?.focus({ preventScroll: true })
    if (!onSave) { timer.current = setTimeout(() => complete(nextSaved), 600); return }
    try {
      complete(await saveSettingsBlock(nextSaved, onSave))
    } catch (error) {
      if (!mounted.current) return
      saving.current = false; setBusy(false); setStatus('')
      setSaveError(error instanceof Error && error.message.trim() ? error.message : '설정을 저장하지 못했어요. 다시 시도해 주세요.')
      statusRef.current?.focus({ preventScroll: true })
    }
  }

  return <Card style={{ width: '100%', maxWidth: 560, margin: '0 auto', padding: 'var(--ui-card-padding, 24px)', boxSizing: 'border-box' }}>
    <form onSubmit={submit} noValidate aria-labelledby={`${id}-title`} style={{ display: 'grid', gap: 'var(--ui-form-gap, 20px)' }}>
      <header style={{ display: 'grid', gap: 'var(--ui-field-gap, 8px)' }}>
        <h3 id={`${id}-title`} style={{ margin: 0, fontSize: 'var(--ui-type-heading-size, 24px)', fontWeight: 'var(--ui-type-heading-weight, 600)', lineHeight: 'var(--ui-type-heading-line-height, 1.35)', letterSpacing: 'var(--ui-type-heading-letter-spacing, -.025em)' }}>{title}</h3>
        <p style={{ margin: 0, color: 'var(--ui-muted)', fontSize: 'var(--ui-type-body-size, 14px)', lineHeight: 'var(--ui-type-body-line-height, 1.6)' }}>{description}</p>
      </header>
      <Field label="작업 공간 이름" error={errors.name}><Input ref={nameRef} name="workspaceName" value={draft.name} maxLength={80} disabled={busy} required onChange={(event) => { change({ name: event.target.value }); setErrors((current) => ({ ...current, name: '' })) }} /></Field>
      <Field label="연락 이메일" error={errors.email}><Input ref={emailRef} name="contactEmail" type="email" autoComplete="email" value={draft.email} disabled={busy} required onChange={(event) => { change({ email: event.target.value }); setErrors((current) => ({ ...current, email: '' })) }} /></Field>
      <Field label="공개 범위"><Select name="visibility" value={draft.visibility} disabled={busy} onValueChange={(visibility) => { if (visibility === 'private' || visibility === 'team' || visibility === 'public') change({ visibility }) }} items={[{ value: 'private', label: '초대한 팀원만' }, { value: 'team', label: '워크스페이스 전체' }, { value: 'public', label: '링크를 가진 누구나' }]} /></Field>
      <fieldset style={{ display: 'grid', gap: 'var(--ui-form-gap, 16px)', border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <legend style={{ marginBottom: 'var(--ui-control-gap, 12px)', fontSize: 'var(--ui-type-label-size, 14px)', fontWeight: 'var(--ui-type-label-weight, 550)' }}>알림 설정</legend>
        <Switch label="프로젝트 업데이트" description="담당한 작업의 변경 사항을 받아요." checked={draft.updates} disabled={busy} onCheckedChange={(updates) => change({ updates })} />
        <Switch label="주간 요약" description="한 주의 진행 상황을 이메일로 모아봐요." checked={draft.digest} disabled={busy} onCheckedChange={(digest) => change({ digest })} />
      </fieldset>
      <div style={{ display: 'flex', justifyContent: 'end', flexWrap: 'wrap', gap: 'var(--ui-control-gap, 8px)' }}>
        <Button type="button" variant="secondary" disabled={busy || !dirty} onClick={() => { updateDraft({ ...saved }); setErrors({ name: '', email: '' }); setSaveError(''); setStatus('마지막으로 저장한 설정으로 되돌렸어요.'); onCancel?.({ ...saved }); nameRef.current?.focus() }}>변경 취소</Button>
        <Button type="submit" loading={busy} disabled={!dirty}>설정 저장</Button>
      </div>
      <p ref={statusRef} tabIndex={-1} role={saveError ? 'alert' : 'status'} aria-live={saveError ? 'assertive' : 'polite'} style={{ minHeight: '1.6em', margin: 0, color: saveError ? 'var(--ui-danger)' : 'var(--ui-muted)', fontSize: 'var(--ui-type-caption-size, 12px)', lineHeight: 'var(--ui-type-caption-line-height, 1.5)', overflowWrap: 'anywhere' }}>{saveError || status || (dirty ? '저장하지 않은 변경 사항이 있어요.' : '모든 변경 사항을 저장했어요.')}</p>
    </form>
  </Card>
}
