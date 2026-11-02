export const registryRelease = '0.3.4'
export const registryCliVersion = '4.23.0'
export const registryBaseUrl = `https://moru-ui-lab.riius.chatgpt.site/r/v${registryRelease}`

export const registryInstallItems = [
  { name: 'core', label: '공통 기반' },
  { name: 'button', label: 'Button' },
  { name: 'input', label: 'Input' },
  { name: 'field', label: 'Field' },
  { name: 'login', label: '로그인' },
  { name: 'otp', label: 'OTP' },
  { name: 'search-filters', label: '검색 필터' },
  { name: 'settings', label: '설정 폼' },
  { name: 'tabs', label: 'Tabs' },
  { name: 'menu', label: 'Menu' },
  { name: 'popover', label: 'Popover' },
  { name: 'drawer', label: 'Drawer' },
  { name: 'calendar', label: '캘린더' },
  { name: 'date-picker', label: '날짜 선택' },
  { name: 'date-range-picker', label: '날짜 범위' },
  { name: 'time-picker', label: '시간 선택' },
  { name: 'time-range-picker', label: '시간 범위' },
] as const

export type RegistryInstallItem = typeof registryInstallItems[number]['name']

export function registryInstallCommand(item: RegistryInstallItem) {
  return `npx shadcn@${registryCliVersion} add ${registryBaseUrl}/${item}.json`
}
