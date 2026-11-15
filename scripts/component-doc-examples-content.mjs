/** Complete examples for the public component docs; shared setup supplies MoruProvider and CSS. */
export const contentDocExamples = {
  tooltip: `import { Button } from '@/components/ui/moru/button'
import { Tooltip } from '@/components/ui/moru/tooltip'

export function ExportHelp() {
  return (
    <Tooltip trigger={<Button type="button" variant="secondary">Export options</Button>}>
      Choose a file format before downloading your report.
    </Tooltip>
  )
}`,
  'alert-dialog': `import { useState } from 'react'
import { AlertDialog } from '@/components/ui/moru/alert-dialog'
import { Button } from '@/components/ui/moru/button'

export function ResetDraft() {
  const [status, setStatus] = useState('Your draft is ready to edit.')

  return (
    <div>
      <AlertDialog
        trigger={<Button type="button" variant="danger">Reset draft</Button>}
        title="Reset this draft?"
        description="This example resets the local draft status."
        confirmLabel="Reset draft"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => setStatus('The local draft was reset.')}
      />
      <p role="status">{status}</p>
    </div>
  )
}`,
  sheet: `import { useState } from 'react'
import { Sheet } from '@/components/ui/moru/sheet'
import { Button } from '@/components/ui/moru/button'
import { Field } from '@/components/ui/moru/field'
import { Input } from '@/components/ui/moru/input'

export function ProfileSheet() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('Moru')

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      trigger={<Button type="button">Edit profile</Button>}
      title="Profile"
      description="Edit your display name in this local example."
      side="right"
      footer={<Button type="button" onClick={() => setOpen(false)}>Done</Button>}
    >
      <Field label="Display name">
        <Input value={name} onValueChange={setName} autoComplete="name" />
      </Field>
    </Sheet>
  )
}`,
  'context-menu': `import { useState } from 'react'
import { ContextMenu } from '@/components/ui/moru/context-menu'

export function FileContextMenu() {
  const [status, setStatus] = useState('No action selected.')

  return (
    <div>
      <ContextMenu
        aria-label="Report actions"
        items={[
          { id: 'open', label: 'Open report', onSelect: () => setStatus('Report opened.') },
          { id: 'duplicate', label: 'Duplicate', onSelect: () => setStatus('Local copy created.') },
          { id: 'delete', label: 'Delete', disabled: true, destructive: true },
        ]}
      >
        <p>Report.pdf — right-click, long-press, or press Shift + F10.</p>
      </ContextMenu>
      <p role="status">{status}</p>
    </div>
  )
}`,
  'hover-card': `import { Button } from '@/components/ui/moru/button'
import { HoverCard } from '@/components/ui/moru/hover-card'

export function MemberPreview() {
  return (
    <HoverCard
      trigger={<Button type="button" variant="ghost">Alex Kim</Button>}
      title="Alex Kim"
      description="Product designer · Seoul"
      side="bottom"
    >
      <p>Building thoughtful interfaces with the product team.</p>
    </HoverCard>
  )
}`,
  pagination: `import { useState } from 'react'
import { Pagination } from '@/components/ui/moru/pagination'

const projects = ['Design system', 'Website', 'Mobile app', 'Documentation', 'Research']
const pageSize = 2

export function ProjectPages() {
  const [page, setPage] = useState(1)
  const visible = projects.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div>
      <ul>{visible.map((project) => <li key={project}>{project}</li>)}</ul>
      <Pagination
        aria-label="Project pages"
        page={page}
        pageCount={Math.ceil(projects.length / pageSize)}
        onPageChange={setPage}
      />
    </div>
  )
}`,
  breadcrumb: `import { Breadcrumb } from '@/components/ui/moru/breadcrumb'

export function ProjectBreadcrumb() {
  return (
    <Breadcrumb
      aria-label="Project location"
      items={[
        { label: 'Home', href: '/' },
        { label: 'Projects', href: '/projects' },
        { label: 'Design system' },
      ]}
    />
  )
}`,
  menubar: `import { useState } from 'react'
import { Menubar } from '@/components/ui/moru/menubar'

export function DocumentMenu() {
  const [status, setStatus] = useState('Untitled document')

  return (
    <div>
      <Menubar
        aria-label="Document actions"
        menus={[
          {
            id: 'file', label: 'File', items: [
              { id: 'new', label: 'New document', onSelect: () => setStatus('New document created.') },
              { id: 'save', label: 'Save draft', onSelect: () => setStatus('Draft saved in this example.') },
            ],
          },
          {
            id: 'help', label: 'Help', items: [
              { id: 'about', label: 'About', onSelect: () => setStatus('Moru document menu example.') },
            ],
          },
        ]}
      />
      <p role="status">{status}</p>
    </div>
  )
}`,
  'navigation-menu': `import { NavigationMenu } from '@/components/ui/moru/navigation-menu'

export function SiteNavigation() {
  return (
    <NavigationMenu
      aria-label="Main navigation"
      items={[
        { id: 'home', label: 'Home', href: '/', active: true },
        {
          id: 'product', label: 'Product', links: [
            { id: 'features', label: 'Features', href: '/features', description: 'Explore the product.' },
            { id: 'pricing', label: 'Pricing', href: '/pricing', description: 'Choose a plan.' },
          ],
        },
        { id: 'docs', label: 'Documentation', href: '/docs' },
      ]}
    />
  )
}`,
  sidebar: `import { useState } from 'react'
import { Sidebar } from '@/components/ui/moru/sidebar'

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'projects', label: 'Projects', badge: 3 },
  { id: 'settings', label: 'Settings' },
]

export function WorkspaceNavigation() {
  const [section, setSection] = useState('overview')

  return (
    <div style={{ display: 'flex', gap: 'var(--ui-section-gap)', flexWrap: 'wrap' }}>
      <Sidebar title="Workspace" items={sections} value={section} onValueChange={setSection} />
      <section aria-live="polite">
        <h2>{sections.find((item) => item.id === section)?.label}</h2>
        <p>Content for the selected workspace section.</p>
      </section>
    </div>
  )
}`,
  stepper: `import { useState } from 'react'
import { Stepper } from '@/components/ui/moru/stepper'
import { Button } from '@/components/ui/moru/button'

const steps = [
  { id: 'details', label: 'Details', content: <p>Review the project details.</p> },
  { id: 'members', label: 'Members', content: <p>Review the project members.</p> },
  { id: 'confirm', label: 'Confirm', content: <p>Ready to finish this example.</p> },
]

export function SetupSteps() {
  const [step, setStep] = useState(0)

  return (
    <div style={{ display: 'grid', gap: 'var(--ui-form-gap)' }}>
      <Stepper
        aria-label="Project setup"
        items={steps}
        value={step}
        onValueChange={setStep}
        completedContent={<p role="status">Setup complete.</p>}
      />
      <div style={{ display: 'flex', gap: 'var(--ui-control-gap)' }}>
        <Button type="button" variant="secondary" disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}>Back</Button>
        <Button type="button" disabled={step === steps.length}
          onClick={() => setStep((current) => Math.min(steps.length, current + 1))}>
          {step === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  )
}`,
  badge: `import { Badge } from '@/components/ui/moru/badge'

export function ProjectStatus() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ui-control-gap)' }}>
      <Badge tone="success">Published</Badge>
      <Badge tone="warning" variant="secondary">In review</Badge>
      <Badge variant="outline">Draft</Badge>
    </div>
  )
}`,
  alert: `import { Alert } from '@/components/ui/moru/alert'

export function SavedNotice() {
  return (
    <Alert title="Changes saved" tone="success">
      Your team can now see the updated project details.
    </Alert>
  )
}`,
  'ring-progress': `import { RingProgress } from '@/components/ui/moru/ring-progress'

export function WeeklyGoal() {
  return <RingProgress label="Weekly task goal" value={7} max={10} centerLabel="7 / 10" />
}`,
  toast: `import { Button } from '@/components/ui/moru/button'
import { ToastProvider, useToast } from '@/components/ui/moru/toast'

function SaveAction() {
  const { toast } = useToast()
  return (
    <Button type="button" onClick={() => toast({
      title: 'Example notification',
      description: 'Your save action can show its result here.',
      tone: 'success',
      duration: 5000,
    })}>Show notification</Button>
  )
}

export function ToastExample() {
  return <ToastProvider><SaveAction /></ToastProvider>
}`,
  empty: `import { useState } from 'react'
import { Empty } from '@/components/ui/moru/empty'
import { Button } from '@/components/ui/moru/button'

export function ProjectList() {
  const [projects, setProjects] = useState<string[]>([])

  if (projects.length) {
    return <ul>{projects.map((project) => <li key={project}>{project}</li>)}</ul>
  }

  return (
    <Empty title="No projects yet" description="Create your first project to get started.">
      <Button type="button" onClick={() => setProjects(['New project'])}>Create project</Button>
    </Empty>
  )
}`,
  marker: `import { Marker, MarkerContent } from '@/components/ui/moru/marker'

export function ConversationBoundary() {
  return (
    <Marker variant="separator">
      <MarkerContent>Today · November 15</MarkerContent>
    </Marker>
  )
}`,
  table: `import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption,
} from '@/components/ui/moru/table'

const projects = [
  { id: 'design', name: 'Design system', status: 'In progress' },
  { id: 'docs', name: 'Documentation', status: 'Published' },
]

export function ProjectTable() {
  return (
    <Table scrollLabel="Project list">
      <TableCaption>Current projects</TableCaption>
      <TableHeader>
        <TableRow><TableHead>Project</TableHead><TableHead>Status</TableHead></TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableHead scope="row">{project.name}</TableHead>
            <TableCell>{project.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}`,
  'data-table': `import { createColumnHelper } from '@tanstack/react-table'
import { DataTable, type DataTableFeatures } from '@/components/ui/moru/data-table'

type Project = { id: string; name: string; progress: number }

const projects: Project[] = [
  { id: 'design', name: 'Design system', progress: 80 },
  { id: 'docs', name: 'Documentation', progress: 100 },
  { id: 'website', name: 'Website', progress: 40 },
]

const helper = createColumnHelper<DataTableFeatures, Project>()
const columns = helper.columns([
  helper.accessor('name', { header: 'Project', sortFn: 'text' }),
  helper.accessor('progress', { header: 'Progress', sortFn: 'basic' }),
])

export function ProjectsDataTable() {
  return (
    <DataTable
      caption="Projects"
      data={projects}
      columns={columns}
      getRowId={(project) => project.id}
      pageSize={2}
      searchPlaceholder="Search projects"
    />
  )
}`,
  bubble: `import { Bubble, BubbleContent, BubbleFooter } from '@/components/ui/moru/bubble'

export function SentMessage() {
  return (
    <Bubble align="end" variant="secondary">
      <BubbleContent>The updated design is ready for review.</BubbleContent>
      <BubbleFooter><time dateTime="2026-11-15T09:41:00+09:00">09:41</time> · Sent</BubbleFooter>
    </Bubble>
  )
}`,
  'code-block': `import { CodeBlock } from '@/components/ui/moru/code-block'

export function InstallCommand() {
  return (
    <CodeBlock
      value="npm install moru-ui"
      language="sh"
      filename="Terminal"
      defaultWrap
    />
  )
}`,
  message: `import {
  Message, MessageAvatar, MessageContent, MessageHeader, MessageFooter,
} from '@/components/ui/moru/message'

export function TeamMessage() {
  return (
    <Message aria-label="Message from Alex Kim">
      <MessageAvatar aria-hidden="true">AK</MessageAvatar>
      <MessageContent>
        <MessageHeader><strong>Alex Kim</strong></MessageHeader>
        <p>The new component documentation is ready.</p>
        <MessageFooter><time dateTime="2026-11-15T09:41:00+09:00">09:41</time></MessageFooter>
      </MessageContent>
    </Message>
  )
}`,
  'message-scroller': `import { useState } from 'react'
import { MessageScroller, MessageScrollerItem } from '@/components/ui/moru/message-scroller'
import { Button } from '@/components/ui/moru/button'

export function ActivityStream() {
  const [messages, setMessages] = useState([
    { id: 'message-1', text: 'Welcome to the project.' },
  ])

  return (
    <div>
      <MessageScroller aria-label="Project activity" height={240} followOutput>
        {messages.map((message) => (
          <MessageScrollerItem key={message.id} messageId={message.id}>
            <p>{message.text}</p>
          </MessageScrollerItem>
        ))}
      </MessageScroller>
      <Button type="button" onClick={() => setMessages((current) => [
        ...current,
        { id: 'message-' + (current.length + 1), text: 'Activity update ' + current.length },
      ])}>Add activity</Button>
    </div>
  )
}`,
  trace: `import { Trace } from '@/components/ui/moru/trace'

export function ImportSummary() {
  return (
    <Trace
      aria-label="Import steps"
      defaultExpanded={['read']}
      items={[
        {
          id: 'read', title: 'Read file', status: 'complete', durationMs: 240,
          details: <p>24 rows were read from the example file.</p>,
        },
        { id: 'validate', title: 'Validate rows', status: 'complete', durationMs: 180 },
        { id: 'save', title: 'Save records', status: 'pending', description: 'Waiting for confirmation.' },
      ]}
    />
  )
}`,
}
