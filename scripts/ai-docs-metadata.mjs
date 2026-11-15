// Human-authored usage guidance. APIs and defaults are extracted by build-ai-docs.mjs.
export const itemGuidance = {
  progress: {
    notes: [
      'Use value=null for indeterminate work; never invent a completion percentage. max defaults to 100; invalid numeric values are normalized.',
      'bufferValue uses the same units as value and describes work prepared ahead, not completed. It cannot be below the completion value. Use an adjacent description to explain buffering when needed.',
      'size is sm/md/lg, tone is primary/success/warning/danger/info. striped adds a pattern; animated opts into moving stripes. paused stops repeating motion. System reduced-motion settings disable animation.',
      'Keep cancel and retry buttons outside Progress: progressbar descendants are presentational. Announce start and completion in a separate status region, not every percentage change.',
    ],
    example: `import { Progress } from '@/components/ui/moru/progress'
export function UploadProgress() {
  return <Progress label="Uploading files" value={42} bufferValue={68} showValue size="md" />
}`,
  },
  spinner: {
    notes: [
      'Variants are ring (default), dots and bars; sizes are sm/md/lg. Use for waiting whose percentage is unknown.',
      'Provide a meaningful label for a standalone Spinner. Use decorative when a surrounding status message already announces the same operation, to avoid duplicate announcements.',
      'paused stops repeating motion and reduced-motion is respected automatically. Do not leave users waiting indefinitely without a way to cancel or retry real work.',
    ],
    example: `import { Spinner } from '@/components/ui/moru/spinner'
export function SaveStatus() {
  return <div role="status"><Spinner variant="dots" decorative /> Saving changes</div>
}`,
  },
  skeleton: {
    notes: [
      'animation is pulse (default), shimmer or none. paused stops motion. Skeleton is always decorative/aria-hidden.',
      'Match the eventual content geometry to avoid layout shifts. Mark the containing content aria-busy and announce loading/completion once in a separate live status outside the busy region.',
    ],
    example: `import { Skeleton } from '@/components/ui/moru/skeleton'
export function ContentPlaceholder() {
  return <div aria-busy="true"><Skeleton animation="shimmer" style={{ height: 120 }} /></div>
}`,
  },
  'loading-overlay': {
    notes: [
      'Wrap content in LoadingOverlay and control loading from the actual request lifecycle. Content remains mounted and becomes inert while busy. The status lives outside the busy/inert content.',
      'Keep cancel/retry/complete controls outside the covered content. Close already-open portaled menus before starting loading; inert covers only descendants.',
      'If loading starts while a child owns focus, focus moves to the loading status without scrolling. It restores only if the status still owns focus. Focus elsewhere is not stolen. This is a local boundary, not a modal or focus trap.',
      'label defaults to the localized loading text; description adds detail. spinnerVariant accepts ring/dots/bars and paused stops its motion.',
    ],
    example: `import { LoadingOverlay } from '@/components/ui/moru/loading-overlay'
import { Input } from '@/components/ui/moru/input'
export function SavingForm({ saving }: { saving: boolean }) {
  return <LoadingOverlay loading={saving} label="Saving settings" spinnerVariant="dots">
    <label>Project name<Input name="name" defaultValue="Moru" /></label>
  </LoadingOverlay>
}`,
  },
  'status-indicator': {
    notes: [
      'Always provide readable label text: color and an animated dot alone do not explain status. tone is neutral/success/warning/danger/info.',
      'pulse is opt-in for ongoing activity; paused and system reduced-motion stop the animation. Use live="polite" for changing status text; default static indicators do not announce themselves.',
      'Use Spinner for a wait, Progress for a known amount, and StatusIndicator for persistent connectivity or synchronization state.',
    ],
    example: `import { StatusIndicator } from '@/components/ui/moru/status-indicator'
export function SyncStatus({ syncing }: { syncing: boolean }) {
  return <StatusIndicator label={syncing ? "Syncing" : "Saved"}
    tone={syncing ? "info" : "success"} pulse={syncing} live="polite" />
}`,
  },
  button: {
    notes: [
      'Use type="button" for non-submit actions inside forms. loading locks activation and announces busy state while the button stays focusable (aria-disabled, not the disabled attribute), so keyboard focus is not lost; keep a meaningful text label.',
      'Variants are primary, secondary, ghost, danger. Do not substitute shadcn variant names.',
      'A label wraps on its own when its container is too narrow. textWrap="wrap" marks a label that is expected to wrap and tightens its vertical padding while preserving the S/M/L minimum height; textWrap="nowrap" forces a single line. Reflow the parent action row before truncating action text.',
    ],
    example: `import { Button } from '@/components/ui/moru/button'

export function SaveAction() {
  return <Button type="button" variant="primary" onClick={() => window.alert('Saved')}>Save changes</Button>
}`,
  },
  'toggle-group': {
    notes: [
      'layout="wrap" is the default for groups that may use multiple rows. Use layout="segmented" for equal-width choices that must stay together in one row.',
      'In a narrow card, move the whole segmented group below neighboring content. Long labels can wrap inside each choice; keep a meaningful aria-label and the existing keyboard order.',
    ],
    example: `import { ToggleGroup } from '@/components/ui/moru/toggle-group'
export function ReportingPeriod() {
  return <ToggleGroup layout="segmented" aria-label="Reporting period" preventEmpty
    defaultValue={["week"]} items={[{ value: "week", label: "Weekly" }, { value: "month", label: "Monthly" }]} />
}`,
  },
  chart: {
    notes: [
      'Keep full category names in data. xAxisTickFormatter abbreviates only visual tick labels; tooltips and the data table preserve the original values.',
      'xAxisInterval={0} retains every category tick. Use it with compact labels and enough plot width; the default collision-aware behavior is unchanged.',
    ],
    example: `import { Chart } from '@/components/ui/moru/chart'
export function WeeklyActivity() {
  return <Chart title="Weekly activity" xKey="day"
    data={[{ day: "Monday", tasks: 24 }, { day: "Tuesday", tasks: 36 }, { day: "Wednesday", tasks: 28 }]}
    config={{ tasks: { label: "Completed tasks", color: "var(--ui-primary)" } }}
    xAxisInterval={0} xAxisTickFormatter={(value) => String(value).slice(0, 1)} />
}`,
  },
  input: {
    notes: [
      'Use Field for the visible label, description and error connection. Placeholder text is not a label.',
      'onValueChange receives the string; native onChange receives an event. Keep controlled values defined from the first render.',
      'loading makes the field read-only and busy instead of disabled: it keeps focus and its value is still submitted with the form. Use disabled when the value must not be sent.',
    ],
    example: `import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { Input } from '@/components/ui/moru/input'

export function ProjectName() {
  const [name, setName] = useState('')
  return <Field label="Project name" description="Choose a recognizable name.">
    <Input name="projectName" value={name} onValueChange={setName} autoComplete="off" />
  </Field>
}`,
  },
  'formatted-input': {
    notes: [
      'Use FormattedInput for opt-in formatting; ordinary Input remains unchanged. Supported format values: card-number, card-expiry, card-cvc, phone, email, url, ipv4, ipv6, postal-code.',
      'value, defaultValue, onValueChange and native FormData contain the displayed formatted string. Do not assume callbacks return unformatted digits. onValueChange is the canonical formatted value callback; onChange receives native events only and is not fired for manual separator deletion. Use Field for label, description and error.',
      'validateFormattedInput is an optional helper exported alongside FormattedInput. It returns a Korean error key or null; translate errors for your app. Empty optional fields are valid; handle required values separately. Validate on blur or submit, without interrupting typing.',
      'Phone grouping and postal-code validation target South Korea; +international phone values only get basic syntax validation. Card checks are formatting and checksum only, not payment authorization. IP and URL syntax do not prove network reachability.',
      'Do not persist payment input in demonstration state storage. In production payment flows use your payment provider integration as appropriate.',
    ],
    example: `import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { FormattedInput, validateFormattedInput } from '@/components/ui/moru/formatted-input'

export function ContactPhone() {
  const [phone, setPhone] = useState('')
  const [touched, setTouched] = useState(false)
  const error = touched ? validateFormattedInput('phone', phone) : null
  return <Field label="Phone number" error={error ?? undefined}>
    <FormattedInput format="phone" name="phone" value={phone} onValueChange={setPhone}
      onBlur={() => setTouched(true)} placeholder="010-1234-5678" />
  </Field>
}`,
  },
  field: {
    notes: [
      'Field connects Moru inputs to labels, descriptions and errors. Put the field control inside its children.',
      'Show an actionable error without deleting the entered value. Do not add a second competing aria-label to an already labelled field.',
    ],
    example: `import { Field } from '@/components/ui/moru/field'
import { Input } from '@/components/ui/moru/input'

export function EmailField() {
  return <Field label="Email" description="We will send your invitation here.">
    <Input name="email" type="email" autoComplete="email" required />
  </Field>
}`,
  },
  card: {
    notes: [
      'Card is a single HTML div surface. CardHeader/CardContent are not Moru exports.',
      'Compose semantic content and use the common spacing tokens; avoid nested arbitrary padding that doubles the surface inset.',
    ],
    example: `import { Card } from '@/components/ui/moru/card'

export function Summary() {
  return <Card style={{ display: 'grid', gap: 'var(--ui-field-gap)' }}>
    <h2 style={{ margin: 0 }}>Project overview</h2>
    <p style={{ margin: 0 }}>Your next milestone is ready to review.</p>
  </Card>
}`,
  },
  header: {
    notes: [
      'brand is required. Compose navigation and actions as React nodes; Header does not invent routes or own authentication.',
      'Variants are navigation, centered and app. The small-screen navigation is an inline disclosure; preserve its menu button, Escape handling and focus return.',
      'Use ordinary links for page navigation and mark the current destination with aria-current="page". Give separate navigation regions distinct navigationLabel values.',
    ],
    example: `import { Header } from '@/components/ui/moru/header'

export function SiteHeader() {
  return <Header brand={<a href="/">Moru</a>} navigationLabel="Primary navigation"
    navigation={<><a href="/projects" aria-current="page">Projects</a><a href="/settings">Settings</a></>}
    actions={<a href="/account">Account</a>} />
}`,
  },
  footer: {
    notes: [
      'Variants are simple, columns and compact. Use navigation for a flat group, or columns with title and content for grouped links.',
      'columns is an array of {title, content, label?}; it is not a list of route objects. Each content value is a React node.',
      'Use copyright and meta for supporting information; preserve semantic footer/nav landmarks and give repeated navigation groups distinct labels.',
    ],
    example: `import { Footer } from '@/components/ui/moru/footer'

export function SiteFooter() {
  return <Footer variant="columns" brand="Moru" description="Build with care."
    columns={[
      { title: 'Product', content: <><a href="/components">Components</a><a href="/docs">Documentation</a></> },
      { title: 'Company', content: <><a href="/about">About</a><a href="/contact">Contact</a></> },
    ]}
    copyright="© Moru" meta={<a href="/privacy">Privacy</a>} />
}`,
  },
  textarea: {
    notes: [
      'Use native onChange(event), not onValueChange. Keep a visible label through Field.',
      'Allow multiline text to grow or scroll; do not hide entered content behind a fixed clipped height.',
      'loading makes the field read-only and busy instead of disabled, so focus and the submitted value are kept.',
    ],
    example: `import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { Textarea } from '@/components/ui/moru/textarea'

export function Notes() {
  const [notes, setNotes] = useState('')
  return <Field label="Notes"><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} /></Field>
}`,
  },
  'input-otp': {
    notes: [
      'InputOTP uses one real input with visual slots. Preserve its paste, numeric filtering and one-time-code autofill behavior; do not rebuild separate slot inputs.',
      'onComplete reports input completion, not successful authentication. Verify codes on your server and handle resend/rate limiting in the application.',
    ],
    example: `import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { InputOTP } from '@/components/ui/moru/input-otp'

export function VerificationCode() {
  const [code, setCode] = useState('')
  return <Field label="Verification code" description="Enter the six-digit code.">
    <InputOTP name="code" length={6} value={code} onValueChange={setCode} />
  </Field>
}`,
  },
  select: {
    notes: [
      'Moru Select accepts items; it has no SelectTrigger/SelectContent/SelectItem exports.',
      'Use value/onValueChange for controlled selection; pass value={null} for a controlled select with nothing chosen (the placeholder is shown). Preserve keyboard navigation and disabled options.',
    ],
    example: `import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { Select } from '@/components/ui/moru/select'

export function Visibility() {
  const [value, setValue] = useState('team')
  return <Field label="Visibility"><Select name="visibility" value={value} onValueChange={setValue}
    items={[{ value: 'private', label: 'Private' }, { value: 'team', label: 'Team' }]} /></Field>
}`,
  },
  tabs: {
    notes: [
      'Tabs uses items with value, label and content; do not invent TabsList/TabTrigger exports.',
      'Default activateOnFocus=false: arrows move focus; Enter/Space selects. Use tabs for views inside a page, ordinary links for navigation.',
    ],
    example: `import { Tabs } from '@/components/ui/moru/tabs'

export function ProjectTabs() {
  return <Tabs aria-label="Project views" defaultValue="overview" items={[
    { value: 'overview', label: 'Overview', content: <p>Project summary</p> },
    { value: 'activity', label: 'Activity', content: <p>Recent updates</p> },
  ]} />
}`,
  },
  menu: {
    notes: [
      'Menu accepts a ReactElement trigger and items with onClick. The export is Menu, not DropdownMenu.',
      'Use a trigger that forwards its props/ref (Moru Button does). Preserve focus restoration and keyboard activation.',
      'Menu manages its own open state by default. open/defaultOpen/onOpenChange are available when the application needs to control it, as with Popover and Modal.',
    ],
    example: `import { Button } from '@/components/ui/moru/button'
import { Menu } from '@/components/ui/moru/menu'

export function Actions() {
  return <Menu trigger={<Button type="button" variant="secondary">Actions</Button>}
    items={[{ label: 'Copy project name', onClick: () => void navigator.clipboard.writeText('Moru project') }]} />
}`,
  },
  modal: {
    notes: [
      'title is required. Use open/onOpenChange for controlled modals or defaultOpen for an initially open uncontrolled modal.',
      'Variants are default, confirmation, form, success and danger. Sizes are sm, md, lg and full. A variant changes presentation; implement the actual confirmation, submission or deletion in the application.',
      'Retain managed focus, Escape dismissal and focus return. Avoid nesting interactive elements inside the trigger.',
    ],
    example: `import { Button } from '@/components/ui/moru/button'
import { Modal } from '@/components/ui/moru/modal'

export function ProjectDetails() {
  return <Modal trigger={<Button type="button">Project details</Button>} title="Project details" description="Review the current milestone." size="md">
    <p>The design review is ready.</p>
  </Modal>
}`,
  },
  dialog: {
    notes: [
      'Legacy compatibility entry only. Dialog and DialogProps alias Modal and ModalProps. Existing imports remain valid; use modal.json and the Modal export for new code.',
      'Read the modal dependency documentation for the canonical API, supported variations and examples. Dialog is not a second, different component.',
    ],
  },
  popover: {
    notes: [
      'Use Popover for anchored supporting content. Keep its trigger focusable and give the popup a title or aria-label.',
      'Positioning and portals are owned by Moru; do not move the popup outside the theme provider manually.',
    ],
    example: `import { Button } from '@/components/ui/moru/button'
import { Popover } from '@/components/ui/moru/popover'

export function Help() {
  return <Popover trigger={<Button type="button" variant="ghost">About visibility</Button>} title="Team visibility">
    <p>Only invited teammates can open this project.</p>
  </Popover>
}`,
  },
  drawer: {
    notes: [
      'Drawer is a bottom modal with a required title. Preserve its focus management and keyboard-accessible dismissal.',
      'Use the component’s existing pointer/keyboard handle; do not make swipe the only way to close.',
    ],
    example: `import { Button } from '@/components/ui/moru/button'
import { Drawer } from '@/components/ui/moru/drawer'

export function MobileDetails() {
  return <Drawer trigger={<Button type="button">Details</Button>} title="Project details" description="Your current milestone.">
    <p>Three tasks remain before launch.</p>
  </Drawer>
}`,
  },
  switch: {
    notes: [
      'Web Switch uses checked/onCheckedChange, not value/onValueChange. Its label and description are part of the clickable label.',
      'Use for independent on/off settings; provide clear text explaining the enabled state.',
      'loading shows progress in the thumb and locks the switch as read-only, so it stays focusable while a change is being saved.',
    ],
    example: `import { useState } from 'react'
import { Switch } from '@/components/ui/moru/switch'

export function Notifications() {
  const [checked, setChecked] = useState(true)
  return <Switch label="Project updates" description="Notify me about new comments." checked={checked} onCheckedChange={setChecked} />
}`,
  },
  calendar: {
    notes: [
      'Calendar uses mode="range" with {start, end} dates, or the default single date mode. CalendarDisplayOptions do not replace its value API.',
      'Use variant (default/minimal/schedule/activity), dayShape and dayData for presentation; keep the date grid keyboard behavior intact.',
    ],
    example: `import { useState } from 'react'
import { Calendar } from '@/components/ui/moru/calendar'

export function PlanningCalendar() {
  const [date, setDate] = useState<Date | null>(null)
  return <Calendar value={date} onValueChange={setDate} variant="minimal" dayShape="circle" aria-label="Planning date" />
}`,
  },
  'date-picker': {
    notes: [
      'value/onValueChange use Date|null, not a date string. Name submits a local calendar date; handle timezone requirements in application logic.',
      'DatePicker has no outer size prop. Set calendarOptions.size to adjust its calendar; use minDate/maxDate for bounds.',
    ],
    example: `import { useState } from 'react'
import { DatePicker } from '@/components/ui/moru/date-picker'

export function DueDate() {
  const [date, setDate] = useState<Date | null>(null)
  return <DatePicker label="Due date" name="dueDate" value={date} onValueChange={setDate} calendarOptions={{ variant: 'minimal', size: 'md' }} />
}`,
  },
  'date-range-picker': {
    notes: [
      'A range is {start: Date|null, end: Date|null}; allow the intermediate state with only a start date.',
      'name submits name.start and name.end. Do not substitute an array or shadcn’s from/to object.',
    ],
    example: `import { useState } from 'react'
import type { CalendarRange } from '@/components/ui/moru/calendar'
import { DateRangePicker } from '@/components/ui/moru/date-range-picker'

export function Schedule() {
  const [range, setRange] = useState<CalendarRange>({ start: null, end: null })
  return <DateRangePicker label="Project dates" name="schedule" value={range} onValueChange={setRange} />
}`,
  },
  'time-picker': {
    notes: [
      'Values are HH:mm wall-clock strings or null, not Date instances. step is a minute increment (1–60).',
      'TimePicker does not convert timezones. Store a separate date/timezone when scheduling real events.',
    ],
    example: `import { useState } from 'react'
import { TimePicker } from '@/components/ui/moru/time-picker'

export function StartTime() {
  const [time, setTime] = useState<string | null>('09:00')
  return <TimePicker label="Start time" name="start" value={time} onValueChange={setTime} step={15} />
}`,
  },
  'time-range-picker': {
    notes: [
      'TimeRangeValue is {start: string|null, end: string|null}. name submits two form fields.',
      'allowOvernight defaults to false. Opt in for ranges crossing midnight; application logic owns date/timezone interpretation.',
    ],
    example: `import { useState } from 'react'
import { TimeRangePicker, type TimeRangeValue } from '@/components/ui/moru/time-range-picker'

export function MeetingTime() {
  const [range, setRange] = useState<TimeRangeValue>({ start: '09:00', end: '10:00' })
  return <TimeRangePicker label="Meeting time" name="meeting" value={range} onValueChange={setRange} step={15} />
}`,
  },
  dashboard: {
    notes: [
      'DashboardBlock composes a complete project overview with Moru controls and SearchFiltersBlock. Its default data and actions are local examples, not a connected backend.',
      'title and defaultProjects customize the initial screen. onProjectsChange reports local project changes; it is a notification callback, not an awaited persistence handler or a controlled value prop.',
      'Use #blocks/dashboard for the interactive preview. Keep search filters inside the dashboard instead of treating them as an entire application screen.',
    ],
    example: `import { DashboardBlock } from '@/components/ui/moru/blocks/DashboardBlock'

export function ProjectOverview() {
  return <DashboardBlock />
}`,
  },
  signup: {
    notes: [
      'SignupBlock currently takes no props and composes account details, email verification and completion into a single signup screen flow. The local verification code is 123456; no account or email is created. Edit installed handlers to integrate authentication; do not invent callback props.',
      'Use #blocks/signup for the interactive preview. Connect server-side account creation and verification before production use, retaining validation and focus behavior.',
    ],
    example: `import { SignupBlock } from '@/components/ui/moru/blocks/SignupBlock'

export function SignupScreen() {
  return <SignupBlock />
}`,
  },
  login: {
    notes: [
      'LoginBlock currently takes no props. It validates locally, waits briefly and displays demo feedback; it does not authenticate or persist credentials.',
      'Edit the installed submit handler to call your authentication service. Do not invent onLogin/onSubmit props on this block.',
    ],
    example: `import { LoginBlock } from '@/components/ui/moru/blocks/LoginBlock'

export function LoginPreview() {
  return <LoginBlock />
}`,
  },
  otp: {
    notes: [
      'A supporting step for signup, not a standalone gallery screen. The screen preview is #blocks/signup.',
      'OTPBlock takes no props and accepts 123456 in its local demonstration. Verification and resend do not contact a server.',
      'Replace the installed demo handlers with server verification/resend and expiry/rate limits. Do not invent onVerify props.',
    ],
    example: `import { OTPBlock } from '@/components/ui/moru/blocks/OTPBlock'

export function VerificationPreview() {
  return <OTPBlock />
}`,
  },
  'search-filters': {
    notes: [
      'A supporting region for dashboard and application screens. The screen preview is #blocks/dashboard.',
      'Omitting props shows demo data. Supply items, filters/onFiltersChange and onSelect for application data.',
      'Filtering is local. Connect server requests/pagination explicitly if your dataset requires them.',
    ],
    example: `import { useState } from 'react'
import { SearchFiltersBlock, type SearchFiltersValue } from '@/components/ui/moru/blocks/SearchFiltersBlock'

export function ProjectSearch() {
  const [filters, setFilters] = useState<SearchFiltersValue>({ query: '', status: 'all', mineOnly: false })
  return <SearchFiltersBlock filters={filters} onFiltersChange={setFilters}
    items={[{ id: 'launch', name: 'Launch', summary: 'Prepare the next release.', status: 'active', owner: 'me' }]}
    onSelect={(id) => window.alert(id)} />
}`,
  },
  settings: {
    notes: [
      'value/onValueChange describe the draft; onSave receives a validated value and may return a Promise. Reject/throw to keep the error visible.',
      'The cancel baseline is the last successful save. Without onSave this is a local demo, not persisted settings.',
    ],
    example: `import { SettingsBlock } from '@/components/ui/moru/blocks/SettingsBlock'

export function WorkspaceSettings() {
  return <SettingsBlock onSave={async (value) => {
    const response = await fetch('/api/workspace/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value),
    })
    if (!response.ok) throw new Error('Could not save settings. Try again.')
  }} />
}`,
  },
  toast: {
    notes: [
      'ToastProvider must wrap consumers of useToast. Inspect the exported provider and hook signatures below before composing toast actions.',
    ],
  },
}
