import { createRoot } from 'react-dom/client'
import { MoruProvider } from 'moru-ui'
import * as Charts from 'moru-ui/chart'
import * as Tables from 'moru-ui/data-table'
import * as Carousels from 'moru-ui/carousel'
import * as Panels from 'moru-ui/resizable'
import * as Dashboards from 'moru-ui/dashboard'
import 'moru-ui/styles.css'

const columns: Tables.DataTableColumn<{ id: string; name: string }>[] = [
  { accessorKey: 'name', header: 'Name' },
]

createRoot(document.getElementById('root')!).render(
  <MoruProvider locale="en">
    <p>{[Charts, Tables, Carousels, Panels, Dashboards].flatMap(Object.keys).join(', ')}</p>
    <Charts.Chart
      title="Activity"
      xKey="day"
      data={[{ day: 'Mon', total: 3 }]}
      config={{ total: { label: 'Total', color: '#345678' } }}
    />
    <Tables.DataTable
      caption="Projects"
      data={[{ id: '1', name: 'Moru' }]}
      columns={columns}
      getRowId={(row) => row.id}
    />
    <Carousels.Carousel
      aria-label="Examples"
      items={[
        { id: '1', content: 'First' },
        { id: '2', content: 'Second' },
      ]}
    />
    <Panels.ResizablePanelGroup>
      <Panels.ResizablePanel>One</Panels.ResizablePanel>
      <Panels.ResizableHandle />
      <Panels.ResizablePanel>Two</Panels.ResizablePanel>
    </Panels.ResizablePanelGroup>
    <Dashboards.DashboardBlock />
  </MoruProvider>,
)
