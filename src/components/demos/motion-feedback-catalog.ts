export const motionFeedbackComponents = [
  {
    id: 'loading-overlay',
    name: 'Loading Overlay',
    subtitle: '영역 로딩과 안전한 상호작용 잠금',
    category: 'feedback',
    generation: 'completion',
  },
  {
    id: 'status-indicator',
    name: 'Status Indicator',
    subtitle: '연결·동기화 상태를 읽는 작은 신호',
    category: 'feedback',
    generation: 'completion',
  },
] as const
export type MotionFeedbackId = (typeof motionFeedbackComponents)[number]['id']
export const motionFeedbackAliases: Record<MotionFeedbackId, string> = {
  'loading-overlay': '로딩 오버레이 영역 대기 로더 loading overlay busy inert',
  'status-indicator': '상태 인디케이터 연결 동기화 저장 신호 pulse status indicator sync',
}
export const motionFeedbackSnippets: Record<MotionFeedbackId, string> = {
  'loading-overlay':
    '<LoadingOverlay loading={saving} label="설정 저장 중" spinnerVariant="dots">\n  <SettingsForm />\n</LoadingOverlay>\n{/* 취소·완료 동작은 잠긴 영역 밖에 배치하세요. */}',
  'status-indicator':
    '<StatusIndicator\n  label={syncing ? "동기화 중" : "저장됨"}\n  tone={syncing ? "info" : "success"}\n  pulse={syncing} live="polite"\n/>',
}
