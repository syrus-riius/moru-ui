import { useId } from 'react'
import { useI18n } from '../../../../i18n'
import type { ComponentId } from '../../../catalog/component-catalog'
import { Checkbox } from '../../../ui/checkbox'
import { Combobox } from '../../../ui/combobox'
import { Field } from '../../../ui/field'
import { MultiSelect } from '../../../ui/multi-select'
import { RadioGroup, type RadioGroupProps } from '../../../ui/radio-group'
import { Select } from '../../../ui/select'
import { Slider } from '../../../ui/slider'
import { Switch } from '../../../ui/switch'
import { ToggleGroup } from '../../../ui/toggle-group'
import { VariationExample, VariationGroup } from '../VariationLayout'
import { FormSizeExamples, type ControlSize } from './FormVariationLayout'

type ChoiceInputId = 'select' | 'multi-select' | 'combobox'

function ChoiceInput({
  id,
  size = 'md',
  disabled,
  loading,
  readOnly,
  invalid,
}: {
  id: ChoiceInputId
  size?: ControlSize
  disabled?: boolean
  loading?: boolean
  readOnly?: boolean
  invalid?: boolean
}) {
  const { t } = useI18n()
  const items = [
    { value: 'design', label: t('디자인') },
    { value: 'development', label: t('개발') },
    { value: 'planning', label: t('기획') },
    { value: 'disabled', label: t('비활성'), disabled: true },
  ]
  const props = { items, size, disabled, loading, readOnly, 'aria-invalid': invalid || undefined }
  return (
    <Field label={t('팀')} error={invalid ? t('항목을 선택해 주세요.') : undefined}>
      {id === 'select' ? (
        <Select {...props} defaultValue="design" />
      ) : id === 'multi-select' ? (
        <MultiSelect {...props} defaultValue={['design', 'development']} />
      ) : (
        <Combobox {...props} defaultValue="design" />
      )}
    </Field>
  )
}

function ChoiceInputVariations({ id }: { id: ChoiceInputId }) {
  return (
    <>
      <FormSizeExamples>{(size) => <ChoiceInput id={id} size={size} />}</FormSizeExamples>
      <VariationGroup title="상태 비교">
        <VariationExample label="기본">
          <ChoiceInput id={id} />
        </VariationExample>
        <VariationExample label="비활성" code="disabled">
          <ChoiceInput id={id} disabled />
        </VariationExample>
        <VariationExample label="로딩" code="loading">
          <ChoiceInput id={id} loading />
        </VariationExample>
        <VariationExample label="읽기 전용" code="readOnly">
          <ChoiceInput id={id} readOnly />
        </VariationExample>
        <VariationExample label="오류" code="Field error">
          <ChoiceInput id={id} invalid />
        </VariationExample>
      </VariationGroup>
    </>
  )
}

function RadioExample(
  props: Pick<RadioGroupProps, 'size' | 'disabled' | 'readOnly' | 'aria-invalid'>,
) {
  const { t } = useI18n()
  const name = useId()
  return (
    <RadioGroup
      {...props}
      name={name}
      aria-label={t('프로젝트 접근 권한')}
      defaultValue="team"
      items={[
        { value: 'personal', label: t('나만 보기') },
        { value: 'team', label: t('팀과 공유') },
        { value: 'public', label: t('전체 공개'), disabled: true },
      ]}
    />
  )
}

export function ChoiceVariations({ id }: { id: ComponentId }) {
  const { t } = useI18n()
  if (id === 'select' || id === 'multi-select' || id === 'combobox')
    return <ChoiceInputVariations id={id} />

  if (id === 'checkbox' || id === 'switch') {
    const Control = id === 'checkbox' ? Checkbox : Switch
    const label = t('이메일 알림 받기')
    return (
      <>
        <FormSizeExamples>
          {(size) => (
            <Control
              size={size}
              label={label}
              description={t('프로젝트의 새로운 소식을 알려드려요.')}
              defaultChecked
            />
          )}
        </FormSizeExamples>
        <VariationGroup title="상태 비교">
          <VariationExample label="기본" code="defaultChecked={false}">
            <Control label={label} />
          </VariationExample>
          <VariationExample label="선택됨" code="defaultChecked">
            <Control label={label} defaultChecked />
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <Control label={label} defaultChecked disabled />
          </VariationExample>
          <VariationExample label="로딩" code="loading">
            <Control label={label} defaultChecked loading />
          </VariationExample>
          <VariationExample label="읽기 전용" code="readOnly">
            <Control label={label} defaultChecked readOnly />
          </VariationExample>
          <VariationExample label="오류" code="aria-invalid">
            <Control label={label} aria-invalid />
          </VariationExample>
        </VariationGroup>
      </>
    )
  }

  if (id === 'radio-group')
    return (
      <>
        <FormSizeExamples>{(size) => <RadioExample size={size} />}</FormSizeExamples>
        <VariationGroup title="상태 비교">
          <VariationExample label="기본">
            <RadioExample />
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <RadioExample disabled />
          </VariationExample>
          <VariationExample label="읽기 전용" code="readOnly">
            <RadioExample readOnly />
          </VariationExample>
          <VariationExample label="오류" code="aria-invalid">
            <RadioExample aria-invalid />
          </VariationExample>
        </VariationGroup>
      </>
    )

  if (id === 'slider')
    return (
      <>
        <FormSizeExamples>
          {(size) => <Slider size={size} label={t('볼륨')} defaultValue={60} />}
        </FormSizeExamples>
        <VariationGroup title="상태 비교">
          <VariationExample label="기본" code="step={1}">
            <Slider label={t('볼륨')} defaultValue={60} />
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <Slider label={t('볼륨')} defaultValue={60} disabled />
          </VariationExample>
          <VariationExample label="오류" code="aria-invalid">
            <Slider label={t('볼륨')} defaultValue={100} aria-invalid />
          </VariationExample>
          <VariationExample label="단계" code="min={0} max={100} step={25}">
            <Slider label={t('볼륨')} defaultValue={50} step={25} />
          </VariationExample>
          <VariationExample label="값 숨기기" code="showValue={false}">
            <Slider label={t('볼륨')} defaultValue={60} showValue={false} />
          </VariationExample>
        </VariationGroup>
      </>
    )

  if (id === 'toggle-group') {
    const items = [
      { value: 'day', label: t('일간') },
      { value: 'week', label: t('주간') },
      { value: 'month', label: t('월간') },
    ]
    const props = { items, 'aria-label': t('활동 집계 기간') }
    return (
      <>
        <FormSizeExamples>
          {(size) => (
            <ToggleGroup {...props} size={size} defaultValue={['week']} layout="segmented" />
          )}
        </FormSizeExamples>
        <VariationGroup title="형태 비교">
          <VariationExample label="기본" code={'type="single" preventEmpty'}>
            <ToggleGroup {...props} defaultValue={['week']} preventEmpty />
          </VariationExample>
          <VariationExample label="다중 선택" code={'type="multiple"'}>
            <ToggleGroup {...props} type="multiple" defaultValue={['day', 'week']} />
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <ToggleGroup {...props} defaultValue={['week']} disabled />
          </VariationExample>
        </VariationGroup>
      </>
    )
  }
  return null
}
