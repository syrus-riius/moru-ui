import { components, componentAliases, filterComponents, type Category } from './component-catalog'
import { componentGroupFor } from './component-pages'

type Translate = (source: string) => string
const normalize = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s-]+/g, '')

/** Keep Korean aliases searchable while adding the language currently shown in the catalog. */
export function filterLocalizedComponents(
  category: Category,
  query: string,
  newOnly: boolean,
  t: Translate,
) {
  const originalMatches = new Set(filterComponents(category, query, newOnly).map(({ id }) => id))
  const search = normalize(query)
  return components.filter((component) => {
    if (newOnly && component.generation !== 'completion') return false
    if (category !== 'all' && component.category !== category) return false
    if (originalMatches.has(component.id)) return true
    const group = componentGroupFor(component.id)
    return normalize(
      `${component.name} ${t(component.subtitle)} ${t(componentAliases[component.id])} ${t(group.label)}`,
    ).includes(search)
  })
}

/** Localize presentation fields while keeping option values and identifiers unchanged. */
export function localizeCatalogItems<T>(items: readonly T[], t: Translate): T[] {
  return items.map((item) => {
    if (!item || typeof item !== 'object') return item
    const copy = { ...item } as Record<string, unknown>
    for (const key of [
      'label',
      'title',
      'description',
      'subtitle',
      'hint',
      'header',
      'placeholder',
      'content',
    ]) {
      if (typeof copy[key] === 'string') copy[key] = t(copy[key])
    }
    for (const key of ['items', 'options']) {
      if (Array.isArray(copy[key])) copy[key] = localizeCatalogItems(copy[key], t)
    }
    return copy as T
  })
}
