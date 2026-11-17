# Toast

ToastProvider and useToast for stacked or listed notifications with actions and dismissal.

Version: 0.4.1. Source hash: cf8221846caa9e729f2295329aa88140290148a595053c1c2cd671fc80cb0e9b.

## Discovery

- Registry ID: `toast`
- Import: `@/components/ui/moru/toast`
- Runtime exports: `ToastProvider`, `useToast`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [toast.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/toast.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/toast.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/toast.tsx)

## Usage and interaction

- ToastProvider must wrap consumers of useToast. Inspect the exported provider and hook signatures below before composing toast actions.
- Use <ToastProvider layout="stack"> for layered notifications or layout="list" for the default separate cards. Keep one provider at the app boundary; do not create a provider for each action.
- Stacked notifications expand on hover or keyboard focus (F6). Touch devices show an expanded list so every action remains reachable. limit controls visible notifications, not an application inbox.
- toast(options) returns an id. dismiss(id) closes that toast; dismiss() closes all. duration: 0 persists until dismissed. Use action.onClick for a real undo operation; a notification alone does not persist or revert application data.

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ReactNode` from `react`
- `SemanticTone` from `./state`

```ts
interface ToastOptions {
  title: string
  description?: string
  tone?: SemanticTone
  action?: { label: string; onClick: () => void }
  /** Time in milliseconds. Zero keeps the notification until it is dismissed. */
  duration?: number
}

interface ToastProviderProps {
  children: ReactNode
  /** Present notifications separately, or overlap them until hovered or focused. */
  layout?: 'list' | 'stack'
  /** Maximum visible notifications, clamped between 1 and 5. Defaults to 3. */
  limit?: number
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function ToastProvider({ children, layout = 'list', limit = 3 }: ToastProviderProps);
function useToast();
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `ToastProvider.layout`: `'list'`
- `ToastProvider.limit`: `3`
