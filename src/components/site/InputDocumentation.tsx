import { useI18n } from '../../i18n'
import { useId, type ReactNode } from 'react'
import { DocumentationCodeBlock } from './DocumentationCodeBlock'
import { Input, type InputProps } from '../ui/input'
import { Tabs } from '../ui/tabs'
import { InputVariationsDemo } from '../demos/InputVariationsDemo'
import { ComponentDocumentationLayout } from './ComponentDocumentationLayout'
import { ComponentInstallation } from './ComponentInstallation'
import type { ComponentPage } from '../catalog/component-pages'
import { sizes, VariationExample, VariationGroup } from './variations/VariationLayout'

const sections = [
  { id: 'input-preview', label: '미리보기' },
  { id: 'input-sizes', label: '크기 비교' },
  { id: 'input-variations', label: '입력 베리에이션' },
  { id: 'input-installation', label: '설치' },
  { id: 'input-usage', label: '사용법' },
  { id: 'input-states', label: '상태' },
  { id: 'input-props', label: 'Props' },
] as const

const previewCode = `import { Input } from 'moru-ui'

export function EmailInput() {
  return (
    <label>
      이메일
      <Input
        name="email"
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
      />
    </label>
  )
}`

const usageCode = `import { useState } from 'react'
import { Input } from 'moru-ui'

export function ProjectNameInput() {
  const [name, setName] = useState('')

  return (
    <label>
      프로젝트 이름
      <Input
        name="projectName"
        value={name}
        onValueChange={setName}
        placeholder="새 프로젝트"
      />
    </label>
  )
}`

const formattedUsageCode = `import { useState } from 'react'
import { Field, FormattedInput, validateFormattedInput } from 'moru-ui'

export function CardNumberField() {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const error = touched ? validateFormattedInput('card-number', value) : null

  return (
    <Field label="카드번호" error={error ?? undefined}>
      <FormattedInput
        format="card-number"
        name="cardNumber"
        value={value}
        onValueChange={setValue}
        onBlur={() => setTouched(true)}
        placeholder="4242 4242 4242 4242"
      />
    </Field>
  )
}`

const stateExamples: ReadonlyArray<{
  label: string
  description?: string
  input: InputProps
}> = [
  { label: '기본', input: { type: 'email', placeholder: 'name@example.com' } },
  {
    label: '오류',
    description: '이메일 주소 형식을 확인해 주세요.',
    input: { type: 'email', defaultValue: 'name@', 'aria-invalid': true },
  },
  { label: '비활성', input: { type: 'email', defaultValue: 'name@example.com', disabled: true } },
  {
    label: '로딩',
    description: '이메일 주소를 확인하고 있어요.',
    input: { type: 'email', defaultValue: 'name@example.com', loading: true },
  },
]

const props: ReadonlyArray<{
  name: keyof InputProps
  type: string
  initial?: string
  description: string
}> = [
  {
    name: 'type',
    type: 'HTMLInputTypeAttribute',
    initial: 'text',
    description: '텍스트, 이메일 등 입력값의 형식을 지정합니다.',
  },
  {
    name: 'size',
    type: 'sm | md | lg',
    initial: 'md',
    description: '입력창의 높이와 좌우 여백을 조정합니다.',
  },
  {
    name: 'value',
    type: 'string | number | readonly string[]',
    description: '부모 컴포넌트에서 관리하는 현재 값입니다.',
  },
  {
    name: 'defaultValue',
    type: 'string | number | readonly string[]',
    description: 'Input이 직접 값을 관리할 때 지정하는 초기값입니다.',
  },
  {
    name: 'onValueChange',
    type: '(value, eventDetails) => void',
    description: '값이 바뀌면 새 문자열과 이벤트 정보를 전달합니다.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    initial: 'false',
    description: '입력과 포커스를 비활성화합니다.',
  },
  {
    name: 'loading',
    type: 'boolean',
    initial: 'false',
    description: '진행 표시를 보여주고 처리가 끝날 때까지 입력을 잠급니다.',
  },
  {
    name: 'aria-invalid',
    type: 'boolean | grammar | spelling',
    description: '유효하지 않은 입력임을 보조 기술에 알립니다.',
  },
]

function InputExample({ input, description }: { input: InputProps; description?: string }) {
  const { t } = useI18n()
  const id = useId()
  const descriptionId = description ? `${id}-description` : undefined

  return (
    <div className="moru-component-doc__example">
      <label htmlFor={id}>{t('이메일')}</label>
      <Input {...input} id={id} aria-describedby={descriptionId} />
      {description && (
        <p id={descriptionId} data-invalid={input['aria-invalid'] === true || undefined}>
          {t(description)}
        </p>
      )}
    </div>
  )
}

