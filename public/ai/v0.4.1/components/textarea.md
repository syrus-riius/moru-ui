# Textarea

Multiline input with Field integration and loading state.

Version: 0.4.1. Source hash: 0b0b1530e773209ed6b6628a4168c3305b7342a1378da2b37377f96c1e54f293.

## Discovery

- Registry ID: `textarea`
- Import: `@/components/ui/moru/textarea`
- Runtime exports: `Textarea`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [textarea.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/textarea.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/textarea.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/textarea.tsx)

## Usage and interaction

- Use native onChange(event), not onValueChange. Keep a visible label through Field.
- Allow multiline text to grow or scroll; do not hide entered content behind a fixed clipped height.
- loading makes the field read-only and busy instead of disabled, so focus and the submitted value are kept.

## Minimal example

Also install: `field`.

```tsx
import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { Textarea } from '@/components/ui/moru/textarea'

export function Notes() {
  const [notes, setNotes] = useState('')
  return <Field label="Notes"><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} /></Field>
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `TextareaHTMLAttributes` from `react`
- `UIState` from `./state`

```ts
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  previewState?: UIState
}
```

Exported value type annotations / generic factory calls from source:

- `Textarea: forwardRef<HTMLTextAreaElement, TextareaProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Textarea.size`: `'md'`
- `Textarea.rows`: `3`
- `Textarea.loading`: `false`
