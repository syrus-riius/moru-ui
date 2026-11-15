import { useState } from 'react'
import { useI18n } from '../../../../i18n'
import { Button } from '../../../ui/button'
import { Badge } from '../../../ui/badge'
import { Card } from '../../../ui/card'
import { Footer } from '../../../ui/footer'
import { Header } from '../../../ui/header'
import { Skeleton } from '../../../ui/skeleton'
import { Typography } from '../../../ui/typography'
import { VariationExample, VariationGroup, sizes } from '../VariationLayout'

function ExampleNavigation() {
  const { t } = useI18n()
  const [active, setActive] = useState('프로젝트')
  return (
    <>
      {['프로젝트', '팀', '설정'].map((label) => (
        <button
          key={label}
          type="button"
          aria-current={active === label ? 'page' : undefined}
          onClick={() => setActive(label)}
        >
          {t(label)}
        </button>
      ))}
    </>
  )
}

export function PageLayoutVariations({ id }: { id: 'header' | 'footer' | 'card' }) {
  const { t } = useI18n()
  if (id === 'header') {
    return (
      <>
        <VariationGroup title="크기 비교" wide>
          {sizes.map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`} wide>
              <Header
                size={size}
                brand={<strong>Moru</strong>}
                navigation={<ExampleNavigation />}
                navigationLabel={`Moru ${size}`}
                actions={<Badge variant="secondary">Beta</Badge>}
              />
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="베리에이션" wide>
          {(['navigation', 'centered', 'app'] as const).map((variant) => (
            <VariationExample key={variant} label={variant} code={`variant="${variant}"`} wide>
              <Header
                variant={variant}
                brand={<strong>Moru Studio</strong>}
                navigation={<ExampleNavigation />}
                navigationLabel={`Moru ${variant}`}
                actions={<Badge variant="secondary">Beta</Badge>}
              >
                {variant === 'app' ? (
                  <Typography variant="caption">{t('개인 프로젝트')}</Typography>
                ) : null}
              </Header>
            </VariationExample>
          ))}
        </VariationGroup>
      </>
    )
  }
  if (id === 'footer') {
    return (
      <>
        <VariationGroup title="크기 비교" wide>
          {sizes.map((size) => (
            <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`} wide>
              <Footer
                size={size}
                brand={<strong>Moru</strong>}
                navigation={<ExampleNavigation />}
                navigationLabel={`Moru footer ${size}`}
                copyright="© Moru UI"
              />
            </VariationExample>
          ))}
        </VariationGroup>
        <VariationGroup title="베리에이션" wide>
          {(['simple', 'columns', 'compact'] as const).map((variant) => (
            <VariationExample key={variant} label={variant} code={`variant="${variant}"`} wide>
              <Footer
                variant={variant}
                brand={<strong>Moru Studio</strong>}
                description={variant === 'compact' ? undefined : t('기본은 단단하게.')}
                navigation={variant === 'columns' ? undefined : <ExampleNavigation />}
                navigationLabel={`Moru footer ${variant}`}
                columns={
                  variant === 'columns'
                    ? [
                        { title: t('제품'), content: <a href="#components">{t('컴포넌트')}</a> },
                        {
                          title: t('시작하기'),
                          content: <a href="#guide">{t('설치')}</a>,
                        },
                      ]
                    : undefined
                }
                copyright="© Moru UI"
                meta={<Badge variant="secondary">MIT</Badge>}
              />
            </VariationExample>
          ))}
        </VariationGroup>
      </>
    )
  }
  return (
    <VariationGroup title="베리에이션" wide>
      <VariationExample label="기본" code="<Card>…</Card>">
        <Card style={{ display: 'grid', gap: 'calc(var(--ui-control-gap) * 2)' }}>
          <Typography variant="heading" as="h5">
            {t('디자인 토큰')}
          </Typography>
          <Typography>{t('일관된 규칙이 작업을 받쳐 줍니다.')}</Typography>
        </Card>
      </VariationExample>
      <VariationExample label="상태" code="<Card><Badge />…<Button /></Card>">
        <ProjectCard />
      </VariationExample>
      <VariationExample label="로딩" code="<Card aria-busy><Skeleton />…</Card>">
        <Card
          aria-busy="true"
          aria-label={t('불러오는 중')}
          style={{ display: 'grid', gap: 'calc(var(--ui-control-gap) * 2)' }}
        >
          <Skeleton style={{ width: '55%', height: 24 }} />
          <Skeleton style={{ height: 16 }} />
          <Skeleton style={{ width: '75%', height: 16 }} />
        </Card>
      </VariationExample>
    </VariationGroup>
  )
}

function ProjectCard() {
  const { t } = useI18n()
  const [complete, setComplete] = useState(false)
  return (
    <Card
      style={{ display: 'grid', justifyItems: 'start', gap: 'calc(var(--ui-control-gap) * 2)' }}
    >
      <Badge tone={complete ? 'success' : 'info'}>{t(complete ? '완료' : '진행 중')}</Badge>
      <Typography variant="heading" as="h5">
        {t('UI 라이브러리')}
      </Typography>
      <Button size="sm" variant="secondary" onClick={() => setComplete(!complete)}>
        {t(complete ? '다시 시작' : '완료')}
      </Button>
    </Card>
  )
}
