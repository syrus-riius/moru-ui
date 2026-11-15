# Combobox

Searchable option selection with labelled results and scoped popup theming.

Version: 0.4.1. Source hash: 08414026dbe9c50ebadb9391b938ed8ed1e97050bc3c6b5f7c1b6fd190aa8ab2.

## Discovery

- Registry ID: `combobox`
- Import: `@/components/ui/moru/combobox`
- Runtime exports: `Combobox`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [combobox.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/combobox.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/combobox.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/combobox.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `AriaAttributes` from `react`

```ts
interface ComboboxItem {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface ComboboxProps {
  items: ComboboxItem[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  placeholder?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: AriaAttributes['aria-invalid']
  disabled?: boolean
  loading?: boolean
  readOnly?: boolean
  required?: boolean
  clearable?: boolean
  name?: string
  form?: string
  id?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

Exported value type annotations / generic factory calls from source:

- `Combobox: forwardRef<HTMLInputElement, ComboboxProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Combobox.loading`: `false`
- `Combobox.clearable`: `true`
- `Combobox.size`: `'md'`
