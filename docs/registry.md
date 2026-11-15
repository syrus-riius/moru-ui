# Selective installation

Moru v0.4.1 distributes editable component sources through the shadcn CLI.
The registry has 90 items: a shared core, 81 UI entries, six reusable blocks, the
legacy Dialog alias and one support entry (`block-messages`, the block translations
that blocks install on their own). It covers all 79 components in the eight gallery
categories plus StatusMessage and FormattedInput. These are installation
entries, not the number of files or exported React components. Moru is not
published as an npm library.

The supported baseline is Node.js 24+, React 19.3, TypeScript, Vite and Tailwind CSS 4.
Prepare Tailwind and `components.json` using the
[shadcn Vite setup guide](https://ui.shadcn.com/docs/installation/vite), then run:

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/button.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/input.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/field.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/login.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/otp.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/search-filters.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/settings.json
```

Use `core.json` to install only the foundation. Other items resolve core and their
own dependencies automatically. Your UI alias determines the installation path;
Moru files go in its `moru/` subdirectory to coexist with existing components.
Registry targets remain `@ui/moru/`; the examples below use `@/components/ui` as
the consumer project's UI alias.

## Components by category

Use any item name below in `/r/v0.4.1/<item>.json`. Core and the six blocks
(`dashboard`, `login`, `signup`, `settings`, `otp`, `search-filters`) are additional entries.

| Category | UI entries | Item names |
| --- | ---: | --- |
| Forms and input | 26 | `field`, `input`, `formatted-input`, `number-input`, `password-input`, `textarea`, `checkbox`, `select`, `multi-select`, `switch`, `radio-group`, `slider`, `combobox`, `calendar`, `date-picker`, `date-range-picker`, `time-picker`, `time-range-picker`, `toggle-group`, `input-group`, `input-otp`, `label`, `native-select`, `file-input`, `attachment`, `questionnaire` |
| Actions | 5 | `button`, `command`, `button-group`, `kbd`, `toggle` |
| Overlays | 9 | `modal`, `menu`, `popover`, `tooltip`, `alert-dialog`, `sheet`, `context-menu`, `drawer`, `hover-card` |
| Navigation | 7 | `tabs`, `pagination`, `breadcrumb`, `menubar`, `navigation-menu`, `sidebar`, `stepper` |
| Layout | 14 | `header`, `footer`, `card`, `accordion`, `avatar`, `separator`, `aspect-ratio`, `direction`, `item`, `collapsible`, `carousel`, `resizable`, `scroll-area`, `typography` |
| Status and feedback | 12 | `badge`, `alert`, `progress`, `ring-progress`, `skeleton`, `toast`, `empty`, `spinner`, `loading-overlay`, `status-indicator`, `marker`, `status-message` |
| Data | 3 | `table`, `chart`, `data-table` |
| Conversation and content | 5 | `bubble`, `code-block`, `message`, `message-scroller`, `trace` |

Use `modal.json` and `Modal` from `@/components/ui/moru/modal` for new code.
Modal supports `default`, `confirmation`, `form`, `success` and `danger` variants,
and `sm`, `md`, `lg` and `full` sizes. Existing `dialog.json`, `Dialog` and
`DialogProps` imports remain available as compatibility aliases of Modal.
Header and Footer install through `header.json` and `footer.json` respectively.

For example, select one entry from each category; these commands do not install
the entire registry:

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/number-input.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/command.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/context-menu.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/navigation-menu.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/carousel.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/toast.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/data-table.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/code-block.json
```

Most imports use the item name as the filename. Exceptions and multi-export
entries include `direction` → `direction-provider` (`DirectionProvider`), `toast`
→ `ToastProvider`/`useToast`, and `resizable` → `ResizablePanelGroup`,
`ResizablePanel`, `ResizableHandle`. The dropdown item is `menu`, exporting `Menu`.

## Styles and theme

Import the styles once, and wrap the area that uses Moru:

```tsx
import '@/components/ui/moru/styles.css'
import { MoruProvider } from '@/components/ui/moru/provider'
import { LoginBlock } from '@/components/ui/moru/blocks/LoginBlock'

export function SignInPage() {
  return <MoruProvider mode="light"><LoginBlock /></MoruProvider>
}
```

Change the import prefix to match your aliases. The provider defaults to light;
`mode="dark"` supplies Moru's dark default tokens. A custom `tokens` value must
already match the chosen mode. Fonts are optional and fall back to system sans.

Shared CSS is included once and scoped to Moru's provider and theme portals. The
host's `:root` tokens are not replaced. Tailwind CSS 4 remains required for layout
utilities. Moru's small fallback utilities sit in the `base` cascade layer, so your
own Tailwind classes inside the provider (`flex md:hidden`, `text-sm` on a button)
keep working. `styles.css` may be imported before or after the components. Component-specific styles follow their sources. A composite component
may install other Moru entries that it imports. Recharts, TanStack Table, Embla and
React Resizable Panels are installed only when the selected dependency graph needs
them; installing Button does not install those features.
Some shared CSS files are downloaded with core even when their component is not
selected; the original component imports determine when those styles load.

Login and OTP are local interaction examples, not authentication services. Login
validates an email and an eight-character password without sending or storing it.
OTP uses `123456`. Replace the installed submit/resend handlers with your service.

## Providers and application data

`MoruProvider` supplies theme tokens and themed portals; it does not install
application-wide toast state. Install `toast` and place `ToastProvider` inside
`MoruProvider`. Call `useToast` from a child of the toast provider:

```tsx
import { MoruProvider } from '@/components/ui/moru/provider'
import { Button } from '@/components/ui/moru/button'
import { ToastProvider, useToast } from '@/components/ui/moru/toast'

function SaveAction() {
  const { toast } = useToast()
  return <Button onClick={() => toast({ title: 'Saved', tone: 'success' })}>Notify</Button>
}

export function Notifications() {
  return <MoruProvider><ToastProvider><SaveAction /></ToastProvider></MoruProvider>
}
```

Toast tones are `success`, `warning`, `info`, `danger`; `toast` returns an ID for
`dismiss(id)`. Set `duration: 0` in the toast options to keep it open.
Tooltip works without an explicit provider and
also exports `TooltipProvider` for shared delays. For right-to-left layouts, pair
`DirectionProvider` with `dir="rtl"` on the DOM boundary.

DataTable is a client-side table composition; pass `data`, Moru's
`DataTableColumn<T>[]`, a unique stable `getRowId` and a `caption`. Its selection
callback receives IDs, not row indexes. The installed TanStack Table version is
part of this implementation; use the exported column type rather than a column
type copied from a different major version. DataTable uses React's
`useEffectEvent`, so keep the supported React baseline.

```tsx
import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/ui/moru/data-table'
import { Chart } from '@/components/ui/moru/chart'

type Project = { id: string; name: string; tasks: number }
const projects: Project[] = [{ id: 'project-one', name: 'Launch', tasks: 12 }]
const columns: DataTableColumn<Project>[] = [
  { accessorKey: 'name', header: 'Project' },
  { accessorKey: 'tasks', header: 'Tasks' },
]

export function ProjectData() {
  const [selected, setSelected] = useState<string[]>([])
  return <>
    <DataTable data={projects} columns={columns} getRowId={(row) => row.id}
      caption="Projects" onSelectionChange={setSelected} />
    <p role="status">{selected.length} selected</p>
    <Chart title="Completed tasks" type="line" xKey="month" chartHeight={240}
      config={{ completed: { label: 'Completed', color: 'var(--ui-accent)' } }}
      data={[{ month: 'Nov', completed: 12 }, { month: 'Dec', completed: 18 }]} />
  </>
}
```

Render the example inside `MoruProvider` and install `data-table` and `chart`.
Chart requires `data`, `config`, `xKey` and `title`; types are `bar`, `line`, `area`,
`donut`. Keep a non-zero `chartHeight` and the available data-table alternative.
`ChartContainer` is also exported for custom Recharts compositions. Carousel
requires an `aria-label` and stable item IDs; Resizable exports the installed
panel library's API rather than a separate `Resizable` component.

NumberInput distinguishes `null` from `0`; MultiSelect uses string values and
repeated form entries, read with `FormData.getAll`. FileInput selects real files
and performs client-side checks; uploading and server validation belong to your
application. Questionnaire, Trace and messaging components provide UI and
callbacks, not backend execution or an AI service. CodeBlock copying uses the
browser clipboard and exposes `onCopyError` for unavailable clipboard access.

## Tabs, menus and overlays

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/tabs.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/menu.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/popover.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/drawer.json
```

Use these inside the existing `MoruProvider`, with the one-time stylesheet import
shown above. This example also uses the separately installed Button item.

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/moru/button'
import { Tabs } from '@/components/ui/moru/tabs'
import { Menu } from '@/components/ui/moru/menu'
import { Popover } from '@/components/ui/moru/popover'
import { Drawer } from '@/components/ui/moru/drawer'

export function WorkspaceNavigation() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  return <>
    <Tabs aria-label="Workspace views" defaultValue="projects" items={[
      { value: 'projects', label: 'Projects', content: <p>Project list</p> },
      { value: 'activity', label: 'Activity', content: <p>Recent activity</p> },
    ]} />
    <Menu trigger={<Button variant="secondary">Actions</Button>} items={[
      { label: 'Create project', onClick: () => setMessage('Create selected') },
      { label: 'Archive', disabled: true },
    ]} />
    <Popover trigger={<Button variant="secondary">Details</Button>}
      title="Workspace details" side="bottom" align="start">
      <p>Contextual information belongs here.</p>
    </Popover>
    <Drawer trigger={<Button>Open editor</Button>} title="Project editor"
      open={open} onOpenChange={setOpen}
      footer={<Button onClick={() => setOpen(false)}>Done</Button>}>
      <p>Place the editing form here.</p>
    </Drawer>
    <p role="status">{message}</p>
  </>
}
```

Tabs support controlled `value`/`onValueChange`, disabled items and vertical
orientation. Arrow keys move focus; Enter/Space activates by default. Use
`activateOnFocus` to opt into activation while arrowing between tabs. Menu items
provide `onClick`, `disabled`, `destructive` and optional icons. Popover supports
controlled or default-open state and positioning; Drawer is a bottom modal with
an optional trigger, footer and controlled or uncontrolled state. Popover and
Drawer expose `initialFocus` and `finalFocus`; Menu exposes `finalFocus`.
Their portals use the same Moru theme as their provider.

## Calendars, dates and times

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/calendar.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/date-picker.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/date-range-picker.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/time-picker.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/time-range-picker.json
```

Each item includes its required calendar, popup, styles and helpers. Keep the
shared stylesheet import and render inside `MoruProvider` as shown above.

```tsx
import { useState } from 'react'
import { Calendar, type CalendarRange } from '@/components/ui/moru/calendar'
import { DatePicker } from '@/components/ui/moru/date-picker'
import { DateRangePicker } from '@/components/ui/moru/date-range-picker'
import { TimePicker } from '@/components/ui/moru/time-picker'
import { TimeRangePicker, type TimeRangeValue } from '@/components/ui/moru/time-range-picker'

export function PlanningControls() {
  const [day, setDay] = useState<Date | null>(null)
  const [dates, setDates] = useState<CalendarRange>({ start: null, end: null })
  const [time, setTime] = useState<string | null>(null)
  const [times, setTimes] = useState<TimeRangeValue>({ start: '09:00', end: '10:00' })
  return <div style={{ display: 'grid', gap: 24 }}>
    <Calendar aria-label="Planning calendar" value={day} onValueChange={setDay}
      variant="minimal" dayShape="circle" weekStartsOn={1} />
    <DatePicker label="Due date" name="dueDate" value={day}
      onValueChange={setDay} calendarOptions={{ variant: 'schedule', dayShape: 'rounded' }} />
    <DateRangePicker label="Project period" name="period" value={dates}
      onValueChange={setDates} required />
    <TimePicker label="Reminder" name="reminder" value={time}
      onValueChange={setTime} min="08:00" max="20:00" step={15} />
    <TimeRangePicker label="Session" name="session" value={times}
      onValueChange={setTimes} step={15} required />
  </div>
}
```

Calendar supports single-date selection or `mode="range"` with a `CalendarRange`.
Its year/month headings open fast navigation. Display options include `variant`
(`default`, `minimal`, `schedule`, `activity`), `dayShape`, `size`, `weekStartsOn`,
`showOutsideDays`, `fixedWeeks` and date-keyed `dayData`. DatePicker and
DateRangePicker accept these display options through `calendarOptions` while
retaining their own value and form constraints.

Dates use local calendar `Date` values; create fixed dates with
`new Date(year, monthIndex, day)`. Calendar itself has no form submission field.
DatePicker submits `name` as `YYYY-MM-DD`; DateRangePicker submits `name.start`
and `name.end`. Its value is `{ start: Date | null, end: Date | null }`.
TimePicker uses `HH:mm | null`, and TimeRangePicker uses
`{ start: string | null, end: string | null }` with `name.start`/`name.end` entries.
`step={15}` means 15 minutes, with `min` as the step base when supplied.
Time values are wall-clock values without timezone conversion. Time ranges
require an end after the start on the same day unless `allowOvernight` is enabled;
equal start/end values are not a valid range. Pickers also accept `disabled`,
`loading`, `readOnly` and `required`. Uncontrolled pickers restore `defaultValue`
on a form reset; controlled callers update their values in the form's `onReset`.

Versioned HTTP items and dependencies use `/r/v0.4.1/`. GitHub registry items use
`syrus-riius/moru-ui/button#v0.4.1` with independently pinned dependency refs.
Published `/r/v0.3.1/`, `/r/v0.3.2/`, `/r/v0.3.3/`, `/r/v0.3.4/` and `/r/v0.4.0/` remain unchanged; their existing
installation URLs continue to select those versions. Tabs/Menu/Popover/Drawer
start at v0.3.3; the five calendar/date/time items start at v0.3.4.
Commit your local changes before upgrading, review diffs and avoid unconditional
`--overwrite` when you have customized installed sources.

Original sources remain in `src/`. Generate artifacts with `npm run registry:build`
and check freshness with `npm run registry:check`. Do not edit generated files.
The registry targets web React. Next.js SSR/hydration and Native/Expo consumption
remain outside its supported baseline. v0.4.1 was checked locally with the unit
tests, the production build, a CLI installation smoke test against the v0.4.1
payloads and a before/after browser comparison of the lab; CI has not run for it.

## Upgrading from v0.4.0

v0.4.1 fixes cascade and focus problems and reorganizes the installed stylesheets.
Commit your files first, then reinstall the items you use.

- **Stylesheets are per component.** `controls-completion.css`, `advanced-controls.css`,
  `navigation-completion.css`, `content-completion.css`, `data-completion.css`,
  `enhanced-inputs.css`, `advanced-overlays.css`, `workflow-patterns.css`,
  `page-chrome.css`, `overlays.css` and `time-controls.css` are gone. Each component
  now imports `<component>.css`, plus a small `*-shared.css` where several components
  share rules. Delete the old files after reinstalling; nothing imports them.
- **Your Tailwind classes win inside the provider.** The fallback utilities moved to
  the `base` cascade layer, so `flex md:hidden` or `text-sm` on your own elements
  are no longer overridden. `styles.css` may be imported before or after components.
- **Busy controls keep focus.** A `loading` Button uses `aria-disabled` instead of
  the `disabled` attribute, and so do the DatePicker and DateRangePicker triggers.
  `loading` on Input, Textarea, Checkbox, Switch, Select, Combobox, MultiSelect,
  NumberInput, InputOTP and the time pickers makes the control read-only, so its
  value is still submitted with the form. Use `disabled` when the value must not be
  sent. FileInput and NativeSelect have no read-only mode and stay disabled while busy.
- **Button labels wrap by default**, as they already did in practice.
  `textWrap="nowrap"` now keeps a single line.
- **Block copy is a separate item.** Blocks install `block-messages` automatically;
  core no longer carries their translations.
- **New props.** Menu accepts `open`, `defaultOpen` and `onOpenChange`; Select accepts
  `value={null}`; Switch accepts `loading`; Select, Combobox, Checkbox and Switch
  forward a ref.
- Chart's empty state uses `ui-chart-empty` instead of `ui-data-table-empty`.

See the [한국어 guide](registry.ko.md), [MIT license](../LICENSE) and
[third-party notices](../NOTICE.md).

SearchFiltersBlock accepts external items, controlled filters and an onSelect callback with the actual item ID. SettingsBlock accepts draft values and an async onSave; failed saves preserve the draft. See the [project/task app template](project-template.ko.md) for a complete local-persistence integration.
