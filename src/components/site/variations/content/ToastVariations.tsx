import { useState } from 'react'
import { Layers, List, Plus, RotateCcw, X } from 'lucide-react'
import { useI18n } from '../../../../i18n'
import { Button } from '../../../ui/button'
import { ToastProvider, useToast } from '../../../ui/toast'
import { VariationExample, VariationGroup } from '../VariationLayout'
import './toast-variations.css'

const tones = ['info', 'success', 'warning', 'danger'] as const
const toneLabels = { info: '안내', success: '완료', warning: '주의', danger: '오류' } as const
type ToastLayout = 'list' | 'stack'

/** A single provider lets both layouts share dismissal and keyboard navigation. */
export function ToastVariations() {
  const [layout, setLayout] = useState<ToastLayout>('stack')
  return (
    <ToastProvider layout={layout} limit={3}>
      <ToastExamples layout={layout} onLayoutChange={setLayout} />
    </ToastProvider>
  )
}

function ToastExamples({
  layout,
  onLayoutChange,
}: {
  layout: ToastLayout
  onLayoutChange: (layout: ToastLayout) => void
}) {
  const { t } = useI18n()
  const { toast, dismiss } = useToast()
  const [feedback, setFeedback] = useState('')

  function prepareLayout(next: ToastLayout, replace = false) {
    if (layout !== next || replace) dismiss()
    onLayoutChange(next)
    setFeedback('')
  }

  function showThree(next: ToastLayout) {
    prepareLayout(next, true)
    for (const title of ['파일 업로드 완료', '디자인 토큰 적용 완료', '변경 사항을 저장했어요.']) {
      toast({
        title: t(title),
        description: t('이 알림은 미리보기입니다.'),
        tone: 'success',
        duration: 0,
      })
    }
  }

  return (
    <>
      <VariationGroup
        title="베리에이션"
        description="알림은 화면 오른쪽 아래에 나타납니다. 실제 알림을 띄워 배치와 동작을 비교하세요."
        wide
      >
        <VariationExample
          label="스택형 알림"
          code={'<ToastProvider layout="stack" limit={3}>…</ToastProvider>'}
          wide
        >
          <div className="moru-toast-demo">
            {/* Remove this notice once the npm package includes the stack layout. */}
            <p className="moru-toast-demo-note">
              {t(
                '스택형 알림은 현재 Lab·레지스트리에서 제공하며 npm 0.5.0-beta.3에는 아직 포함되지 않습니다.',
              )}
            </p>
            <p>
              {t('여러 알림을 포개어 표시합니다. 포인터를 올리거나 F6 키로 이동하면 펼쳐집니다.')}
            </p>
            <p className="moru-toast-demo-note">
              {t(
                'F6로 알림 영역에 들어가고 Tab으로 이동합니다. 영역에서 Shift+Tab을 누르면 이전 위치로 돌아갑니다. 터치 화면에서는 알림을 펼쳐 표시합니다.',
              )}
            </p>
            <div className="moru-toast-demo-actions">
              <Button
                onClick={() => {
                  prepareLayout('stack')
                  toast({
                    title: t('변경 사항을 저장했어요.'),
                    description: t('이 알림은 미리보기입니다.'),
                    tone: 'success',
                  })
                }}
              >
                <Plus size={16} aria-hidden="true" />
                {t('한 개 추가')}
              </Button>
              <Button variant="secondary" onClick={() => showThree('stack')}>
                <Layers size={16} aria-hidden="true" />
                {t('3개 쌓기')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  prepareLayout('stack')
                  toast({
                    title: t('팀의 모든 프로젝트에 새로운 디자인 설정을 적용했어요.'),
                    description: t(
                      '색상과 글꼴, 간격, 모서리 설정이 함께 반영되었습니다. 긴 설명과 여러 줄 제목이 작은 화면에서도 어떻게 표시되는지 확인하는 미리보기입니다.',
                    ),
                    tone: 'success',
                    duration: 0,
                  })
                }}
              >
                {t('긴 알림')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  prepareLayout('stack')
                  toast({
                    title: t('작업을 보관했어요.'),
                    description: t(
                      '실행 취소를 눌러 되돌릴 수 있어요. 이 예제 안에서만 동작합니다.',
                    ),
                    tone: 'success',
                    duration: 0,
                    action: {
                      label: t('실행 취소'),
                      onClick: () => setFeedback(t('보관을 취소했어요.')),
                    },
                  })
                }}
              >
                <RotateCcw size={16} aria-hidden="true" />
                {t('실행 취소 알림')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  dismiss()
                  setFeedback(t('모든 알림을 닫았어요.'))
                }}
              >
                <X size={16} aria-hidden="true" />
                {t('모두 닫기')}
              </Button>
            </div>
            <p className="moru-toast-demo-note">
              {t('‘3개 쌓기’와 긴 알림은 직접 닫을 때까지 유지됩니다.')}
            </p>
            <p className="moru-toast-demo-status" role="status">
              {feedback}
            </p>
          </div>
        </VariationExample>
        <VariationExample
          label="목록형 알림"
          code={'<ToastProvider layout="list">…</ToastProvider>'}
          wide
        >
          <div className="moru-toast-demo">
            <p>{t('알림을 겹치지 않고 세로로 표시합니다. 기존 기본 배치입니다.')}</p>
            <div className="moru-toast-demo-actions">
              <Button variant="secondary" onClick={() => showThree('list')}>
                <List size={16} aria-hidden="true" />
                {t('목록으로 3개 보기')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  dismiss()
                  setFeedback(t('모든 알림을 닫았어요.'))
                }}
              >
                {t('모두 닫기')}
              </Button>
            </div>
          </div>
        </VariationExample>
      </VariationGroup>
      <VariationGroup title="상태 비교" wide>
        {tones.map((tone) => (
          <VariationExample
            key={tone}
            label={toneLabels[tone]}
            code={`toast({ title, tone: "${tone}" })`}
          >
            <ToastTrigger tone={tone} onBeforeShow={() => prepareLayout('list')} />
          </VariationExample>
        ))}
        <VariationExample label="실행 취소" code="toast({ title, action: { label, onClick } })">
          <ToastTrigger tone="success" actionable onBeforeShow={() => prepareLayout('list')} />
        </VariationExample>
        <VariationExample label="직접 닫기" code="toast({ title, duration: 0 })">
          <ToastTrigger tone="info" persistent onBeforeShow={() => prepareLayout('list')} />
        </VariationExample>
      </VariationGroup>
    </>
  )
}

function ToastTrigger({
  tone,
  actionable = false,
  persistent = false,
  onBeforeShow,
}: {
  tone: (typeof tones)[number]
  actionable?: boolean
  persistent?: boolean
  onBeforeShow: () => void
}) {
  const { t } = useI18n()
  const { toast } = useToast()
  const [undone, setUndone] = useState(false)
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          onBeforeShow()
          setUndone(false)
          toast({
            title: t(toneLabels[tone]),
            description: t('프로젝트 설정을 확인하세요.'),
            tone,
            duration: persistent ? 0 : 5000,
            action: actionable
              ? { label: t('실행 취소'), onClick: () => setUndone(true) }
              : undefined,
          })
        }}
      >
        {t('알림 표시')}
      </Button>
      {undone ? <span role="status">{t('실행 취소')}</span> : null}
    </>
  )
}
