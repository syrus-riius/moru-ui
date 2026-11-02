import type { ColorTokenKey } from '../theme/tokens'

/** Terminology for design editors; product-facing status messages keep their own copy. */
export const colorRoleLabels: Record<ColorTokenKey, string> = {
  primary: '프라이머리', accent: '액센트', background: '백그라운드', surface: '서피스',
  text: '텍스트', muted: '뮤티드', border: '보더',
  success: '석세스', warning: '워닝', info: '인포', danger: '데인저',
}

export const colorGroupLabels = { foundation: '베이스 컬러', semantic: '시맨틱 컬러' } as const

export const colorAuditLabels: Record<string, string> = {
  'text-surface': '텍스트 / 서피스', 'muted-surface': '뮤티드 / 서피스',
  'text-background': '텍스트 / 백그라운드', primary: '버튼 텍스트 / 프라이머리',
  accent: '텍스트 / 액센트', 'accent-surface': '액센트 텍스트 / 서피스',
  success: '석세스 / 서피스', warning: '워닝 / 서피스', info: '인포 / 서피스', danger: '데인저 / 서피스',
}
