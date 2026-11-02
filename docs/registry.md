# Selective installation

Moru v0.3.1 distributes editable component sources through the shadcn CLI.
It includes a shared core, Button, Input, Field, Login and OTP blocks, and the
supporting components used by those blocks. Moru is not published as an npm library.

The tested baseline is Node.js 24+, React 19, TypeScript, Vite and Tailwind CSS 4.
Prepare Tailwind and `components.json` using the
[shadcn Vite setup guide](https://ui.shadcn.com/docs/installation/vite), then run:

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.1/button.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.1/input.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.1/field.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.1/login.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.1/otp.json
```

Use `core.json` to install only the foundation. Other items resolve core and their
own dependencies automatically. Your UI alias determines the installation path;
Moru files go in its `moru/` subdirectory to coexist with existing components.

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

Versioned HTTP items and dependencies use `/r/v0.3.1/`. GitHub registry items use
`syrus-riius/moru-ui/button#v0.3.1` with independently pinned dependency refs.
Commit your local changes before upgrading, review diffs and avoid unconditional
`--overwrite` when you have customized installed sources.

Original sources remain in `src/`. Generate artifacts with `npm run registry:build`
and check freshness with `npm run registry:check`. Do not edit generated files.
The registry targets web React. Next.js SSR/hydration and Native/Expo consumption
are not covered by this release's validation.

See the [한국어 guide](registry.ko.md), [MIT license](../LICENSE) and
[third-party notices](../NOTICE.md).
