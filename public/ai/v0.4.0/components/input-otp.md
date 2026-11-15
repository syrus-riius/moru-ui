# Input OTP

Single native input with visual slots and one-time-code autofill.

Version: 0.4.0. Source hash: c7657160432134a41ca0feec508cb24f0ded72c14d22567531868ef45f3e6dcc.

## Discovery

- Registry ID: `input-otp`
- Import: `@/components/ui/moru/input-otp`
- Runtime exports: `InputOTP`
- Registry dependencies: [core](/ai/v0.4.0/core.md)
- Install source: [input-otp.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/input-otp.json)
- Setup and import-path differences: [start](/ai/v0.4.0/start.md)
- Source: [src/components/ui/input-otp.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/input-otp.tsx)

## Usage and interaction

- InputOTP uses one real input with visual slots. Preserve its paste, numeric filtering and one-time-code autofill behavior; do not rebuild separate slot inputs.
- onComplete reports input completion, not successful authentication. Verify codes on your server and handle resend/rate limiting in the application.

## Minimal example

Also install: `field`.

```tsx
import { useState } from 'react'
import { Field } from '@/components/ui/moru/field'
import { InputOTP } from '@/components/ui/moru/input-otp'

export function VerificationCode() {
  const [code, setCode] = useState('')
  return <Field label="Verification code" description="Enter the six-digit code.">
    <InputOTP name="code" length={6} value={code} onValueChange={setCode} />
  </Field>
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `InputHTMLAttributes` from `react`
- `UIState` from `./state`

```ts
type InputOTPProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'maxLength' | 'type' | 'inputMode' | 'pattern'> & {
  length?: number
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onComplete?: (value: string) => void
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  previewState?: UIState
}
```

Exported value type annotations / generic factory calls from source:

- `InputOTP: forwardRef<HTMLInputElement, InputOTPProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `InputOTP.length`: `6`
- `InputOTP.defaultValue`: `''`
- `InputOTP.size`: `'md'`
- `InputOTP.loading`: `false`
- `InputOTP.autoComplete`: `'one-time-code'`
