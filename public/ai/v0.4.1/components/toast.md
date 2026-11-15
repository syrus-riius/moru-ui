# Toast

ToastProvider and useToast for dismissible semantic application notifications.

Version: 0.4.1. Source hash: 0b0b1530e773209ed6b6628a4168c3305b7342a1378da2b37377f96c1e54f293.

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
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function ToastProvider({ children }: { children: ReactNode });
function useToast();
```
