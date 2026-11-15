# Multi Select

Searchable multi-value selection with removable chips and native form values.

Version: 0.4.1. Source hash: 3d50d8d1c9951acff47d57ffd227011e1e268683be793d82d543261e48d83ef7.

## Discovery

- Registry ID: `multi-select`
- Import: `@/components/ui/moru/multi-select`
- Runtime exports: `MultiSelect`, `subscribeMultiSelectFormReset`
- Registry dependencies: [combobox](/ai/v0.4.1/components/combobox.md), [core](/ai/v0.4.1/core.md)
- Install source: [multi-select.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/multi-select.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/multi-select.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/multi-select.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `AriaAttributes` from `react`
- `ComboboxItem` from `./combobox`

```ts
type MultiSelectItem = ComboboxItem

interface MultiSelectProps {
  items: MultiSelectItem[]
  value?: readonly string[]
  defaultValue?: readonly string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  emptyMessage?: string
  maxSelected?: number
  clearable?: boolean
  disabled?: boolean
  loading?: boolean
  readOnly?: boolean
  required?: boolean
  name?: string
  form?: string
  id?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: AriaAttributes['aria-invalid']
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function subscribeMultiSelectFormReset(form: EventTarget, onReset: () => void);
function MultiSelect({
  items,
  value,
  defaultValue = [],
  onValueChange,
  placeholder: placeholderProp,
  emptyMessage: emptyMessageProp,
  maxSelected,
  clearable = true,
  disabled,
  loading = false,
  readOnly,
  required,
  name,
  form,
  id,
  size = 'md',
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
}: MultiSelectProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `MultiSelect.defaultValue`: `[]`
- `MultiSelect.clearable`: `true`
- `MultiSelect.loading`: `false`
- `MultiSelect.size`: `'md'`
