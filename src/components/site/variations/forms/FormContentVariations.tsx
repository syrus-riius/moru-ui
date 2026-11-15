import { useState } from 'react'
import { useI18n } from '../../../../i18n'
import type { ComponentId } from '../../../catalog/component-catalog'
import { Attachment, type AttachmentProps, type AttachmentStatus } from '../../../ui/attachment'
import { Button } from '../../../ui/button'
import { Questionnaire, type QuestionnaireQuestion } from '../../../ui/questionnaire'
import { VariationExample, VariationGroup } from '../VariationLayout'
import { FormSizeExamples, type ControlSize } from './FormVariationLayout'

function AttachmentExample({
  status = 'idle',
  size = 'md',
  disabled,
  orientation,
}: Pick<AttachmentProps, 'size' | 'status' | 'disabled' | 'orientation'>) {
  const { t } = useI18n()
  const [currentStatus, setCurrentStatus] = useState<AttachmentStatus>(status)
  const [removed, setRemoved] = useState(false)
  return removed ? (
    <Button
      type="button"
      variant="secondary"
      size={size}
      onClick={() => {
        setRemoved(false)
        setCurrentStatus(status)
      }}
    >
      {t('다시 시작')}
    </Button>
  ) : (
    <Attachment
      fileName="moru-design.pdf"
      fileSize={245760}
      size={size}
      orientation={orientation}
      status={currentStatus}
      progress={currentStatus === 'uploading' ? 64 : undefined}
      disabled={disabled}
      onRemove={() => setRemoved(true)}
      onRetry={() => setCurrentStatus('done')}
    />
  )
}

function QuestionnaireExample({
  size = 'md',
  disabled,
  type = 'single',
  asyncSubmit = false,
  empty = false,
}: {
  size?: ControlSize
  disabled?: boolean
  type?: QuestionnaireQuestion['type']
  asyncSubmit?: boolean
  empty?: boolean
}) {
  const { t } = useI18n()
  const questions: QuestionnaireQuestion[] = [
    {
      id: 'purpose',
      title: t('어떤 프로젝트를 만들고 있나요?'),
      type,
      required: true,
      placeholder: t('프로젝트 이름을 입력하세요.'),
      options: [
        { value: 'personal', label: t('개인 프로젝트') },
        { value: 'team', label: t('팀 프로젝트') },
      ],
    },
  ]
  return (
    <Questionnaire
      size={size}
      disabled={disabled}
      questions={questions}
      defaultValue={
        empty
          ? {}
          : type === 'text'
            ? { purpose: 'Moru' }
            : type === 'multiple'
              ? { purpose: ['team'] }
              : { purpose: 'team' }
      }
      onComplete={
        asyncSubmit
          ? async () => {
              await new Promise<void>((resolve) => window.setTimeout(resolve, 1200))
            }
          : undefined
      }
    />
  )
}

export function FormContentVariations({ id }: { id: ComponentId }) {
  const { t } = useI18n()
  if (id === 'attachment')
    return (
      <>
        <FormSizeExamples wide>{(size) => <AttachmentExample size={size} />}</FormSizeExamples>
        <VariationGroup title="상태 비교" wide>
          <VariationExample label="기본" code={'status="idle"'}>
            <AttachmentExample />
          </VariationExample>
          <VariationExample label="업로드 중" code={'status="uploading" progress={64}'}>
            <AttachmentExample status="uploading" />
          </VariationExample>
          <VariationExample label="처리 중" code={'status="processing"'}>
            <AttachmentExample status="processing" />
          </VariationExample>
          <VariationExample label="오류" code={'status="error" onRetry'}>
            <AttachmentExample status="error" />
          </VariationExample>
          <VariationExample label="완료" code={'status="done"'}>
            <AttachmentExample status="done" />
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <AttachmentExample disabled />
          </VariationExample>
        </VariationGroup>
        <VariationGroup title="형태 비교" wide>
          <VariationExample label="가로" code={'orientation="horizontal"'}>
            <AttachmentExample orientation="horizontal" />
          </VariationExample>
          <VariationExample label="세로" code={'orientation="vertical"'}>
            <AttachmentExample orientation="vertical" />
          </VariationExample>
        </VariationGroup>
      </>
    )

  if (id === 'questionnaire')
    return (
      <>
        <FormSizeExamples wide>{(size) => <QuestionnaireExample size={size} />}</FormSizeExamples>
        <VariationGroup title="형태 비교" wide>
          <VariationExample label="단일 선택" code={'type: "single"'}>
            <QuestionnaireExample />
          </VariationExample>
          <VariationExample label="다중 선택" code={'type: "multiple"'}>
            <QuestionnaireExample type="multiple" />
          </VariationExample>
          <VariationExample label="텍스트" code={'type: "text"'}>
            <QuestionnaireExample type="text" />
          </VariationExample>
        </VariationGroup>
        <VariationGroup title="상태 비교" wide>
          <VariationExample label="비활성" code="disabled">
            <QuestionnaireExample disabled />
          </VariationExample>
          <VariationExample label="로딩" code="async onComplete">
            <p className="ui-content-caption">
              {t('답변 완료')} → {t('로딩')} → {t('완료')}
            </p>
            <QuestionnaireExample asyncSubmit />
          </VariationExample>
          <VariationExample label="필수" code="required">
            <QuestionnaireExample type="text" empty />
          </VariationExample>
        </VariationGroup>
      </>
    )
  return null
}
