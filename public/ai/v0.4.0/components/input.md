# Input

Accessible text input with Field integration.

Version: 0.4.0. Source hash: e068de2cd7d2d1f2f198a786dcd23f4fee5b398de94b2591cabeb3a5ceb100f6.

## Discovery

- Registry ID: `input`
- Import: `@/components/ui/moru/input`
- Runtime exports: `Input`
- Registry dependencies: [core](/ai/v0.4.0/core.md)
- Install source: [input.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/input.json)
- Setup and import-path differences: [start](/ai/v0.4.0/start.md)
- Source: [src/components/ui/input.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/input.tsx)

## Usage and interaction

- Use Field for the visible label, description and error connection. Placeholder text is not a label.
- onValueChange receives the string; native onChange receives an event. Keep controlled values defined from the first render.

## Minimal example

Also install: `field`.

```tsx
import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { Input } from '@/components/ui/moru/input'

export function ProjectName() {
  const [name, setName] = useState('')
  return <Field label="Project name" description="Choose a recognizable name.">
    <Input name="projectName" value={name} onValueChange={setName} autoComplete="off" />
  </Field>
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ComponentPropsWithoutRef` from `react`
- `BaseInput` from `@base-ui/react/input`
- `UIState` from `./state`

```ts
type InputProps = Omit<ComponentPropsWithoutRef<typeof BaseInput>, 'className' | 'size'> & {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  previewState?: UIState
}
```

Exported value type annotations / generic factory calls from source:

- `Input: forwardRef<HTMLInputElement, InputProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Input.size`: `'md'`
- `Input.loading`: `false`
