// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useMemo } from 'react'
import { messagesFor, translate, useI18n, type Locale, type Translations } from './i18n'
import { blockMessages } from './block-messages'

const dictionaries = new Map<Locale, Translations>()
function blockDictionary(locale: Locale) {
  let dictionary = dictionaries.get(locale)
  if (!dictionary) {
    dictionary = messagesFor(blockMessages, locale)
    dictionaries.set(locale, dictionary)
  }
  return dictionary
}

/**
 * useI18n for blocks and the project template. Their copy travels with them instead of
 * with core; text supplied by the application's provider still takes precedence.
 */
export function useBlockI18n() {
  const i18n = useI18n()
  return useMemo(() => {
    const dictionary = blockDictionary(i18n.locale)
    return {
      ...i18n,
      t: ((message, values) =>
        i18n.has(message)
          ? i18n.t(message, values)
          : translate(message, dictionary, values)) as typeof i18n.t,
    }
  }, [i18n])
}
