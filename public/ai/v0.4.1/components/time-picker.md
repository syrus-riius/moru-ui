# Time Picker

Wall-clock time field with direct input, hour/minute selection and configurable time bounds or steps.

Version: 0.4.1. Source hash: 27e6f5b10b06dae29c6129d5ab80e735d6c44f2d84f74acf4149c979e0f65f4e.

## Discovery

- Registry ID: `time-picker`
- Import: `@/components/ui/moru/time-picker`
- Runtime exports: `TimePicker`
- Registry dependencies: [core](/ai/v0.4.1/core.md), [popover](/ai/v0.4.1/components/popover.md)
- Install source: [time-picker.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/time-picker.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/time-picker.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/time-picker.tsx)

## Usage and interaction

- Values are HH:mm wall-clock strings or null, not Date instances. step is a minute increment (1–60).
- TimePicker does not convert timezones. Store a separate date/timezone when scheduling real events.

## Minimal example

```tsx
import { useState } from 'react'
import { TimePicker } from '@/components/ui/moru/time-picker'

export function StartTime() {
  const [time, setTime] = useState<string | null>('09:00')
  return <TimePicker label="Start time" name="start" value={time} onValueChange={setTime} step={15} />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `InputHTMLAttributes` from `react`

```ts
interface TimePickerProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'size' | 'step' | 'min' | 'max'
> {
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  label?: string
  min?: string
  max?: string
  /** Interval in minutes, from 1 to 60. The step base is min, or midnight. */
  step?: number
  size?: 'sm' | 'md' | 'lg'
  clearable?: boolean
  error?: string
  loading?: boolean
}
```

Exported value type annotations / generic factory calls from source:

- `TimePicker: forwardRef<HTMLInputElement, TimePickerProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `TimePicker.defaultValue`: `null`
- `TimePicker.step`: `1`
- `TimePicker.size`: `'md'`
- `TimePicker.clearable`: `true`
- `TimePicker.loading`: `false`
