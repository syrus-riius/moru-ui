'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { MoruLocaleProvider, type Locale, type Translations } from './_lib/i18n'
export { MoruLocaleProvider, useI18n } from './_lib/i18n'
export type { Locale, Translations } from './_lib/i18n'
import { ThemeScope, type ThemeScopeProps } from './theme-scope'
import { createDarkTokens, defaultTokens, type ThemeMode, type ThemeTokens } from './_theme/tokens'

export interface MoruProviderProps extends Omit<ThemeScopeProps, 'mode' | 'tokens'> {
  mode?: ThemeMode
  tokens?: ThemeTokens
  locale?: Locale
  messages?: Translations
}

const darkTokens = createDarkTokens(defaultTokens)

/** Import ./styles.css once, then wrap Moru components. Host tokens are not modified. */
export function MoruProvider({ mode = 'light', tokens, locale, messages, children, ...props }: MoruProviderProps) {
  const content = <ThemeScope {...props} mode={mode} tokens={tokens ?? (mode === 'dark' ? darkTokens : defaultTokens)}>{children}</ThemeScope>
  return locale !== undefined || messages !== undefined ? <MoruLocaleProvider locale={locale} messages={messages}>{content}</MoruLocaleProvider> : content
}
