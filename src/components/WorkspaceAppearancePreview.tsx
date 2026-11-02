import type { CSSProperties } from 'react'
import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import { Avatar } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Separator } from './ui/separator'
import { Slider } from './ui/slider'
import { MoruMark } from './brand'
import './workspace-appearance-preview.css'

interface WorkspaceAppearancePreviewProps {
  gap: number
  onGapChange: (value: number) => void
  onOpenEditor: () => void
  onOpenGeneral: () => void
}

export function WorkspaceAppearancePreview({ gap, onGapChange, onOpenEditor, onOpenGeneral }: WorkspaceAppearancePreviewProps) {
  return <section className="workspace-appearance-preview" aria-labelledby="workspace-appearance-title">
    <div className="workspace-preview-section-heading">
      <h3 id="workspace-appearance-title">읽기 편한 간격 찾기</h3>
      <p>간격을 조절하고, 같은 내용의 인상이 어떻게 달라지는지 살펴보세요.</p>
    </div>
    <div className="workspace-appearance-control">
      <Slider label="콘텐츠 간격" value={gap} onValueChange={onGapChange} min={8} max={32} step={4} showValue />
      <div className="workspace-appearance-scale"><span>8px · 촘촘하게</span><span>32px · 여유롭게</span></div>
    </div>
    <Card className="workspace-appearance-sample" style={{ '--workspace-sample-gap': `${gap}px` } as CSSProperties} aria-label="콘텐츠 간격 미리보기">
      <header className="workspace-appearance-sample-heading">
        <Avatar alt="Moru Studio" fallback={<MoruMark width={20} height={20} />} />
        <div><strong>Moru Studio</strong><span>새로운 아이디어를 함께 다듬는 곳</span></div>
        <Badge variant="secondary" tone="success">진행 중</Badge>
      </header>
      <Separator />
      <div className="workspace-appearance-sample-copy"><h4>작은 아이디어의 다음 단계</h4><p>필요한 내용을 정리하고, 함께 만드는 사람들과 다음 작업을 시작해 보세요.</p></div>
      <div className="workspace-appearance-sample-meta"><Badge variant="outline">디자인</Badge><Badge variant="outline">프로젝트</Badge><span>{gap}px 간격</span></div>
      <Button variant="secondary" onClick={onOpenGeneral}>일반 설정으로 돌아가기<ArrowRight size={14} /></Button>
    </Card>
    <div className="workspace-appearance-editor">
      <p>색상·글꼴·밀도는 디자인 편집에서 함께 다듬을 수 있어요.</p>
      <Button variant="secondary" onClick={onOpenEditor}><SlidersHorizontal size={14} />디자인 토큰 편집</Button>
    </div>
  </section>
}
