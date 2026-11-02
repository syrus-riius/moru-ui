import { createContext, useCallback, useContext, useReducer, type ReactNode } from 'react'
import { createExampleSession, exampleSessionReducer, type ExampleConversation, type ExampleProject, type ExampleRelease, type ExampleScene, type ExampleSessionAction, type ExampleSessionState } from './example-session-state'
import type { QuestionnaireAnswers } from '../ui/questionnaire'

interface ExampleSessionContextValue {
  state: ExampleSessionState
  dispatch: React.Dispatch<ExampleSessionAction>
  setScene: (scene: ExampleScene) => void
  updateRelease: (patch: Partial<ExampleRelease>) => void
  updateWizardAnswers: (answers: QuestionnaireAnswers) => void
  addProject: (project: ExampleProject) => void
  updateProject: (id: string, patch: Partial<Omit<ExampleProject, 'id'>>) => void
  patchConversation: (patch: Partial<Omit<ExampleConversation, 'messages'>>) => void
}
const ExampleSessionContext = createContext<ExampleSessionContextValue | null>(null)

export function ExampleSessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(exampleSessionReducer, undefined, () => createExampleSession())
  const setScene = useCallback((scene: ExampleScene) => dispatch({ type: 'scene/set', scene }), [])
  const updateRelease = useCallback((patch: Partial<ExampleRelease>) => dispatch({ type: 'release/patch', patch }), [])
  const updateWizardAnswers = useCallback((answers: QuestionnaireAnswers) => dispatch({ type: 'wizard/answers', answers }), [])
  const addProject = useCallback((project: ExampleProject) => dispatch({ type: 'project/add', project }), [])
  const updateProject = useCallback((id: string, patch: Partial<Omit<ExampleProject, 'id'>>) => dispatch({ type: 'project/update', id, patch }), [])
  const patchConversation = useCallback((patch: Partial<Omit<ExampleConversation, 'messages'>>) => dispatch({ type: 'conversation/patch', patch }), [])
  return <ExampleSessionContext value={{ state, dispatch, setScene, updateRelease, updateWizardAnswers, addProject, updateProject, patchConversation }}>{children}</ExampleSessionContext>
}
export function useExampleSession() {
  const context = useContext(ExampleSessionContext)
  if (!context) throw new Error('useExampleSession must be used inside ExampleSessionProvider')
  return context
}
