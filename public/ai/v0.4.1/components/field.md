# Field

Connected labels, descriptions and validation messages.

Version: 0.4.1. Source hash: 27e6f5b10b06dae29c6129d5ab80e735d6c44f2d84f74acf4149c979e0f65f4e.

## Discovery

- Registry ID: `field`
- Import: `@/components/ui/moru/field`
- Runtime exports: `Field`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [field.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/field.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/field.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/field.tsx)

## Usage and interaction

- Field connects Moru inputs to labels, descriptions and errors. Put the field control inside its children.
- Show an actionable error without deleting the entered value. Do not add a second competing aria-label to an already labelled field.

## Minimal example

Also install: `input`.

```tsx
import { Field } from '@/components/ui/moru/field'
import { Input } from '@/components/ui/moru/input'

export function EmailField() {
  return <Field label="Email" description="We will send your invitation here.">
    <Input name="email" type="email" autoComplete="email" required />
  </Field>
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ReactNode` from `react`

```ts
interface FieldProps {
  label: string
  description?: string
  error?: string
  children: ReactNode
  className?: string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Field({ label, description, error, children, className }: FieldProps);
```
