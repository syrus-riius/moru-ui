import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Plus, RefreshCw, Search, Trash2, UserRound } from 'lucide-react'
import { useWorkspaceMembers } from './WorkspaceMembersContext'
import type { MemberRole, WorkspaceMember } from './workspace-members-state'
import { Alert } from './ui/alert'
import { AlertDialog } from './ui/alert-dialog'
import { Avatar } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Combobox } from './ui/combobox'
import { Empty } from './ui/empty'
import { Field } from './ui/field'
import { Input } from './ui/input'
import { Pagination } from './ui/pagination'
import { Select } from './ui/select'
import { Separator } from './ui/separator'
import { Sheet } from './ui/sheet'
import { Skeleton } from './ui/skeleton'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { useToast } from './ui/toast'
import { ToggleGroup } from './ui/toggle-group'
import './workspace-team-preview.css'

interface WorkspaceTeamPreviewProps { onInvite: () => void }

const pageSize = 3
const roleLabels: Record<MemberRole, string> = { owner: '소유자', admin: '관리자', member: '멤버' }
const roleOptions = [{ value: 'admin', label: '관리자' }, { value: 'member', label: '멤버' }]
const statusOptions = [{ value: 'all', label: '전체' }, { value: 'active', label: '활동 중' }, { value: 'invited', label: '초대 중' }]

