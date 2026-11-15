# Sheet

Side panel dialog with managed focus, title, content and footer actions.

Version: 0.4.1. Source hash: 3d50d8d1c9951acff47d57ffd227011e1e268683be793d82d543261e48d83ef7.

## Discovery

- Registry ID: `sheet`
- Import: `@/components/ui/moru/sheet`
- Runtime exports: `Sheet`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [sheet.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/sheet.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/sheet.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/sheet.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ComponentPropsWithoutRef, ReactElement, ReactNode` from `react`
- `BaseDialog` from `@base-ui/react/dialog`

```ts
interface SheetProps {
  trigger?: ReactElement
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'left' | 'right' | 'bottom'
  className?: string
  initialFocus?: ComponentPropsWithoutRef<typeof BaseDialog.Popup>['initialFocus']
  finalFocus?: ComponentPropsWithoutRef<typeof BaseDialog.Popup>['finalFocus']
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Sheet({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  defaultOpen,
  onOpenChange,
  side = 'right',
  className,
  initialFocus,
  finalFocus,
}: SheetProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Sheet.side`: `'right'`
