import { useState } from 'react'
import { useI18n } from '../../../../i18n'
import type { ComponentId } from '../../../catalog/component-catalog'
import { Button } from '../../../ui/button'
import { Modal, type ModalProps } from '../../../ui/modal'
import { Menu } from '../../../ui/menu'
import { Popover } from '../../../ui/popover'
import { Tooltip } from '../../../ui/tooltip'
import { AlertDialog } from '../../../ui/alert-dialog'
import { Sheet } from '../../../ui/sheet'
import { ContextMenu } from '../../../ui/context-menu'
import { Drawer } from '../../../ui/drawer'
import { HoverCard } from '../../../ui/hover-card'
import { Input } from '../../../ui/input'
import { Field } from '../../../ui/field'
import { sizes, VariationExample, VariationGroup } from '../VariationLayout'

function ProjectName() {
  const { t } = useI18n()
  return (
    <Field label={t('프로젝트 이름')}>
      <Input defaultValue="Moru UI" />
    </Field>
  )
}

function ModalExample({
  size = 'md',
  variant = 'default',
  disabled = false,
}: {
  size?: ModalProps['size']
  variant?: ModalProps['variant']
  disabled?: boolean
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  return (
    <Modal
      size={size}
      variant={variant}
      open={open}
      onOpenChange={setOpen}
      title={`${t('Modal')} · ${size.toUpperCase()}`}
      description={t('변경 사항을 저장할까요?')}
      trigger={
        <Button variant="secondary" disabled={disabled}>
          {t('열기')}
        </Button>
      }
      footer={
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={() => setOpen(false)}
        >
          {t('확인')}
        </Button>
      }
    >
      {variant === 'form' ? (
        <ProjectName />
      ) : (
        <p>{t('Tab으로 이동하고 Escape로 닫을 수 있어요.')}</p>
      )}
    </Modal>
  )
}

function MenuExample({
  size = 'md',
  disabled = false,
  withDisabledItem = false,
}: {
  size?: (typeof sizes)[number]
  disabled?: boolean
  withDisabledItem?: boolean
}) {
  const { t } = useI18n()
  const [selected, setSelected] = useState('')
  return (
    <>
      <Menu
        size={size}
        disabled={disabled}
        trigger={
          <Button size={size} variant="secondary">
            {t('메뉴 열기')}
          </Button>
        }
        items={[
          { label: t('편집'), onClick: () => setSelected(t('편집')) },
          { label: t('복사'), disabled: withDisabledItem, onClick: () => setSelected(t('복사')) },
          { label: t('삭제'), destructive: true, onClick: () => setSelected(t('삭제')) },
        ]}
      />
      <span role="status">{selected}</span>
    </>
  )
}

function ContextMenuExample({
  size = 'md',
  disabled = false,
}: {
  size?: (typeof sizes)[number]
  disabled?: boolean
}) {
  const { t } = useI18n()
  const [selected, setSelected] = useState('')
  return (
    <>
      <ContextMenu
        size={size}
        disabled={disabled}
        aria-label={`${t('컨텍스트 메뉴 영역')} ${size}`}
        items={[
          { id: 'copy', label: t('복사'), shortcut: '⌘C', onSelect: () => setSelected(t('복사')) },
          {
            id: 'more',
            label: t('더 보기'),
            children: [
              { id: 'edit', label: t('편집'), onSelect: () => setSelected(t('편집')) },
              {
                id: 'delete',
                label: t('삭제'),
                destructive: true,
                onSelect: () => setSelected(t('삭제')),
              },
            ],
          },
          { id: 'disabled', label: t('비활성'), disabled: true },
        ]}
      >
        <p>{t('오른쪽 클릭')}</p>
        <KbdHint />
      </ContextMenu>
      <span role="status">{selected}</span>
    </>
  )
}

function KbdHint() {
  return <small>Shift + F10</small>
}

function AlertExample({ mode }: { mode: 'default' | 'danger' | 'async' | 'error' | 'disabled' }) {
  const { t } = useI18n()
  const [complete, setComplete] = useState(false)
  return (
    <>
      <AlertDialog
        title={t(mode === 'danger' ? '삭제할까요?' : '변경 사항을 저장할까요?')}
        destructive={mode === 'danger'}
        description={t(
          mode === 'async' ? '확인 후 잠시 기다려 주세요.' : '작업을 계속하려면 확인해 주세요.',
        )}
        trigger={
          <Button
            disabled={mode === 'disabled'}
            variant={mode === 'danger' ? 'danger' : 'secondary'}
          >
            {t('열기')}
          </Button>
        }
        onConfirm={async () => {
          if (mode === 'async') await new Promise<void>((resolve) => setTimeout(resolve, 1200))
          if (mode === 'error') throw new Error(t('저장하지 못했어요. 다시 시도해 주세요.'))
          setComplete(true)
        }}
      />
      <span role="status">{complete ? t('완료') : ''}</span>
    </>
  )
}

export function OverlayVariations({ id }: { id: ComponentId }) {
  const { t } = useI18n()
  if (id === 'dialog')
    return (
      <>
        <VariationGroup title="크기">
          {([...sizes, 'full'] as const).map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
              <ModalExample size={size} />
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="베리에이션">
          {(['default', 'confirmation', 'form', 'success', 'danger'] as const).map((variant) => (
            <VariationExample key={variant} label={variant} code={`variant="${variant}"`}>
              <ModalExample variant={variant} />
            </VariationExample>
          ))}
          <VariationExample label="트리거 비활성" code="trigger={<Button disabled />}">
            <ModalExample disabled />
          </VariationExample>
        </VariationGroup>
      </>
    )
  if (id === 'menu')
    return (
      <>
        <VariationGroup title="크기">
          {sizes.map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
              <MenuExample size={size} />
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="상태">
          <VariationExample label="기본">
            <MenuExample />
          </VariationExample>
          <VariationExample label="항목 비활성" code="items[].disabled">
            <MenuExample withDisabledItem />
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <MenuExample disabled />
          </VariationExample>
        </VariationGroup>
      </>
    )
  if (id === 'popover')
    return (
      <>
        <VariationGroup title="위치">
          {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
            <VariationExample key={side} label={side} code={`side="${side}"`}>
              <Popover
                side={side}
                title={t('빠른 설정')}
                trigger={<Button variant="secondary">{t('열기')}</Button>}
              >
                <ProjectName />
              </Popover>
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="베리에이션">
          {(['start', 'center', 'end'] as const).map((align) => (
            <VariationExample key={align} label={align} code={`align="${align}"`}>
              <Popover
                align={align}
                title={t('추가 정보')}
                trigger={<Button variant="secondary">{t('열기')}</Button>}
              >
                <p>{t('프로젝트 설정을 관리하세요.')}</p>
              </Popover>
            </VariationExample>
          ))}
          <VariationExample label="트리거 비활성" code="trigger={<Button disabled />}">
            <Popover trigger={<Button disabled>{t('열기')}</Button>} title={t('추가 정보')}>
              <ProjectName />
            </Popover>
          </VariationExample>
        </VariationGroup>
      </>
    )
  if (id === 'tooltip')
    return (
      <>
        <VariationGroup title="위치">
          {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
            <VariationExample key={side} label={side} code={`side="${side}"`}>
              <Tooltip side={side} trigger={<Button variant="secondary">{t('도움말')}</Button>}>
                {t('변경 사항을 저장합니다.')}
              </Tooltip>
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="베리에이션">
          <VariationExample label="즉시" code="delay={0}">
            <Tooltip delay={0} trigger={<Button variant="secondary">{t('도움말')}</Button>}>
              {t('추가 정보')}
            </Tooltip>
          </VariationExample>
          <VariationExample label="지연" code="delay={700}">
            <Tooltip delay={700} trigger={<Button variant="secondary">{t('도움말')}</Button>}>
              {t('추가 정보')}
            </Tooltip>
          </VariationExample>
        </VariationGroup>
      </>
    )
  if (id === 'alert-dialog')
    return (
      <VariationGroup title="상태">
        <VariationExample label="기본">
          <AlertExample mode="default" />
        </VariationExample>
        <VariationExample label="위험" code="destructive">
          <AlertExample mode="danger" />
        </VariationExample>
        <VariationExample label="로딩" code="onConfirm={async () => …}">
          <AlertExample mode="async" />
        </VariationExample>
        <VariationExample label="오류" code="onConfirm={async () => { throw … }}">
          <AlertExample mode="error" />
        </VariationExample>
        <VariationExample label="트리거 비활성" code="trigger={<Button disabled />}">
          <AlertExample mode="disabled" />
        </VariationExample>
      </VariationGroup>
    )
  if (id === 'sheet')
    return (
      <VariationGroup title="위치">
        {(['left', 'right', 'bottom'] as const).map((side) => (
          <VariationExample key={side} label={side} code={`side="${side}"`}>
            <Sheet
              side={side}
              title={t('프로젝트 설정')}
              trigger={<Button variant="secondary">{t('열기')}</Button>}
            >
              <ProjectName />
            </Sheet>
          </VariationExample>
        ))}
        <VariationExample label="트리거 비활성" code="trigger={<Button disabled />}">
          <Sheet title={t('설정')} trigger={<Button disabled>{t('열기')}</Button>}>
            <ProjectName />
          </Sheet>
        </VariationExample>
      </VariationGroup>
    )
  if (id === 'context-menu')
    return (
      <>
        <VariationGroup title="크기">
          {sizes.map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
              <ContextMenuExample size={size} />
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="상태">
          <VariationExample label="기본">
            <ContextMenuExample />
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <ContextMenuExample disabled />
          </VariationExample>
        </VariationGroup>
      </>
    )
  if (id === 'drawer')
    return (
      <>
        <VariationGroup title="크기">
          {sizes.map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
              <Drawer
                size={size}
                title={`${t('Drawer')} · ${size.toUpperCase()}`}
                trigger={<Button variant="secondary">{t('열기')}</Button>}
              >
                <ProjectName />
              </Drawer>
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="상태">
          <VariationExample label="기본">
            <Drawer title={t('설정')} trigger={<Button variant="secondary">{t('열기')}</Button>}>
              <ProjectName />
            </Drawer>
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <Drawer
              disabled
              title={t('설정')}
              trigger={<Button variant="secondary">{t('열기')}</Button>}
            >
              <ProjectName />
            </Drawer>
          </VariationExample>
        </VariationGroup>
      </>
    )
  if (id === 'hover-card')
    return (
      <>
        <VariationGroup title="크기">
          {sizes.map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
              <HoverCard
                size={size}
                title={`Moru UI · ${size.toUpperCase()}`}
                description={t('디자인 시스템')}
                trigger={<Button variant="ghost">Moru UI</Button>}
              >
                <p>{t('프로젝트 설정을 관리하세요.')}</p>
              </HoverCard>
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="베리에이션">
          <VariationExample label="top" code={'side="top"'}>
            <HoverCard
              side="top"
              title="Moru UI"
              trigger={<Button variant="ghost">Moru UI</Button>}
            >
              <p>{t('디자인 시스템')}</p>
            </HoverCard>
          </VariationExample>
          <VariationExample label="즉시" code="delay={0}">
            <HoverCard delay={0} title="Moru UI" trigger={<Button variant="ghost">Moru UI</Button>}>
              <p>{t('디자인 시스템')}</p>
            </HoverCard>
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <HoverCard
              disabled
              title="Moru UI"
              trigger={
                <Button disabled variant="ghost">
                  Moru UI
                </Button>
              }
            >
              <p>{t('디자인 시스템')}</p>
            </HoverCard>
          </VariationExample>
        </VariationGroup>
      </>
    )
  return null
}
