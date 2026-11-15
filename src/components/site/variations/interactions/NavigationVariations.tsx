import { useState } from 'react'
import { Folder, Home, Settings } from 'lucide-react'
import { useI18n } from '../../../../i18n'
import type { ComponentId } from '../../../catalog/component-catalog'
import { Tabs } from '../../../ui/tabs'
import { Pagination } from '../../../ui/pagination'
import { Breadcrumb } from '../../../ui/breadcrumb'
import { Menubar } from '../../../ui/menubar'
import { NavigationMenu } from '../../../ui/navigation-menu'
import { Sidebar } from '../../../ui/sidebar'
import { Stepper } from '../../../ui/stepper'
import { sizes, VariationExample, VariationGroup } from '../VariationLayout'

type Size = (typeof sizes)[number]

function TabsExample({
  size = 'md',
  vertical = false,
  disabledItem = false,
  automatic = false,
}: {
  size?: Size
  vertical?: boolean
  disabledItem?: boolean
  automatic?: boolean
}) {
  const { t } = useI18n()
  return (
    <Tabs
      size={size}
      orientation={vertical ? 'vertical' : 'horizontal'}
      activateOnFocus={automatic}
      aria-label={`${t('콘텐츠 보기')} ${size}`}
      items={[
        { value: 'profile', label: t('프로필'), content: <p>{t('계정 정보를 확인하세요.')}</p> },
        {
          value: 'settings',
          label: t('설정'),
          disabled: disabledItem,
          content: <p>{t('알림 설정')}</p>,
        },
      ]}
    />
  )
}

function PaginationExample({
  pages = 3,
  initialPage = 1,
  disabled = false,
  compact = false,
}: {
  pages?: number
  initialPage?: number
  disabled?: boolean
  compact?: boolean
}) {
  const { t } = useI18n()
  const [page, setPage] = useState(initialPage)
  return (
    <>
      <Pagination
        page={page}
        pageCount={pages}
        onPageChange={setPage}
        disabled={disabled}
        siblingCount={compact ? 0 : 1}
      />
      <span role="status">{t('{v0}페이지', { v0: page })}</span>
    </>
  )
}

function BreadcrumbExample({
  size = 'md',
  disabled = false,
  disabledItem = false,
}: {
  size?: Size
  disabled?: boolean
  disabledItem?: boolean
}) {
  const { t } = useI18n()
  const [level, setLevel] = useState(2)
  const items = [
    { label: t('홈'), onClick: () => setLevel(0) },
    { label: t('프로젝트'), disabled: disabledItem, onClick: () => setLevel(1) },
    { label: t('설정') },
  ]
  return (
    <>
      <Breadcrumb size={size} disabled={disabled} items={items.slice(0, level + 1)} />
      {level < 2 ? (
        <button type="button" className="text-link" onClick={() => setLevel(2)}>
          {t('초기화')}
        </button>
      ) : null}
    </>
  )
}

function MenubarExample({
  size = 'md',
  disabled = false,
  disabledItem = false,
}: {
  size?: Size
  disabled?: boolean
  disabledItem?: boolean
}) {
  const { t } = useI18n()
  const [selected, setSelected] = useState('')
  return (
    <>
      <Menubar
        size={size}
        disabled={disabled}
        menus={[
          {
            id: 'file',
            label: t('파일'),
            items: [
              {
                id: 'new',
                label: t('새 프로젝트'),
                shortcut: '⌘N',
                onSelect: () => setSelected(t('새 프로젝트')),
              },
              {
                id: 'save',
                label: t('저장'),
                shortcut: '⌘S',
                onSelect: () => setSelected(t('저장')),
              },
            ],
          },
          {
            id: 'edit',
            label: t('편집'),
            disabled: disabledItem,
            items: [
              { id: 'copy', label: t('복사'), onSelect: () => setSelected(t('복사')) },
              { id: 'paste', label: t('붙여넣기'), disabled: true },
            ],
          },
        ]}
      />
      <span role="status">{selected}</span>
    </>
  )
}

function NavigationExample({
  size = 'md',
  disabled = false,
  disabledItem = false,
}: {
  size?: Size
  disabled?: boolean
  disabledItem?: boolean
}) {
  const { t } = useI18n()
  const [selected, setSelected] = useState('home')
  return (
    <>
      <NavigationMenu
        size={size}
        disabled={disabled}
        items={[
          {
            id: 'home',
            label: t('홈'),
            active: selected === 'home',
            onSelect: () => setSelected('home'),
          },
          {
            id: 'project',
            label: t('프로젝트'),
            disabled: disabledItem,
            links: [
              {
                id: 'overview',
                label: t('개요'),
                href: '#',
                onSelect: () => setSelected('overview'),
                description: t('프로젝트 정보를 확인하세요.'),
              },
              {
                id: 'settings',
                label: t('설정'),
                href: '#',
                onSelect: () => setSelected('settings'),
              },
              { id: 'disabled', label: t('비활성'), href: '#', disabled: true },
            ],
          },
        ]}
      />
      <span role="status">
        {selected === 'home' ? t('홈') : selected === 'overview' ? t('개요') : t('설정')}
      </span>
    </>
  )
}

