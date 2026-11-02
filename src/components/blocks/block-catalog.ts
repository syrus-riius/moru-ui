import loginSource from './LoginBlock.tsx?raw'
import otpSource from './OTPBlock.tsx?raw'
import searchFiltersSource from './SearchFiltersBlock.tsx?raw'
import settingsSource from './SettingsBlock.tsx?raw'

import type { BlockId } from './block-metadata'
export { BLOCKS, type BlockId, type BlockDefinition } from './block-metadata'

const sources: Record<BlockId, string> = { login: loginSource, otp: otpSource, 'search-filters': searchFiltersSource, settings: settingsSource }

/** Paste into src/BlockName.tsx in the Moru web starter; no gallery-only dependencies. */
export function getBlockSource(id: BlockId): string {
  return sources[id].replace(/from '\.\.\/ui\//g, "from './components/ui/")
}
