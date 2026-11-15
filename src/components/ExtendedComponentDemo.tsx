import { useI18n } from '../i18n'
import { useState } from 'react'
import { ArrowRight, CircleHelp, Settings2 } from 'lucide-react'
import { Accordion } from './ui/accordion'
import { Alert } from './ui/alert'
import { Avatar } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Field } from './ui/field'
import { Popover } from './ui/popover'
import { ProgressVariationsDemo, SkeletonVariationsDemo } from './MotionFeedbackDemo'
import { RadioGroup } from './ui/radio-group'
import { Separator } from './ui/separator'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'
import { Tooltip } from './ui/tooltip'
import type { SemanticTone } from './ui'
import type { AddedComponentId } from './component-catalog'
import './extended-component-demo.css'

export type DemoSize = 'sm' | 'md' | 'lg'

export interface ExtendedComponentDemoProps {
  id: AddedComponentId
  disabled: boolean
  size: DemoSize
  tone: SemanticTone
  progress: number
  onProgressChange: (value: number) => void
  loading: boolean
  onLoadingChange: (loading: boolean) => void
  onNotice: (message: string) => void
}

// Kept outside App so each specimen owns its interaction state across token edits.
export function ExtendedComponentDemo({
  id,
  disabled,
  size,
  tone,
  progress,
  onProgressChange,
  loading,
  onLoadingChange,
  onNotice,
}: ExtendedComponentDemoProps) {
  const { t } = useI18n()
  const [notifications, setNotifications] = useState(true)
  const [access, setAccess] = useState('team')
  const [scale, setScale] = useState(60)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [comments, setComments] = useState(true)

  switch (id) {
    case 'switch':
      return (
        <div className="extended-demo-stack">
          <Switch
            label={t('새로운 활동 알림')}
            description={t('팀의 소식을 바로 받아보세요.')}
            checked={notifications}
            onCheckedChange={setNotifications}
            disabled={disabled}
            size={size}
          />
          <Switch
            label={t('매주 요약 받기')}
            defaultChecked={false}
            disabled={disabled}
            size={size}
          />
          <span className="extended-demo-caption">
            {t('활동 알림 ·')}
            {notifications ? t('켜짐') : t('꺼짐')}
          </span>
        </div>
      )
    case 'radio-group':
      return (
        <div className="extended-demo-stack">
          <Field label={t('프로젝트 접근 권한')}>
            <RadioGroup
              name="demo-access"
              value={access}
              onValueChange={setAccess}
              disabled={disabled}
              size={size}
              items={[
                { value: 'private', label: t('나만 보기') },
                {
                  value: 'team',
                  label: t('팀과 공유'),
                  description: t('초대한 팀원과 함께 작업해요.'),
                },
                { value: 'public', label: t('전체 공개') },
              ]}
            />
          </Field>
        </div>
      )
    case 'slider':
      return (
        <div className="extended-demo-stack">
          <Slider
            label={t('미리보기 배율')}
            value={scale}
            onValueChange={setScale}
            min={0}
            max={100}
            step={5}
            showValue
            disabled={disabled}
            size={size}
          />
          <div className="extended-demo-range">
            <span>0%</span>
            <span>100%</span>
          </div>
          <span className="extended-demo-caption">
            {t('방향키로 5씩, Home·End로 처음과 끝으로.')}
          </span>
        </div>
      )
    case 'accordion':
      return (
        <Accordion
          defaultValue={['tokens']}
          disabled={disabled}
          items={[
            {
              value: 'tokens',
              title: t('내 제품에 맞게 바꿀 수 있나요?'),
              content:
                '색상·글꼴·밀도를 토큰으로 조절하세요. 모든 컴포넌트에 같은 규칙이 적용됩니다.',
            },
            {
              value: 'source',
              title: t('소스도 수정할 수 있나요?'),
              content: '필요한 컴포넌트를 가져와 직접 다듬고, 제품에 맞게 조합하세요.',
            },
            {
              value: 'keyboard',
              title: t('키보드로도 쓸 수 있나요?'),
              content: 'Tab으로 이동하고, Enter나 Space로 항목을 펼쳐 보세요.',
            },
          ]}
        />
      )
    case 'popover':
      return (
        <div className="extended-demo-stack">
          <Popover
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
            title={t('알림 설정')}
            description={t('필요한 소식만 골라 받아보세요.')}
            trigger={
              <Button variant="secondary" size={size} disabled={disabled}>
                <Settings2 />
                {t('빠른 설정')}
              </Button>
            }
          >
            <div className="extended-demo-stack">
              <Switch
                label={t('새 댓글 알림')}
                checked={comments}
                onCheckedChange={setComments}
                disabled={disabled}
                size={size}
              />
              <Button
                size={size}
                disabled={disabled}
                onClick={() => {
                  setPopoverOpen(false)
                  onNotice(t('알림 설정을 적용했어요.'))
                }}
              >
                {t('적용하기')}
                <ArrowRight />
              </Button>
            </div>
          </Popover>
          <span className="extended-demo-caption">
            {t('버튼 옆에서 설정하고, 바깥을 누르거나 Esc로 닫으세요.')}
          </span>
        </div>
      )
    case 'tooltip':
      return (
        <div className="extended-demo-stack">
          <div className="extended-demo-row">
            <Tooltip
              trigger={
                <Button
                  variant="secondary"
                  size={size}
                  disabled={disabled}
                  aria-label={t('컴포넌트 도움말')}
                  onClick={() => onNotice(t('색상·글꼴·밀도는 디자인 편집에서 조절하세요.'))}
                >
                  <CircleHelp />
                </Button>
              }
            >
              {t('디자인 편집에서 스타일을 조절할 수 있어요.')}
            </Tooltip>
            <Tooltip
              trigger={
                <Button
                  variant="secondary"
                  size={size}
                  disabled={disabled}
                  onClick={() => onNotice(t('저장 버튼의 동작을 확인했어요.'))}
                >
                  {t('저장하기')}
                </Button>
              }
            >
              {t('변경한 설정을 저장합니다.')}
            </Tooltip>
          </div>
          <span className="extended-demo-caption">
            {t('마우스를 올리거나 Tab으로 초점을 옮겨보세요.')}
          </span>
        </div>
      )
    case 'badge':
      return (
        <div className="extended-demo-stack">
          <div className="extended-demo-row">
            <Badge>{t('진행 중')}</Badge>
            <Badge variant="secondary">{t('초안')}</Badge>
            <Badge variant="outline">{t('디자인')}</Badge>
          </div>
          <div className="extended-demo-row">
            <Badge tone="success">{t('완료')}</Badge>
            <Badge tone="warning">{t('검토 필요')}</Badge>
            <Badge tone={tone}>{t('선택한 의미 색상')}</Badge>
          </div>
        </div>
      )
    case 'alert':
      return (
        <Alert
          title={
            {
              success: '변경 사항을 저장했어요.',
              warning: '공개 전에 확인해 주세요.',
              info: '팀과 함께 작업해 보세요.',
              danger: '변경 사항을 저장하지 못했어요.',
            }[tone]
          }
          tone={tone}
          role="group"
        >
          {
            {
              success: '팀원에게도 새로운 설정이 적용됩니다.',
              warning: '링크가 있는 모든 사람이 내용을 볼 수 있어요.',
              info: '초대한 팀원과 같은 공간에서 작업할 수 있어요.',
              danger: '연결 상태를 확인하고 다시 시도해 주세요.',
            }[tone]
          }
        </Alert>
      )
    case 'avatar':
      return (
        <div className="extended-demo-stack">
          <div className="extended-demo-row">
            <Avatar alt="민지" fallback="MJ" size="sm" />
            <Avatar alt="수현" fallback="SH" size="md" />
            <Avatar alt="Moru 팀" src="/brand/moru-symbol.svg" fallback="M" size="lg" />
          </div>
          <div className="extended-demo-row">
            <Avatar alt="새 팀원" fallback="YO" size={size} />
            <span className="extended-demo-caption">{t('이미지가 없어도 이름을 표시해요.')}</span>
          </div>
        </div>
      )
    case 'progress':
      return (
        <ProgressVariationsDemo
          progress={progress}
          onProgressChange={onProgressChange}
          disabled={disabled}
          size={size}
        />
      )
    case 'separator':
      return (
        <div className="extended-demo-stack">
          <div className="extended-demo-copy">
            <strong>{t('프로젝트 정보')}</strong>
            <span>{t('필요한 곳에, 적당한 간격으로.')}</span>
          </div>
          <Separator />
          <div className="extended-demo-separated">
            <span>{t('디자인')}</span>
            <Separator orientation="vertical" />
            <span>{t('개발')}</span>
            <Separator orientation="vertical" />
            <span>{t('배포')}</span>
          </div>
        </div>
      )
    case 'skeleton':
      return (
        <SkeletonVariationsDemo
          loading={loading}
          onLoadingChange={onLoadingChange}
          disabled={disabled}
          size={size}
        />
      )
  }
}
