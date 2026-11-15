# Button

Accessible button with variants, loading and disabled states.

Version: 0.4.0. Source hash: e068de2cd7d2d1f2f198a786dcd23f4fee5b398de94b2591cabeb3a5ceb100f6.

## Discovery

- Registry ID: `button`
- Import: `@/components/ui/moru/button`
- Runtime exports: `Button`
- Registry dependencies: [core](/ai/v0.4.0/core.md)
- Install source: [button.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/button.json)
- Setup and import-path differences: [start](/ai/v0.4.0/start.md)
- Source: [src/components/ui/button.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/button.tsx)

## Usage and interaction

- Use type="button" for non-submit actions inside forms. loading locks activation and announces busy state; keep a meaningful text label.
- Variants are primary, secondary, ghost, danger. Do not substitute shadcn variant names.
- For long translated actions in narrow containers, textWrap="wrap" lets the label grow to multiple lines while preserving the S/M/L minimum height. The default remains nowrap; reflow the parent action row before truncating action text.

## Minimal example

```tsx
import { Button } from '@/components/ui/moru/button'

export function SaveAction() {
  return <Button type="button" variant="primary" onClick={() => window.alert('Saved')}>Save changes</Button>
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ComponentPropsWithoutRef` from `react`
- `BaseButton` from `@base-ui/react/button`
- `UIState` from `./state`

```ts
type ButtonProps = Omit<ComponentPropsWithoutRef<typeof BaseButton>, 'className'> & {
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  /** Allow a long action label to wrap while preserving the selected size's minimum height. */
  textWrap?: 'nowrap' | 'wrap'
  loading?: boolean
  previewState?: UIState
}
```

Exported value type annotations / generic factory calls from source:

- `Button: forwardRef<HTMLButtonElement, ButtonProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Button.variant`: `'primary'`
- `Button.size`: `'md'`
- `Button.textWrap`: `'nowrap'`
- `Button.loading`: `false`
