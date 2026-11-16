# Switch

Accessible labelled switch with form and Field integration.

Version: 0.4.1. Source hash: 9e7fc610717ab4a2a951696248d6d47b7eb7d11cbfffc90d292087c06ac3c874.

## Discovery

- Registry ID: `switch`
- Import: `@/components/ui/moru/switch`
- Runtime exports: `Switch`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [switch.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/switch.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/switch.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/switch.tsx)

## Usage and interaction

- Web Switch uses checked/onCheckedChange, not value/onValueChange. Its label and description are part of the clickable label.
- Use for independent on/off settings; provide clear text explaining the enabled state.
- loading shows progress in the thumb and locks the switch as read-only, so it stays focusable while a change is being saved.

## Minimal example

```tsx
import { useState } from 'react'
import { Switch } from '@/components/ui/moru/switch'

export function Notifications() {
  const [checked, setChecked] = useState(true)
  return <Switch label="Project updates" description="Notify me about new comments." checked={checked} onCheckedChange={setChecked} />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ComponentPropsWithoutRef, ReactNode` from `react`
- `BaseSwitch` from `@base-ui/react/switch`

```ts
type SwitchProps = Omit<
  ComponentPropsWithoutRef<typeof BaseSwitch.Root>,
  'children' | 'className' | 'checked' | 'defaultChecked' | 'onCheckedChange'
> & {
  label?: ReactNode
  description?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** Shows a busy indicator and locks the switch without taking it out of the tab order. */
  loading?: boolean
}
```

Exported value type annotations / generic factory calls from source:

- `Switch: forwardRef<HTMLElement, SwitchProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Switch.size`: `'md'`
- `Switch.loading`: `false`
