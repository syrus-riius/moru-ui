# Native Select

Styled native select with standard browser form and keyboard behavior.

Version: 0.4.1. Source hash: 92d4b85e1d28cd9eda9391ef75e1e633fa26d884c86603172df42465b8fa832c.

## Discovery

- Registry ID: `native-select`
- Import: `@/components/ui/moru/native-select`
- Runtime exports: `NativeSelect`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [native-select.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/native-select.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/native-select.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/native-select.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `SelectHTMLAttributes` from `react`
- `UIState` from `./state`

```ts
interface NativeSelectOption {
  value: string
  label: string
  disabled?: boolean
}

type NativeSelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size' | 'multiple'
> & {
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  previewState?: UIState
  items?: NativeSelectOption[]
  onValueChange?: (value: string) => void
}
```

Exported value type annotations / generic factory calls from source:

- `NativeSelect: forwardRef<HTMLSelectElement, NativeSelectProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `NativeSelect.size`: `'md'`
- `NativeSelect.loading`: `false`
