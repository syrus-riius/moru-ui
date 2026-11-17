# Ring Progress

Circular progress presentation with optional sections and center content.

Version: 0.4.1. Source hash: 2fd87d38eaaf0375eb097047b65a7d17f1067292b1a98efdbfd46ccdaa31ff28.

## Discovery

- Registry ID: `ring-progress`
- Import: `@/components/ui/moru/ring-progress`
- Runtime exports: `RingProgress`, `normalizeRingSections`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [ring-progress.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/ring-progress.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/ring-progress.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/ring-progress.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes, ReactNode` from `react`
- `SemanticTone` from `./_theme/tokens`

```ts
interface RingProgressSection {
  label: string
  value: number
  tone?: SemanticTone | 'primary' | 'accent'
  color?: string
}

interface RingProgressProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  label: string
  value?: number
  max?: number
  sections?: readonly RingProgressSection[]
  size?: number
  thickness?: number
  roundCaps?: boolean
  showLegend?: boolean
  centerLabel?: ReactNode
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function normalizeRingSections(sections: readonly RingProgressSection[], max = 100);
function RingProgress({
  label,
  value = 0,
  max = 100,
  sections,
  size = 144,
  thickness = 10,
  roundCaps,
  showLegend = true,
  centerLabel,
  className,
  ...props
}: RingProgressProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `RingProgress.value`: `0`
- `RingProgress.max`: `100`
- `RingProgress.size`: `144`
- `RingProgress.thickness`: `10`
- `RingProgress.showLegend`: `true`
