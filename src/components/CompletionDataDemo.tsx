import { useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Badge } from './ui/badge'
import { Carousel } from './ui/carousel'
import { DataTable, type DataTableFeatures } from './ui/data-table'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable'
import { ScrollArea } from './ui/scroll-area'
import { ToggleGroup } from './ui/toggle-group'
import { Typography } from './ui/typography'
import { ChartVariationsDemo } from './ChartVariationsDemo'
import type { DataComponentId } from './completion-data-catalog'
import './completion-demo.css'

interface Project { id: string; name: string; progress: number; status: string }
const projects: Project[] = [
  { id: 'tokens', name: '디자인 토큰', progress: 100, status: '완료' },
  { id: 'library', name: 'UI 라이브러리', progress: 80, status: '진행 중' },
  { id: 'brand', name: '브랜드 가이드', progress: 65, status: '검토 중' },
  { id: 'docs', name: '시작 가이드', progress: 45, status: '진행 중' },
  { id: 'patterns', name: '제품 패턴', progress: 20, status: '준비 중' },
  { id: 'release', name: '첫 번째 릴리스', progress: 10, status: '준비 중' },
]
const helper = createColumnHelper<DataTableFeatures, Project>()
const columns = helper.columns([
  helper.accessor('name', { header: '프로젝트', sortFn: 'text' }),
  helper.accessor('progress', { header: '진행률', sortFn: 'basic', cell: ({ getValue }) => `${getValue()}%` }),
  helper.accessor('status', { header: '상태', cell: ({ getValue }) => <Badge variant="secondary">{getValue()}</Badge> }),
])

export function CompletionDataDemo({ id, disabled, size }: { id: DataComponentId; disabled: boolean; size: 'sm' | 'md' | 'lg' }) {
  const [selected, setSelected] = useState<string[]>([])
  const [orientation, setOrientation] = useState(['horizontal'])
  const [role, setRole] = useState(['heading'])
  switch (id) {
    case 'carousel': return <Carousel aria-label="Moru의 세 가지 원칙" disabled={disabled} items={[
      { id: 'solid', content: <div className="completion-demo-slide"><span>01 / FOUNDATION</span><strong>기본은 단단하게.</strong><p>일관된 규칙이 작업을 받쳐 줍니다.</p></div> },
      { id: 'yours', content: <div className="completion-demo-slide"><span>02 / FREEDOM</span><strong>선택은 자유롭게.</strong><p>필요한 부분을 직접 다듬으세요.</p></div> },
      { id: 'lasting', content: <div className="completion-demo-slide"><span>03 / LONGEVITY</span><strong>오래 쓰도록.</strong><p>변화에 맞춰 함께 자라나는 UI.</p></div> },
    ]} />
    case 'chart': return <ChartVariationsDemo disabled={disabled} />
    case 'data-table': return <div className="completion-demo-stack"><DataTable data={projects} columns={columns} getRowId={(row) => row.id} caption="Moru 프로젝트" pageSize={3} disabled={disabled} onSelectionChange={setSelected} /><p className="completion-demo-caption">선택한 프로젝트 · {selected.length ? selected.map((value) => projects.find((project) => project.id === value)?.name).join(', ') : '아직 없어요'}</p></div>
    case 'resizable': return <div className="completion-demo-stack"><ToggleGroup size={size} disabled={disabled} aria-label="패널 배치" value={orientation} onValueChange={setOrientation} preventEmpty items={[{ value: 'horizontal', label: '가로' }, { value: 'vertical', label: '세로' }]} /><div className="completion-demo-panels"><ResizablePanelGroup key={orientation[0]} orientation={orientation[0] as 'horizontal' | 'vertical'} disabled={disabled}><ResizablePanel defaultSize="40%" minSize="20%"><div className="completion-demo-pane">탐색</div></ResizablePanel><ResizableHandle disabled={disabled} /><ResizablePanel minSize="20%"><div className="completion-demo-pane">작업 공간</div></ResizablePanel></ResizablePanelGroup></div><p className="completion-demo-caption">손잡이를 끌거나 Tab으로 이동해 방향키로 조절하세요.</p></div>
    case 'scroll-area': return <ScrollArea aria-label="프로젝트 활동 기록" style={{ height: 220 }}><ol className="completion-demo-activity">{Array.from({ length: 12 }, (_, index) => <li key={index}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{['디자인 토큰을 다듬었어요.', '새 컴포넌트를 만들었어요.', '사용 가이드를 정리했어요.'][index % 3]}</strong><p>팀의 작은 변화가 이곳에 쌓입니다.</p></div></li>)}</ol></ScrollArea>
    case 'typography': return <div className="completion-demo-stack"><ToggleGroup size={size} disabled={disabled} value={role} onValueChange={setRole} preventEmpty aria-label="타이포그래피 역할" items={[{ value: 'heading', label: '제목' }, { value: 'body', label: '본문' }, { value: 'caption', label: '설명' }]} /><Typography variant={role[0] as 'heading' | 'body' | 'caption'} as="p">단단한 기본, 당신만의 UI.</Typography><Typography variant="code">Moru UI / 66 components</Typography></div>
  }
}
