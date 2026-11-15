# Typography

Role-based display, heading, body, label, caption and code text.

Version: 0.4.0. Source hash: c7657160432134a41ca0feec508cb24f0ded72c14d22567531868ef45f3e6dcc.

## Discovery

- Registry ID: `typography`
- Import: `@/components/ui/moru/typography`
- Runtime exports: `Typography`
- Registry dependencies: [core](/ai/v0.4.0/core.md)
- Install source: [typography.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/typography.json)
- Setup and import-path differences: [start](/ai/v0.4.0/start.md)
- Source: [src/components/ui/typography.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/typography.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes` from `react`
- `TypographyRole` from `./_theme/tokens`

```ts
type TypographyElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label' | 'strong' | 'small' | 'code'

type TypographyProps = HTMLAttributes<HTMLElement> & {
  variant?: TypographyRole
  as?: TypographyElement
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Typography({ variant = 'body', as, className, children, ...props }: TypographyProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Typography.variant`: `'body'`
