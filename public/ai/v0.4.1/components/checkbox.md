# Checkbox

Accessible checkbox with label, description and loading state.

Version: 0.4.1. Source hash: 2fd87d38eaaf0375eb097047b65a7d17f1067292b1a98efdbfd46ccdaa31ff28.

## Discovery

- Registry ID: `checkbox`
- Import: `@/components/ui/moru/checkbox`
- Runtime exports: `Checkbox`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [checkbox.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/checkbox.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/checkbox.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/checkbox.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ComponentPropsWithoutRef, ReactNode` from `react`
- `BaseCheckbox` from `@base-ui/react/checkbox`
- `UIState` from `./state`

```ts
type CheckboxProps = Omit<
  ComponentPropsWithoutRef<typeof BaseCheckbox.Root>,
  'children' | 'className' | 'checked' | 'defaultChecked' | 'onCheckedChange'
> & {
  label?: ReactNode
  description?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  previewState?: UIState
}
```

Exported value type annotations / generic factory calls from source:

- `Checkbox: forwardRef<HTMLElement, CheckboxProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Checkbox.size`: `'md'`
- `Checkbox.loading`: `false`
