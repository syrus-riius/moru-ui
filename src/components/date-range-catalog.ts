export const dateRangeComponents = [
  { id: 'date-range-picker', name: 'Date Range Picker', subtitle: '시작일과 종료일을 한 번에 선택', category: 'forms', generation: 'completion' },
] as const
export type DateRangeComponentId = (typeof dateRangeComponents)[number]['id']
export const dateRangeAliases: Record<DateRangeComponentId, string> = {
  'date-range-picker': '날짜 범위 기간 시작일 종료일 캘린더 date range picker',
}
export const dateRangeSnippets: Record<DateRangeComponentId, string> = {
  'date-range-picker': '<Field label="프로젝트 기간">\n  <DateRangePicker\n    name="period"\n    value={period}\n    onValueChange={setPeriod}\n    required\n  />\n</Field>\n{/* period = { start: Date | null, end: Date | null } */}\n{/* FormData: period.start / period.end, YYYY-MM-DD */}',
}