function SidebarExample({
  size = 'md',
  collapsed = false,
  disabled = false,
  disabledItem = false,
}: {
  size?: Size
  collapsed?: boolean
  disabled?: boolean
  disabledItem?: boolean
}) {
  const { t } = useI18n()
  return (
    <Sidebar
      title={`Moru · ${size.toUpperCase()}`}
      size={size}
      defaultCollapsed={collapsed}
      disabled={disabled}
      defaultValue="home"
      items={[
        { id: 'home', label: t('홈'), icon: <Home aria-hidden="true" /> },
        { id: 'projects', label: t('프로젝트'), badge: 3, icon: <Folder aria-hidden="true" /> },
        {
          id: 'settings',
          label: t('설정'),
          disabled: disabledItem,
          icon: <Settings aria-hidden="true" />,
        },
      ]}
    />
  )
}

function StepperExample({
  size = 'md',
  vertical = true,
  disabled = false,
  error = false,
  complete = false,
}: {
  size?: Size
  vertical?: boolean
  disabled?: boolean
  error?: boolean
  complete?: boolean
}) {
  const { t } = useI18n()
  return (
    <Stepper
      size={size}
      orientation={vertical ? 'vertical' : 'horizontal'}
      disabled={disabled}
      defaultValue={complete ? 3 : 1}
      allowNextStepsSelect
      completedContent={<p>{t('완료')}</p>}
      items={[
        { id: 'account', label: t('계정'), content: <p>{t('계정 정보를 확인하세요.')}</p> },
        {
          id: 'profile',
          label: t('프로필'),
          error,
          content: <p>{t(error ? '필수 항목을 확인해 주세요.' : '프로필을 설정하세요.')}</p>,
        },
        { id: 'confirm', label: t('확인'), content: <p>{t('변경 사항을 저장할까요?')}</p> },
      ]}
    />
  )
}

export function NavigationVariations({ id }: { id: ComponentId }) {
  if (id === 'tabs')
    return (
      <>
        <VariationGroup title="크기" wide>
          {sizes.map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
              <TabsExample size={size} />
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="베리에이션" wide>
          <VariationExample label="세로" code={'orientation="vertical"'}>
            <TabsExample vertical />
          </VariationExample>
          <VariationExample label="항목 비활성" code="items[].disabled">
            <TabsExample disabledItem />
          </VariationExample>
          <VariationExample label="자동 활성화" code="activateOnFocus">
            <TabsExample automatic />
          </VariationExample>
        </VariationGroup>
      </>
    )
  if (id === 'pagination')
    return (
      <>
        <VariationGroup title="베리에이션" wide>
          <VariationExample label="기본">
            <PaginationExample />
          </VariationExample>
          <VariationExample label="페이지 생략" code="pageCount={20} siblingCount={0}" wide>
            <PaginationExample pages={20} initialPage={10} compact />
          </VariationExample>
          <VariationExample label="마지막 페이지" code="page={pageCount}">
            <PaginationExample initialPage={3} />
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <PaginationExample disabled />
          </VariationExample>
        </VariationGroup>
      </>
    )
  if (id === 'breadcrumb')
    return (
      <>
        <VariationGroup title="크기" wide>
          {sizes.map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
              <BreadcrumbExample size={size} />
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="상태" wide>
          <VariationExample label="기본">
            <BreadcrumbExample />
          </VariationExample>
          <VariationExample label="항목 비활성" code="items[].disabled">
            <BreadcrumbExample disabledItem />
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <BreadcrumbExample disabled />
          </VariationExample>
        </VariationGroup>
      </>
    )
  if (id === 'menubar')
    return (
      <>
        <VariationGroup title="크기" wide>
          {sizes.map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
              <MenubarExample size={size} />
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="상태" wide>
          <VariationExample label="기본">
            <MenubarExample />
          </VariationExample>
          <VariationExample label="항목 비활성" code="menus[].disabled">
            <MenubarExample disabledItem />
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <MenubarExample disabled />
          </VariationExample>
        </VariationGroup>
      </>
    )
  if (id === 'navigation-menu')
    return (
      <>
        <VariationGroup title="크기" wide>
          {sizes.map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
              <NavigationExample size={size} />
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="상태" wide>
          <VariationExample label="기본">
            <NavigationExample />
          </VariationExample>
          <VariationExample label="항목 비활성" code="items[].disabled">
            <NavigationExample disabledItem />
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <NavigationExample disabled />
          </VariationExample>
        </VariationGroup>
      </>
    )
  if (id === 'sidebar')
    return (
      <>
        <VariationGroup title="크기" wide>
          {sizes.map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
              <SidebarExample size={size} />
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="상태" wide>
          <VariationExample label="접힘" code="defaultCollapsed">
            <SidebarExample collapsed />
          </VariationExample>
          <VariationExample label="항목 비활성" code="items[].disabled">
            <SidebarExample disabledItem />
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <SidebarExample disabled />
          </VariationExample>
        </VariationGroup>
      </>
    )
  if (id === 'stepper')
    return (
      <>
        <VariationGroup title="크기">
          {sizes.map((size) => (
            <VariationExample
              key={size}
              label={size.toUpperCase()}
              code={`size="${size}" orientation="vertical"`}
            >
              <StepperExample size={size} />
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="상태">
          <VariationExample label="기본">
            <StepperExample />
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <StepperExample disabled />
          </VariationExample>
          <VariationExample label="오류" code="items[].error">
            <StepperExample error />
          </VariationExample>
          <VariationExample label="완료" code="defaultValue={items.length}">
            <StepperExample complete />
          </VariationExample>
          <VariationExample label="가로" code={'orientation="horizontal"'} wide>
            <StepperExample vertical={false} />
          </VariationExample>
        </VariationGroup>
      </>
    )
  return null
}
