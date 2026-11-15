import type { ReactNode } from 'react'
import { sizes, VariationExample, VariationGroup } from '../VariationLayout'

export type ControlSize = (typeof sizes)[number]

export function FormSizeExamples({
  children,
  wide = false,
}: {
  children: (size: ControlSize) => ReactNode
  wide?: boolean
}) {
  return (
    <VariationGroup title="크기 비교" wide={wide}>
      {sizes.map((size) => (
        <VariationExample key={size} label={size.toUpperCase()} code={`size="${size}"`}>
          {children(size)}
        </VariationExample>
      ))}
    </VariationGroup>
  )
}
