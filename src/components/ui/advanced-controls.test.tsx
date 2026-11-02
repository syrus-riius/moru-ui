import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Combobox } from './combobox'
import { Empty } from './empty'
import { Field } from './field'
import { Pagination } from './pagination'
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './table'
import { ToggleGroup } from './toggle-group'

function openingTags(markup: string, element: string): string[] { return [...(markup.match(new RegExp(`<${element}\\b[^>]*>`, 'g')) ?? [])] }
function attribute(tag: string, name: string) { return tag.match(new RegExp(`(?:^|\\s)${name}(?:="([^"]*)")?(?=\\s|/?>|$)`))?.[1] }

describe('Combobox public form and Field contracts', () => {
  const items = [{ value: 'design', label: '디자인', description: '화면을 만듭니다.' }, { value: 'develop', label: '개발', disabled: true }]
  it('submits a stable string rather than the visible label', () => {
    const markup = renderToStaticMarkup(<Combobox items={items} name="team" value="design" aria-label="팀 선택" />)
    const input = openingTags(markup, 'input').find((tag) => attribute(tag, 'role') === 'combobox')!
    const hidden = openingTags(markup, 'input').find((tag) => attribute(tag, 'name') === 'team')!
    expect(attribute(input, 'aria-label')).toBe('팀 선택')
    expect(attribute(input, 'value')).toBe('디자인')
    expect(attribute(hidden, 'value')).toBe('design')
  })
  it('connects the editable input to the Field label, descriptions and error', () => {
    const markup = renderToStaticMarkup(<Field label="담당 팀" description="팀을 선택합니다." error="선택이 필요합니다."><Combobox items={items} /></Field>)
    const input = openingTags(markup, 'input').find((tag) => attribute(tag, 'role') === 'combobox')!
    expect(attribute(input, 'id')).toBeTruthy()
    expect(attribute(input, 'aria-invalid')).toBe('true')
    expect(attribute(input, 'aria-describedby')?.split(' ')).toHaveLength(2)
    expect(markup).toContain(`for="${attribute(input, 'id')}"`)
    const ids = (markup.match(/<[a-z][^>]*>/g) ?? []).map((tag) => attribute(tag, 'id')).filter(Boolean)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('renders disabled input and does not submit a disabled selection', () => {
    const markup = renderToStaticMarkup(<Combobox items={items} name="team" defaultValue="design" disabled aria-label="팀 선택" />)
    const inputs = openingTags(markup, 'input')
    expect(inputs.every((tag) => /\sdisabled(?:="")?(?:\s|>)/.test(tag))).toBe(true)
  })
})

describe('Pagination accessible boundaries', () => {
  it('identifies the current page exactly once and announces its position', () => {
    const markup = renderToStaticMarkup(<Pagination page={3} pageCount={8} onPageChange={() => {}} />)
    expect(markup.match(/aria-current="page"/g)).toHaveLength(1)
    expect(markup).toContain('전체 8페이지 중 3페이지')
    expect(openingTags(markup, 'nav')[0]).toContain('aria-label="페이지 탐색"')
  })
  it('exposes no current page for an empty list and disables both directions', () => {
    const markup = renderToStaticMarkup(<Pagination page={1} pageCount={0} onPageChange={() => {}} />)
    const buttons = openingTags(markup, 'button')
    expect(buttons).toHaveLength(2)
    expect(buttons.every((button) => button.includes('disabled=""'))).toBe(true)
    expect(markup).not.toContain('aria-current')
    expect(markup).toContain('페이지가 없습니다.')
  })
  it('clamps a page made stale by removal of the last page', () => {
    const markup = renderToStaticMarkup(<Pagination page={8} pageCount={4} onPageChange={() => {}} />)
    expect(markup).toMatch(/aria-label="4페이지" aria-current="page"/)
    expect(openingTags(markup, 'button').find((tag) => attribute(tag, 'aria-label') === '다음 페이지')).toContain('disabled=""')
  })
})

describe('Compound table preserves native table semantics', () => {
  it('keeps captions, header scopes, row selection and native attributes on their elements', () => {
    const markup = renderToStaticMarkup(<Table id="team-table" aria-label="팀원 목록" scrollLabel="팀원 표 가로 스크롤"><TableCaption>전체 팀원 1명</TableCaption><TableHeader><TableRow><TableHead>이름</TableHead><TableHead scope="row">역할</TableHead></TableRow></TableHeader><TableBody><TableRow aria-selected="true"><TableCell>박다은</TableCell><TableCell>디자인</TableCell></TableRow></TableBody><TableFooter><TableRow><TableCell colSpan={2}>1명</TableCell></TableRow></TableFooter></Table>)
    expect(openingTags(markup, 'div')[0]).toContain('tabindex="0"')
    expect(openingTags(markup, 'div')[0]).toContain('role="region"')
    expect(openingTags(markup, 'div')[0]).toContain('aria-label="팀원 표 가로 스크롤"')
    expect(openingTags(markup, 'table')[0]).toContain('id="team-table"')
    expect(openingTags(markup, 'table')[0]).toContain('aria-label="팀원 목록"')
    expect(markup).toMatch(/<caption[^>]*>전체 팀원 1명<\/caption>/)
    expect(openingTags(markup, 'th').map((tag) => attribute(tag, 'scope'))).toEqual(['col', 'row'])
    expect(markup).toContain('aria-selected="true"')
    expect(markup).toContain('colSpan="2"')
    expect(markup).toContain('<tfoot')
  })
})

describe('Empty actionable state', () => {
  it('names and describes its region without announcing static content as an alert', () => {
    const markup = renderToStaticMarkup(<Empty title="팀원이 없습니다" description="첫 팀원을 초대하세요." icon={<svg />}><button>초대하기</button></Empty>)
    const root = openingTags(markup, 'div')[0]
    expect(attribute(root, 'role')).toBe('region')
    expect(attribute(root, 'aria-labelledby')).toBeTruthy()
    expect(attribute(root, 'aria-describedby')).toBeTruthy()
    expect(markup).toContain(`id="${attribute(root, 'aria-labelledby')}"`)
    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain('<button>초대하기</button>')
    expect(markup).not.toContain('role="alert"')
  })
})

describe('ToggleGroup selection semantics', () => {
  const items = [{ value: 'list', label: '목록' }, { value: 'grid', label: '격자' }, { value: 'board', label: '보드', disabled: true }]
  it('keeps single selection unique even when given more than one selected value', () => {
    const markup = renderToStaticMarkup(<ToggleGroup items={items} value={['list', 'grid']} aria-label="보기 방식" />)
    const buttons = openingTags(markup, 'button')
    expect(buttons.filter((tag) => attribute(tag, 'aria-pressed') === 'true')).toHaveLength(1)
    expect(attribute(buttons[0], 'aria-label')).toBe('목록')
    expect(buttons[2]).toContain('disabled=""')
  })
  it('supports independently pressed multiple items', () => {
    const markup = renderToStaticMarkup(<ToggleGroup items={items} type="multiple" defaultValue={['list', 'grid']} aria-label="보기 방식" />)
    expect(openingTags(markup, 'button').filter((tag) => attribute(tag, 'aria-pressed') === 'true')).toHaveLength(2)
    expect(markup).toContain('aria-label="보기 방식"')
  })
})
