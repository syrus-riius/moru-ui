export const registryRelease = '0.3.1'
export const registryCliVersion = '4.23.0'
export const registryBaseUrl = `https://moru-ui-lab.riius.chatgpt.site/r/v${registryRelease}`

export const registryInstallItems = [
  { name: 'core', label: '공통 기반' },
  { name: 'button', label: 'Button' },
  { name: 'input', label: 'Input' },
  { name: 'field', label: 'Field' },
  { name: 'login', label: '로그인' },
  { name: 'otp', label: 'OTP' },
] as const

export type RegistryInstallItem = typeof registryInstallItems[number]['name']

export function registryInstallCommand(item: RegistryInstallItem) {
  return `npx shadcn@${registryCliVersion} add ${registryBaseUrl}/${item}.json`
}
