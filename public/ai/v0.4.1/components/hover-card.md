# Hover Card

Contextual preview content attached to a trigger with scoped popup theming.

Version: 0.4.1. Source hash: 27e6f5b10b06dae29c6129d5ab80e735d6c44f2d84f74acf4149c979e0f65f4e.

## Discovery

- Registry ID: `hover-card`
- Import: `@/components/ui/moru/hover-card`
- Runtime exports: `HoverCard`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [hover-card.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/hover-card.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/hover-card.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/hover-card.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ReactElement, ReactNode` from `react`

```ts
interface HoverCardProps {
  trigger: ReactElement
  title: string
  description?: string
  children?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  side?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function HoverCard({
  trigger,
  title,
  description,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled,
  size = 'md',
  side = 'bottom',
  delay = 250,
  className,
}: HoverCardProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `HoverCard.defaultOpen`: `false`
- `HoverCard.size`: `'md'`
- `HoverCard.side`: `'bottom'`
- `HoverCard.delay`: `250`
