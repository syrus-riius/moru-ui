// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
export const locales = ['ko', 'en', 'ja', 'zh-CN'] as const
export type Locale = (typeof locales)[number]
export type TranslationValues = Record<string, string | number>
export type Translations = Record<string, string>
export type MessageCatalog = Record<string, { en: string; ja: string; 'zh-CN': string }>
export type Translator = (message: string, values?: TranslationValues) => string

export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  'zh-CN': '简体中文',
}
export const formattingLocales: Record<Locale, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  'zh-CN': 'zh-CN',
}
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && locales.includes(value as Locale)
}
export function resolveLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const code = language.toLowerCase().split('-')[0]
    if (code === 'zh') return 'zh-CN'
    if (code === 'ko' || code === 'en' || code === 'ja') return code
  }
  return 'ko'
}
/** Named placeholders keep sentence order in the translation, outside application logic. */
export function translate(message: string, messages: Translations, values?: TranslationValues) {
  const translated = Object.prototype.hasOwnProperty.call(messages, message)
    ? messages[message]
    : message
  return values
    ? translated.replace(/\{(\w+)\}/g, (placeholder, key) =>
        Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : placeholder,
      )
    : translated
}
export function messagesFor(catalog: MessageCatalog, locale: Locale): Translations {
  return locale === 'ko'
    ? {}
    : Object.fromEntries(
        Object.entries(catalog).map(([source, translations]) => [source, translations[locale]]),
      )
}

export const koreanTranslator: Translator = (message, values) => translate(message, {}, values)
