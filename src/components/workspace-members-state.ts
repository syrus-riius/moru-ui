export type MemberRole = 'owner' | 'admin' | 'member'
export type MemberStatus = 'active' | 'invited'

export interface WorkspaceMember {
  id: string
  name: string
  email: string
  title: string
  role: MemberRole
  status: MemberStatus
}

export type MemberAction =
  | { type: 'add'; member: WorkspaceMember }
  | { type: 'update'; id: string; patch: Pick<WorkspaceMember, 'name' | 'title' | 'role'> }
  | { type: 'remove'; id: string }
  | { type: 'restore'; member: WorkspaceMember; index: number }

export function createWorkspaceMembers(): WorkspaceMember[] {
  return [
    { id: 'me', name: '나의 계정', email: 'me@moru.example', title: '워크스페이스 관리', role: 'owner', status: 'active' },
    { id: 'minji', name: '민지', email: 'minji@studio.example', title: '프로덕트 디자인', role: 'admin', status: 'active' },
    { id: 'suhyeon', name: '수현', email: 'suhyeon@studio.example', title: '프론트엔드 개발', role: 'member', status: 'active' },
    { id: 'jae', name: '제이', email: 'jae@studio.example', title: '브랜드 디자인', role: 'member', status: 'active' },
    { id: 'seoyeon', name: '서연', email: 'seoyeon@studio.example', title: '프로덕트 기획', role: 'member', status: 'invited' },
  ]
}

export function membersReducer(members: WorkspaceMember[], action: MemberAction): WorkspaceMember[] {
  if (action.type === 'add') {
    if (members.some((member) => member.id === action.member.id || member.email.toLowerCase() === action.member.email.toLowerCase())) return members
    return [...members, { ...action.member }]
  }
  if (action.type === 'remove') return members.filter((member) => member.id !== action.id || member.role === 'owner')
  if (action.type === 'update') return members.map((member) => member.id === action.id
    ? { ...member, ...action.patch, name: action.patch.name.trim() || member.name, role: member.role === 'owner' ? 'owner' : action.patch.role }
    : member)
  if (members.some((member) => member.id === action.member.id || member.email.toLowerCase() === action.member.email.toLowerCase())) return members
  const restored = [...members]
  restored.splice(Math.min(members.length, Math.max(0, action.index)), 0, { ...action.member })
  return restored
}
