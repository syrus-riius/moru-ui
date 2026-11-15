import { useState } from 'react'
import { Check, FolderOpen, Inbox, Search } from 'lucide-react'
import { useI18n } from '../../../../i18n'
import type { ComponentId } from '../../../catalog/component-catalog'
import { Alert } from '../../../ui/alert'
import { Badge } from '../../../ui/badge'
import { Button } from '../../../ui/button'
import { Card } from '../../../ui/card'
import { Empty } from '../../../ui/empty'
import { LoadingOverlay } from '../../../ui/loading-overlay'
import { Marker, MarkerContent, MarkerIcon } from '../../../ui/marker'
import { Progress } from '../../../ui/progress'
import { RingProgress } from '../../../ui/ring-progress'
import { Skeleton } from '../../../ui/skeleton'
import { Spinner } from '../../../ui/spinner'
import { StatusIndicator } from '../../../ui/status-indicator'
import { ToastProvider, useToast } from '../../../ui/toast'
import { VariationExample, VariationGroup, sizes } from '../VariationLayout'

const tones = ['info', 'success', 'warning', 'danger'] as const
const toneLabels = { info: '안내', success: '완료', warning: '주의', danger: '오류' } as const

export function FeedbackVariations({ id }: { id: ComponentId }) {
  const { t } = useI18n()
  switch (id) {
    case 'badge':
      return (
        <>
          <VariationGroup title="베리에이션">
            {(['primary', 'secondary', 'outline'] as const).map((variant) => (
              <VariationExample key={variant} label={variant} code={`variant="${variant}"`}>
                <Badge variant={variant}>{t('프로젝트')}</Badge>
              </VariationExample>
            ))}
          </VariationGroup>
          <VariationGroup title="상태 비교">
            {tones.map((tone) => (
              <VariationExample key={tone} label={toneLabels[tone]} code={`tone="${tone}"`}>
                <Badge tone={tone}>{t(toneLabels[tone])}</Badge>
              </VariationExample>
            ))}
          </VariationGroup>
        </>
      )
    case 'alert':
      return (
        <VariationGroup title="상태 비교" wide>
          {tones.map((tone) => (
            <VariationExample
              key={tone}
              label={toneLabels[tone]}
              code={`tone="${tone}" role="region"`}
            >
              <Alert tone={tone} title={t(toneLabels[tone])} role="region">
                {t('프로젝트 설정을 확인하세요.')}
              </Alert>
            </VariationExample>
          ))}
          <VariationExample label="제목만" code={'title="…" role="region"'}>
            <Alert title={t('업데이트')} role="region" />
          </VariationExample>
          <VariationExample label="아이콘 없음" code={'icon={null} role="region"'}>
            <Alert title={t('안내')} role="region" icon={null}>
              {t('나중에 언제든 변경할 수 있어요.')}
            </Alert>
          </VariationExample>
        </VariationGroup>
      )
    case 'progress':
      return (
        <>
          <VariationGroup title="크기 비교">
            {sizes.map((size) => (
              <VariationExample
                key={size}
                label={size.toUpperCase()}
                code={`size="${size}" value={64} showValue`}
              >
                <Progress size={size} value={64} showValue label={t('진행률')} />
              </VariationExample>
            ))}
          </VariationGroup>
          <VariationGroup title="상태 비교" wide>
            <VariationExample label="진행 중" code="value={40} bufferValue={75}">
              <Progress value={40} bufferValue={75} label={t('업로드')} showValue />
            </VariationExample>
            <VariationExample label="로딩" code="value={null}">
              <Progress value={null} label={t('불러오는 중')} />
            </VariationExample>
            <VariationExample label="완료" code={'value={100} tone="success"'}>
              <Progress value={100} tone="success" label={t('완료')} showValue />
            </VariationExample>
            <VariationExample label="오류" code={'value={40} tone="danger"'}>
              <Progress value={40} tone="danger" label={t('오류')} showValue />
            </VariationExample>
            <VariationExample label="애니메이션" code="value={64} striped animated">
              <Progress value={64} striped animated label={t('진행 중')} showValue />
            </VariationExample>
            <VariationExample label="일시정지" code="value={64} striped animated paused">
              <Progress value={64} striped animated paused label={t('일시정지')} showValue />
            </VariationExample>
          </VariationGroup>
        </>
      )
    case 'ring-progress':
      return (
        <>
          <VariationGroup title="크기 비교">
            {[96, 144, 192].map((size) => (
              <VariationExample
                key={size}
                label={`${size}px`}
                code={`size={${size}} value={64} showLegend={false}`}
              >
                <RingProgress label={t('진행률')} size={size} value={64} showLegend={false} />
              </VariationExample>
            ))}
          </VariationGroup>
          <VariationGroup title="베리에이션" wide>
            <VariationExample label="다중 선택" code="sections={[{ label, value, tone }, …]}">
              <RingProgress
                label={t('프로젝트')}
                sections={[
                  { label: t('완료'), value: 45, tone: 'success' },
                  { label: t('진행 중'), value: 30, tone: 'info' },
                  { label: t('대기'), value: 15, tone: 'warning' },
                ]}
              />
            </VariationExample>
            <VariationExample label="완료" code="value={100} thickness={16} roundCaps">
              <RingProgress
                label={t('완료')}
                value={100}
                thickness={16}
                roundCaps
                centerLabel={<Check size={32} aria-hidden="true" />}
              />
            </VariationExample>
            <VariationExample label="빈 상태" code="sections={[]}">
              <RingProgress label={t('프로젝트')} sections={[]} />
            </VariationExample>
          </VariationGroup>
        </>
      )
    case 'skeleton':
      return (
        <VariationGroup title="베리에이션">
          {(['pulse', 'shimmer', 'none'] as const).map((animation) => (
            <VariationExample key={animation} label={animation} code={`animation="${animation}"`}>
              <SkeletonContent animation={animation} />
            </VariationExample>
          ))}
          <VariationExample label="일시정지" code={'animation="shimmer" paused'}>
            <SkeletonContent animation="shimmer" paused />
          </VariationExample>
        </VariationGroup>
      )
    case 'toast':
      return (
        <ToastProvider>
          <VariationGroup title="상태 비교" wide>
            {tones.map((tone) => (
              <VariationExample
                key={tone}
                label={toneLabels[tone]}
                code={`toast({ title, tone: "${tone}" })`}
              >
                <ToastTrigger tone={tone} />
              </VariationExample>
            ))}
            <VariationExample label="실행 취소" code="toast({ title, action: { label, onClick } })">
              <ToastTrigger tone="success" actionable />
            </VariationExample>
            <VariationExample label="직접 닫기" code="toast({ title, duration: 0 })">
              <ToastTrigger tone="info" persistent />
            </VariationExample>
          </VariationGroup>
        </ToastProvider>
      )
    case 'empty':
      return (
        <VariationGroup title="베리에이션" wide>
          <VariationExample label="기본" code="<Empty title={title} />">
            <Empty title={t('항목이 없어요.')} />
          </VariationExample>
          <VariationExample
            label="검색 결과 없음"
            code="<Empty title={title} description={description} icon={<Search />} />"
          >
            <Empty
              title={t('검색 결과가 없어요.')}
              description={t('다른 검색어로 다시 시도해 보세요.')}
              icon={<Search size={24} />}
            />
          </VariationExample>
          <VariationExample
            label="액션"
            code="<Empty …><Button onClick={create}>…</Button></Empty>"
          >
            <EmptyAction />
          </VariationExample>
        </VariationGroup>
      )
    case 'spinner':
      return (
        <>
          <VariationGroup title="크기 비교">
            {sizes.map((size) => (
              <VariationExample
                key={size}
                label={size.toUpperCase()}
                code={`size="${size}" decorative`}
              >
                <Spinner size={size} decorative />
              </VariationExample>
            ))}
          </VariationGroup>
          <VariationGroup title="베리에이션">
            {(['ring', 'dots', 'bars'] as const).map((variant) => (
              <VariationExample
                key={variant}
                label={variant}
                code={`variant="${variant}" decorative`}
              >
                <Spinner variant={variant} decorative />
              </VariationExample>
            ))}
          </VariationGroup>
          <VariationGroup title="상태 비교">
            <VariationExample label="일시정지" code="paused decorative">
              <Spinner paused decorative />
            </VariationExample>
            <VariationExample label="버튼 조합" code="<Button loading>…</Button>">
              <Button loading>{t('저장 중')}</Button>
            </VariationExample>
          </VariationGroup>
        </>
      )
    case 'loading-overlay':
      return (
        <VariationGroup title="베리에이션" wide>
          {(['ring', 'dots', 'bars'] as const).map((variant) => (
            <VariationExample
              key={variant}
              label={variant}
              code={`loading={loading} spinnerVariant="${variant}"`}
            >
              <LoadingExample variant={variant} />
            </VariationExample>
          ))}
          <VariationExample label="일시정지" code="loading={loading} paused">
            <LoadingExample variant="ring" paused />
          </VariationExample>
        </VariationGroup>
      )
    case 'status-indicator':
      return (
        <>
          <VariationGroup title="크기 비교">
            {sizes.map((size) => (
              <VariationExample
                key={size}
                label={size.toUpperCase()}
                code={`size="${size}" tone="success"`}
              >
                <StatusIndicator size={size} tone="success" label={t('연결됨')} />
              </VariationExample>
            ))}
          </VariationGroup>
          <VariationGroup title="상태 비교">
            {(['neutral', ...tones] as const).map((tone) => (
              <VariationExample
                key={tone}
                label={tone === 'neutral' ? '대기' : toneLabels[tone]}
                code={`tone="${tone}"`}
              >
                <StatusIndicator
                  tone={tone}
                  label={t(tone === 'neutral' ? '대기' : toneLabels[tone])}
                />
              </VariationExample>
            ))}
          </VariationGroup>
          <VariationGroup title="베리에이션">
            <VariationExample label="애니메이션" code="pulse">
              <StatusIndicator tone="info" pulse label={t('연결 중')} />
            </VariationExample>
            <VariationExample label="일시정지" code="pulse paused">
              <StatusIndicator tone="info" pulse paused label={t('일시정지')} />
            </VariationExample>
          </VariationGroup>
        </>
      )
    case 'marker':
      return (
        <>
          <VariationGroup title="베리에이션" wide>
            {(['default', 'border', 'separator'] as const).map((variant) => (
              <VariationExample key={variant} label={variant} code={`variant="${variant}"`}>
                <Marker variant={variant}>
                  <MarkerContent>{t('새 메시지')}</MarkerContent>
                </Marker>
              </VariationExample>
            ))}
          </VariationGroup>
          <VariationGroup title="상태 비교" wide>
            {tones.map((tone) => (
              <VariationExample key={tone} label={toneLabels[tone]} code={`tone="${tone}"`}>
                <Marker tone={tone}>
                  <MarkerIcon>
                    <Inbox size={16} />
                  </MarkerIcon>
                  <MarkerContent>{t(toneLabels[tone])}</MarkerContent>
                </Marker>
              </VariationExample>
            ))}
          </VariationGroup>
        </>
      )
    default:
      return null
  }
}

