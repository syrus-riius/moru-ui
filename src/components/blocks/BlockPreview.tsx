import type { BlockId } from './block-catalog'
import { LoginBlock } from './LoginBlock'
import { OTPBlock } from './OTPBlock'
import { SearchFiltersBlock } from './SearchFiltersBlock'
import { SettingsBlock } from './SettingsBlock'

export function BlockPreview({ blockId }: { blockId: BlockId }) {
  switch (blockId) {
    case 'login': return <LoginBlock />
    case 'otp': return <OTPBlock />
    case 'search-filters': return <SearchFiltersBlock />
    case 'settings': return <SettingsBlock />
  }
}
