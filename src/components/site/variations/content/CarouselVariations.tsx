import { useI18n } from '../../../../i18n'
import { Carousel } from '../../../ui/carousel'
import { VariationExample, VariationGroup } from '../VariationLayout'

export default function CarouselVariations() {
  const { t } = useI18n()
  const items = ['기본은 단단하게.', '선택은 자유롭게.', '오래 쓰도록.'].map((title, index) => ({
    id: String(index),
    label: `${index + 1} / 3`,
    content: (
      <div
        style={{
          minHeight: 180,
          padding: 'var(--ui-card-padding)',
          background: 'var(--ui-control-hover-bg)',
          display: 'grid',
          alignContent: 'center',
          gap: 'calc(var(--ui-control-gap) * 2)',
        }}
      >
        <span>0{index + 1} / MORU</span>
        <strong>{t(title)}</strong>
      </div>
    ),
  }))
  return (
    <VariationGroup title="베리에이션" wide>
      <VariationExample label="가로" code={'orientation="horizontal"'}>
        <Carousel items={items} aria-label={t('가로')} />
      </VariationExample>
      <VariationExample label="세로" code={'orientation="vertical"'}>
        <Carousel items={items} orientation="vertical" aria-label={t('세로')} />
      </VariationExample>
      <VariationExample label="반복" code="loop">
        <Carousel items={items} loop aria-label={t('반복')} />
      </VariationExample>
      <VariationExample label="RTL" code={'direction="rtl"'}>
        <Carousel items={items} direction="rtl" aria-label="RTL" />
      </VariationExample>
      <VariationExample label="비활성" code="disabled">
        <Carousel items={items} disabled aria-label={t('비활성')} />
      </VariationExample>
    </VariationGroup>
  )
}
