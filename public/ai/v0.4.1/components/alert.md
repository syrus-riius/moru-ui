# Alert

Semantic inline notice with a title, description and meaning beyond color.

Version: 0.4.1. Source hash: 3d50d8d1c9951acff47d57ffd227011e1e268683be793d82d543261e48d83ef7.

## Discovery

- Registry ID: `alert`
- Import: `@/components/ui/moru/alert`
- Runtime exports: `Alert`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [alert.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/alert.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/alert.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/alert.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes, ReactNode` from `react`
- `SemanticTone` from `./state`

```ts
interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  title: string
  children?: ReactNode
  tone?: SemanticTone
  icon?: ReactNode
}
```

Exported value type annotations / generic factory calls from source:

- `Alert: forwardRef<HTMLDivElement, AlertProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Alert.tone`: `'info'`
