# Login Block

Local login form demo. Connect your own authentication service.

Version: 0.4.1. Source hash: 08414026dbe9c50ebadb9391b938ed8ed1e97050bc3c6b5f7c1b6fd190aa8ab2.

## Discovery

- Registry ID: `login`
- Import: `@/components/ui/moru/blocks/LoginBlock`
- Runtime exports: `LoginBlock`, `validateLoginBlock`
- Registry dependencies: [block-messages](/ai/v0.4.1/components/block-messages.md), [button](/ai/v0.4.1/components/button.md), [card](/ai/v0.4.1/components/card.md), [checkbox](/ai/v0.4.1/components/checkbox.md), [core](/ai/v0.4.1/core.md), [field](/ai/v0.4.1/components/field.md), [input](/ai/v0.4.1/components/input.md), [password-input](/ai/v0.4.1/components/password-input.md)
- Install source: [login.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/login.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/blocks/LoginBlock.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/blocks/LoginBlock.tsx)

## Usage and interaction

- LoginBlock currently takes no props. It validates locally, waits briefly and displays demo feedback; it does not authenticate or persist credentials.
- Edit the installed submit handler to call your authentication service. Do not invent onLogin/onSubmit props on this block.

## Minimal example

```tsx
import { LoginBlock } from '@/components/ui/moru/blocks/LoginBlock'

export function LoginPreview() {
  return <LoginBlock />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Exported function declaration excerpts (return types may be inferred in source):

```ts
function validateLoginBlock(email: string, password: string);
function LoginBlock();
```
