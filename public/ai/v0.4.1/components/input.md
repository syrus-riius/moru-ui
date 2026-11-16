# Input

Accessible text input with Field integration.

Version: 0.4.1. Source hash: 27e6f5b10b06dae29c6129d5ab80e735d6c44f2d84f74acf4149c979e0f65f4e.

## Discovery

- Registry ID: `input`
- Import: `@/components/ui/moru/input`
- Runtime exports: `Input`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [input.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/input.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/input.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/input.tsx)

## Usage and interaction

- Use Field for the visible label, description and error connection. Placeholder text is not a label.
- onValueChange receives the string; native onChange receives an event. Keep controlled values defined from the first render.
- loading makes the field read-only and busy instead of disabled: it keeps focus and its value is still submitted with the form. Use disabled when the value must not be sent.

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
