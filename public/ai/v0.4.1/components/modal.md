# Modal

Modal dialog with managed focus, scoped portals, size options and purpose-based variants.

Version: 0.4.1. Source hash: baf065ccb1fccaa4eed187992c95b92d1b8fd9b7084c361d9faa54b0f7c55c24.

## Discovery

- Registry ID: `modal`
- Import: `@/components/ui/moru/modal`
- Runtime exports: `Modal`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [modal.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/modal.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/modal.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/modal.tsx)

## Usage and interaction

- title is required. Use open/onOpenChange for controlled modals or defaultOpen for an initially open uncontrolled modal.
- Variants are default, confirmation, form, success and danger. Sizes are sm, md, lg and full. A variant changes presentation; implement the actual confirmation, submission or deletion in the application.
- Retain managed focus, Escape dismissal and focus return. Avoid nesting interactive elements inside the trigger.

## Minimal example

Also install: `button`.

```tsx
import { Button } from '@/components/ui/moru/button'
import { Modal } from '@/components/ui/moru/modal'

export function ProjectDetails() {
  return <Modal trigger={<Button type="button">Project details</Button>} title="Project details" description="Review the current milestone." size="md">
    <p>The design review is ready.</p>
  </Modal>
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ComponentPropsWithoutRef, ReactElement, ReactNode` from `react`
- `BaseDialog` from `@base-ui/react/dialog`

```ts
interface ModalProps {
  trigger?: ReactElement
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  /** Visual presentation; the caller owns confirmation actions and validation. */
  variant?: 'default' | 'confirmation' | 'form' | 'success' | 'danger'
  /** Override the decorative variant icon. Pass null to omit it. */
  icon?: ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  /** Choose the initial target for forms or long content; Base UI keeps its touch-safe default when omitted. */
  initialFocus?: ComponentPropsWithoutRef<typeof BaseDialog.Popup>['initialFocus']
  /** Restore focus to a stable destination when the opener is removed or the dialog has no trigger. */
  finalFocus?: ComponentPropsWithoutRef<typeof BaseDialog.Popup>['finalFocus']
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Modal({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  defaultOpen,
  size = 'md',
  variant = 'default',
  icon,
  onOpenChange,
  className,
  initialFocus,
  finalFocus,
}: ModalProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Modal.size`: `'md'`
- `Modal.variant`: `'default'`