export function WorkspaceTeamPreview({ onInvite }: WorkspaceTeamPreviewProps) {
  const { members, dispatch } = useWorkspaceMembers()
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<WorkspaceMember | null>(null)
  const [nameError, setNameError] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshed, setRefreshed] = useState(false)
  const refreshTimer = useRef<number | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => () => {
    if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current)
  }, [])

  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filteredMembers = members.filter((member) =>
    (status === 'all' || member.status === status) &&
    (member.name + ' ' + member.email).toLocaleLowerCase().includes(normalizedQuery),
  )
  const pageCount = Math.ceil(filteredMembers.length / pageSize)
  const currentPage = Math.min(Math.max(1, page), Math.max(1, pageCount))
  const pageMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function openMember(id: string) {
    const member = members.find((candidate) => candidate.id === id)
    if (!member) return
    setDraft({ ...member })
    setNameError('')
    setSelectedId(id)
  }

  function refreshMembers() {
    if (refreshTimer.current !== null) return
    setLoading(true)
    setRefreshed(false)
    refreshTimer.current = window.setTimeout(() => {
      refreshTimer.current = null
      setLoading(false)
      setRefreshed(true)
    }, 800)
  }

  function clearFilters() {
    setQuery('')
    setStatus('all')
    setPage(1)
    searchRef.current?.focus()
  }

  function saveMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft || !selectedId) return
    const name = draft.name.trim()
    if (!name) {
      setNameError('팀원의 이름을 입력해 주세요.')
      nameRef.current?.focus()
      return
    }
    dispatch({ type: 'update', id: selectedId, patch: { name, title: draft.title.trim(), role: draft.role } })
    setSelectedId(null)
    toast({ title: '팀원 정보를 저장했어요.', description: name + '님의 정보가 목록에 반영되었습니다.', tone: 'success' })
  }

  function removeMember() {
    const member = members.find((candidate) => candidate.id === selectedId)
    if (!member || member.role === 'owner') return
    const index = members.findIndex((candidate) => candidate.id === member.id)
    dispatch({ type: 'remove', id: member.id })
    const remainingResults = filteredMembers.filter((candidate) => candidate.id !== member.id).length
    setPage(Math.min(currentPage, Math.max(1, Math.ceil(remainingResults / pageSize))))
    setSelectedId(null)
    toast({
      title: '팀원을 목록에서 제거했어요.',
      description: member.name + '님의 예제 정보가 제거되었습니다.',
      tone: 'info',
      duration: 8000,
      action: { label: '실행 취소', onClick: () => { dispatch({ type: 'restore', member: { ...member }, index }) } },
    })
  }

  return (
    <section className="workspace-team-preview" aria-label="워크스페이스 팀원">
      <header className="workspace-team-heading">
        <div className="workspace-preview-section-heading">
          <div className="workspace-team-title"><h3>함께하는 사람들</h3><Badge variant="secondary">{members.length}명</Badge></div>
          <p>사람을 찾고 역할을 다듬으며, 함께할 공간을 만들어 보세요.</p>
        </div>
        <Button type="button" variant="ghost" size="sm" loading={loading} aria-label="팀원 목록 새로고침" onClick={refreshMembers}>
          {!loading && <RefreshCw size={14} aria-hidden="true" />}새로고침
        </Button>
      </header>

      <div className="workspace-team-search-grid">
        <Field label="팀원 검색"><Input ref={searchRef} type="search" value={query} onValueChange={(value) => { setQuery(value); setPage(1) }} placeholder="이름 또는 이메일" /></Field>
        <Field label="팀원 바로 찾기"><Combobox value={selectedId} items={members.map((member) => ({ value: member.id, label: member.name, description: member.email }))} onValueChange={(value) => { if (value) openMember(value) }} placeholder="팀원을 선택하면 상세 보기" /></Field>
      </div>

      <div className="workspace-team-filter-row">
        <ToggleGroup items={statusOptions} value={[status]} preventEmpty size="sm" aria-label="팀원 상태 필터" onValueChange={(value) => { setStatus(value[0] ?? 'all'); setPage(1) }} />
        <p className="workspace-team-result-count">{filteredMembers.length}명 표시</p>
      </div>

      <div className="workspace-team-list-region">
        <p className="workspace-team-list-status" role="status" aria-live="polite">
          {loading ? '팀원 목록을 확인하고 있어요…' : refreshed ? '목록을 확인했어요. ' + members.length + '명이 함께하고 있습니다.' : '이 목록은 브라우저에서 편집하는 예제입니다.'}
        </p>
        {!loading && filteredMembers.length === 0 ? (
          <Empty title="찾는 팀원이 없어요." description="검색어나 상태를 바꾸거나, 새로운 팀원을 초대해 보세요." icon={<Search size={22} />}>
            <Button type="button" size="sm" variant="secondary" onClick={clearFilters}>필터 초기화</Button>
            <Button type="button" size="sm" onClick={onInvite}>팀원 초대</Button>
          </Empty>
        ) : (
          <Table className="workspace-team-table" wrapperClassName="workspace-team-table-scroll" scrollLabel="팀원 목록 · 가로로 스크롤할 수 있습니다" aria-busy={loading}>
            <TableCaption>워크스페이스 팀원 · {filteredMembers.length}명</TableCaption>
            <TableHeader><TableRow><TableHead>팀원</TableHead><TableHead>역할</TableHead><TableHead>상태</TableHead><TableHead><span className="workspace-team-sr-only">작업</span></TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? Array.from({ length: Math.max(1, pageMembers.length) }, (_, index) => (
                <TableRow key={index} aria-hidden="true"><TableCell><div className="workspace-team-person"><Skeleton className="workspace-team-skeleton-avatar" /><div className="workspace-team-skeleton-copy"><Skeleton className="workspace-team-skeleton-name" /><Skeleton className="workspace-team-skeleton-description" /></div></div></TableCell><TableCell><Skeleton className="workspace-team-skeleton-role" /></TableCell><TableCell><Skeleton className="workspace-team-skeleton-role" /></TableCell><TableCell><Skeleton className="workspace-team-skeleton-action" /></TableCell></TableRow>
              )) : pageMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell><div className="workspace-team-person"><Avatar alt={member.name + ' 프로필'} fallback={member.name.slice(0, 2)} size="sm" /><div className="workspace-team-person-copy"><strong>{member.name}</strong><p>{member.email}</p></div></div></TableCell>
                  <TableCell><Badge variant={member.role === 'owner' ? 'secondary' : 'outline'}>{roleLabels[member.role]}</Badge></TableCell>
                  <TableCell><Badge variant="secondary" tone={member.status === 'active' ? 'success' : 'warning'}>{member.status === 'active' ? '활동 중' : '초대 중'}</Badge></TableCell>
                  <TableCell><Button type="button" variant="ghost" size="sm" aria-label={member.name + ' 상세 보기'} onClick={() => openMember(member.id)}>상세</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {pageCount > 1 && <div className="workspace-team-pagination"><Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} disabled={loading} aria-label="팀원 목록 페이지" /><p>{currentPage} / {pageCount}페이지</p></div>}
      </div>

      <Separator />
      <div className="workspace-team-invite">
        <Alert title="함께할 사람이 더 있나요?" tone="info" role="note">추가·수정·삭제는 예제 안에 반영됩니다. 팀원을 초대해 구성원 목록을 늘려 보세요.</Alert>
        <Button type="button" variant="secondary" onClick={onInvite}><Plus size={14} aria-hidden="true" />팀원 초대</Button>
      </div>

      <Sheet title="팀원 상세" description="함께하는 사람의 이름과 역할을 다듬어 보세요." open={selectedId !== null} onOpenChange={(open) => { if (!open) setSelectedId(null) }} initialFocus={nameRef} finalFocus={searchRef}>
        {draft && <form className="workspace-team-detail-form" onSubmit={saveMember}>
          <div className="workspace-team-detail-profile"><Avatar alt={(draft.name || '팀원') + ' 프로필'} fallback={draft.name.slice(0, 2) || <UserRound size={18} />} size="lg" /><div><strong>{draft.name || '팀원'}</strong><p>{draft.email}</p><Badge variant="secondary" tone={draft.status === 'active' ? 'success' : 'warning'}>{draft.status === 'active' ? '활동 중' : '초대 중'}</Badge></div></div>
          <Field label="이름" error={nameError}><Input ref={nameRef} value={draft.name} onValueChange={(name) => { setDraft({ ...draft, name }); setNameError('') }} maxLength={60} autoComplete="name" /></Field>
          <Field label="담당 업무"><Input value={draft.title} onValueChange={(title) => setDraft({ ...draft, title })} maxLength={100} placeholder="예: 프로덕트 디자인" /></Field>
          <Field label="역할" description={draft.role === 'owner' ? '소유자 역할은 변경할 수 없습니다.' : '관리자는 워크스페이스와 팀원을 관리할 수 있습니다.'}><Select items={draft.role === 'owner' ? [{ value: 'owner', label: '소유자' }] : roleOptions} value={draft.role} disabled={draft.role === 'owner'} onValueChange={(role) => { if (role === 'admin' || role === 'member') setDraft({ ...draft, role }) }} /></Field>
          <div className="workspace-team-detail-actions"><Button type="button" variant="secondary" onClick={() => setSelectedId(null)}>취소</Button><Button type="submit">변경 저장</Button></div>
          {draft.role !== 'owner' && <div className="workspace-team-danger-area"><Separator /><div><h3>팀원 제거</h3><p>목록에서 제거한 뒤 알림에서 실행을 취소할 수 있습니다.</p></div><AlertDialog trigger={<Button type="button" variant="danger"><Trash2 size={14} aria-hidden="true" />팀원 제거</Button>} title={(draft.name || '이 팀원') + '님을 제거할까요?'} description="현재 워크스페이스 예제의 목록에서 제거합니다. 다른 팀원의 정보는 유지됩니다." confirmLabel="제거" destructive onConfirm={removeMember} /></div>}
        </form>}
      </Sheet>
    </section>
  )
}
