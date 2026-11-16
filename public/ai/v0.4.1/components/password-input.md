# Password Input

Password input with an accessible visibility toggle.

Version: 0.4.1. Source hash: 9e7fc610717ab4a2a951696248d6d47b7eb7d11cbfffc90d292087c06ac3c874.

## Discovery

- Registry ID: `password-input`
- Import: `@/components/ui/moru/password-input`
- Runtime exports: `PasswordInput`
- Registry dependencies: [core](/ai/v0.4.1/core.md), [input](/ai/v0.4.1/components/input.md)
- Install source: [password-input.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/password-input.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/password-input.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/password-input.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `InputProps` from `./input`

```ts
interface PasswordInputProps extends Omit<InputProps, 'type'> {
  visible?: boolean
  defaultVisible?: boolean
  onVisibilityChange?: (visible: boolean) => void
}
```

Exported value type annotations / generic factory calls from source:

- `PasswordInput: forwardRef<HTMLInputElement, PasswordInputProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `PasswordInput.defaultVisible`: `false`
- `PasswordInput.size`: `'md'`
