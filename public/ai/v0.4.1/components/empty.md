# Empty

Empty-state content with explanation and a next action.

Version: 0.4.1. Source hash: 3d50d8d1c9951acff47d57ffd227011e1e268683be793d82d543261e48d83ef7.

## Discovery

- Registry ID: `empty`
- Import: `@/components/ui/moru/empty`
- Runtime exports: `Empty`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [empty.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/empty.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/empty.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/empty.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes, ReactNode` from `react`

```ts
interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string
  description?: ReactNode
  icon?: ReactNode
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Empty({
  title,
  description,
  icon,
  children,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  ...props
}: EmptyProps);
```
