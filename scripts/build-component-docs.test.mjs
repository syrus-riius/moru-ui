import assert from 'node:assert/strict'
import { before, test } from 'node:test'
import { extractApi, generateComponentDocs, prepareNpmExample } from './build-component-docs.mjs'

let generated
before(async () => {
  generated = await generateComponentDocs()
})

test('source props retain exact nested types, comments, required flags and declared defaults', () => {
  const document = `## Source-derived API
\n\`\`\`ts
interface TaskProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Items retain their own required label. */
  items: Array<{ label: string; disabled?: boolean }>
  state?: 'open' | 'done'
  onChange?: (state: string) => void
}
type SupportingValue = { id: string }
\`\`\`
\n## Declared defaults
- \`Task.state\`: \`'open'\`
`
  const { props, defaults } = extractApi(document)
  assert.equal(props.length, 4)
  assert.deepEqual(props[0], {
    owner: 'TaskProps',
    name: 'items',
    type: 'Array<{ label: string; disabled?: boolean }>',
    required: true,
    description: 'Items retain their own required label.',
  })
  assert.equal(props[1].defaultValue, "'open'")
  assert.equal(props[1].required, false)
  assert.equal(props[2].type, '(state: string) => void')
  assert.equal(props[3].owner, 'SupportingValue')
  assert.deepEqual(defaults, [{ component: 'Task', prop: 'state', value: "'open'" }])
  assert.ok(!props.some((prop) => prop.name === 'className'))
})

test('npm examples preserve literals and use actual subpaths with only their required peers', () => {
  const modules = new Map([
    ['moru-ui', { names: new Set(['Button']), peers: new Set() }],
    ['moru-ui/chart', { names: new Set(['Chart']), peers: new Set(['recharts']) }],
  ])
  const manifest = { name: 'moru-ui', peerDependencies: { recharts: '^3.10.1' } }
  const source = `
import { Button } from '@/components/ui/moru/button'
import { Chart } from '@/components/ui/moru/chart'
export function Example() {
  const path = '@/components/ui/moru/chart'
  return <><Button>{path}</Button><Chart /></>
}`
  const result = prepareNpmExample(source, modules, manifest)
  assert.match(result.example, /import \{ Chart \} from 'moru-ui\/chart'/)
  assert.match(result.example, /import \{ Button \} from 'moru-ui'/)
  assert.match(result.example, /const path = '@\/components\/ui\/moru\/chart'/)
  assert.equal(result.installCommand, 'npm install moru-ui "recharts@^3.10.1"')
  assert.throws(
    () =>
      prepareNpmExample(
        "import { Chart } from 'moru-ui'; export const Demo = Chart",
        modules,
        manifest,
      ),
    /Chart is not exported by moru-ui/,
  )
  assert.throws(() => prepareNpmExample('<Button />', modules, manifest), /complete React example/)
})

test('generated docs use canonical modal IDs, complete npm examples and inherited-only APIs', () => {
  const doc = (id) => JSON.parse(generated.artifacts.get(`public/docs/components/${id}.json`))
  assert.ok(generated.itemCount >= 79)
  assert.equal(doc('modal').id, 'modal')
  assert.ok(!generated.artifacts.has('public/docs/components/dialog.json'))
  for (const source of generated.artifacts.values()) {
    const data = JSON.parse(source)
    assert.equal(data.schemaVersion, 1)
    assert.ok(data.example.includes('export '), data.id)
    assert.ok(!data.example.includes("from '@/components/ui/moru/"), data.id)
    assert.ok(data.sourceUrl.startsWith('https://github.com/syrus-riius/moru-ui/blob/main/'))
    assert.ok(data.api.length > 0, data.id)
  }
  assert.deepEqual(doc('direction').props, [])
  assert.match(doc('direction').api, /BaseDirectionProvider\.Props/)
  assert.equal(doc('button').installCommand, 'npm install moru-ui')
  assert.match(doc('chart').installCommand, /recharts/)
  assert.match(doc('data-table').installCommand, /@tanstack\/react-table/)
  assert.match(doc('carousel').installCommand, /embla-carousel-react/)
  assert.match(doc('resizable').installCommand, /react-resizable-panels/)
  const rangeMode = doc('calendar').props.find(
    (prop) => prop.owner === 'CalendarRangeProps' && prop.name === 'mode',
  )
  assert.equal(rangeMode.required, true)
  assert.equal(rangeMode.type, "'range'")
})
