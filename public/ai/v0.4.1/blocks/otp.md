# OTP Block

Local OTP verification demo. The sample code is 123456.

Version: 0.4.1. Source hash: 5a0a4b244fa08e5ec114908231ad33098aa6646cb022935d28cab19340a90d48.

## Discovery

- Registry ID: `otp`
- Import: `@/components/ui/moru/blocks/OTPBlock`
- Runtime exports: `OTPBlock`, `validateOTPBlock`
- Registry dependencies: [block-messages](/ai/v0.4.1/components/block-messages.md), [button](/ai/v0.4.1/components/button.md), [card](/ai/v0.4.1/components/card.md), [core](/ai/v0.4.1/core.md), [field](/ai/v0.4.1/components/field.md), [input-otp](/ai/v0.4.1/components/input-otp.md)
- Install source: [otp.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/otp.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/blocks/OTPBlock.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/blocks/OTPBlock.tsx)

## Usage and interaction

- A supporting step for signup, not a standalone gallery screen. The screen preview is #blocks/signup.
- OTPBlock takes no props and accepts 123456 in its local demonstration. Verification and resend do not contact a server.
- Replace the installed demo handlers with server verification/resend and expiry/rate limits. Do not invent onVerify props.

## Minimal example

```tsx
import { OTPBlock } from '@/components/ui/moru/blocks/OTPBlock'

export function VerificationPreview() {
  return <OTPBlock />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Exported function declaration excerpts (return types may be inferred in source):

```ts
function validateOTPBlock(value: string);
function OTPBlock();
```
