# Signup Block

Account details, email verification and completion in one signup flow. Local demo; connect your authentication service.

Version: 0.4.0. Source hash: c7657160432134a41ca0feec508cb24f0ded72c14d22567531868ef45f3e6dcc.

## Discovery

- Registry ID: `signup`
- Import: `@/components/ui/moru/blocks/SignupBlock`
- Runtime exports: `SignupBlock`, `validateSignupBlock`
- Registry dependencies: [button](/ai/v0.4.0/components/button.md), [card](/ai/v0.4.0/components/card.md), [checkbox](/ai/v0.4.0/components/checkbox.md), [core](/ai/v0.4.0/core.md), [field](/ai/v0.4.0/components/field.md), [input](/ai/v0.4.0/components/input.md), [input-otp](/ai/v0.4.0/components/input-otp.md), [otp](/ai/v0.4.0/blocks/otp.md), [password-input](/ai/v0.4.0/components/password-input.md)
- Install source: [signup.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/signup.json)
- Setup and import-path differences: [start](/ai/v0.4.0/start.md)
- Source: [src/components/blocks/SignupBlock.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/blocks/SignupBlock.tsx)

## Usage and interaction

- SignupBlock currently takes no props and composes account details, email verification and completion into a single signup screen flow. The local verification code is 123456; no account or email is created. Edit installed handlers to integrate authentication; do not invent callback props.
- Use #blocks/signup for the interactive preview. Connect server-side account creation and verification before production use, retaining validation and focus behavior.

## Minimal example

```tsx
import { SignupBlock } from '@/components/ui/moru/blocks/SignupBlock'

export function SignupScreen() {
  return <SignupBlock />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

```ts
interface SignupDetails {
  name: string
  email: string
  password: string
  accepted: boolean
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function validateSignupBlock(details: SignupDetails);
function SignupBlock();
```
