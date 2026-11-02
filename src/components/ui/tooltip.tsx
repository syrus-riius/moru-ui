import { createContext, useContext, useId, useState, type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from 'react'
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { cn } from '../../lib/cn'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './overlays.css'

const TooltipProviderContext = createContext(false)

export interface TooltipProviderProps {
  children: ReactNode
  delay?: number
  closeDelay?: number
  timeout?: number
}

/** Group nearby tooltips to share the opening delay after the first tooltip. */
export function TooltipProvider({ children, delay = 400, closeDelay = 100, timeout = 400 }: TooltipProviderProps) {
  return (
    <TooltipProviderContext.Provider value={true}>
      <BaseTooltip.Provider delay={delay} closeDelay={closeDelay} timeout={timeout}>
        {children}
      </BaseTooltip.Provider>
    </TooltipProviderContext.Provider>
  )
}

export interface TooltipProps {
  trigger: ReactElement
  children: ReactNode
  side?: ComponentPropsWithoutRef<typeof BaseTooltip.Positioner>['side']
  align?: ComponentPropsWithoutRef<typeof BaseTooltip.Positioner>['align']
  className?: string
  delay?: number
}

export function Tooltip({ trigger, children, side = 'top', align = 'center', className, delay }: TooltipProps) {
  const portalContainer = useThemePortalContainer()
  const hasProvider = useContext(TooltipProviderContext)
  const tooltipId = useId()
  const [open, setOpen] = useState(false)
  const existingDescription = (trigger.props as { 'aria-describedby'?: string })['aria-describedby']
  const describedBy = [existingDescription, open ? tooltipId : undefined].filter(Boolean).join(' ') || undefined
  const tooltip = (
    <BaseTooltip.Root open={open} onOpenChange={setOpen}>
      <BaseTooltip.Trigger render={trigger} delay={delay} aria-describedby={describedBy} />
      <OverlayPortal portal={BaseTooltip.Portal} kind="tooltip" container={portalContainer}>
        <BaseTooltip.Positioner
          className="ui-tooltip-positioner"
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={12}
          collisionAvoidance={{ side: 'flip', align: 'shift', fallbackAxisSide: 'end' }}
        >
          <BaseTooltip.Popup id={tooltipId} role="tooltip" className={cn('ui-tooltip', className)}>{children}</BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </OverlayPortal>
    </BaseTooltip.Root>
  )

  return hasProvider ? tooltip : <TooltipProvider>{tooltip}</TooltipProvider>
}
