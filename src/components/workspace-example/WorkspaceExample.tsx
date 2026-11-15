import { useI18n } from '../../i18n'
import { useRef, useState } from 'react'
import { Bell, Check, CircleHelp, MoreHorizontal, Settings2 } from 'lucide-react'
import { Accordion } from '../ui/accordion'
import { Alert } from '../ui/alert'
import { Avatar } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Field } from '../ui/field'
import { Input } from '../ui/input'
import { Menu } from '../ui/menu'
import { Popover } from '../ui/popover'
import { RadioGroup } from '../ui/radio-group'
import { Select } from '../ui/select'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'
import { Tabs } from '../ui/tabs'
import { Textarea } from '../ui/textarea'
import { Tooltip } from '../ui/tooltip'
import { MoruLogo, MoruMark } from '../brand'
import { WorkspaceReadiness } from './WorkspaceReadiness'
import { WorkspaceTeamPreview } from './WorkspaceTeamPreview'
import { WorkspaceProjectPlan, type ProjectPlanSettings } from './WorkspaceProjectPlan'
import { WorkspaceAppearancePreview } from './WorkspaceAppearancePreview'
import { useWorkspaceMembers } from './WorkspaceMembersContext'
import type { WorkspacePreferences } from './workspace-example-settings'
import './workspace-example.css'

interface WorkspaceExampleProps {
  embedded?: boolean
  projectPlan: ProjectPlanSettings
  onProjectPlanChange: (value: ProjectPlanSettings) => void
  name: string
  onNameChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  type: string
  onTypeChange: (value: string) => void
  visibility: string
  onVisibilityChange: (value: string) => void
  notifications: boolean
  onNotificationsChange: (value: boolean) => void
  preferences: WorkspacePreferences
  onPreferencesChange: (patch: Partial<WorkspacePreferences>) => void
  onExport: () => void
  onInvite: () => void
  onOpenEditor: () => void
  onSave: () => void
}

const visibilityNames: Record<string, string> = {
  private: '비공개',
  team: '팀 공개',
  public: '전체 공개',
}

