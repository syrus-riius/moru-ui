import loginSource from './LoginBlock.tsx?raw'
import signupSource from './SignupBlock.tsx?raw'
import dashboardSource from './DashboardBlock.tsx?raw'
import settingsSource from './SettingsBlock.tsx?raw'

import type { BlockId } from './block-metadata'
export { BLOCKS, type BlockId, type BlockDefinition } from './block-metadata'

const sources: Record<BlockId, string> = {
  login: loginSource,
  signup: signupSource,
  dashboard: dashboardSource,
  settings: settingsSource,
}

/** Paste into src/BlockName.tsx in the Moru web starter; no gallery-only dependencies. */
export function getBlockSource(id: BlockId): string {
  return sources[id]
    .replace(/from '\.\.\/\.\.\/lib\/i18n'/g, "from './lib/i18n'")
    .replace(/from '\.\.\/ui\//g, "from './components/ui/")
    .replace(/from '\.\/(OTPBlock|SearchFiltersBlock)'/g, "from './components/blocks/$1'")
}
