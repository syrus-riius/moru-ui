# Settings Block

Workspace settings form with local demo feedback and controlled application save handlers.

Version: 0.4.1. Source hash: baf065ccb1fccaa4eed187992c95b92d1b8fd9b7084c361d9faa54b0f7c55c24.

## Discovery

- Registry ID: `settings`
- Import: `@/components/ui/moru/blocks/SettingsBlock`
- Runtime exports: `SettingsBlock`, `saveSettingsBlock`, `validateSettingsBlock`
- Registry dependencies: [block-messages](/ai/v0.4.1/components/block-messages.md), [button](/ai/v0.4.1/components/button.md), [card](/ai/v0.4.1/components/card.md), [core](/ai/v0.4.1/core.md), [field](/ai/v0.4.1/components/field.md), [input](/ai/v0.4.1/components/input.md), [select](/ai/v0.4.1/components/select.md), [switch](/ai/v0.4.1/components/switch.md)
- Install source: [settings.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/settings.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/blocks/SettingsBlock.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/blocks/SettingsBlock.tsx)

## Usage and interaction

- value/onValueChange describe the draft; onSave receives a validated value and may return a Promise. Reject/throw to keep the error visible.
- The cancel baseline is the last successful save. Without onSave this is a local demo, not persisted settings.

## Minimal example

```tsx
import { SettingsBlock } from '@/components/ui/moru/blocks/SettingsBlock'

export function WorkspaceSettings() {
  return <SettingsBlock onSave={async (value) => {
    const response = await fetch('/api/workspace/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value),
    })
    if (!response.ok) throw new Error('Could not save settings. Try again.')
  }} />
}
```

The /api/workspace/settings endpoint is an application-owned integration point; Moru does not create it.

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

```ts
interface WorkspaceSettingsValue {
  name: string
  email: string
  visibility: 'private' | 'team' | 'public'
  updates: boolean
  digest: boolean
}

interface SettingsBlockProps {
  value?: WorkspaceSettingsValue
  defaultValue?: WorkspaceSettingsValue
  onValueChange?: (value: WorkspaceSettingsValue) => void
  onSave?: (value: WorkspaceSettingsValue) => void | Promise<void>
  onCancel?: (saved: WorkspaceSettingsValue) => void
  title?: string
  description?: string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function validateSettingsBlock(name: string, email: string);
async function saveSettingsBlock(
  draft: WorkspaceSettingsValue,
  onSave: (value: WorkspaceSettingsValue) => void | Promise<void>,
);
function SettingsBlock({
  value,
  defaultValue = initialSettings,
  onValueChange,
  onSave,
  onCancel,
  title: titleProp,
  description: descriptionProp,
}: SettingsBlockProps = {});
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `SettingsBlock.defaultValue`: `initialSettings`
