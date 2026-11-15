import { useI18n } from '../../i18n'
import { WorkspaceExample } from '../workspace-example/WorkspaceExample'
import { ExamplesPage } from '../examples/ExamplesPage'
import { useStudio } from './useStudioController'
import { useWorkspaceExampleState } from './WorkspaceExampleState'

/** The examples hub with the editable workspace example. */
export function ExamplesView() {
  const { t } = useI18n()
  const { setNotice, setExportOpen, invite, go, openBlocks, openEditor } = useStudio()
  const {
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
  } = useWorkspaceExampleState()
  return (
    <ExamplesPage
      standalone
      onBlocks={openBlocks}
      onProjectTemplate={() => go('project-template')}
      name={workspaceName}
      workspace={
        <WorkspaceExample
          embedded
          projectPlan={projectPlan}
          onProjectPlanChange={setProjectPlan}
          name={workspaceName}
          onNameChange={setWorkspaceName}
          description={workspaceDesc}
          onDescriptionChange={setWorkspaceDesc}
          type={workspaceType}
          onTypeChange={setWorkspaceType}
          visibility={workspaceVisibility}
          onVisibilityChange={setWorkspaceVisibility}
          notifications={workspaceNotifications}
          onNotificationsChange={setWorkspaceNotifications}
          preferences={workspacePreferences}
          onPreferencesChange={(patch) =>
            setWorkspacePreferences((current) => ({ ...current, ...patch }))
          }
          onExport={() => setExportOpen(true)}
          onInvite={() => invite.openInvite('workspace')}
          onOpenEditor={() => openEditor()}
          onSave={() =>
            setNotice(t('예제 설정을 적용했어요. 이 화면의 값은 새로고침하면 초기화됩니다.'))
          }
        />
      }
    />
  )
}
