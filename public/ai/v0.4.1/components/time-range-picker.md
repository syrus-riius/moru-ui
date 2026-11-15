# Time Range Picker

Paired start/end time fields with duration feedback and optional overnight ranges.

Version: 0.4.1. Source hash: 3d50d8d1c9951acff47d57ffd227011e1e268683be793d82d543261e48d83ef7.

## Discovery

- Registry ID: `time-range-picker`
- Import: `@/components/ui/moru/time-range-picker`
- Runtime exports: `TimeRangePicker`
- Registry dependencies: [core](/ai/v0.4.1/core.md), [time-picker](/ai/v0.4.1/components/time-picker.md)
- Install source: [time-range-picker.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/time-range-picker.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/time-range-picker.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/time-range-picker.tsx)

## Usage and interaction

- TimeRangeValue is {start: string|null, end: string|null}. name submits two form fields.
- allowOvernight defaults to false. Opt in for ranges crossing midnight; application logic owns date/timezone interpretation.

## Minimal example

```tsx
import { useState } from 'react'
import { TimeRangePicker, type TimeRangeValue } from '@/components/ui/moru/time-range-picker'

export function MeetingTime() {
  const [range, setRange] = useState<TimeRangeValue>({ start: '09:00', end: '10:00' })
  return <TimeRangePicker label="Meeting time" name="meeting" value={range} onValueChange={setRange} step={15} />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `AriaAttributes` from `react`
- `TimeRangeValue` from `./time-utils`

```ts
interface TimeRangePickerProps {
  value?: TimeRangeValue
  defaultValue?: TimeRangeValue
  onValueChange?: (value: TimeRangeValue) => void
  label?: string
  startLabel?: string
  endLabel?: string
  /** A name produces `${name}.start` and `${name}.end` native form entries. */
  name?: string
  startName?: string
  endName?: string
  form?: string
  required?: boolean
  disabled?: boolean
  loading?: boolean
  readOnly?: boolean
  min?: string
  max?: string
  step?: number
  allowOvernight?: boolean
  size?: 'sm' | 'md' | 'lg'
  clearable?: boolean
  error?: string
  className?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: AriaAttributes['aria-invalid']
}

export type { TimeRangeValue } from './time-utils'
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function TimeRangePicker({
  value,
  defaultValue,
  onValueChange,
  label,
  startLabel: startLabelProp,
  endLabel: endLabelProp,
  name,
  startName,
  endName,
  form,
  required,
  disabled,
  loading = false,
  readOnly,
  min,
  max,
  step = 1,
  allowOvernight = false,
  size = 'md',
  clearable = true,
  error,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
}: TimeRangePickerProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `TimeRangePicker.loading`: `false`
- `TimeRangePicker.step`: `1`
- `TimeRangePicker.allowOvernight`: `false`
- `TimeRangePicker.size`: `'md'`
- `TimeRangePicker.clearable`: `true`
