import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  isLocale,
  MoruLocaleProvider,
  resolveLocale,
  messagesFor,
  type Locale,
  type MessageCatalog,
  type Translations,
} from './index'
import { blockMessages } from '../lib/block-messages'

export const LANGUAGE_STORAGE_KEY = 'moru-ui-language'
const dictionaries = new Map<Locale, Translations>([['ko', {}]])
let catalogPromise: Promise<MessageCatalog> | undefined
function loadCatalog() {
  return (catalogPromise ??= Promise.all([
    import('./messages/app'),
    import('./messages/public'),
    import('./messages/studio'),
    import('./messages/catalog'),
    import('./messages/screens'),
    import('./messages/simulator'),
    import('./messages/examples'),
    import('./messages/input-variations'),
    import('./messages/motion-feedback'),
  ])
    .then(
      ([
        app,
        content,
        studio,
        catalog,
        screens,
        simulator,
        examples,
        inputVariations,
        motionFeedback,
      ]) => ({
        // Block copy is no longer part of the library provider; the lab keeps showing it.
        ...blockMessages,
        ...app.appMessages,
        ...content.publicMessages,
        ...studio.studioMessages,
        ...catalog.catalogMessages,
        ...screens.screenMessages,
        ...simulator.simulatorMessages,
        ...examples.exampleMessages,
        ...inputVariations.inputVariationMessages,
        ...motionFeedback.motionFeedbackMessages,
      }),
    )
    .catch((error) => {
      catalogPromise = undefined
      throw error
    }))
}
function preferredLocale(): Locale {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (isLocale(saved)) return saved
  } catch {
    /* Storage may be disabled; language selection remains usable. */
  }
  return typeof navigator === 'undefined' ? 'ko' : resolveLocale(navigator.languages)
}

export function SiteI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('ko')
  const [messages, setMessages] = useState<Translations>({})
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const request = useRef(0)
  const changeLocale = useCallback(async (next: Locale, persist = true) => {
    if (!isLocale(next)) return
    const version = ++request.current
    setFailed(false)
    setPending(!dictionaries.has(next))
    try {
      const dictionary = dictionaries.get(next) ?? messagesFor(await loadCatalog(), next)
      dictionaries.set(next, dictionary)
      if (request.current !== version) return
      setLocale(next)
      setMessages(dictionary)
      if (persist) {
        try {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
        } catch {
          /* Optional persistence. */
        }
      }
    } catch {
      if (request.current === version) setFailed(true)
    } finally {
      if (request.current === version) setPending(false)
    }
  }, [])
  const onLocaleChange = useCallback(
    (next: Locale) => {
      void changeLocale(next)
    },
    [changeLocale],
  )
  useEffect(() => {
    void changeLocale(preferredLocale(), false)
    function sync(event: StorageEvent) {
      if (event.key === LANGUAGE_STORAGE_KEY && isLocale(event.newValue))
        void changeLocale(event.newValue, false)
    }
    window.addEventListener('storage', sync)
    return () => {
      request.current++
      window.removeEventListener('storage', sync)
    }
  }, [changeLocale])
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return (
    <MoruLocaleProvider
      locale={locale}
      messages={messages}
      pending={pending}
      onLocaleChange={onLocaleChange}
    >
      {children}
      {failed && (
        <p role="alert" className="moru-language-error">
          Language could not be loaded. Please select it again.
        </p>
      )}
    </MoruLocaleProvider>
  )
}
