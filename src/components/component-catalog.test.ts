import { describe, expect, it } from 'vitest'
import { filterComponents } from './component-catalog'

describe('component discovery', () => {
  it('finds an English component through its Korean name', () => {
    expect(filterComponents('all', '스위치').map((item) => item.id)).toEqual(['switch'])
    expect(filterComponents('all', '팝오버').map((item) => item.id)).toEqual(['popover'])
  })

  it('accepts spaces, casing and the source file name for Radio Group', () => {
    for (const query of ['  RADIO GROUP  ', 'radio-group', '라디오 그룹']) {
      expect(filterComponents('all', query).map((item) => item.id)).toEqual(['radio-group'])
    }
  })

  it('combines the new collection and category filters with search', () => {
    expect(filterComponents('forms', '알림', true)).toEqual([])
    expect(filterComponents('feedback', '스피너', true).map((item) => item.id)).toEqual(['spinner'])
    expect(filterComponents('all', '스위치', true)).toEqual([])
    expect(filterComponents('all', '스위치').map((item) => item.id)).toEqual(['switch'])
  })

  it('treats a blank query as browsing and keeps unmatched queries empty', () => {
    expect(filterComponents('forms', '  ').length).toBeGreaterThan(0)
    expect(filterComponents('all', '존재하지않는부품')).toEqual([])
  })
})
