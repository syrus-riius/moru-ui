import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'
import { createWorkspaceMembers, membersReducer, type MemberAction, type WorkspaceMember } from './workspace-members-state'

const MembersContext = createContext<{ members: WorkspaceMember[]; dispatch: Dispatch<MemberAction> } | null>(null)

export function WorkspaceMembersProvider({ children }: { children: ReactNode }) {
  const [members, dispatch] = useReducer(membersReducer, undefined, createWorkspaceMembers)
  return <MembersContext.Provider value={{ members, dispatch }}>{children}</MembersContext.Provider>
}

export function useWorkspaceMembers() {
  const context = useContext(MembersContext)
  if (!context) throw new Error('useWorkspaceMembers must be used inside WorkspaceMembersProvider')
  return context
}
