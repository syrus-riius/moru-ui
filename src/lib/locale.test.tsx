import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MoruLocaleProvider } from './i18n'
import { isLocale, messagesFor, resolveLocale, translate } from './locale'
import { uiMessages } from './ui-messages'
import { blockMessages } from './block-messages'
import { DatePicker } from '../components/ui/date-picker'
import { TimeRangePicker } from '../components/ui/time-range-picker'
import { PasswordInput } from '../components/ui/password-input'
import { LoginBlock } from '../components/blocks/LoginBlock'
import { getTimeValidationError } from '../components/ui/time-utils'
import { getDateRangeIssue } from '../components/ui/date-range-picker-utils'

describe('locale contracts', () => {
  it('resolves supported browser languages and rejects invalid persisted values', () => {
    expect(resolveLocale(['fr-FR', 'ja-JP', 'en-US'])).toBe('ja')
    expect(resolveLocale(['zh-TW'])).toBe('zh-CN')
    expect(resolveLocale(['de-DE'])).toBe('ko')
    expect(isLocale('en-US')).toBe(false)
    expect(isLocale('__proto__')).toBe(false)
  })
  it('preserves unknown text, reorders placeholders and treats values as plain text', () => {
    expect(
      translate('{a} → {b}', { '{a} → {b}': '{b}, then {a}' }, { a: 'user input', b: '<b>x</b>' }),
    ).toBe('<b>x</b>, then user input')
    expect(translate('Custom label', {})).toBe('Custom label')
    expect(translate('constructor', {})).toBe('constructor')
  })
  it.each(['en', 'ja', 'zh-CN'] as const)('%s preserves dictionary placeholders', (locale) => {
    for (const [source, entry] of Object.entries({ ...uiMessages, ...blockMessages })) {
      expect(entry[locale], source).toBeTruthy()
      const keys = (value: string) => [...new Set(value.match(/\{\w+\}/g))].sort()
      expect(keys(entry[locale]), source).toEqual(keys(source))
    }
  })
  it.each(['en', 'ja', 'zh-CN'] as const)(
    '%s translates built-in input copy without changing submitted dates',
    (locale) => {
      const messages = messagesFor(uiMessages, locale)
      const html = renderToStaticMarkup(
        <MoruLocaleProvider locale={locale}>
          <DatePicker name="date" defaultValue={new Date(2026, 10, 12)} />
          <PasswordInput aria-label="내가 입력한 제목" />
        </MoruLocaleProvider>,
      )
      expect(html).toContain('value="2026-11-12"')
      expect(html).toContain(messages['비밀번호 표시'])
      expect(html).toContain('내가 입력한 제목')
      expect(html).not.toContain('날짜 선택')
    },
  )
  it('keeps Korean defaults and allows applications to override built-in copy', () => {
    expect(renderToStaticMarkup(<PasswordInput />)).toContain('비밀번호 표시')
    expect(
      renderToStaticMarkup(
        <MoruLocaleProvider locale="en" messages={{ '비밀번호 표시': 'Reveal secret' }}>
          <PasswordInput />
        </MoruLocaleProvider>,
      ),
    ).toContain('Reveal secret')
  })
  it('localizes validation and overnight range guidance', () => {
    const t = (key: string, values?: Record<string, string | number>) =>
      translate(key, messagesFor(uiMessages, 'en'), values)
    expect(getTimeValidationError('25:00', {}, t)).toContain('HH:mm')
    expect(getTimeValidationError('09:02', { step: 15 }, t)).toContain('15-minute')
    expect(
      getDateRangeIssue({ start: new Date(2026, 10, 13), end: new Date(2026, 10, 12) }, {}, t)
        ?.message,
    ).toBe('End date must be on or after start date.')
    expect(
      renderToStaticMarkup(
        <MoruLocaleProvider locale="en">
          <TimeRangePicker defaultValue={{ start: '23:00', end: '01:00' }} allowOvernight />
        </MoruLocaleProvider>,
      ),
    ).toContain('ends next day')
  })
  it('inherits an outer language when no nested locale is provided', () => {
    const html = renderToStaticMarkup(
      <MoruLocaleProvider locale="ja">
        <MoruLocaleProvider>
          <PasswordInput />
        </MoruLocaleProvider>
      </MoruLocaleProvider>,
    )
    expect(html).toContain('パスワードを表示')
  })
  it('ships block translations with the portable provider', () => {
    const html = renderToStaticMarkup(
      <MoruLocaleProvider locale="en">
        <LoginBlock />
      </MoruLocaleProvider>,
    )
    expect(html).not.toContain('로그인')
  })
})