export function InputDocumentation({
  onOpenStudio,
  onNavigate,
  aiAction,
}: {
  onOpenStudio: () => void
  onNavigate: (page: ComponentPage) => void
  aiAction?: ReactNode
}) {
  const { t } = useI18n()
  return (
    <ComponentDocumentationLayout
      id="input"
      description="한 줄 입력부터 결제·연락처·네트워크 정보까지, 목적에 맞는 입력 경험을 구성합니다."
      sections={sections}
      onOpenStudio={onOpenStudio}
      onNavigate={onNavigate}
      aiAction={aiAction}
    >
      <section id="input-preview" tabIndex={-1} aria-label={t('미리보기')}>
        <Tabs
          className="moru-component-doc__tabs"
          aria-label={t('Input 예제 보기')}
          defaultValue="preview"
          items={[
            {
              value: 'preview',
              label: t('미리보기'),
              content: (
                <div className="moru-component-doc__preview">
                  <InputExample
                    input={{
                      name: 'email',
                      type: 'email',
                      autoComplete: 'email',
                      placeholder: 'name@example.com',
                    }}
                  />
                </div>
              ),
            },
            {
              value: 'code',
              label: t('코드'),
              content: (
                <DocumentationCodeBlock
                  value={previewCode}
                  filename="email-input.tsx"
                  language="tsx"
                  defaultWrap
                />
              ),
            },
          ]}
        />
      </section>

      <section aria-labelledby="input-sizes">
        <h2 id="input-sizes" tabIndex={-1}>
          {t('크기 비교')}
        </h2>
        <p>
          {t(
            '같은 디자인 토큰에서 크기와 상태를 비교하세요. 각 예제는 컴포넌트가 지원하는 실제 옵션을 사용합니다.',
          )}
        </p>
        <VariationGroup title="Small · Medium · Large">
          {sizes.map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
              <InputExample
                input={{ name: `size-${size}`, size, placeholder: 'name@example.com' }}
              />
            </VariationExample>
          ))}
        </VariationGroup>
      </section>
      <section aria-labelledby="input-variations">
        <h2 id="input-variations" tabIndex={-1}>
          {t('입력 베리에이션')}
        </h2>
        <p>{t('12가지 입력을 직접 편집하고, 예시 채우기와 입력 확인으로 동작을 비교하세요.')}</p>
        <InputVariationsDemo />
      </section>

      <section aria-labelledby="input-installation">
        <h2 id="input-installation" tabIndex={-1}>
          {t('설치')}
        </h2>
        <ComponentInstallation />
      </section>

      <section aria-labelledby="input-usage">
        <h2 id="input-usage" tabIndex={-1}>
          {t('사용법')}
        </h2>
        <p>
          {t(
            '입력창에는 label로 이름을 붙입니다. 입력값을 다른 UI에서 사용하려면 value와 onValueChange를 연결하세요.',
          )}
        </p>
        <DocumentationCodeBlock
          value={usageCode}
          filename="project-name-input.tsx"
          language="tsx"
          defaultWrap
        />
        <h3>{t('자동 서식과 선택적 검증')}</h3>
        <p>
          {t(
            '기존 Input의 사용법은 유지됩니다. FormattedInput의 value와 onValueChange, 폼 제출값은 화면에 표시된 문자열입니다.',
          )}
        </p>
        <p>
          {t(
            '서식이 적용된 값은 onValueChange로 받으세요. onChange는 브라우저의 기본 입력 이벤트만 전달하므로 구분자 삭제 같은 서식 동작에는 호출되지 않을 수 있습니다.',
          )}
        </p>
        <DocumentationCodeBlock
          value={formattedUsageCode}
          filename="card-number-field.tsx"
          language="tsx"
          defaultWrap
        />
        <p>
          {t(
            'format으로 입력 목적을 지정하고, validateFormattedInput으로 필요한 시점에 형식을 확인하세요. 빈 값의 필수 여부는 required 또는 폼에서 별도로 처리합니다.',
          )}
        </p>
        <p>
          {t(
            '형식 검사는 실제 카드 승인, 연락처 소유권 또는 주소의 연결 가능 여부를 확인하지 않습니다.',
          )}
        </p>
      </section>

      <section aria-labelledby="input-states">
        <h2 id="input-states" tabIndex={-1}>
          {t('상태')}
        </h2>
        <div className="moru-component-doc__states">
          {stateExamples.map(({ label, input, description }) => (
            <div className="moru-component-doc__state" key={label}>
              <h3>{t(label)}</h3>
              <InputExample input={input} description={description} />
            </div>
          ))}
        </div>
        <p>
          {t(
            '오류 메시지는 aria-describedby로 입력창에 연결하고 aria-invalid에 오류 상태를 전달하세요.',
          )}
        </p>
      </section>

      <section aria-labelledby="input-props">
        <h2 id="input-props" tabIndex={-1}>
          Props
        </h2>
        <p>
          {t(
            '아래 옵션과 함께 name, required, autoComplete 같은 HTML 입력 속성을 사용할 수 있습니다.',
          )}
        </p>
        <table className="moru-component-doc__props" aria-label={t('Input 주요 속성')}>
          <thead>
            <tr>
              <th scope="col">Prop</th>
              <th scope="col">{t('타입 · 기본값')}</th>
              <th scope="col">{t('설명')}</th>
            </tr>
          </thead>
          <tbody>
            {props.map(({ name, type, initial, description }) => (
              <tr key={name}>
                <th scope="row">
                  <code>{name}</code>
                </th>
                <td>
                  <code>{type}</code>
                  {initial && (
                    <small>
                      {t('기본값')}
                      <code>{initial}</code>
                    </small>
                  )}
                </td>
                <td>{t(description)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </ComponentDocumentationLayout>
  )
}
