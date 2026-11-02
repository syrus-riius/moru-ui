import { useState } from 'react'
import { Field } from './ui/field'
import { NumberInput } from './ui/number-input'
import { PasswordInput } from './ui/password-input'
import { MultiSelect } from './ui/multi-select'
import type { EnhancedInputComponentId } from './enhanced-inputs-catalog'
import './completion-controls-demo.css'

export interface EnhancedInputsDemoProps { id: EnhancedInputComponentId; disabled: boolean; size: 'sm' | 'md' | 'lg'; onNotice?: (message: string) => void }

export function EnhancedInputsDemo({ id, disabled, size }: EnhancedInputsDemoProps) {
  const [quantity, setQuantity] = useState<number | null>(4)
  const [password, setPassword] = useState('')
  const [areas, setAreas] = useState<string[]>(['design'])
  switch (id) {
    case 'number-input': return <div className="completion-controls-stack">
      <Field label="참여 인원" description="방향키 또는 + / − 버튼으로 1명씩 조정하세요."><NumberInput size={size} disabled={disabled} value={quantity} onValueChange={setQuantity} min={1} max={20} step={1} precision={0} locale="ko-KR" name="participants" placeholder="인원 입력" /></Field>
      <Field label="예상 작업 시간" description="0.25시간씩 조절하고 소수 둘째 자리까지 표시합니다."><NumberInput size={size} disabled={disabled} defaultValue={2.5} min={0} max={24} step={0.25} precision={2} locale="ko-KR" format={{ style: 'unit', unit: 'hour', unitDisplay: 'short' }} /></Field>
      <p className="completion-controls-caption" role="status">{quantity === null ? '값을 비웠어요. 빈 입력은 0과 구분됩니다.' : `${quantity}명 참여 · 최대 20명`}</p>
    </div>
    case 'password-input': return <div className="completion-controls-stack">
      <Field label="새 비밀번호" description="8자 이상 입력하세요. 눈 아이콘으로 표시할 수 있어요." error={password.length > 0 && password.length < 8 ? '8자 이상 입력해 주세요.' : undefined}>
        <PasswordInput size={size} disabled={disabled} value={password} onValueChange={setPassword} autoComplete="new-password" name="new-password" minLength={8} placeholder="새 비밀번호 입력" />
      </Field>
      <p className="completion-controls-caption" role="status">{password.length === 0 ? '비밀번호 내용은 다른 곳에 표시하지 않아요.' : password.length >= 8 ? '길이 조건을 충족했어요.' : '길이 조건을 확인해 주세요.'}</p>
    </div>
    case 'multi-select': return <div className="completion-controls-stack">
      <Field label="프로젝트 분야" description="검색해서 최대 3개를 고르세요. 왼쪽 방향키로 선택 항목에 이동하고 Delete로 해제할 수 있어요.">
        <MultiSelect size={size} disabled={disabled} items={[
          { value: 'design', label: '디자인', description: '브랜드와 화면' },
          { value: 'develop', label: '개발', description: '제품 구현' },
          { value: 'research', label: '리서치', description: '고객 이해' },
          { value: 'content', label: '콘텐츠', description: '문구와 이야기' },
          { value: 'archive', label: '아카이브 · 선택 불가', disabled: true },
        ]} value={areas} onValueChange={setAreas} maxSelected={3} name="project-areas" />
      </Field>
    </div>
  }
}
