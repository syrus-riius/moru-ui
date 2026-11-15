import { useState } from 'react'
import { Bold, Plus } from 'lucide-react'
import { useI18n } from '../../../../i18n'
import type { ComponentId } from '../../../catalog/component-catalog'
import { Button } from '../../../ui/button'
import { ButtonGroup } from '../../../ui/button-group'
import { Command } from '../../../ui/command'
import { Kbd, KbdGroup } from '../../../ui/kbd'
import { Toggle } from '../../../ui/toggle'
import { sizes, VariationExample, VariationGroup } from '../VariationLayout'

function CommandExample({
  grouped = false,
  empty = false,
  disabled = false,
}: {
  grouped?: boolean
  empty?: boolean
  disabled?: boolean
}) {
  const { t } = useI18n()
  const [selected, setSelected] = useState('')
  return (
    <>
      <Command
        trigger={
          <Button variant="secondary" disabled={disabled}>
            {t('빠른 작업')}
          </Button>
        }
        items={
          empty
            ? []
            : [
                {
                  id: 'project',
                  label: t('새 프로젝트'),
                  group: grouped ? t('프로젝트') : undefined,
                  onSelect: () => setSelected(t('새 프로젝트')),
                },
                {
                  id: 'settings',
                  label: t('설정'),
                  group: grouped ? t('계정') : undefined,
                  onSelect: () => setSelected(t('설정')),
                },
                { id: 'unavailable', label: t('비활성'), disabled: true, onSelect: () => {} },
              ]
        }
      />
      <span role="status">{selected}</span>
    </>
  )
}

export function ActionVariations({ id }: { id: ComponentId }) {
  const { t } = useI18n()
  if (id === 'button')
    return (
      <>
        <VariationGroup title="크기">
          {sizes.map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
              <Button size={size}>
                <Plus size={16} aria-hidden="true" />
                {t('추가')}
              </Button>
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="베리에이션">
          {(['primary', 'secondary', 'ghost', 'danger'] as const).map((variant) => (
            <VariationExample key={variant} label={variant} code={`variant="${variant}"`}>
              <Button variant={variant}>{t('확인')}</Button>
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="상태">
          <VariationExample label="기본">
            <Button>{t('저장')}</Button>
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <Button disabled>{t('저장')}</Button>
          </VariationExample>
          <VariationExample label="로딩" code="loading">
            <Button loading>{t('저장')}</Button>
          </VariationExample>
        </VariationGroup>
      </>
    )
  if (id === 'command')
    return (
      <VariationGroup title="베리에이션">
        <VariationExample label="기본">
          <CommandExample />
        </VariationExample>
        <VariationExample label="그룹" code="items[].group">
          <CommandExample grouped />
        </VariationExample>
        <VariationExample label="빈 상태" code="items={[]}">
          <CommandExample empty />
        </VariationExample>
        <VariationExample label="트리거 비활성" code="trigger={<Button disabled />}">
          <CommandExample disabled />
        </VariationExample>
      </VariationGroup>
    )
  if (id === 'button-group')
    return (
      <>
        <VariationGroup title="크기" wide>
          {sizes.map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`Button size="${size}"`}>
              <ButtonGroup aria-label={`${t('편집')} ${size}`}>
                <Button size={size} variant="secondary">
                  {t('복사')}
                </Button>
                <Button size={size} variant="secondary">
                  {t('붙여넣기')}
                </Button>
              </ButtonGroup>
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="베리에이션">
          <VariationExample label="세로" code={'orientation="vertical"'}>
            <ButtonGroup orientation="vertical" aria-label={t('편집')}>
              <Button variant="secondary">{t('복사')}</Button>
              <Button variant="secondary">{t('붙여넣기')}</Button>
            </ButtonGroup>
          </VariationExample>
          <VariationExample label="비활성" code="Button disabled">
            <ButtonGroup aria-label={t('비활성')}>
              <Button disabled>{t('저장')}</Button>
              <Button disabled>{t('취소')}</Button>
            </ButtonGroup>
          </VariationExample>
          <VariationExample label="로딩" code="Button loading">
            <ButtonGroup aria-label={t('저장')}>
              <Button loading>{t('저장')}</Button>
              <Button variant="secondary" disabled>
                {t('취소')}
              </Button>
            </ButtonGroup>
          </VariationExample>
        </VariationGroup>
      </>
    )
  if (id === 'kbd')
    return (
      <VariationGroup title="베리에이션">
        <VariationExample label="기본">
          <Kbd>Esc</Kbd>
        </VariationExample>
        <VariationExample label="그룹" code="KbdGroup">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </VariationExample>
        <VariationExample label="키보드" code="KbdGroup">
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>Shift</Kbd>
            <Kbd>P</Kbd>
          </KbdGroup>
        </VariationExample>
      </VariationGroup>
    )
  if (id === 'toggle')
    return (
      <>
        <VariationGroup title="크기">
          {sizes.map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
              <Toggle size={size} aria-label={t('굵게')}>
                <Bold size={16} aria-hidden="true" />
              </Toggle>
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="상태">
          <VariationExample label="기본">
            <Toggle aria-label={t('굵게')}>
              <Bold size={16} aria-hidden="true" />
            </Toggle>
          </VariationExample>
          <VariationExample label="선택됨" code="defaultPressed">
            <Toggle defaultPressed aria-label={t('굵게')}>
              <Bold size={16} aria-hidden="true" />
            </Toggle>
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <Toggle disabled aria-label={t('굵게')}>
              <Bold size={16} aria-hidden="true" />
            </Toggle>
          </VariationExample>
          <VariationExample label="아웃라인" code={'variant="outline"'}>
            <Toggle variant="outline" aria-label={t('굵게')}>
              <Bold size={16} aria-hidden="true" />
            </Toggle>
          </VariationExample>
        </VariationGroup>
      </>
    )
  return null
}
