# Carousel

Embla-based content carousel with keyboard controls and selected-slide feedback.

Version: 0.4.0. Source hash: e068de2cd7d2d1f2f198a786dcd23f4fee5b398de94b2591cabeb3a5ceb100f6.

## Discovery

- Registry ID: `carousel`
- Import: `@/components/ui/moru/carousel`
- Runtime exports: `Carousel`
- Registry dependencies: [button](/ai/v0.4.0/components/button.md), [core](/ai/v0.4.0/core.md)
- Install source: [carousel.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/carousel.json)
- Setup and import-path differences: [start](/ai/v0.4.0/start.md)
- Source: [src/components/ui/carousel.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/carousel.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ReactNode` from `react`

```ts
interface CarouselItem {
  id: string
  content: ReactNode
  label?: string
}

interface CarouselProps {
  items: CarouselItem[]
  loop?: boolean
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  direction?: 'ltr' | 'rtl'
  onValueChange?: (index: number) => void
  className?: string
  'aria-label': string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Carousel({
  items,
  loop = false,
  disabled = false,
  orientation = 'horizontal',
  direction = 'ltr',
  onValueChange,
  className,
  'aria-label': label,
}: CarouselProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Carousel.loop`: `false`
- `Carousel.disabled`: `false`
- `Carousel.orientation`: `'horizontal'`
- `Carousel.direction`: `'ltr'`
