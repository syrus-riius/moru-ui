# Calendar

Calendar with single-date or range selection, year/month navigation and display variants.

Version: 0.4.1. Source hash: 27e6f5b10b06dae29c6129d5ab80e735d6c44f2d84f74acf4149c979e0f65f4e.

## Discovery

- Registry ID: `calendar`
- Import: `@/components/ui/moru/calendar`
- Runtime exports: `Calendar`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [calendar.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/calendar.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/calendar.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/calendar.tsx)

## Usage and interaction

- Calendar uses mode="range" with {start, end} dates, or the default single date mode. CalendarDisplayOptions do not replace its value API.
- Use variant (default/minimal/schedule/activity), dayShape and dayData for presentation; keep the date grid keyboard behavior intact.

## Minimal example

```tsx
import { useState } from 'react'
import { Calendar } from '@/components/ui/moru/calendar'

export function PlanningCalendar() {
  const [date, setDate] = useState<Date | null>(null)
  return <Calendar value={date} onValueChange={setDate} variant="minimal" dayShape="circle" aria-label="Planning date" />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ReactNode` from `react`
- `CalendarRange` from `./calendar-utils`

```ts
interface CalendarDayData {
  label: string
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
  icon?: ReactNode
  count?: number
  completed?: boolean
}

interface CalendarCommonProps {
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  locale?: string
  className?: string
  variant?: 'default' | 'minimal' | 'schedule' | 'activity'
  size?: 'sm' | 'md' | 'lg'
  dayShape?: 'rounded' | 'square' | 'circle'
  weekStartsOn?: 0 | 1
  showOutsideDays?: boolean
  fixedWeeks?: boolean
  /** Local date keys (YYYY-MM-DD), independent of the displayed locale. */
  dayData?: Record<string, CalendarDayData>
  'aria-label'?: string
  'aria-describedby'?: string
}

interface CalendarSingleProps extends CalendarCommonProps {
  mode?: 'single'
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (value: Date) => void
}

interface CalendarRangeProps extends CalendarCommonProps {
  mode: 'range'
  value?: CalendarRange
  defaultValue?: CalendarRange
  onValueChange?: (value: CalendarRange) => void
}

type CalendarProps = CalendarSingleProps | CalendarRangeProps

export type { CalendarRange } from './calendar-utils'
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Calendar(props: CalendarProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Calendar.disabled`: `false`
- `Calendar.locale`: `formatLocale`
- `Calendar.variant`: `'default'`
- `Calendar.size`: `'sm'`
- `Calendar.dayShape`: `'rounded'`
- `Calendar.weekStartsOn`: `0`
- `Calendar.showOutsideDays`: `true`
- `Calendar.fixedWeeks`: `true`
- `Calendar.aria-label`: `props.mode === 'range' ? t('날짜 범위 선택') : t('날짜 선택')`
