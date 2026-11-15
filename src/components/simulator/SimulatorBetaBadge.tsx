import { cn } from '../../lib/cn'
import { Badge } from '../ui/badge'
import './simulator-beta-badge.css'

/** Keep the simulator's release status consistent across its entry points. */
export function SimulatorBetaBadge({ className }: { className?: string }) {
  return (
    <Badge tone="warning" className={cn('simulator-beta-badge', className)}>
      BETA
    </Badge>
  )
}
