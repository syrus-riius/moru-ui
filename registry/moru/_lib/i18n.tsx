'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import {
  formattingLocales,
  messagesFor,
  translate,
  type Locale,
  type Translator,
  type Translations,
} from './locale'
import { uiMessages } from './ui-messages'
export * from './locale'

type I18nValue = {
  locale: Locale
  formatLocale: string
  t: Translator
  /** Whether this provider (built-in labels or application `messages`) translates the text. */
  has: (message: string) => boolean
  setLocale: (locale: Locale) => void
  pending: boolean
}
const fallback: I18nValue = {
  locale: 'ko',
  formatLocale: 'ko-KR',
  t: (message, values) => translate(message, {}, values),
  has: () => false,
  setLocale: () => {},
  pending: false,
}
const I18nContext = createContext<I18nValue>(fallback)

/**
 * Optional and isolated: components keep their Korean defaults without a locale provider.
 * Only built-in component labels live here. Block copy ships with the blocks (block-i18n),
 * so an application that installs a single component does not bundle every block's text.
 */
export function MoruLocaleProvider({
  locale: localeProp,
  messages,
  onLocaleChange,
  pending = false,
  children,
}: {
  locale?: Locale
  messages?: Translations
  onLocaleChange?: (locale: Locale) => void
  pending?: boolean
  children: ReactNode
}) {
  const parent = useContext(I18nContext)
  const locale = localeProp ?? parent.locale
  const value = useMemo<I18nValue>(() => {
    const dictionary = {
      ...messagesFor(uiMessages, locale),
      ...messages,
    }
    return {
      locale,
      formatLocale: formattingLocales[locale],
      t: (message, values) => translate(message, dictionary, values),
      has: (message) => Object.prototype.hasOwnProperty.call(dictionary, message),
      setLocale: onLocaleChange ?? fallback.setLocale,
      pending,
    }
  }, [locale, messages, onLocaleChange, pending])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
export function useI18n() {
  return useContext(I18nContext)
}
