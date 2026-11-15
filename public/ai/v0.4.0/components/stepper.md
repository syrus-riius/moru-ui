# Stepper

Step progress and navigation with completed, current and error states.

Version: 0.4.0. Source hash: e068de2cd7d2d1f2f198a786dcd23f4fee5b398de94b2591cabeb3a5ceb100f6.

## Discovery

- Registry ID: `stepper`
- Import: `@/components/ui/moru/stepper`
- Runtime exports: `Stepper`, `canSelectStep`, `normalizeStepperValue`
- Registry dependencies: [core](/ai/v0.4.0/core.md)
- Install source: [stepper.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/stepper.json)
- Setup and import-path differences: [start](/ai/v0.4.0/start.md)
- Source: [src/components/ui/stepper.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/stepper.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes, ReactNode` from `react`

```ts
interface StepperItem {
  id: string
  label: string
  description?: string
  content?: ReactNode
  disabled?: boolean
  error?: boolean
}

interface StepperProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'defaultValue' | 'onChange'
> {
  items: readonly StepperItem[]
  /** Zero-based index. items.length represents the completed sequence. */
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Future steps stay unavailable until the host form validates and advances. */
  allowNextStepsSelect?: boolean
  allowStepSelect?: boolean
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  completedContent?: ReactNode
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function normalizeStepperValue(value: number, count: number);
function canSelectStep(
  index: number,
  active: number,
  count: number,
  options: {
    disabled?: boolean
    itemDisabled?: boolean
    allowStepSelect?: boolean
    allowNextStepsSelect?: boolean
  } = {},
);
function Stepper({
  items,
  value,
  defaultValue = 0,
  onValueChange,
  allowNextStepsSelect = false,
  allowStepSelect = true,
  disabled,
  orientation = 'horizontal',
  size = 'md',
  completedContent,
  className,
  'aria-label': labelProp,
  ...props
}: StepperProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Stepper.defaultValue`: `0`
- `Stepper.allowNextStepsSelect`: `false`
- `Stepper.allowStepSelect`: `true`
- `Stepper.orientation`: `'horizontal'`
- `Stepper.size`: `'md'`
