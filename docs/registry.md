# Selective installation

Moru v0.3.3 distributes editable component sources through the shadcn CLI.
The registry has 22 items: a shared core, 17 UI components and four reusable blocks.
This release adds Tabs, Menu, Popover and Drawer alongside the Login, OTP,
Search Filters and Settings blocks. Moru is not published as an npm library.

The supported baseline is Node.js 24+, React 19, TypeScript, Vite and Tailwind CSS 4.
Prepare Tailwind and `components.json` using the
[shadcn Vite setup guide](https://ui.shadcn.com/docs/installation/vite), then run:

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/button.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/input.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/field.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/login.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/otp.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/search-filters.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/settings.json
```

Use `core.json` to install only the foundation. Other items resolve core and their
own dependencies automatically. Your UI alias determines the installation path;
Moru files go in its `moru/` subdirectory to coexist with existing components.
Registry targets remain `@ui/moru/`; the examples below use `@/components/ui` as
the consumer project's UI alias.

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
utilities. Unused charts, tables and carousels are not installed by these items.

Login and OTP are local interaction examples, not authentication services. Login
validates an email and an eight-character password without sending or storing it.
OTP uses `123456`. Replace the installed submit/resend handlers with your service.

## Tabs, menus and overlays

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/tabs.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/menu.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/popover.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/drawer.json
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

Versioned HTTP items and dependencies use `/r/v0.3.3/`. GitHub registry items use
`syrus-riius/moru-ui/button#v0.3.3` with independently pinned dependency refs.
Published `/r/v0.3.1/` and `/r/v0.3.2/` remain unchanged; their existing installation
URLs continue to select those versions. The four new items start at v0.3.3.
Commit your local changes before upgrading, review diffs and avoid unconditional
`--overwrite` when you have customized installed sources.

Original sources remain in `src/`. Generate artifacts with `npm run registry:build`
and check freshness with `npm run registry:check`. Do not edit generated files.
The registry targets web React. Next.js SSR/hydration and Native/Expo consumption
remain outside its supported baseline. The v0.3.3 release process is limited to
artifact generation and a production build; automated tests, CLI installation
smoke checks and browser checks are skipped for the additions.

See the [한국어 guide](registry.ko.md), [MIT license](../LICENSE) and
[third-party notices](../NOTICE.md).

SearchFiltersBlock accepts external items, controlled filters and an onSelect callback with the actual item ID. SettingsBlock accepts draft values and an async onSave; failed saves preserve the draft. See the [project/task app template](project-template.ko.md) for a complete local-persistence integration.
