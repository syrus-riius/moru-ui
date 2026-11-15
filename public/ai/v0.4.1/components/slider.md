# Slider

Keyboard-operable value slider with configurable range and step.

Version: 0.4.1. Source hash: 08414026dbe9c50ebadb9391b938ed8ed1e97050bc3c6b5f7c1b6fd190aa8ab2.

## Discovery

- Registry ID: `slider`
- Import: `@/components/ui/moru/slider`
- Runtime exports: `Slider`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [slider.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/slider.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/slider.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/slider.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `BaseSlider` from `@base-ui/react/slider`

```ts
interface SliderProps extends Omit<
  BaseSlider.Root.Props<number>,
  | 'children'
  | 'className'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'orientation'
  | 'minStepsBetweenValues'
  | 'thumbCollisionBehavior'
> {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  label?: string
  showValue?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Slider({
  value,
  defaultValue,
  onValueChange,
  label,
  showValue = false,
  className,
  disabled,
  id,
  size = 'md',
  min = 0,
  max = 100,
  step = 1,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  'aria-valuetext': valueText,
  ...props
}: SliderProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Slider.showValue`: `false`
- `Slider.size`: `'md'`
- `Slider.min`: `0`
- `Slider.max`: `100`
- `Slider.step`: `1`
