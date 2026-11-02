import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Field } from '../ui/field'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Switch } from '../ui/switch'

const initialSettings = { name: 'Moru Studio', email: 'hello@moru.example', visibility: 'private', updates: true, digest: false }

export function validateSettingsBlock(name: string, email: string) {
  return {
    name: name.trim() ? '' : '작업 공간 이름을 입력해 주세요.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? '' : '올바른 이메일 주소를 입력해 주세요.',
  }
}

/** Local draft/save interaction; connect your persistence in submit. */
export function SettingsBlock() {
  const id = useId()
  const [saved, setSaved] = useState(initialSettings)
  const [draft, setDraft] = useState(initialSettings)
  const [errors, setErrors] = useState({ name: '', email: '' })
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  const dirty = Object.keys(draft).some((key) => draft[key as keyof typeof draft] !== saved[key as keyof typeof saved])
  function change(patch: Partial<typeof initialSettings>) { setDraft((current) => ({ ...current, ...patch })); setStatus('') }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const next = validateSettingsBlock(draft.name, draft.email)
    setErrors(next)
    if (next.name || next.email) { (next.name ? nameRef : emailRef).current?.focus(); return }
    if (!dirty) return
    const nextSaved = { ...draft, name: draft.name.trim(), email: draft.email.trim() }
    setBusy(true)
    setStatus('변경한 설정을 저장하고 있어요.')
    statusRef.current?.focus({ preventScroll: true })
    timer.current = setTimeout(() => {
      setSaved(nextSaved); setDraft(nextSaved); setBusy(false)
      setStatus('변경한 설정을 저장했어요.')
    }, 600)
  }

  return <Card style={{ width: '100%', maxWidth: 560, margin: '0 auto', padding: 'var(--ui-card-padding, 24px)', boxSizing: 'border-box' }}>
    <form onSubmit={submit} noValidate aria-labelledby={`${id}-title`} style={{ display: 'grid', gap: 'var(--ui-form-gap, 20px)' }}>
      <header style={{ display: 'grid', gap: 'var(--ui-field-gap, 8px)' }}>
        <h3 id={`${id}-title`} style={{ margin: 0, fontSize: 'var(--ui-type-heading-size, 24px)', fontWeight: 'var(--ui-type-heading-weight, 600)', lineHeight: 'var(--ui-type-heading-line-height, 1.35)', letterSpacing: 'var(--ui-type-heading-letter-spacing, -.025em)' }}>작업 공간 설정</h3>
        <p style={{ margin: 0, color: 'var(--ui-muted)', fontSize: 'var(--ui-type-body-size, 14px)', lineHeight: 'var(--ui-type-body-line-height, 1.6)' }}>기본 정보와 팀에 필요한 알림을 정하세요.</p>
      </header>
      <Field label="작업 공간 이름" error={errors.name}><Input ref={nameRef} name="workspaceName" value={draft.name} maxLength={80} disabled={busy} required onChange={(event) => { change({ name: event.target.value }); setErrors((current) => ({ ...current, name: '' })) }} /></Field>
      <Field label="연락 이메일" error={errors.email}><Input ref={emailRef} name="contactEmail" type="email" autoComplete="email" value={draft.email} disabled={busy} required onChange={(event) => { change({ email: event.target.value }); setErrors((current) => ({ ...current, email: '' })) }} /></Field>
      <Field label="공개 범위"><Select name="visibility" value={draft.visibility} disabled={busy} onValueChange={(visibility) => change({ visibility })} items={[{ value: 'private', label: '초대한 팀원만' }, { value: 'team', label: '워크스페이스 전체' }, { value: 'public', label: '링크를 가진 누구나' }]} /></Field>
      <fieldset style={{ display: 'grid', gap: 'var(--ui-form-gap, 16px)', border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <legend style={{ marginBottom: 'var(--ui-control-gap, 12px)', fontSize: 'var(--ui-type-label-size, 14px)', fontWeight: 'var(--ui-type-label-weight, 550)' }}>알림 설정</legend>
        <Switch label="프로젝트 업데이트" description="담당한 작업의 변경 사항을 받아요." checked={draft.updates} disabled={busy} onCheckedChange={(updates) => change({ updates })} />
        <Switch label="주간 요약" description="한 주의 진행 상황을 이메일로 모아봐요." checked={draft.digest} disabled={busy} onCheckedChange={(digest) => change({ digest })} />
      </fieldset>
      <div style={{ display: 'flex', justifyContent: 'end', flexWrap: 'wrap', gap: 'var(--ui-control-gap, 8px)' }}>
        <Button type="button" variant="secondary" disabled={busy || !dirty} onClick={() => { setDraft(saved); setErrors({ name: '', email: '' }); setStatus('마지막으로 저장한 설정으로 되돌렸어요.'); nameRef.current?.focus() }}>변경 취소</Button>
        <Button type="submit" loading={busy} disabled={!dirty}>설정 저장</Button>
      </div>
      <p ref={statusRef} tabIndex={-1} role="status" aria-live="polite" style={{ minHeight: '1.6em', margin: 0, color: 'var(--ui-muted)', fontSize: 'var(--ui-type-caption-size, 12px)', lineHeight: 'var(--ui-type-caption-line-height, 1.5)', overflowWrap: 'anywhere' }}>{status || (dirty ? '저장하지 않은 변경 사항이 있어요.' : '모든 변경 사항을 저장했어요.')}</p>
    </form>
  </Card>
}
