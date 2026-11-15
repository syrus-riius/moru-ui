# Date Picker

Single-date field with a calendar popup, date bounds and native form integration.

Version: 0.4.1. Source hash: 5a0a4b244fa08e5ec114908231ad33098aa6646cb022935d28cab19340a90d48.

## Discovery

- Registry ID: `date-picker`
- Import: `@/components/ui/moru/date-picker`
- Runtime exports: `DatePicker`
- Registry dependencies: [calendar](/ai/v0.4.1/components/calendar.md), [core](/ai/v0.4.1/core.md), [popover](/ai/v0.4.1/components/popover.md)
- Install source: [date-picker.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/date-picker.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/date-picker.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/date-picker.tsx)

## Usage and interaction

- value/onValueChange use Date|null, not a date string. Name submits a local calendar date; handle timezone requirements in application logic.
- DatePicker has no outer size prop. Set calendarOptions.size to adjust its calendar; use minDate/maxDate for bounds.

## Minimal example

```tsx
import { useState } from 'react'
import { DatePicker } from '@/components/ui/moru/date-picker'

export function DueDate() {
  const [date, setDate] = useState<Date | null>(null)
  return <DatePicker label="Due date" name="dueDate" value={date} onValueChange={setDate} calendarOptions={{ variant: 'minimal', size: 'md' }} />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `AriaAttributes` from `react`
- `CalendarDisplayOptions` from `./calendar-options`

```ts
interface DatePickerProps {
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (value: Date | null) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  readOnly?: boolean
  required?: boolean
  name?: string
  form?: string
  minDate?: Date
  maxDate?: Date
  locale?: string
  clearable?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Customize the popup calendar without replacing value, constraints, or selection behavior. */
  calendarOptions?: CalendarDisplayOptions
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
function DatePicker({
  value,
  defaultValue,
  onValueChange,
  label,
  placeholder: placeholderProp,
  disabled = false,
  loading = false,
  readOnly = false,
  required = false,
  name,
  form,
  minDate,
  maxDate,
  locale: localeProp,
  clearable = true,
  size = 'md',
  calendarOptions,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
}: DatePickerProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `DatePicker.disabled`: `false`
- `DatePicker.loading`: `false`
- `DatePicker.readOnly`: `false`
- `DatePicker.required`: `false`
- `DatePicker.clearable`: `true`
- `DatePicker.size`: `'md'`
