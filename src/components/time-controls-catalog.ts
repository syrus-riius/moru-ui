export const timeControlComponents = [
  { id: 'time-picker', name: 'Time Picker', subtitle: '시간 입력과 시·분 빠른 선택', category: 'forms', generation: 'completion' },
  { id: 'time-range-picker', name: 'Time Range Picker', subtitle: '시작·종료와 다음 날 시간 범위', category: 'forms', generation: 'completion' },
] as const
export type TimeControlId = (typeof timeControlComponents)[number]['id']
export const timeControlAliases: Record<TimeControlId, string> = {
  'time-picker': '시간 타임 피커 시 분 스케줄 24시간',
  'time-range-picker': '시간 범위 타임 레인지 시작 종료 기간 다음날 자정',
}
export const timeControlSnippets: Record<TimeControlId, string> = {
  'time-picker': '<Field label="회의 시작 시간">\n  <TimePicker name="meeting-time"\n    value={time} onValueChange={setTime}\n    min="09:00" max="18:00" step={15} required />\n</Field>\n{/* 값은 시간대 변환 없는 HH:mm 또는 null입니다. */}',
  'time-range-picker': '<TimeRangePicker label="회의 시간" name="meeting"\n  value={timeRange} onValueChange={setTimeRange}\n  step={15} required\n/>\n{/* FormData: meeting.start / meeting.end */}\n\n<TimeRangePicker label="야간 작업"\n  allowOvernight defaultValue={{ start: "22:00", end: "02:00" }}\n/>',
}
