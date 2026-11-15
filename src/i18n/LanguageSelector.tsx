import { Languages } from 'lucide-react'
import { NativeSelect } from '../components/ui/native-select'
import { isLocale, localeNames, locales, useI18n } from './index'
import './language-selector.css'

export function LanguageSelector() {
  const { locale, setLocale, pending, t } = useI18n()
  return (
    <label className="moru-language-selector" aria-busy={pending}>
      <Languages size={17} aria-hidden="true" />
      <NativeSelect
        size="sm"
        aria-label={t('언어 선택')}
        title={t('언어 선택')}
        value={locale}
        onChange={(event) => {
          if (isLocale(event.target.value)) setLocale(event.target.value)
        }}
      >
        {locales.map((option) => (
          <option key={option} value={option} lang={option}>
            {localeNames[option]}
          </option>
        ))}
      </NativeSelect>
    </label>
  )
}
