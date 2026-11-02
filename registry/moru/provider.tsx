'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { ThemeScope, type ThemeScopeProps } from './theme-scope'
import { createDarkTokens, defaultTokens, type ThemeMode, type ThemeTokens } from './_theme/tokens'

export interface MoruProviderProps extends Omit<ThemeScopeProps, 'mode' | 'tokens'> {
  mode?: ThemeMode
  tokens?: ThemeTokens
}

const darkTokens = createDarkTokens(defaultTokens)

/** Import ./styles.css once, then wrap Moru components. Host tokens are not modified. */
export function MoruProvider({ mode = 'light', tokens, children, ...props }: MoruProviderProps) {
  return <ThemeScope {...props} mode={mode} tokens={tokens ?? (mode === 'dark' ? darkTokens : defaultTokens)}>{children}</ThemeScope>
}
