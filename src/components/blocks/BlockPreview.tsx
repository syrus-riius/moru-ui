import type { BlockId } from './block-catalog'
import { LoginBlock } from './LoginBlock'
import { SignupBlock } from './SignupBlock'
import { DashboardBlock } from './DashboardBlock'
import { SettingsBlock } from './SettingsBlock'

export function BlockPreview({ blockId }: { blockId: BlockId }) {
  switch (blockId) {
    case 'login':
      return <LoginBlock />
    case 'signup':
      return <SignupBlock />
    case 'dashboard':
      return <DashboardBlock />
    case 'settings':
      return <SettingsBlock />
  }
}
