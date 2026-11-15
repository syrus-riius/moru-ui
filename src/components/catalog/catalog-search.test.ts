import { describe, expect, it } from 'vitest'
import { messagesFor, translate } from '../../lib/locale'
import { catalogMessages } from '../../i18n/messages/catalog'
import { inputVariationMessages } from '../../i18n/messages/input-variations'
import { filterLocalizedComponents, localizeCatalogItems } from './catalog-search'

function translator(locale: 'en' | 'ja' | 'zh-CN') {
  const messages = messagesFor({ ...catalogMessages, ...inputVariationMessages }, locale)
  return (source: string) => translate(source, messages)
}

describe('localized component discovery', () => {
  it.each(['en', 'ja', 'zh-CN'] as const)(
    'searches translated descriptions in %s while retaining Korean aliases',
    (locale) => {
      const t = translator(locale)
      expect(
        filterLocalizedComponents('forms', t('결제·연락처·네트워크 등 12가지 입력'), false, t).some(
          ({ id }) => id === 'input',
        ),
      ).toBe(true)
      expect(filterLocalizedComponents('all', '스위치', false, t).map(({ id }) => id)).toEqual([
        'switch',
      ])
      expect(filterLocalizedComponents('all', 'radio-group', false, t).map(({ id }) => id)).toEqual(
        ['radio-group'],
      )
    },
  )

  it('keeps category and new-only filters when searching translated text', () => {
    const t = translator('en')
    expect(
      filterLocalizedComponents('layout', t('결제·연락처·네트워크 등 12가지 입력'), false, t),
    ).toEqual([])
    expect(
      filterLocalizedComponents('forms', t('결제·연락처·네트워크 등 12가지 입력'), true, t),
    ).toEqual([])
  })

  it('localizes nested labels without changing option values, identifiers, or source data', () => {
    const source = [{ id: 'role', label: '권한', options: [{ value: '편집자', label: '편집자' }] }]
    const localized = localizeCatalogItems(source, translator('en'))
    expect(localized).toEqual([
      { id: 'role', label: 'Permissions', options: [{ value: '편집자', label: 'Editor' }] },
    ])
    expect(source[0].options[0].label).toBe('편집자')
  })
})
