# Signup Block

Account details, email verification and completion in one signup flow. Local demo; connect your authentication service.

Version: 0.4.1. Source hash: 92d4b85e1d28cd9eda9391ef75e1e633fa26d884c86603172df42465b8fa832c.

## Discovery

- Registry ID: `signup`
- Import: `@/components/ui/moru/blocks/SignupBlock`
- Runtime exports: `SignupBlock`, `validateSignupBlock`
- Registry dependencies: [block-messages](/ai/v0.4.1/components/block-messages.md), [button](/ai/v0.4.1/components/button.md), [card](/ai/v0.4.1/components/card.md), [checkbox](/ai/v0.4.1/components/checkbox.md), [core](/ai/v0.4.1/core.md), [field](/ai/v0.4.1/components/field.md), [input](/ai/v0.4.1/components/input.md), [input-otp](/ai/v0.4.1/components/input-otp.md), [otp](/ai/v0.4.1/blocks/otp.md), [password-input](/ai/v0.4.1/components/password-input.md)
- Install source: [signup.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/signup.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
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
