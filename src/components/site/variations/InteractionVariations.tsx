import type { ComponentId } from '../../catalog/component-catalog'
import { ActionVariations } from './interactions/ActionVariations'
import { NavigationVariations } from './interactions/NavigationVariations'
import { OverlayVariations } from './interactions/OverlayVariations'

const actions: ComponentId[] = ['button', 'command', 'button-group', 'kbd', 'toggle']
const navigation: ComponentId[] = [
  'tabs',
  'pagination',
  'breadcrumb',
  'menubar',
  'navigation-menu',
  'sidebar',
  'stepper',
]

export function InteractionVariations({ id }: { id: ComponentId }) {
  if (actions.includes(id)) return <ActionVariations id={id} />
  if (navigation.includes(id)) return <NavigationVariations id={id} />
  return <OverlayVariations id={id} />
}
