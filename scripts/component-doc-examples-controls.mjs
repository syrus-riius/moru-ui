// Complete examples for component documentation. Imports use registry paths here;
// the documentation generator resolves them to the matching npm entry points.
export const controlDocExamples = {
  'number-input': `import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { NumberInput } from '@/components/ui/moru/number-input'

export function QuantityField() {
  const [quantity, setQuantity] = useState<number | null>(1)
  return (
    <Field label="Quantity" description="Choose between 1 and 20 items.">
      <NumberInput name="quantity" min={1} max={20} step={1}
        value={quantity} onValueChange={setQuantity} />
    </Field>
  )
}`,
  'password-input': `import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { PasswordInput } from '@/components/ui/moru/password-input'

export function PasswordField() {
  const [password, setPassword] = useState('')
  return (
    <Field label="Password">
      <PasswordInput name="password" autoComplete="current-password"
        value={password} onValueChange={setPassword} required />
    </Field>
  )
}`,
  checkbox: `import { useState } from 'react'
import { Checkbox } from '@/components/ui/moru/checkbox'

export function EmailPreference() {
  const [enabled, setEnabled] = useState(true)
  return (
    <Checkbox name="emailUpdates" checked={enabled} onCheckedChange={setEnabled}
      label="Email updates" description="Receive project news by email." />
  )
}`,
  'multi-select': `import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { MultiSelect } from '@/components/ui/moru/multi-select'

export function TeamPicker() {
  const [members, setMembers] = useState<string[]>(['sara'])
  return (
    <Field label="Team members" description="Choose up to three people.">
      <MultiSelect name="members" value={members} onValueChange={setMembers}
        maxSelected={3} items={[
          { value: 'sara', label: 'Sara Kim' },
          { value: 'alex', label: 'Alex Lee' },
          { value: 'june', label: 'June Park' },
        ]} />
    </Field>
  )
}`,
  'radio-group': `import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { RadioGroup } from '@/components/ui/moru/radio-group'

export function PlanPicker() {
  const [plan, setPlan] = useState('personal')
  return (
    <Field label="Plan">
      <RadioGroup name="plan" value={plan} onValueChange={setPlan} items={[
        { value: 'personal', label: 'Personal', description: 'For individual projects.' },
        { value: 'team', label: 'Team', description: 'For shared workspaces.' },
      ]} />
    </Field>
  )
}`,
  slider: `import { useState } from 'react'
import { Slider } from '@/components/ui/moru/slider'

export function VolumeControl() {
  const [volume, setVolume] = useState(50)
  return (
    <Slider label="Volume" name="volume" min={0} max={100} step={5}
      value={volume} onValueChange={setVolume} showValue />
  )
}`,
  combobox: `import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { Combobox } from '@/components/ui/moru/combobox'

export function AssigneePicker() {
  const [assignee, setAssignee] = useState<string | null>(null)
  return (
    <Field label="Assignee">
      <Combobox name="assignee" placeholder="Search people"
        value={assignee} onValueChange={setAssignee} items={[
          { value: 'sara', label: 'Sara Kim', description: 'Design' },
          { value: 'alex', label: 'Alex Lee', description: 'Engineering' },
        ]} />
    </Field>
  )
}`,
  'input-group': `import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/moru/input-group'

export function WebsiteField() {
  const [domain, setDomain] = useState('')
  return (
    <Field label="Website domain" description="Enter the domain without https://.">
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput name="domain" value={domain} onValueChange={setDomain}
          placeholder="example.com" autoCapitalize="none" spellCheck={false} />
      </InputGroup>
    </Field>
  )
}`,
  label: `import { useId } from 'react'
import { Label } from '@/components/ui/moru/label'
import { Input } from '@/components/ui/moru/input'

export function ProjectNameField() {
  const id = useId()
  return (
    <div style={{ display: 'grid', gap: 'var(--ui-field-gap, 8px)' }}>
      <Label htmlFor={id}>Project name</Label>
      <Input id={id} name="projectName" placeholder="My project" />
    </div>
  )
}`,
  'native-select': `import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { NativeSelect } from '@/components/ui/moru/native-select'

export function VisibilityField() {
  const [visibility, setVisibility] = useState('private')
  return (
    <Field label="Visibility">
      <NativeSelect name="visibility" value={visibility} onValueChange={setVisibility}>
        <option value="private">Only me</option>
        <option value="team">My team</option>
      </NativeSelect>
    </Field>
  )
}`,
  'file-input': `import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { FileInput } from '@/components/ui/moru/file-input'

export function DocumentPicker() {
  const [files, setFiles] = useState<File[]>([])
  return (
    <div>
      <Field label="Attach documents" description="Up to 3 PDF files, 5 MB each. Selection only; files are not uploaded.">
        <FileInput name="documents" accept=".pdf" multiple maxFiles={3}
          maxSize={5 * 1024 * 1024} onFilesChange={setFiles} />
      </Field>
      <p role="status">{files.length} files selected</p>
    </div>
  )
}`,
  attachment: `import { useState } from 'react'
import { Attachment } from '@/components/ui/moru/attachment'
import { Button } from '@/components/ui/moru/button'

export function AttachmentPreview() {
  const [visible, setVisible] = useState(true)
  return visible ? (
    <Attachment fileName="project-brief.pdf" fileSize={245760}
      status="idle" onRemove={() => setVisible(false)} />
  ) : (
    <Button type="button" variant="secondary" onClick={() => setVisible(true)}>
      Restore sample attachment
    </Button>
  )
}`,
  questionnaire: `import { useState } from 'react'
import { Questionnaire, type QuestionnaireAnswers } from '@/components/ui/moru/questionnaire'

export function ProjectQuestionnaire() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers | null>(null)
  return (
    <div>
      <Questionnaire aria-label="Project preferences" onComplete={setAnswers} questions={[
        { id: 'name', title: 'What is your project called?', type: 'text', required: true },
        { id: 'team', title: 'Who will use it?', type: 'single', required: true,
          options: [{ value: 'personal', label: 'Only me' }, { value: 'team', label: 'My team' }] },
      ]} />
      {answers && <pre aria-label="Your answers">{JSON.stringify(answers, null, 2)}</pre>}
    </div>
  )
}`,
  command: `import { useState } from 'react'
import { Button } from '@/components/ui/moru/button'
import { Command } from '@/components/ui/moru/command'

export function QuickActions() {
  const [view, setView] = useState('Projects')
  return (
    <div>
      <Command title="Go to" trigger={<Button type="button">Open commands</Button>}
        items={[
          { id: 'projects', label: 'Projects', keywords: ['work'], onSelect: () => setView('Projects') },
          { id: 'team', label: 'Team', keywords: ['people'], onSelect: () => setView('Team') },
        ]} />
      <p role="status">Current view: {view}</p>
    </div>
  )
}`,
  'button-group': `import { useState } from 'react'
import { Button } from '@/components/ui/moru/button'
import { ButtonGroup, ButtonGroupText } from '@/components/ui/moru/button-group'

export function PageActions() {
  const [page, setPage] = useState(1)
  return (
    <ButtonGroup aria-label="Page navigation">
      <Button type="button" variant="secondary" disabled={page === 1}
        onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
      <ButtonGroupText aria-live="polite">{page} / 5</ButtonGroupText>
      <Button type="button" variant="secondary" disabled={page === 5}
        onClick={() => setPage((value) => Math.min(5, value + 1))}>Next</Button>
    </ButtonGroup>
  )
}`,
  kbd: `import { Kbd, KbdGroup } from '@/components/ui/moru/kbd'

export function ShortcutHint() {
  return (
    <p>
      Quick search <KbdGroup><Kbd>Ctrl</Kbd><Kbd>K</Kbd></KbdGroup>
    </p>
  )
}
// Kbd displays a shortcut. Register the matching keyboard handler in your app.`,
  toggle: `import { useState } from 'react'
import { Toggle } from '@/components/ui/moru/toggle'

export function BoldControl() {
  const [bold, setBold] = useState(false)
  return (
    <div>
      <Toggle aria-label="Bold text" pressed={bold} onPressedChange={setBold}>B</Toggle>
      <p style={{ fontWeight: bold ? 700 : 400 }}>Preview your text.</p>
    </div>
  )
}`,
  accordion: `import { Accordion } from '@/components/ui/moru/accordion'

export function ProjectQuestions() {
  return (
    <Accordion defaultValue={['sharing']} items={[
      { value: 'sharing', title: 'Can I share a project?', content: <p>Invite your team from project settings.</p> },
      { value: 'export', title: 'Can I export my data?', content: <p>Download a copy from the export menu.</p> },
    ]} />
  )
}`,
  avatar: `import { Avatar } from '@/components/ui/moru/avatar'

export function MemberAvatar() {
  return <Avatar alt="Sara Kim" fallback="SK" size="lg" />
}
// Add src with your own image URL. The fallback remains visible if the image fails.`,
  separator: `import { Separator } from '@/components/ui/moru/separator'

export function AccountSections() {
  return (
    <div>
      <h2>Profile</h2>
      <p>Your name and contact details.</p>
      <Separator decorative={false} />
      <h2>Security</h2>
      <p>Your password and sign-in preferences.</p>
    </div>
  )
}`,
  'aspect-ratio': `import { AspectRatio } from '@/components/ui/moru/aspect-ratio'

export function MediaPlaceholder() {
  return (
    <AspectRatio ratio={16 / 9} style={{ background: 'var(--ui-surface-hover)' }}>
      <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        16:9 media preview
      </div>
    </AspectRatio>
  )
}`,
  direction: `import { DirectionProvider } from '@/components/ui/moru/direction-provider'
import { Tabs } from '@/components/ui/moru/tabs'

export function RightToLeftTabs() {
  return (
    <DirectionProvider direction="rtl">
      <div dir="rtl" lang="ar">
        <Tabs aria-label="المحتوى" defaultValue="overview" items={[
          { value: 'overview', label: 'نظرة عامة', content: <p>نظرة عامة على المشروع</p> },
          { value: 'settings', label: 'الإعدادات', content: <p>إعدادات المشروع</p> },
        ]} />
      </div>
    </DirectionProvider>
  )
}`,
  item: `import { useState } from 'react'
import { Button } from '@/components/ui/moru/button'
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from '@/components/ui/moru/item'

export function ProjectItem() {
  const [expanded, setExpanded] = useState(false)
  return (
    <Item variant="muted">
      <ItemContent>
        <ItemTitle>Project brief</ItemTitle>
        <ItemDescription>{expanded ? 'A shared outline of goals, milestones, and owners.' : 'A quick introduction.'}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button type="button" size="sm" variant="secondary" aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}>{expanded ? 'Less' : 'More'}</Button>
      </ItemActions>
    </Item>
  )
}`,
  collapsible: `import { Collapsible } from '@/components/ui/moru/collapsible'

export function ProjectDetails() {
  return (
    <Collapsible title="Project details" defaultOpen>
      <p>Design review is scheduled for Friday.</p>
    </Collapsible>
  )
}`,
  carousel: `import { Carousel } from '@/components/ui/moru/carousel'
import { Card } from '@/components/ui/moru/card'

export function ProjectCarousel() {
  return (
    <Carousel aria-label="Featured projects" items={[
      { id: 'design', label: 'Design system', content: <Card>Design system</Card> },
      { id: 'website', label: 'New website', content: <Card>New website</Card> },
      { id: 'mobile', label: 'Mobile app', content: <Card>Mobile app</Card> },
    ]} />
  )
}`,
  resizable: `import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/moru/resizable'

export function SplitWorkspace() {
  return (
    <div style={{ height: 260 }}>
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="35%" minSize="20%">
          <nav aria-label="Workspace navigation">Projects</nav>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize navigation" />
        <ResizablePanel minSize="20%">
          <section aria-label="Project details">Choose a project to begin.</section>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}`,
  'scroll-area': `import { ScrollArea } from '@/components/ui/moru/scroll-area'

export function ActivityList() {
  return (
    <ScrollArea aria-label="Recent activity" style={{ height: 200 }}>
      <ol>
        {Array.from({ length: 20 }, (_, index) => (
          <li key={index} style={{ paddingBlock: 8 }}>Activity {index + 1}</li>
        ))}
      </ol>
    </ScrollArea>
  )
}`,
  typography: `import { Typography } from '@/components/ui/moru/typography'

export function ProjectIntroduction() {
  return (
    <section>
      <Typography variant="heading" as="h2">A thoughtful workspace</Typography>
      <Typography variant="body">Start with the essentials and make it your own.</Typography>
      <Typography variant="caption" as="p">Updated today</Typography>
    </section>
  )
}`,
}
