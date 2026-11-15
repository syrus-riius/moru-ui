import { useId, useState } from 'react'
import { Mail, Search, X } from 'lucide-react'
import { useI18n } from '../../../../i18n'
import type { ComponentId } from '../../../catalog/component-catalog'
import { Field } from '../../../ui/field'
import { FileInput } from '../../../ui/file-input'
import { Input } from '../../../ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from '../../../ui/input-group'
import { InputOTP } from '../../../ui/input-otp'
import { Label } from '../../../ui/label'
import { NativeSelect } from '../../../ui/native-select'
import { NumberInput } from '../../../ui/number-input'
import { PasswordInput } from '../../../ui/password-input'
import { Textarea } from '../../../ui/textarea'
import { VariationExample, VariationGroup } from '../VariationLayout'
import { FormSizeExamples, type ControlSize } from './FormVariationLayout'

type TextControlId =
  | 'textarea'
  | 'number-input'
  | 'password-input'
  | 'native-select'
  | 'file-input'
  | 'input-otp'
  | 'input-group'
type ControlState = 'default' | 'disabled' | 'loading' | 'readOnly' | 'error'

function TextControl({
  id,
  size = 'md',
  state = 'default',
}: {
  id: TextControlId
  size?: ControlSize
  state?: ControlState
}) {
  const { t } = useI18n()
  const common = {
    size,
    disabled: state === 'disabled',
    loading: state === 'loading',
    readOnly: state === 'readOnly',
  }
  const labels: Record<TextControlId, string> = {
    textarea: '메시지',
    'number-input': '수량',
    'password-input': '비밀번호',
    'native-select': '팀',
    'file-input': '파일 첨부',
    'input-otp': '인증번호',
    'input-group': '이메일',
  }
  return (
    <Field
      label={t(labels[id])}
      error={state === 'error' ? t('입력 내용을 확인해 주세요.') : undefined}
    >
      {id === 'textarea' && <Textarea {...common} defaultValue={t('새로운 프로젝트')} rows={3} />}
      {id === 'number-input' && <NumberInput {...common} defaultValue={3} min={0} max={99} />}
      {id === 'password-input' && (
        <PasswordInput {...common} defaultValue="Moru2026!" autoComplete="off" />
      )}
      {id === 'native-select' && (
        <NativeSelect
          size={size}
          disabled={common.disabled}
          loading={common.loading}
          defaultValue="design"
          items={[
            { value: 'design', label: t('디자인') },
            { value: 'development', label: t('개발') },
            { value: 'disabled', label: t('비활성'), disabled: true },
          ]}
        />
      )}
      {id === 'file-input' && (
        <FileInput
          size={size}
          disabled={common.disabled}
          loading={common.loading}
          accept="image/*,.pdf"
          maxSize={5 * 1024 * 1024}
        />
      )}
      {id === 'input-otp' && (
        <InputOTP {...common} length={6} defaultValue={state === 'default' ? '123' : '123456'} />
      )}
      {id === 'input-group' && (
        <InputGroup>
          <InputGroupAddon>
            <Mail size={16} aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput {...common} type="email" placeholder="hello@moru.design" />
        </InputGroup>
      )}
    </Field>
  )
}

function SearchGroupExample() {
  const { t } = useI18n()
  const [value, setValue] = useState('Moru')
  return (
    <Field label={t('검색')}>
      <InputGroup>
        <InputGroupAddon>
          <Search size={16} aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t('검색')}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            disabled={!value}
            aria-label={t('지우기')}
            onClick={() => setValue('')}
          >
            <X size={16} aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}

