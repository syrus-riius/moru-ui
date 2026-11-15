import { useEffect, useState, type ReactNode } from 'react'
import { Check, Pause, Play, RotateCcw, Save } from 'lucide-react'
import { useI18n } from '../i18n'
import { Button } from './ui/button'
import { Field } from './ui/field'
import { Input } from './ui/input'
import { LoadingOverlay } from './ui/loading-overlay'
import { Progress } from './ui/progress'
import { Skeleton } from './ui/skeleton'
import { Spinner } from './ui/spinner'
import { StatusIndicator } from './ui/status-indicator'
import './motion-feedback-demo.css'

type DemoProps = { disabled: boolean; size: 'sm' | 'md' | 'lg' }

function MotionExample({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="motion-demo-example">
      <p className="motion-demo-title">{title}</p>
      {children}
    </div>
  )
}

function MotionToggle({
  paused,
  onChange,
  disabled,
}: {
  paused: boolean
  onChange: (value: boolean) => void
  disabled: boolean
}) {
  const { t } = useI18n()
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={disabled}
      onClick={() => onChange(!paused)}
      aria-pressed={paused}
    >
      {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
      {paused ? t('모션 재개') : t('모션 일시정지')}
    </Button>
  )
}

export function ProgressVariationsDemo({
  progress,
  onProgressChange,
  disabled,
  size,
}: DemoProps & { progress: number; onProgressChange: (value: number) => void }) {
  const { t } = useI18n()
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const active = running && progress < 100 && !disabled && !paused
  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => {
      if (!document.hidden) onProgressChange(Math.min(100, progress + 5))
    }, 400)
    return () => window.clearInterval(timer)
  }, [active, progress, onProgressChange])
  return (
    <div className="motion-demo">
      <p className="motion-demo-description">
        {t('완료한 양, 미리 받은 양, 아직 알 수 없는 작업을 구분해 표시해요.')}
      </p>
      <div className="motion-demo-grid">
        <MotionExample title={t('기본 진행률')}>
          <Progress value={progress} label={t('파일 업로드')} showValue size={size} />
        </MotionExample>
        <MotionExample title={t('버퍼 진행률')}>
          <Progress
            value={progress}
            bufferValue={Math.min(100, progress + 24)}
            label={t('동영상 처리')}
            showValue
            size={size}
          />
          <p className="motion-demo-caption">
            {t('옅은 영역은 미리 받은 양이며 완료율에 포함하지 않아요.')}
          </p>
        </MotionExample>
        <MotionExample title={t('움직이는 스트라이프')}>
          <Progress
            value={progress}
            label={t('데이터 가져오기')}
            showValue
            size={size}
            striped
            animated
            paused={paused || disabled}
          />
        </MotionExample>
        <MotionExample title={t('완료 시점 미정')}>
          <Progress
            value={null}
            label={t('서버 응답 대기')}
            showValue
            size={size}
            paused={paused || disabled}
          />
        </MotionExample>
        <MotionExample title={t('완료 상태')}>
          <Progress value={100} label={t('업로드 완료')} showValue size={size} tone="success" />
        </MotionExample>
        <MotionExample title={t('오류 상태')}>
          <Progress
            value={36}
            label={t('연결 끊김 · 다시 시도 필요')}
            showValue
            size={size}
            tone="danger"
          />
        </MotionExample>
      </div>
      <div className="motion-demo-actions">
        <Button
          size="sm"
          disabled={disabled}
          onClick={() => {
            if (progress >= 100) onProgressChange(0)
            setRunning(!active)
            setPaused(false)
          }}
        >
          {active ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          {active ? t('진행 일시정지') : t('진행 데모 시작')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => {
            setRunning(false)
            onProgressChange(0)
          }}
        >
          <RotateCcw aria-hidden="true" />
          {t('초기화')}
        </Button>
        <MotionToggle paused={paused} onChange={setPaused} disabled={disabled} />
      </div>
      <p className="motion-demo-caption" role="status">
        {progress >= 100
          ? t('데모 작업을 완료했어요.')
          : active
            ? t('예제 진행률을 재생하고 있어요.')
            : t('실제 네트워크 작업 없이 진행 과정을 비교하는 데모입니다.')}
      </p>
    </div>
  )
}

export function SpinnerVariationsDemo({ disabled, size }: DemoProps) {
  const { t } = useI18n()
  const [paused, setPaused] = useState(false)
  return (
    <div className="motion-demo">
      <p className="motion-demo-description">
        {t('소요 시간을 알 수 없는 짧은 대기에 사용해요. 상태 문구와 함께 배치하세요.')}
      </p>
      <div className="motion-demo-grid motion-demo-grid--three">
        {(['ring', 'dots', 'bars'] as const).map((variant) => (
          <MotionExample
            key={variant}
            title={
              variant === 'ring' ? t('회전 링') : variant === 'dots' ? t('점 로더') : t('막대 로더')
            }
          >
            <div className="motion-demo-loader">
              <Spinner variant={variant} size={size} paused={paused || disabled} decorative />
              <span>{t('불러오는 중')}</span>
            </div>
          </MotionExample>
        ))}
      </div>
      <div className="motion-demo-actions">
        {(['sm', 'md', 'lg'] as const).map((s) => (
          <span className="motion-demo-size" key={s}>
            <Spinner size={s} paused={paused || disabled} decorative />
            {s.toUpperCase()}
          </span>
        ))}
        <MotionToggle paused={paused} onChange={setPaused} disabled={disabled} />
      </div>
      <p className="motion-demo-caption">
        {t('움직임 줄이기 설정에서는 회전과 반복 모션을 멈추고 상태를 유지해요.')}
      </p>
    </div>
  )
}

