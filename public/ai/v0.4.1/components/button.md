# Button

Accessible button with variants, loading and disabled states.

Version: 0.4.1. Source hash: 27e6f5b10b06dae29c6129d5ab80e735d6c44f2d84f74acf4149c979e0f65f4e.

## Discovery

- Registry ID: `button`
- Import: `@/components/ui/moru/button`
- Runtime exports: `Button`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [button.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/button.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/button.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/button.tsx)

## Usage and interaction

- Use type="button" for non-submit actions inside forms. loading locks activation and announces busy state while the button stays focusable (aria-disabled, not the disabled attribute), so keyboard focus is not lost; keep a meaningful text label.
- Variants are primary, secondary, ghost, danger. Do not substitute shadcn variant names.
- A label wraps on its own when its container is too narrow. textWrap="wrap" marks a label that is expected to wrap and tightens its vertical padding while preserving the S/M/L minimum height; textWrap="nowrap" forces a single line. Reflow the parent action row before truncating action text.

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
  /**
   * A label wraps on its own when the container is too narrow. `wrap` marks a label that is
   * expected to wrap and tightens its vertical padding; `nowrap` keeps it on one line.
   */
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
- `Button.loading`: `false`