function MessageGroupExample() {
  const { t } = useI18n()
  const [value, setValue] = useState('')
  return (
    <Field label={t('메시지')}>
      <InputGroup>
        <InputGroupTextarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={200}
          placeholder={t('메시지를 남겨 보세요.')}
        />
        <InputGroupAddon align="block-end">
          <span>{value.length}/200</span>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}

function StandaloneLabel({
  required = false,
  disabled = false,
}: {
  required?: boolean
  disabled?: boolean
}) {
  const { t } = useI18n()
  const id = useId()
  return (
    <>
      <Label htmlFor={id}>
        {t('이메일')}
        {required ? ` · ${t('필수')}` : ''}
      </Label>
      <Input
        id={id}
        type="email"
        placeholder="hello@moru.design"
        required={required}
        disabled={disabled}
      />
    </>
  )
}

export function TextControlVariations({ id }: { id: ComponentId }) {
  const { t } = useI18n()
  if (id === 'field')
    return (
      <VariationGroup title="형태 비교">
        <VariationExample label="기본" code="label">
          <Field label={t('프로젝트 이름')}>
            <Input placeholder={t('새로운 프로젝트')} />
          </Field>
        </VariationExample>
        <VariationExample label="도움말" code="description">
          <Field label={t('프로젝트 이름')} description={t('나중에 언제든 변경할 수 있어요.')}>
            <Input placeholder={t('새로운 프로젝트')} />
          </Field>
        </VariationExample>
        <VariationExample label="오류" code="error">
          <Field label={t('프로젝트 이름')} error={t('프로젝트 이름을 입력해 주세요.')}>
            <Input />
          </Field>
        </VariationExample>
        <VariationExample label="비활성" code="Input disabled">
          <Field label={t('프로젝트 이름')}>
            <Input defaultValue={t('새로운 프로젝트')} disabled />
          </Field>
        </VariationExample>
        <VariationExample label="로딩" code="Input loading">
          <Field label={t('프로젝트 이름')}>
            <Input defaultValue={t('새로운 프로젝트')} loading />
          </Field>
        </VariationExample>
        <VariationExample label="여러 줄 입력" code="Textarea">
          <Field label={t('메시지')} description={t('좋은 이야기는 작은 한 줄에서 시작돼요.')}>
            <Textarea placeholder={t('메시지를 남겨 보세요.')} />
          </Field>
        </VariationExample>
      </VariationGroup>
    )

  if (id === 'label')
    return (
      <VariationGroup title="형태 비교">
        <VariationExample label="기본" code="htmlFor">
          <StandaloneLabel />
        </VariationExample>
        <VariationExample label="필수" code="Input required">
          <StandaloneLabel required />
        </VariationExample>
        <VariationExample label="비활성" code="Input disabled">
          <StandaloneLabel disabled />
        </VariationExample>
      </VariationGroup>
    )

  if (
    id !== 'textarea' &&
    id !== 'number-input' &&
    id !== 'password-input' &&
    id !== 'native-select' &&
    id !== 'file-input' &&
    id !== 'input-otp' &&
    id !== 'input-group'
  )
    return null
  const wide = id === 'input-otp' || id === 'file-input'
  return (
    <>
      <FormSizeExamples wide={wide}>
        {(size) => <TextControl id={id} size={size} />}
      </FormSizeExamples>
      <VariationGroup title="상태 비교" wide={wide}>
        <VariationExample label="기본">
          <TextControl id={id} />
        </VariationExample>
        <VariationExample label="비활성" code="disabled">
          <TextControl id={id} state="disabled" />
        </VariationExample>
        <VariationExample label="로딩" code="loading">
          <TextControl id={id} state="loading" />
        </VariationExample>
        <VariationExample label="오류" code="Field error">
          <TextControl id={id} state="error" />
        </VariationExample>
        {id !== 'native-select' && id !== 'file-input' && (
          <VariationExample label="읽기 전용" code="readOnly">
            <TextControl id={id} state="readOnly" />
          </VariationExample>
        )}
      </VariationGroup>
      {id === 'input-otp' && (
        <VariationGroup title="형태 비교" wide>
          <VariationExample label="PIN" code="length={4}">
            <Field label={t('인증번호')}>
              <InputOTP length={4} defaultValue="12" />
            </Field>
          </VariationExample>
          <VariationExample label="OTP" code="length={6}">
            <Field label={t('6자리 인증번호')}>
              <InputOTP length={6} defaultValue="123456" />
            </Field>
          </VariationExample>
        </VariationGroup>
      )}
      {id === 'number-input' && (
        <VariationGroup title="형태 비교">
          <VariationExample label="통화" code={'format={{ style: "currency", currency: "USD" }}'}>
            <Field label={t('금액')}>
              <NumberInput
                defaultValue={49.99}
                min={0}
                precision={2}
                step={0.01}
                format={{ style: 'currency', currency: 'USD' }}
              />
            </Field>
          </VariationExample>
          <VariationExample label="퍼센트" code={'format={{ style: "percent" }}'}>
            <Field label={t('진행률')}>
              <NumberInput
                defaultValue={0.75}
                min={0}
                max={1}
                step={0.05}
                format={{ style: 'percent' }}
              />
            </Field>
          </VariationExample>
          <VariationExample label="기본" code="hideControls">
            <Field label={t('수량')}>
              <NumberInput defaultValue={24} min={0} hideControls />
            </Field>
          </VariationExample>
        </VariationGroup>
      )}
      {id === 'password-input' && (
        <VariationGroup title="형태 비교">
          <VariationExample label="비밀번호" code="defaultVisible={false}">
            <Field label={t('비밀번호')}>
              <PasswordInput defaultValue="Moru2026!" autoComplete="off" />
            </Field>
          </VariationExample>
          <VariationExample label="비밀번호 표시" code="defaultVisible">
            <Field label={t('비밀번호')}>
              <PasswordInput defaultValue="Moru2026!" defaultVisible autoComplete="off" />
            </Field>
          </VariationExample>
        </VariationGroup>
      )}
      {id === 'input-group' && (
        <VariationGroup title="형태 비교" wide>
          <VariationExample label="검색" code="InputGroupButton">
            <SearchGroupExample />
          </VariationExample>
          <VariationExample label="URL" code={'align="inline-start"'}>
            <Field label="URL">
              <InputGroup>
                <InputGroupAddon>https://</InputGroupAddon>
                <InputGroupInput placeholder="moru.design" />
              </InputGroup>
            </Field>
          </VariationExample>
          <VariationExample label="메시지" code={'align="block-end"'}>
            <MessageGroupExample />
          </VariationExample>
        </VariationGroup>
      )}
      {id === 'file-input' && (
        <VariationGroup title="형태 비교" wide>
          <VariationExample label="파일 첨부" code={'accept="image/*,.pdf" multiple maxFiles={3}'}>
            <Field
              label={t('파일 첨부')}
              description={t('파일 이름과 크기만 이 화면에 표시하며, 서버로 업로드하지 않아요.')}
            >
              <FileInput accept="image/*,.pdf" multiple maxFiles={3} maxSize={5 * 1024 * 1024} />
            </Field>
          </VariationExample>
        </VariationGroup>
      )}
    </>
  )
}
