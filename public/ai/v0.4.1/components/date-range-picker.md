# Date Range Picker

Start/end date field with range selection, calendar display options and native form integration.

Version: 0.4.1. Source hash: baf065ccb1fccaa4eed187992c95b92d1b8fd9b7084c361d9faa54b0f7c55c24.

## Discovery

- Registry ID: `date-range-picker`
- Import: `@/components/ui/moru/date-range-picker`
- Runtime exports: `DateRangePicker`
- Registry dependencies: [calendar](/ai/v0.4.1/components/calendar.md), [core](/ai/v0.4.1/core.md), [popover](/ai/v0.4.1/components/popover.md)
- Install source: [date-range-picker.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/date-range-picker.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/date-range-picker.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/date-range-picker.tsx)

## Usage and interaction

- A range is {start: Date|null, end: Date|null}; allow the intermediate state with only a start date.
- name submits name.start and name.end. Do not substitute an array or shadcn’s from/to object.

## Minimal example

```tsx
import { useState } from 'react'
import type { CalendarRange } from '@/components/ui/moru/calendar'
import { DateRangePicker } from '@/components/ui/moru/date-range-picker'

export function Schedule() {
  const [range, setRange] = useState<CalendarRange>({ start: null, end: null })
  return <DateRangePicker label="Project dates" name="schedule" value={range} onValueChange={setRange} />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `AriaAttributes` from `react`
- `CalendarRange` from `./calendar`
- `CalendarDisplayOptions` from `./calendar-options`

```ts
interface DateRangePickerProps {
  value?: CalendarRange | null
  defaultValue?: CalendarRange | null
  onValueChange?: (value: CalendarRange) => void
  /** Submits two values: `${name}.start` and `${name}.end`. */
  name?: string
  startName?: string
  endName?: string
  form?: string
  label?: string
  placeholder?: string
  required?: boolean
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  loading?: boolean
  readOnly?: boolean
  locale?: string
  clearable?: boolean
  /** Display options for the shared calendar; range value and validation remain owned by this picker. */
  calendarOptions?: CalendarDisplayOptions
  size?: 'sm' | 'md' | 'lg'
  className?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: AriaAttributes['aria-invalid']
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function DateRangePicker({
  value,
  defaultValue,
  onValueChange,
  name,
  startName,
  endName,
  form,
  label,
  placeholder: placeholderProp,
  required = false,
  minDate,
  maxDate,
  disabled = false,
  loading = false,
  readOnly = false,
  locale: localeProp,
  clearable = true,
  calendarOptions,
  size = 'md',
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
}: DateRangePickerProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `DateRangePicker.required`: `false`
- `DateRangePicker.disabled`: `false`
- `DateRangePicker.loading`: `false`
- `DateRangePicker.readOnly`: `false`
- `DateRangePicker.clearable`: `true`
- `DateRangePicker.size`: `'md'`
