# Alert Dialog

Confirmation dialog with managed focus and asynchronous action feedback.

Version: 0.4.0. Source hash: c7657160432134a41ca0feec508cb24f0ded72c14d22567531868ef45f3e6dcc.

## Discovery

- Registry ID: `alert-dialog`
- Import: `@/components/ui/moru/alert-dialog`
- Runtime exports: `AlertDialog`
- Registry dependencies: [button](/ai/v0.4.0/components/button.md), [core](/ai/v0.4.0/core.md)
- Install source: [alert-dialog.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/alert-dialog.json)
- Setup and import-path differences: [start](/ai/v0.4.0/start.md)
- Source: [src/components/ui/alert-dialog.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/alert-dialog.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ComponentPropsWithoutRef, ReactElement` from `react`
- `BaseAlertDialog` from `@base-ui/react/alert-dialog`

```ts
interface AlertDialogProps {
  trigger?: ReactElement
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  open?: boolean
  onOpenChange?: (open: boolean) => void
  destructive?: boolean
  loading?: boolean
  /** Focus a stable destination after confirmation removes the original trigger. */
  finalFocus?: ComponentPropsWithoutRef<typeof BaseAlertDialog.Popup>['finalFocus']
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function AlertDialog({
  trigger,
  title,
  description,
  confirmLabel: confirmLabelProp,
  cancelLabel: cancelLabelProp,
  onConfirm,
  open,
  onOpenChange,
  destructive = false,
  loading = false,
  finalFocus,
}: AlertDialogProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `AlertDialog.destructive`: `false`
- `AlertDialog.loading`: `false`
