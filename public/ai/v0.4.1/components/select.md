# Select

Accessible select with keyboard navigation and scoped popup theming.

Version: 0.4.1. Source hash: 92d4b85e1d28cd9eda9391ef75e1e633fa26d884c86603172df42465b8fa832c.

## Discovery

- Registry ID: `select`
- Import: `@/components/ui/moru/select`
- Runtime exports: `Select`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [select.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/select.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/select.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/select.tsx)

## Usage and interaction

- Moru Select accepts items; it has no SelectTrigger/SelectContent/SelectItem exports.
- Use value/onValueChange for controlled selection; pass value={null} for a controlled select with nothing chosen (the placeholder is shown). Preserve keyboard navigation and disabled options.

## Minimal example

Also install: `field`.

```tsx
import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { Select } from '@/components/ui/moru/select'

export function Visibility() {
  const [value, setValue] = useState('team')
  return <Field label="Visibility"><Select name="visibility" value={value} onValueChange={setValue}
    items={[{ value: 'private', label: 'Private' }, { value: 'team', label: 'Team' }]} /></Field>
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `AriaAttributes` from `react`
- `UIState` from `./state`

```ts
interface SelectProps {
  items: Array<{ value: string; label: string; disabled?: boolean }>
  /** Pass null for a controlled select with nothing chosen; the placeholder is shown. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string) => void
  placeholder?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: AriaAttributes['aria-invalid']
  disabled?: boolean
  readOnly?: boolean
  name?: string
  form?: string
  required?: boolean
  id?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  previewState?: UIState
}
```

Exported value type annotations / generic factory calls from source:

- `Select: forwardRef<HTMLButtonElement, SelectProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Select.size`: `'md'`
- `Select.loading`: `false`