function SkeletonContent({
  animation,
  paused = false,
}: {
  animation: 'pulse' | 'shimmer' | 'none'
  paused?: boolean
}) {
  return (
    <div style={{ display: 'grid', gap: 'var(--ui-control-gap)' }}>
      <Skeleton
        animation={animation}
        paused={paused}
        style={{ height: 40, width: 40, borderRadius: '50%' }}
      />
      <Skeleton animation={animation} paused={paused} style={{ height: 16, width: '70%' }} />
      <Skeleton animation={animation} paused={paused} style={{ height: 16 }} />
    </div>
  )
}

function ToastTrigger({
  tone,
  actionable = false,
  persistent = false,
}: {
  tone: (typeof tones)[number]
  actionable?: boolean
  persistent?: boolean
}) {
  const { t } = useI18n()
  const { toast } = useToast()
  const [undone, setUndone] = useState(false)
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
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

function EmptyAction() {
  const { t } = useI18n()
  const [created, setCreated] = useState(false)
  return created ? (
    <>
      <Card>{t('새로운 프로젝트')}</Card>
      <Button variant="ghost" size="sm" onClick={() => setCreated(false)}>
        {t('초기화')}
      </Button>
    </>
  ) : (
    <Empty
      title={t('프로젝트가 없어요.')}
      description={t('첫 번째 프로젝트를 만들어 보세요.')}
      icon={<FolderOpen size={24} />}
    >
      <Button size="sm" onClick={() => setCreated(true)}>
        {t('새 프로젝트')}
      </Button>
    </Empty>
  )
}

function LoadingExample({
  variant,
  paused = false,
}: {
  variant: 'ring' | 'dots' | 'bars'
  paused?: boolean
}) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  return (
    <>
      <LoadingOverlay
        loading={loading}
        spinnerVariant={variant}
        paused={paused}
        label={t('불러오는 중')}
        description={t('잠시만 기다려 주세요.')}
      >
        <Card
          style={{
            minHeight: 160,
            display: 'grid',
            alignContent: 'center',
            gap: 'calc(var(--ui-control-gap) * 2)',
          }}
        >
          <strong>{t('프로젝트 설정')}</strong>
          <Button variant="secondary" onClick={() => setLoading(true)}>
            {t('새로고침')}
          </Button>
        </Card>
      </LoadingOverlay>
      <Button variant="ghost" size="sm" aria-pressed={loading} onClick={() => setLoading(!loading)}>
        {t(loading ? '완료' : '로딩 시작')}
      </Button>
    </>
  )
}
