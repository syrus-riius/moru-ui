import { ArrowRight, FolderKanban, KeyRound, Search, Settings2, ShieldCheck } from 'lucide-react'
import { BLOCKS, type BlockId } from '../blocks/block-metadata'
import { Button } from '../ui/button'
import './examples-hub-launcher.css'

const icons = { login: KeyRound, otp: ShieldCheck, 'search-filters': Search, settings: Settings2 }
export function ExamplesHub({ onWorkspace, onBlocks }: { onWorkspace: () => void; onBlocks?: (id?: BlockId) => void }) {
  return <div className="examples-launcher">
    <header className="catalog-intro"><span className="eyebrow">MORU UI / EXAMPLES</span><h1>예제 허브</h1><p>자주 쓰는 조합에서 하나의 제품 흐름까지. 내 아이디어에 맞는 시작점을 골라보세요.</p><div className="catalog-meta"><span>4 BLOCKS / 6 WORKSPACE FLOWS</span><span>미리보기 · 코드 · 시뮬레이터</span></div></header>
    <section className="examples-featured" aria-labelledby="example-workspace-title">
      <div className="examples-featured-copy"><span className="eyebrow">FEATURED / WORKSPACE</span><span className="examples-featured-icon" aria-hidden="true"><FolderKanban size={24} /></span><h2 id="example-workspace-title">작은 팀의 하루를, 하나의 흐름으로.</h2><p>프로젝트를 시작하고, 일정을 계획하고, 대화와 릴리스를 이어가세요. 여섯 화면의 데이터가 함께 움직입니다.</p><div className="examples-flow-tags"><span>프로젝트 시작</span><span>운영</span><span>일정</span><span>대화</span><span>릴리스</span><span>설정</span></div><Button onClick={onWorkspace}>작업 공간 예제 실행 <ArrowRight size={15} aria-hidden="true" /></Button></div>
      <div className="examples-workspace-sketch" aria-hidden="true"><div className="examples-sketch-nav"><strong>Moru Studio</strong><span className="is-current">프로젝트</span><span>일정 계획</span><span>팀 대화</span><span>릴리스 준비</span></div><div className="examples-sketch-main"><span>GOOD MORNING / MORU</span><strong>함께, 다음 단계로.</strong><div className="examples-sketch-stats"><div><small>진행 중</small><b>12</b></div><div><small>완료한 작업</small><b>48</b></div></div><div className="examples-sketch-task"><i /><div>브랜드 가이드 정리<small>오늘 · 디자인</small></div><span>진행 중</span></div><div className="examples-sketch-task"><i /><div>새로운 아이디어<small>내일 · 제품</small></div><span>계획</span></div></div></div>
    </section>
    <section aria-labelledby="examples-blocks-title" className="examples-blocks-section"><div className="examples-launcher-section-heading"><div><span className="eyebrow">START WITH A PATTERN</span><h2 id="examples-blocks-title">필요한 조합부터 시작하세요.</h2><p>동작하는 Moru 블록을 살펴보고 코드나 편집 가능한 화면으로 가져가세요.</p></div>{onBlocks ? <Button variant="secondary" onClick={() => onBlocks()}>블록·패턴 전체 보기 <ArrowRight size={14} aria-hidden="true" /></Button> : null}</div><div className="examples-block-links">{BLOCKS.map((block) => { const Icon = icons[block.id]; return <button type="button" key={block.id} onClick={() => onBlocks?.(block.id)} disabled={!onBlocks} aria-label={`${block.title} 블록 살펴보기`}><span className="examples-block-link-top"><Icon size={20} aria-hidden="true" /><span>{block.category}</span></span><strong>{block.title}</strong><p>{block.description}</p><span className="examples-block-link-bottom">{block.components.slice(0, 2).join(' + ')}<ArrowRight size={15} aria-hidden="true" /></span></button> })}</div></section>
  </div>
}
