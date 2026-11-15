# Moru UI

React UI components for thoughtful human experiences: a consistent foundation,
useful interactions, and a shared design token system.

This README describes the `0.5.0-beta.2` package. It includes the web component
library, reusable blocks, TypeScript declarations, and scoped styles. The UI Lab,
simulator, and React Native components are not part of this package.

## Install

```bash
npm install moru-ui@beta
```

Requires React and React DOM `^19.3.0`. Moru ships ES modules; CommonJS `require()`
is not a supported entry point. Tailwind CSS is not required.

## Start with a provider and styles

Import `moru-ui/styles.css` once in your app entry point and wrap Moru components
in `MoruProvider`. The provider supplies tokens and the scope used by the styles,
including overlays rendered in a portal.

```tsx
import { Button, Field, Input, MoruProvider } from 'moru-ui'
import 'moru-ui/styles.css'

export function App() {
  return (
    <MoruProvider mode="light" locale="en">
      <form
        onSubmit={(event) => event.preventDefault()}
        style={{ display: 'grid', gap: 'var(--ui-form-gap)', maxWidth: 420 }}
      >
        <Field label="Email" description="Use your work email address.">
          <Input name="email" type="email" autoComplete="email" required />
        </Field>
        <Button type="submit">Continue</Button>
      </form>
    </MoruProvider>
  )
}
```

Form submission, validation rules, data persistence, and authentication remain
your application's responsibility.

## Import paths

| Import path | Contents | Additional package to install |
| --- | --- | --- |
| `moru-ui` | Core components, `MoruProvider`, theme tokens and locale helpers | None |
| `moru-ui/blocks` | `LoginBlock`, `SignupBlock`, `OTPBlock`, `SearchFiltersBlock`, `SettingsBlock` | None |
| `moru-ui/dashboard` | `DashboardBlock` | `recharts` |
| `moru-ui/chart` | `Chart` and chart helpers | `recharts` |
| `moru-ui/data-table` | `DataTable` and table types | `@tanstack/react-table` |
| `moru-ui/carousel` | `Carousel` and carousel types | `embla-carousel-react` |
| `moru-ui/resizable` | `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle` | `react-resizable-panels` |
| `moru-ui/styles.css` | Styles shared by all entry points | Import once |

Core components include form controls, masked inputs, date and time pickers,
calendar and range selection, modal, popover, drawer, navigation, layout, and
feedback components. Charts, tables, carousels, resizable panels, and the
dashboard use separate entry points so basic imports do not require their peers.
Internal paths such as `moru-ui/dist/button.js` are not public APIs.

Install only the optional packages used by your imports:

```bash
# Chart or DashboardBlock
npm install 'recharts@^3.10.1'

# DataTable
npm install '@tanstack/react-table@^9.3.1'

# Carousel
npm install 'embla-carousel-react@^8.6.0'

# Resizable panels
npm install 'react-resizable-panels@^4.14.8'
```

For example, after installing Recharts:

```tsx
import { DashboardBlock } from 'moru-ui/dashboard'

// Render inside MoruProvider. Projects are local example data by default.
export function Dashboard() {
  return <DashboardBlock title="My workspace" />
}
```

## Tokens, appearance, and language

`mode="dark"` uses Moru's default dark palette. Pass a complete `ThemeTokens`
object to customize the design. Start from the matching defaults and override
only the values you need:

```tsx
import { createDarkTokens, defaultTokens, MoruProvider } from 'moru-ui'

const tokens = {
  ...createDarkTokens(defaultTokens),
  density: 'compact' as const,
  radius: 12,
  borderWidth: 0.5,
}

export function DarkExample() {
  return (
    <MoruProvider mode="dark" tokens={tokens} locale="en">
      {/* Moru components */}
    </MoruProvider>
  )
}
```

When you pass `tokens`, the provider uses those values directly; `mode` does not
convert a custom light palette to dark. Density options are `compact`, `standard`,
and `comfortable`. Built-in locale identifiers are `ko`, `en`, `ja`, and `zh-CN`.
Application content and your own labels still need your translations.

Font files are not bundled or downloaded by Moru. Its font-family tokens include
Pretendard, Noto Sans, and system fallbacks. Load any desired font in your own app,
with its applicable license, or use the fallback fonts. Changing the token alone
does not install a font.

## Blocks and application integration

`SearchFiltersBlock` accepts `items`, `filters` / `defaultFilters`,
`onFiltersChange`, and `onSelect`. `SettingsBlock` accepts `value` / `defaultValue`,
`onValueChange`, and an async `onSave` callback. A successful save is reported only
after the supplied callback resolves; reject it to report a failed save.

```tsx
import { SettingsBlock, type WorkspaceSettingsValue } from 'moru-ui/blocks'

export function WorkspaceSettings({
  saveSettings,
}: {
  saveSettings: (settings: WorkspaceSettingsValue) => Promise<void>
}) {
  return (
    <SettingsBlock
      defaultValue={{
        name: 'My workspace',
        email: 'hello@example.com',
        visibility: 'private',
        updates: true,
        digest: false,
      }}
      onSave={saveSettings}
    />
  )
}
```

Supply your persistence function as `saveSettings` and render this component
inside `MoruProvider`. `DashboardBlock` exposes `defaultProjects` and
`onProjectsChange` for integrating project data.

`LoginBlock`, `SignupBlock`, and `OTPBlock` are local interaction demos in this
beta. They do not accept authentication callbacks or contact a backend. The demo
verification code is `123456`; successful screens do not establish an authenticated
session. For production authentication, compose the exported controls with your
service or adapt the block source from the repository. Other blocks also use
local demo data until you provide your application data and callbacks.

## Next.js App Router

Import styles in `app/layout.tsx`. Create a client provider wrapper:

```tsx
// app/providers.tsx
'use client'

import type { ReactNode } from 'react'
import { MoruProvider } from 'moru-ui'

export function Providers({ children }: { children: ReactNode }) {
  return <MoruProvider locale="en">{children}</MoruProvider>
}
```

```tsx
// app/layout.tsx
import type { ReactNode } from 'react'
import 'moru-ui/styles.css'
import { Providers } from './providers'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

Keep components that use state, event handlers, or browser APIs behind a
`'use client'` boundary. Do not pass ordinary callback functions from a Server
Component to a Client Component.

## Source and license

- [Source repository](https://github.com/syrus-riius/moru-ui)
- [Component gallery and documentation](https://moru-ui-lab.riius.chatgpt.site/)
- MIT for Moru's code; see `LICENSE` and `NOTICE.md` for attribution and dependency notices.