export function WorkspaceExample({
  embedded = false,
  projectPlan,
  onProjectPlanChange,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  type,
  onTypeChange,
  visibility,
  onVisibilityChange,
  notifications,
  onNotificationsChange,
  preferences,
  onPreferencesChange,
  onExport,
  onInvite,
  onOpenEditor,
  onSave,
}: WorkspaceExampleProps) {
  const { t } = useI18n()
  const { members } = useWorkspaceMembers()
  const [activeTab, setActiveTab] = useState('general')
  const [notificationOptionsOpen, setNotificationOptionsOpen] = useState(false)
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null)
  const [nameError, setNameError] = useState('')
  const workspaceRef = useRef<HTMLDivElement>(null)
  const snapshot = JSON.stringify({
    name,
    description,
    type,
    visibility,
    notifications,
    mentions: preferences.mentions,
    digest: preferences.digest,
    digestFrequency: preferences.digestFrequency,
  })
  const saved = savedSnapshot === snapshot
  const notificationSummary = !notifications
    ? '프로젝트 활동 알림이 꺼져 있어요.'
    : [
        preferences.mentions ? '멘션 알림' : '',
        preferences.digest
          ? preferences.digestFrequency === 'daily'
            ? '매일 요약'
            : '매주 요약'
          : '',
      ]
        .filter(Boolean)
        .map((label) => t(label))
        .join(' · ') || '받을 소식을 선택해 주세요.'

  function saveWorkspace() {
    if (!name.trim()) {
      setNameError('워크스페이스 이름을 입력해 주세요.')
      return
    }
    setSavedSnapshot(snapshot)
    onSave()
  }

  function openGeneralSettings() {
    setActiveTab('general')
    requestAnimationFrame(() =>
      workspaceRef.current
        ?.querySelector<HTMLButtonElement>(
          '.workspace-preview-tabs [role="tab"][aria-selected="true"]',
        )
        ?.focus(),
    )
  }

  return (
    <>
      {!embedded && (
        <header className="catalog-intro">
          <span className="eyebrow">MORU UI / EXAMPLE</span>
          <h1>
            {t('기본이 모여, ')}
            <span className="brand-title-tail">{t('하나의 화면으로.')}</span>
          </h1>
          <p>
            {t(
              '워크스페이스를 준비하고, 팀과 프로젝트 일정을 관리해 보세요. 컴포넌트가 실제 화면에서 함께 작동하는 모습입니다.',
            )}
          </p>
          <div className="catalog-meta">
            <span>WORKSPACE SETTINGS</span>
            <span>{t('공간 준비 · 팀원 관리 · 프로젝트 일정')}</span>
          </div>
        </header>
      )}

      <Card ref={workspaceRef} className="workspace-example-view">
        <div className="workspace-preview-cover">
          <MoruLogo />
          <p>
            A solid foundation.
            <br />
            Made yours.
          </p>
        </div>
        <div className="workspace-preview-inner">
          <header className="workspace-preview-heading">
            <div>
              <span className="workspace-preview-eyebrow">YOUR WORKSPACE</span>
              <h2>{name || t('이름 없는 워크스페이스')}</h2>
              <p>{t('함께 만드는 공간의 기본 정보를 관리하세요.')}</p>
              <div className="workspace-preview-context">
                <Badge variant="secondary" tone={visibility === 'public' ? 'warning' : undefined}>
                  {t(visibilityNames[visibility] ?? '비공개')}
                </Badge>
                <div className="workspace-preview-team-summary">
                  <Avatar
                    alt={t('나의 계정')}
                    fallback={<MoruMark width={16} height={16} />}
                    size="sm"
                  />
                  <span>{t('함께하는 팀원 {count}명', { count: members.length })}</span>
                </div>
              </div>
            </div>
            <Menu
              trigger={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  aria-label={t('워크스페이스 작업')}
                >
                  <MoreHorizontal size={18} />
                </Button>
              }
              items={[
                { label: t('토큰 내보내기'), onClick: onExport },
                { label: t('팀원 초대'), onClick: onInvite },
              ]}
            />
          </header>

          <WorkspaceReadiness
            tasks={[
              {
                id: 'profile',
                label: t('공간의 기본 정보 확인'),
                done: preferences.checklist.profile,
              },
              { id: 'team', label: t('함께할 팀원과 역할 확인'), done: preferences.checklist.team },
              {
                id: 'settings',
                label: t('공개 범위와 알림 검토'),
                done: preferences.checklist.settings,
              },
            ]}
            onTaskChange={(id, done) =>
              onPreferencesChange({ checklist: { ...preferences.checklist, [id]: done } })
            }
          />

          <Tabs
            aria-label={t('워크스페이스 설정')}
            className="workspace-preview-tabs"
            value={activeTab}
            onValueChange={setActiveTab}
            items={[
              {
                value: 'general',
                label: t('일반 설정'),
                content: (
                  <form
                    className="workspace-preview-form"
                    onSubmit={(event) => {
                      event.preventDefault()
                      saveWorkspace()
                    }}
                  >
                    <section
                      className="workspace-preview-section"
                      aria-labelledby="workspace-info-title"
                    >
                      <div className="workspace-preview-section-heading">
                        <h3 id="workspace-info-title">{t('기본 정보')}</h3>
                        <p>{t('이 공간을 소개하고, 함께할 범위를 정하세요.')}</p>
                      </div>
                      <div className="workspace-preview-fields">
                        <Field
                          label={t('워크스페이스 이름')}
                          description={t('팀원에게 표시되는 이름입니다.')}
                          error={t(nameError)}
                        >
                          <Input
                            name="workspaceName"
                            value={name}
                            onChange={(event) => {
                              onNameChange(event.target.value)
                              setNameError('')
                            }}
                            required
                          />
                        </Field>
                        <Field label={t('한 줄 소개')}>
                          <Textarea
                            name="workspaceDescription"
                            value={description}
                            onChange={(event) => onDescriptionChange(event.target.value)}
                            rows={3}
                          />
                        </Field>
                        <Field label={t('워크스페이스 유형')}>
                          <Select
                            aria-label={t('워크스페이스 유형')}
                            items={[
                              { value: 'design', label: t('디자인 스튜디오') },
                              { value: 'product', label: t('프로덕트 팀') },
                              { value: 'personal', label: t('개인 프로젝트') },
                            ]}
                            value={type}
                            onValueChange={onTypeChange}
                          />
                        </Field>
                      </div>
                    </section>
                    <Separator />
                    <section
                      className="workspace-preview-section"
                      aria-labelledby="workspace-sharing-title"
                    >
                      <div className="workspace-preview-section-heading workspace-preview-heading-with-help">
                        <div>
                          <h3 id="workspace-sharing-title">{t('함께할 범위')}</h3>
                          <p>{t('프로젝트에 접근할 수 있는 사람을 선택하세요.')}</p>
                        </div>
                        <Tooltip
                          trigger={
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={t('공개 범위 안내')}
                            >
                              <CircleHelp size={16} />
                            </Button>
                          }
                        >
                          {t('전체 공개를 선택하면 링크가 있는 모든 사람이 볼 수 있어요.')}
                        </Tooltip>
                      </div>
                      <Field label={t('공개 범위')}>
                        <RadioGroup
                          name="workspaceVisibility"
                          value={visibility}
                          onValueChange={onVisibilityChange}
                          items={[
                            {
                              value: 'private',
                              label: t('나만 보기'),
                              description: t('개인 작업을 위한 공간으로 사용해요.'),
                            },
                            {
                              value: 'team',
                              label: t('팀과 공유'),
                              description: t('초대한 팀원만 함께할 수 있어요.'),
                            },
                            {
                              value: 'public',
                              label: t('전체 공개'),
                              description: t('링크가 있는 모든 사람에게 열어둬요.'),
                            },
                          ]}
                        />
                      </Field>
                      {visibility === 'public' ? (
                        <Alert title={t('공개할 내용을 한 번 더 확인하세요.')} tone="warning">
                          {t('팀의 내부 정보가 포함되어 있지 않은지 확인한 뒤 적용해 주세요.')}
                        </Alert>
                      ) : null}
                    </section>
                    <Separator />
                    <section
                      className="workspace-preview-section"
                      aria-labelledby="workspace-notifications-title"
                    >
                      <div className="workspace-preview-section-heading">
                        <h3 id="workspace-notifications-title">{t('필요한 소식만 받기')}</h3>
                        <p>{t('집중을 지키면서 팀의 소식도 놓치지 마세요.')}</p>
                      </div>
                      <div className="workspace-preview-notification-row">
                        <Switch
                          name="workspaceNotifications"
                          label={t('프로젝트 활동 알림')}
                          description={t('이메일로 새로운 소식을 알려드려요.')}
                          checked={notifications}
                          onCheckedChange={onNotificationsChange}
                        />
                        <Popover
                          title={t('받을 소식 고르기')}
                          description={t('활동 알림이 켜져 있을 때 적용됩니다.')}
                          open={notificationOptionsOpen}
                          onOpenChange={setNotificationOptionsOpen}
                          trigger={
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              disabled={!notifications}
                            >
                              <Settings2 size={14} />
                              {t('알림 세부 설정')}
                            </Button>
                          }
                        >
                          <div className="workspace-notification-options">
                            <Checkbox
                              label={t('나를 멘션한 댓글')}
                              checked={preferences.mentions}
                              onCheckedChange={(mentions) => onPreferencesChange({ mentions })}
                              disabled={!notifications}
                            />
                            <Checkbox
                              label={t('활동 요약 받기')}
                              checked={preferences.digest}
                              onCheckedChange={(digest) => onPreferencesChange({ digest })}
                              disabled={!notifications}
                            />
                            <Field label={t('요약 주기')}>
                              <Select
                                aria-label={t('요약 주기')}
                                value={preferences.digestFrequency}
                                onValueChange={(digestFrequency) =>
                                  onPreferencesChange({ digestFrequency })
                                }
                                disabled={!notifications || !preferences.digest}
                                items={[
                                  { value: 'daily', label: t('매일 한 번') },
                                  { value: 'weekly', label: t('매주 한 번') },
                                ]}
                              />
                            </Field>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setNotificationOptionsOpen(false)}
                            >
                              {t('확인')}
                              <Check size={14} />
                            </Button>
                          </div>
                        </Popover>
                      </div>
                      <p className="workspace-preview-notification-summary">
                        <Bell size={14} aria-hidden="true" />
                        {t(notificationSummary)}
                      </p>
                    </section>
                    {saved ? (
                      <Alert title={t('변경 사항을 적용했어요.')} tone="success">
                        {t(
                          '확인한 설정은 이 화면에 유지됩니다. 새로고침하면 예제의 기본값으로 돌아갑니다.',
                        )}
                      </Alert>
                    ) : null}
                    <footer className="workspace-preview-form-footer">
                      <span>
                        <MoruMark width={16} height={16} />
                        {t('브라우저에서 동작하는 예제입니다.')}
                      </span>
                      <Button type="submit">
                        {t('변경 사항 적용')}
                        <Check size={14} />
                      </Button>
                    </footer>
                  </form>
                ),
              },
              {
                value: 'members',
                label: t('팀원'),
                content: <WorkspaceTeamPreview onInvite={onInvite} />,
              },
              {
                value: 'project',
                label: t('프로젝트'),
                content: (
                  <WorkspaceProjectPlan value={projectPlan} onChange={onProjectPlanChange} />
                ),
              },
              {
                value: 'appearance',
                label: t('화면 설정'),
                content: (
                  <WorkspaceAppearancePreview
                    gap={preferences.previewGap}
                    onGapChange={(previewGap) => onPreferencesChange({ previewGap })}
                    onOpenEditor={onOpenEditor}
                    onOpenGeneral={openGeneralSettings}
                  />
                ),
              },
            ]}
          />

          <section className="workspace-preview-help" aria-labelledby="workspace-help-title">
            <Separator />
            <h3 id="workspace-help-title">{t('궁금할 때 참고하세요.')}</h3>
            <Accordion
              items={[
                {
                  value: 'sharing',
                  title: t('공개 범위는 나중에 바꿀 수 있나요?'),
                  content: (
                    <p className="workspace-preview-help-copy">
                      {t(
                        '언제든 나만 보기·팀 공개·전체 공개 중에서 다시 선택할 수 있어요. 바꾼 범위를 확인하고 변경 사항을 적용하세요.',
                      )}
                    </p>
                  ),
                },
                {
                  value: 'appearance',
                  title: t('색상과 글꼴도 바꿀 수 있나요?'),
                  content: (
                    <p className="workspace-preview-help-copy">
                      {t(
                        '디자인 편집에서 색상·글꼴·밀도를 바꾸면 이 화면에도 바로 반영됩니다. 화면 설정 탭에서는 콘텐츠 간격도 비교할 수 있어요.',
                      )}
                    </p>
                  ),
                },
              ]}
            />
          </section>
        </div>
      </Card>
      <p className="workspace-preview-note">
        <Check size={14} />
        <span>{t('설정과 준비 항목은 화면을 오가도 유지되고, 새로고침하면 초기화됩니다.')}</span>
      </p>
    </>
  )
}
