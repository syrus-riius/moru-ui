import { type ReactNode, createContext, useContext, useMemo, useState } from 'react'
import { createProjectPlanSettings } from '../workspace-example/WorkspaceProjectPlan'
import { createWorkspacePreferences } from '../workspace-example/workspace-example-settings'

/**
 * Values edited in the workspace example. They outlive the examples view, and live in
 * their own provider so that typing a workspace name does not re-render the whole shell.
 */
function useWorkspaceExampleValues() {
  const [workspaceName, setWorkspaceName] = useState('Moru Studio')
  const [workspaceDesc, setWorkspaceDesc] = useState('좋은 아이디어가 자연스럽게 자라는 곳.')
  const [workspaceType, setWorkspaceType] = useState('design')
  const [workspaceNotifications, setWorkspaceNotifications] = useState(true)
  const [workspaceVisibility, setWorkspaceVisibility] = useState('private')
  const [projectPlan, setProjectPlan] = useState(createProjectPlanSettings)
  const [workspacePreferences, setWorkspacePreferences] = useState(createWorkspacePreferences)
  return useMemo(
    () => ({
      workspaceName,
      setWorkspaceName,
      workspaceDesc,
      setWorkspaceDesc,
      workspaceType,
      setWorkspaceType,
      workspaceNotifications,
      setWorkspaceNotifications,
      workspaceVisibility,
      setWorkspaceVisibility,
      projectPlan,
      setProjectPlan,
      workspacePreferences,
      setWorkspacePreferences,
    }),
    [
      workspaceName,
      workspaceDesc,
      workspaceType,
      workspaceNotifications,
      workspaceVisibility,
      projectPlan,
      workspacePreferences,
    ],
  )
}

const WorkspaceExampleContext = createContext<ReturnType<typeof useWorkspaceExampleValues> | null>(
  null,
)

export function WorkspaceExampleStateProvider({ children }: { children: ReactNode }) {
  return (
    <WorkspaceExampleContext.Provider value={useWorkspaceExampleValues()}>
      {children}
    </WorkspaceExampleContext.Provider>
  )
}

export function useWorkspaceExampleState() {
  const value = useContext(WorkspaceExampleContext)
  if (!value) throw new Error('WorkspaceExampleStateProvider is missing')
  return value
}
