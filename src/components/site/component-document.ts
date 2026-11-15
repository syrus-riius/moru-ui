export type ComponentProp = {
  owner: string
  name: string
  type: string
  required: boolean
  description?: string
  defaultValue?: string
}

export type ComponentDocument = {
  schemaVersion: 1
  id: string
  title: string
  description: string
  example: string
  installCommand: string
  sourceUrl: string
  props: ComponentProp[]
  api: string
  defaults: Array<{ component: string; prop: string; value: string }>
}

const documents = new Map<string, ComponentDocument>()

/** Load only the requested reference; never bundle every component's API into the home page. */
export async function loadComponentDocument(
  id: string,
  signal: AbortSignal,
): Promise<ComponentDocument> {
  const cached = documents.get(id)
  if (cached) return cached
  const response = await fetch(`/docs/components/${encodeURIComponent(id)}.json`, { signal })
  if (!response.ok) throw new Error('Unable to load component documentation')
  const value: ComponentDocument = await response.json()
  if (
    !value ||
    value.schemaVersion !== 1 ||
    value.id !== id ||
    !['title', 'description', 'example', 'installCommand', 'sourceUrl', 'api'].every(
      (key) => typeof value[key as keyof ComponentDocument] === 'string',
    ) ||
    !Array.isArray(value.props) ||
    !Array.isArray(value.defaults) ||
    !value.props.every(
      (prop) =>
        prop &&
        typeof prop.name === 'string' &&
        typeof prop.type === 'string' &&
        typeof prop.owner === 'string' &&
        typeof prop.required === 'boolean',
    )
  )
    throw new Error('Invalid component documentation')
  documents.set(id, value)
  return value
}
