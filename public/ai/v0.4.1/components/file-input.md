# File Input

File selection with client-side constraints and removable attachment feedback.

Version: 0.4.1. Source hash: 0b0b1530e773209ed6b6628a4168c3305b7342a1378da2b37377f96c1e54f293.

## Discovery

- Registry ID: `file-input`
- Import: `@/components/ui/moru/file-input`
- Runtime exports: `FileInput`
- Registry dependencies: [attachment](/ai/v0.4.1/components/attachment.md), [core](/ai/v0.4.1/core.md)
- Install source: [file-input.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/file-input.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/file-input.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/file-input.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `InputHTMLAttributes` from `react`
- `UIState` from `./state`

```ts
interface FileInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'size'
> {
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  previewState?: UIState
  maxSize?: number
  maxFiles?: number
  onFilesChange?: (files: File[]) => void
}
```

Exported value type annotations / generic factory calls from source:

- `FileInput: forwardRef<HTMLInputElement, FileInputProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `FileInput.size`: `'md'`
- `FileInput.loading`: `false`
