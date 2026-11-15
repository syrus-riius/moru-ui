# Card

A quiet, token-based content surface.

Version: 0.4.1. Source hash: 330cfc12106a86e9393b1d2a455d5a28d7d11fdeccfe17f602eda7db8f347a38.

## Discovery

- Registry ID: `card`
- Import: `@/components/ui/moru/card`
- Runtime exports: `Card`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [card.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/card.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/card.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/card.tsx)

## Usage and interaction

- Card is a single HTML div surface. CardHeader/CardContent are not Moru exports.
- Compose semantic content and use the common spacing tokens; avoid nested arbitrary padding that doubles the surface inset.

## Minimal example

```tsx
import { Card } from '@/components/ui/moru/card'

export function Summary() {
  return <Card style={{ display: 'grid', gap: 'var(--ui-field-gap)' }}>
    <h2 style={{ margin: 0 }}>Project overview</h2>
    <p style={{ margin: 0 }}>Your next milestone is ready to review.</p>
  </Card>
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes` from `react`

```ts
type CardProps = HTMLAttributes<HTMLDivElement>
```

Exported value type annotations / generic factory calls from source:

- `Card: forwardRef<HTMLDivElement, CardProps>`
