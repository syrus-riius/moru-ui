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
import { blockMessages } from './block-messages'
export * from './locale'

type I18nValue = {
  locale: Locale
  formatLocale: string
  t: Translator
  setLocale: (locale: Locale) => void
  pending: boolean
}
const fallback: I18nValue = {
  locale: 'ko',
  formatLocale: 'ko-KR',
  t: (message, values) => translate(message, {}, values),
  setLocale: () => {},
  pending: false,
}
const I18nContext = createContext<I18nValue>(fallback)

/** Optional and isolated: components keep their Korean defaults without a locale provider. */
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
      ...messagesFor(blockMessages, locale),
      ...messagesFor(uiMessages, locale),
      ...messages,
    }
    return {
      locale,
      formatLocale: formattingLocales[locale],
      t: (message, values) => translate(message, dictionary, values),
      setLocale: onLocaleChange ?? fallback.setLocale,
      pending,
    }
  }, [locale, messages, onLocaleChange, pending])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
export function useI18n() {
  return useContext(I18nContext)
}
