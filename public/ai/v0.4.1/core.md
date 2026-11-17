# Moru Core

Scoped styles, tokens, MoruProvider, and shared helpers.

Version: 0.4.1. Source hash: 2fd87d38eaaf0375eb097047b65a7d17f1067292b1a98efdbfd46ccdaa31ff28.

## Discovery

- Registry ID: `core`
- Import: `@/components/ui/moru/provider`
- Runtime exports: `MoruLocaleProvider`, `MoruProvider`, `useI18n`
- Registry dependencies: none
- Install source: [core.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/core.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `Locale, Translations` from `./_lib/i18n`
- `ThemeScopeProps` from `./theme-scope`
- `ThemeMode, ThemeTokens` from `./_theme/tokens`

```ts
interface MoruProviderProps extends Omit<ThemeScopeProps, 'mode' | 'tokens'> {
  mode?: ThemeMode
  tokens?: ThemeTokens
  locale?: Locale
  messages?: Translations
}

export type { Locale, Translations } from './_lib/i18n'
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function MoruProvider({ mode = 'light', tokens, locale, messages, children, ...props }: MoruProviderProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `MoruProvider.mode`: `'light'`
