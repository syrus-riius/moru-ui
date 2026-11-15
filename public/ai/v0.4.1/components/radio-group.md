# Radio Group

Accessible single-choice group with labels, descriptions and Field integration.

Version: 0.4.1. Source hash: baf065ccb1fccaa4eed187992c95b92d1b8fd9b7084c361d9faa54b0f7c55c24.

## Discovery

- Registry ID: `radio-group`
- Import: `@/components/ui/moru/radio-group`
- Runtime exports: `RadioGroup`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [radio-group.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/radio-group.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/radio-group.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/radio-group.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `BaseRadioGroup` from `@base-ui/react/radio-group`

```ts
interface RadioGroupItem {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface RadioGroupProps extends Omit<
  BaseRadioGroup.Props<string>,
  'children' | 'className' | 'value' | 'defaultValue' | 'onValueChange'
> {
  items: RadioGroupItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function RadioGroup({
  items,
  value,
  defaultValue,
  onValueChange,
  disabled,
  readOnly,
  className,
  id,
  size = 'md',
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...props
}: RadioGroupProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `RadioGroup.size`: `'md'`
