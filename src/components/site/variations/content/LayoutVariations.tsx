import { Bell, User } from 'lucide-react'
import { useI18n } from '../../../../i18n'
import type { ComponentId } from '../../../catalog/component-catalog'
import { Accordion } from '../../../ui/accordion'
import { AspectRatio } from '../../../ui/aspect-ratio'
import { Avatar } from '../../../ui/avatar'
import { Badge } from '../../../ui/badge'
import { Collapsible } from '../../../ui/collapsible'
import { DirectionProvider } from '../../../ui/direction-provider'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../../../ui/item'
import { ScrollArea } from '../../../ui/scroll-area'
import { Separator } from '../../../ui/separator'
import { Tabs } from '../../../ui/tabs'
import { Typography } from '../../../ui/typography'
import { VariationExample, VariationGroup, sizes } from '../VariationLayout'

const avatarImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" fill="%23c2d4c7"/%3E%3Ccircle cx="40" cy="30" r="14" fill="%232d4638"/%3E%3Cpath d="M12 80v-6a28 28 0 0 1 56 0v6" fill="%232d4638"/%3E%3C/svg%3E'

export function LayoutVariations({ id }: { id: ComponentId }) {
  const { t } = useI18n()
  switch (id) {
    case 'accordion': {
      const items = [
        { value: 'install', title: t('설치'), content: <code>npm install moru-ui</code> },
        {
          value: 'tokens',
          title: t('디자인 토큰'),
          content: t('일관된 규칙이 작업을 받쳐 줍니다.'),
        },
      ]
      return (
        <VariationGroup title="베리에이션" wide>
          <VariationExample label="기본" code="<Accordion items={items} />">
            <Accordion items={items} />
          </VariationExample>
          <VariationExample label="열림" code={'defaultValue={["install"]}'}>
            <Accordion items={items} defaultValue={['install']} />
          </VariationExample>
          <VariationExample
            label="다중 선택"
            code={'multiple defaultValue={["install", "tokens"]}'}
          >
            <Accordion items={items} multiple defaultValue={['install', 'tokens']} />
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <Accordion items={items} disabled />
          </VariationExample>
          <VariationExample label="일부 비활성" code="items={[…, { …, disabled: true }]}">
            <Accordion items={[items[0], { ...items[1], disabled: true }]} />
          </VariationExample>
        </VariationGroup>
      )
    }
    case 'avatar':
      return (
        <>
          <VariationGroup title="크기 비교">
            {sizes.map((size) => (
              <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
                <Avatar size={size} src={avatarImage} alt={t('팀 멤버')} />
              </VariationExample>
            ))}
          </VariationGroup>
          <VariationGroup title="베리에이션">
            <VariationExample label="이미지" code="src={image} alt={name}">
              <Avatar src={avatarImage} alt="Moru" />
            </VariationExample>
            <VariationExample label="이니셜" code={'alt="Moru UI"'}>
              <Avatar alt="Moru UI" />
            </VariationExample>
            <VariationExample label="아이콘" code="fallback={<User />}">
              <Avatar alt={t('사용자')} fallback={<User size={20} aria-hidden="true" />} />
            </VariationExample>
          </VariationGroup>
        </>
      )
    case 'separator':
      return (
        <VariationGroup title="방향">
          <VariationExample label="가로" code={'orientation="horizontal"'}>
            <span>{t('프로젝트')}</span>
            <Separator />
            <span>{t('설정')}</span>
          </VariationExample>
          <VariationExample label="세로" code={'orientation="vertical"'}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'calc(var(--ui-control-gap) * 2)',
                height: 48,
              }}
            >
              <span>Moru</span>
              <Separator orientation="vertical" />
              <span>UI</span>
            </div>
          </VariationExample>
          <VariationExample label="구조 구분" code="decorative={false}">
            <span>{t('프로젝트')}</span>
            <Separator decorative={false} />
            <span>{t('설정')}</span>
          </VariationExample>
        </VariationGroup>
      )
    case 'aspect-ratio':
      return (
        <VariationGroup title="비율">
          {[
            { label: '16:9', ratio: 16 / 9, code: '16 / 9' },
            { label: '4:3', ratio: 4 / 3, code: '4 / 3' },
            { label: '1:1', ratio: 1, code: '1' },
          ].map(({ label, ratio, code }) => (
            <VariationExample key={label} label={label} code={`ratio={${code}}`}>
              <AspectRatio
                ratio={ratio}
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  background: 'var(--ui-control-hover-bg)',
                  borderRadius: 'var(--ui-radius)',
                }}
              >
                <Typography variant="heading" as="span">
                  {label}
                </Typography>
              </AspectRatio>
            </VariationExample>
          ))}
        </VariationGroup>
      )
    case 'direction':
      return (
        <VariationGroup title="방향" wide>
          {(['ltr', 'rtl'] as const).map((direction) => (
            <VariationExample
              key={direction}
              label={direction.toUpperCase()}
              code={`<DirectionProvider direction="${direction}"><div dir="${direction}">…</div></DirectionProvider>`}
            >
              <DirectionProvider direction={direction}>
                <div dir={direction}>
                  <Tabs
                    defaultValue="overview"
                    aria-label={`${direction.toUpperCase()} ${t('탭')}`}
                    items={[
                      { value: 'overview', label: t('개요'), content: t('프로젝트') },
                      { value: 'settings', label: t('설정'), content: t('알림 설정') },
                    ]}
                  />
                </div>
              </DirectionProvider>
            </VariationExample>
          ))}
        </VariationGroup>
      )
    case 'item':
      return (
        <>
          <VariationGroup title="크기 비교" wide>
            {sizes.map((size) => (
              <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
                <ExampleItem size={size} />
              </VariationExample>
            ))}
          </VariationGroup>
          <VariationGroup title="베리에이션" wide>
            {(['default', 'outline', 'muted'] as const).map((variant) => (
              <VariationExample key={variant} label={variant} code={`variant="${variant}"`}>
                <ExampleItem variant={variant} />
              </VariationExample>
            ))}
          </VariationGroup>
        </>
      )
    case 'collapsible':
      return (
        <>
          <VariationGroup title="크기 비교" wide>
            {sizes.map((size) => (
              <VariationExample
                key={size}
                label={size.toUpperCase()}
                code={`size="${size}" defaultOpen`}
              >
                <Collapsible size={size} defaultOpen title={t('알림 설정')}>
                  {t('새 댓글과 작업 변경')}
                </Collapsible>
              </VariationExample>
            ))}
          </VariationGroup>
          <VariationGroup title="상태 비교" wide>
            <VariationExample label="기본" code="defaultOpen={false}">
              <Collapsible title={t('세부 설정')}>{t('디자인 토큰')}</Collapsible>
            </VariationExample>
            <VariationExample label="열림" code="defaultOpen">
              <Collapsible defaultOpen title={t('세부 설정')}>
                {t('디자인 토큰')}
              </Collapsible>
            </VariationExample>
            <VariationExample label="비활성" code="disabled">
              <Collapsible disabled title={t('세부 설정')}>
                {t('디자인 토큰')}
              </Collapsible>
            </VariationExample>
          </VariationGroup>
        </>
      )
    case 'scroll-area':
      return (
        <VariationGroup title="방향" wide>
          {(['vertical', 'horizontal', 'both'] as const).map((orientation) => (
            <VariationExample
              key={orientation}
              label={orientation}
              code={`orientation="${orientation}" style={{ height: 180 }}`}
            >
              <ScrollArea
                orientation={orientation}
                style={{ height: 180 }}
                aria-label={`${t('스크롤 영역')} ${orientation}`}
              >
                <div
                  style={{
                    width: orientation === 'vertical' ? '100%' : 600,
                    display: 'grid',
                    gridTemplateColumns:
                      orientation === 'horizontal' ? 'repeat(6, 1fr)' : undefined,
                    gap: 'var(--ui-control-gap)',
                    padding: 'var(--ui-control-gap)',
                  }}
                >
                  {Array.from({ length: 6 }, (_, index) => (
                    <Item key={index} variant="muted">
                      <ItemContent>
                        <ItemTitle>
                          {t('프로젝트')} {index + 1}
                        </ItemTitle>
                        <ItemDescription>Moru UI</ItemDescription>
                      </ItemContent>
                    </Item>
                  ))}
                </div>
              </ScrollArea>
            </VariationExample>
          ))}
        </VariationGroup>
      )
    case 'typography':
      return (
        <VariationGroup title="베리에이션" wide>
          {(['display', 'heading', 'body', 'label', 'caption', 'code'] as const).map((variant) => (
            <VariationExample key={variant} label={variant} code={`variant="${variant}" as="span"`}>
              <Typography variant={variant} as="span">
                {variant === 'code' ? 'npm install moru-ui' : t('기본은 단단하게.')}
              </Typography>
            </VariationExample>
          ))}
        </VariationGroup>
      )
    default:
      return null
  }
}

function ExampleItem({
  size = 'md',
  variant = 'default',
}: {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'muted'
}) {
  const { t } = useI18n()
  return (
    <Item size={size} variant={variant}>
      <ItemMedia>
        <Bell size={20} aria-hidden="true" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{t('알림 설정')}</ItemTitle>
        <ItemDescription>{t('새 댓글과 작업 변경')}</ItemDescription>
      </ItemContent>
      <Badge variant="secondary">3</Badge>
    </Item>
  )
}