export function SkeletonVariationsDemo({
  disabled,
  loading,
  onLoadingChange,
}: DemoProps & { loading: boolean; onLoadingChange: (value: boolean) => void }) {
  const { t } = useI18n()
  const [paused, setPaused] = useState(false)
  return (
    <div className="motion-demo">
      <p className="motion-demo-description">
        {t('콘텐츠가 들어올 자리를 먼저 확보해 화면이 갑자기 밀리지 않게 해요.')}
      </p>
      <div className="motion-demo-grid motion-demo-grid--three">
        {(['pulse', 'shimmer', 'none'] as const).map((animation) => (
          <MotionExample
            key={animation}
            title={
              animation === 'pulse'
                ? t('펄스')
                : animation === 'shimmer'
                  ? t('쉬머')
                  : t('정적 윤곽')
            }
          >
            <div className="motion-demo-skeleton" aria-busy={loading}>
              {loading ? (
                <>
                  <Skeleton
                    className="motion-demo-avatar"
                    animation={animation}
                    paused={paused || disabled}
                  />
                  <div className="motion-demo-lines">
                    <Skeleton animation={animation} paused={paused || disabled} />
                    <Skeleton animation={animation} paused={paused || disabled} />
                    <Skeleton animation={animation} paused={paused || disabled} />
                  </div>
                </>
              ) : (
                <>
                  <span
                    className="motion-demo-avatar motion-demo-avatar--loaded"
                    aria-hidden="true"
                  >
                    M
                  </span>
                  <div className="motion-demo-lines">
                    <strong>{t('Moru 프로젝트')}</strong>
                    <span>{t('팀과 함께 만드는 디자인 시스템')}</span>
                  </div>
                </>
              )}
            </div>
          </MotionExample>
        ))}
      </div>
      <div className="motion-demo-actions">
        <Button
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={() => onLoadingChange(!loading)}
        >
          {loading ? t('완료 모습 보기') : t('로딩 모습 보기')}
        </Button>
        <MotionToggle paused={paused} onChange={setPaused} disabled={disabled} />
      </div>
      <p className="motion-demo-caption" role="status">
        {loading ? t('콘텐츠 자리 표시 중') : t('프로젝트를 불러왔어요.')}
      </p>
    </div>
  )
}

export function LoadingOverlayDemo({ disabled, size }: DemoProps) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<'saved' | 'cancelled' | null>(null)
  const [paused, setPaused] = useState(false)
  const [name, setName] = useState('Moru workspace')
  return (
    <div className="motion-demo">
      <LoadingOverlay
        loading={loading}
        label={t('설정 저장 중')}
        description={t('입력값을 유지한 채 이 영역만 잠가요.')}
        spinnerVariant="dots"
        paused={paused || disabled}
      >
        <div className="motion-demo-form">
          <Field label={t('워크스페이스 이름')}>
            <Input value={name} onValueChange={setName} size={size} disabled={disabled} />
          </Field>
          <Button
            size={size}
            disabled={disabled}
            onClick={() => {
              setLoading(true)
              setResult(null)
            }}
          >
            <Save aria-hidden="true" />
            {t('저장 데모 시작')}
          </Button>
        </div>
      </LoadingOverlay>
      <div className="motion-demo-actions">
        <Button
          size="sm"
          focusableWhenDisabled
          disabled={!loading || disabled}
          onClick={() => {
            setLoading(false)
            setResult('saved')
          }}
        >
          <Check aria-hidden="true" />
          {t('완료 처리')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          focusableWhenDisabled
          disabled={!loading || disabled}
          onClick={() => {
            setLoading(false)
            setResult('cancelled')
          }}
        >
          {t('취소')}
        </Button>
        <MotionToggle paused={paused} onChange={setPaused} disabled={disabled} />
      </div>
      <p className="motion-demo-caption" role="status">
        {result === 'saved'
          ? t('설정을 저장한 상태예요. 입력값은 그대로 유지됩니다.')
          : result === 'cancelled'
            ? t('저장을 취소했어요. 입력값은 유지됩니다.')
            : t('완료·취소는 잠긴 영역 밖에서 조작할 수 있어요. 실제 저장은 하지 않습니다.')}
      </p>
    </div>
  )
}

export function StatusIndicatorDemo({ disabled, size }: DemoProps) {
  const { t } = useI18n()
  const [syncing, setSyncing] = useState(false)
  const [paused, setPaused] = useState(false)
  return (
    <div className="motion-demo">
      <div className="motion-demo-status-list">
        <StatusIndicator label={t('연결됨')} tone="success" size={size} />
        <StatusIndicator label={t('다시 연결 중')} tone="warning" size={size} />
        <StatusIndicator label={t('오프라인')} tone="neutral" size={size} />
        <StatusIndicator label={t('연결 오류')} tone="danger" size={size} />
      </div>
      <div className="motion-demo-example">
        <StatusIndicator
          label={syncing ? t('동기화 중') : t('변경 사항 저장됨')}
          tone={syncing ? 'info' : 'success'}
          pulse={syncing}
          paused={paused || disabled}
          live="polite"
          size={size}
        />
      </div>
      <div className="motion-demo-actions">
        <Button
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={() => setSyncing(!syncing)}
        >
          {syncing ? t('동기화 완료') : t('동기화 데모 시작')}
        </Button>
        <MotionToggle paused={paused} onChange={setPaused} disabled={disabled} />
      </div>
      <p className="motion-demo-caption">
        {t('색상만으로 상태를 전달하지 않고, 읽을 수 있는 문구를 함께 제공해요.')}
      </p>
    </div>
  )
}
