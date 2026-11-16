# Formatted Input

Purpose-built input formats for cards, phone, email, URLs, IP addresses and Korean postal codes, with optional validation helpers.

Version: 0.4.1. Source hash: 9e7fc610717ab4a2a951696248d6d47b7eb7d11cbfffc90d292087c06ac3c874.

## Discovery

- Registry ID: `formatted-input`
- Import: `@/components/ui/moru/formatted-input`
- Runtime exports: `FormattedInput`, `validateFormattedInput`
- Registry dependencies: [core](/ai/v0.4.1/core.md), [input](/ai/v0.4.1/components/input.md)
- Install source: [formatted-input.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/formatted-input.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/formatted-input.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/formatted-input.tsx)

## Usage and interaction

- Use FormattedInput for opt-in formatting; ordinary Input remains unchanged. Supported format values: card-number, card-expiry, card-cvc, phone, email, url, ipv4, ipv6, postal-code.
- value, defaultValue, onValueChange and native FormData contain the displayed formatted string. Do not assume callbacks return unformatted digits. onValueChange is the canonical formatted value callback; onChange receives native events only and is not fired for manual separator deletion. Use Field for label, description and error.
- validateFormattedInput is an optional helper exported alongside FormattedInput. It returns a Korean error key or null; translate errors for your app. Empty optional fields are valid; handle required values separately. Validate on blur or submit, without interrupting typing.
- Phone grouping and postal-code validation target South Korea; +international phone values only get basic syntax validation. Card checks are formatting and checksum only, not payment authorization. IP and URL syntax do not prove network reachability.
- Do not persist payment input in demonstration state storage. In production payment flows use your payment provider integration as appropriate.

## Minimal example

Also install: `field`.

```tsx
import { useState } from 'react'
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
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `InputProps` from `./input`
- `InputFormat` from `./formatted-input-utils`

```ts
type FormattedInputProps = Omit<
  InputProps,
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'onChange'
  | 'type'
  | 'inputMode'
  | 'render'
  | 'maxLength'
> & {
  format: InputFormat
  /** The displayed string, including formatting separators. Native FormData uses this string too. */
  value?: string
  defaultValue?: string
  /** Canonical value callback, including formatted separator deletion and completed IME edits. */
  onValueChange?: (value: string) => void
  /** Native change-event hook before formatting. Use onValueChange to control the displayed value. */
  onChange?: InputProps['onChange']
}

export type { InputFormat } from './formatted-input-utils'
```

Exported value type annotations / generic factory calls from source:

- `FormattedInput: forwardRef<HTMLInputElement, FormattedInputProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `FormattedInput.defaultValue`: `''`
