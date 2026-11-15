# Number Input

Numeric field with step controls, bounds and localized formatting.

Version: 0.4.1. Source hash: 3d50d8d1c9951acff47d57ffd227011e1e268683be793d82d543261e48d83ef7.

## Discovery

- Registry ID: `number-input`
- Import: `@/components/ui/moru/number-input`
- Runtime exports: `NumberInput`, `subscribeNumberInputFormReset`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [number-input.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/number-input.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/number-input.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/number-input.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `AriaAttributes, ComponentPropsWithoutRef` from `react`
- `BaseNumberField` from `@base-ui/react/number-field`

```ts
type RootProps = ComponentPropsWithoutRef<typeof BaseNumberField.Root>

interface NumberInputProps extends Omit<
  RootProps,
  'children' | 'className' | 'render' | 'defaultValue'
> {
  defaultValue?: number | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
  placeholder?: string
  /** Maximum fractional digits. Formatting and locale-aware parsing are handled by Base UI. */
  precision?: number
  hideControls?: boolean
  loading?: boolean
  'aria-invalid'?: AriaAttributes['aria-invalid']
  inputProps?: Omit<
    ComponentPropsWithoutRef<typeof BaseNumberField.Input>,
    'value' | 'defaultValue' | 'id' | 'name' | 'type' | 'size' | 'render' | 'className'
  > & { className?: string }
}
```

Exported value type annotations / generic factory calls from source:

- `NumberInput: forwardRef<HTMLInputElement, NumberInputProps>`

Exported function declaration excerpts (return types may be inferred in source):

```ts
function subscribeNumberInputFormReset(
  form: EventTarget,
  onReset: () => void,
  isControlled: () => boolean,
);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `NumberInput.size`: `'md'`
- `NumberInput.hideControls`: `false`
- `NumberInput.loading`: `false`
