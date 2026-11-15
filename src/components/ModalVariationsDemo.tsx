import { useI18n } from '../i18n'
import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  Check,
  CircleCheck,
  CircleHelp,
  FileText,
  Maximize2,
  PanelsTopLeft,
  Trash2,
} from 'lucide-react'
import { Button } from './ui/button'
import { Field } from './ui/field'
import { Input } from './ui/input'
import { Modal } from './ui/modal'
import { Textarea } from './ui/textarea'
import './modal-variations-demo.css'

type ModalExample = 'basic' | 'confirmation' | 'form' | 'success' | 'danger' | 'full'

interface ModalVariationsDemoProps {
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

function VariationTile({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="modal-variation-tile">
      <div className="modal-variation-tile-heading">
        <span className="modal-variation-tile-icon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

const reviewSections = [
  [
    '기본에 집중하기',
    '화면의 목적을 먼저 정하고, 가장 중요한 작업부터 배치합니다. 제목과 설명은 짧고 분명하게 작성합니다.',
  ],
  [
    '입력과 피드백',
    '입력값은 저장 전에 확인하고, 오류가 발생하면 해결 방법을 가까운 곳에 안내합니다. 사용자가 작성한 내용은 유지합니다.',
  ],
  [
    '키보드로 이동하기',
    'Tab으로 다음 항목으로 이동하고 Shift + Tab으로 돌아갑니다. 모달을 닫으면 열었던 버튼으로 포커스가 돌아갑니다.',
  ],
  [
    '다양한 화면 크기',
    '좁은 화면에서는 내용을 한 열로 배치합니다. 긴 내용은 본문 안에서 스크롤하고, 주요 동작은 아래에서 확인할 수 있습니다.',
  ],
  [
    '상태를 분명하게',
    '완료와 오류를 색상에만 의존하지 않고 문장과 아이콘으로 함께 표현합니다. 실행 결과는 사용자가 이해할 수 있는 말로 전달합니다.',
  ],
  [
    '마무리하기',
    '행간과 여백을 일관되게 유지하고, 실제 작업 흐름 안에서 내용을 다시 확인합니다. 작은 상호작용도 자연스럽게 이어지도록 다듬습니다.',
  ],
] as const

export function ModalVariationsDemo({ disabled = false, size = 'md' }: ModalVariationsDemoProps) {
  const { t } = useI18n()
  const [active, setActive] = useState<ModalExample | null>(null)
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [nameError, setNameError] = useState('')
  const [savedProject, setSavedProject] = useState('Moru 모바일 앱')
  const [reviewed, setReviewed] = useState(false)
  const [removed, setRemoved] = useState(false)
  const [status, setStatus] = useState('')
  const formId = useId()
  const projectInputRef = useRef<HTMLInputElement>(null)
  const confirmationCancelRef = useRef<HTMLButtonElement>(null)
  const deletionCancelRef = useRef<HTMLButtonElement>(null)
  const close = () => setActive(null)
  const openChange = (example: ModalExample) => (open: boolean) => setActive(open ? example : null)

  function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = projectName.trim()
    if (!name) {
      setNameError(t('프로젝트 이름을 입력해 주세요.'))
      projectInputRef.current?.focus()
      return
    }
    setNameError('')
    setSavedProject(name)
    setStatus(t('“{name}” 프로젝트를 이 예제에 저장했어요.', { name: name }))
    close()
  }

  return (
    <div className="modal-variations-demo">
      <div className="modal-variations-grid">
        <VariationTile
          icon={<PanelsTopLeft />}
          title={t('기본')}
          description={t('필요한 정보를 간결하게')}
        >
          <Modal
            title={t('프로젝트 개요')}
            description={t('팀이 같은 방향으로 시작할 수 있도록 핵심 정보를 확인하세요.')}
            open={active === 'basic'}
            onOpenChange={openChange('basic')}
            trigger={
              <Button variant="secondary" size={size} disabled={disabled}>
                {t('기본 모달 열기')}
              </Button>
            }
            footer={
              <Button size={size} onClick={close}>
                {t('확인')}
              </Button>
            }
          >
            <dl className="modal-demo-details">
              <div>
                <dt>{t('프로젝트')}</dt>
                <dd>{savedProject}</dd>
              </div>
              <div>
                <dt>{t('단계')}</dt>
                <dd>{t('아이디어 구체화')}</dd>
              </div>
              <div>
                <dt>{t('작업 공간')}</dt>
                <dd>{t('팀 디자인 시스템')}</dd>
              </div>
            </dl>
          </Modal>
        </VariationTile>

        <VariationTile
          icon={<CircleHelp />}
          title={t('확인')}
          description={t('실행 전 한 번 더 확인')}
        >
          <Modal
            variant="confirmation"
            size="sm"
            title={t('검토를 완료할까요?')}
            description={t('예제 프로젝트의 검토 상태를 완료로 변경합니다.')}
            open={active === 'confirmation'}
            onOpenChange={openChange('confirmation')}
            initialFocus={confirmationCancelRef}
            trigger={
              <Button variant="secondary" size={size} disabled={disabled}>
                {t('확인 모달 열기')}
              </Button>
            }
            footer={
              <>
                <Button ref={confirmationCancelRef} variant="secondary" size={size} onClick={close}>
                  {t('취소')}
                </Button>
                <Button
                  size={size}
                  onClick={() => {
                    setReviewed(true)
                    setStatus(t('예제 프로젝트를 검토 완료로 변경했어요.'))
                    close()
                  }}
                >
                  {t('검토 완료')}
                </Button>
              </>
            }
          >
            <p className="modal-demo-note">
              {reviewed
                ? t('이 프로젝트는 검토가 완료된 상태입니다.')
                : t('변경할 내용이 없다면 검토를 마무리하세요.')}
            </p>
          </Modal>
        </VariationTile>

        <VariationTile
          icon={<FileText />}
          title={t('입력 폼')}
          description={t('검증부터 저장까지 자연스럽게')}
        >
          <Modal
            variant="form"
            size="lg"
            title={t('새 프로젝트')}
            description={t('작은 아이디어부터 시작해 보세요. 이 예제 안에 저장됩니다.')}
            open={active === 'form'}
            onOpenChange={openChange('form')}
            trigger={
              <Button variant="secondary" size={size} disabled={disabled}>
                {t('입력 모달 열기')}
              </Button>
            }
            footer={
              <>
                <Button variant="secondary" size={size} onClick={close}>
                  {t('취소')}
                </Button>
                <Button type="submit" form={formId} size={size}>
                  {t('프로젝트 저장')}
                </Button>
              </>
            }
          >
            <form id={formId} className="modal-demo-form" onSubmit={saveProject} noValidate>
              <Field
                label={t('프로젝트 이름')}
                description={t('최대 60자까지 입력할 수 있어요.')}
                error={nameError || undefined}
              >
                <Input
                  ref={projectInputRef}
                  value={projectName}
                  maxLength={60}
                  required
                  size={size}
                  placeholder={t('예: Moru 모바일 앱')}
                  onChange={(event) => {
                    setProjectName(event.target.value)
                    if (nameError) setNameError('')
                  }}
                />
              </Field>
              <Field label={t('설명 (선택)')} description={t('어떤 문제를 해결하고 싶은가요?')}>
                <Textarea
                  value={description}
                  size={size}
                  maxLength={500}
                  rows={4}
                  placeholder={t('프로젝트의 목표를 적어 주세요.')}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </Field>
            </form>
          </Modal>
        </VariationTile>

        <VariationTile
          icon={<CircleCheck />}
          title={t('완료')}
          description={t('결과와 다음 단계를 함께')}
        >
          <Modal
            variant="success"
            size="sm"
            title={t('모든 준비를 마쳤어요')}
            description={t('프로젝트 정보를 확인하고 다음 작업을 시작하세요.')}
            open={active === 'success'}
            onOpenChange={openChange('success')}
            trigger={
              <Button variant="secondary" size={size} disabled={disabled}>
                {t('완료 모달 열기')}
              </Button>
            }
            footer={
              <Button size={size} onClick={close}>
                {t('확인했어요')}
              </Button>
            }
          >
            <div className="modal-demo-success-summary">
              <Check aria-hidden="true" />
              <span>{savedProject}</span>
            </div>
            <p className="modal-demo-note">{t('이름과 설명은 언제든 다시 수정할 수 있어요.')}</p>
          </Modal>
        </VariationTile>

        <VariationTile
          icon={<Trash2 />}
          title={t('삭제 확인')}
          description={t('대상과 결과를 명확하게')}
        >
          <Modal
            variant="danger"
            size="sm"
            title={removed ? t('샘플을 삭제했어요') : t('이 샘플을 삭제할까요?')}
            description={t('이 화면의 예제 데이터만 변경됩니다. 삭제 후 다시 복원할 수 있어요.')}
            open={active === 'danger'}
            onOpenChange={openChange('danger')}
            initialFocus={deletionCancelRef}
            trigger={
              <Button variant="secondary" size={size} disabled={disabled}>
                {t('삭제 모달 열기')}
              </Button>
            }
            footer={
              <>
                <Button ref={deletionCancelRef} variant="secondary" size={size} onClick={close}>
                  {removed ? t('닫기') : t('취소')}
                </Button>
                {removed ? (
                  <Button
                    size={size}
                    onClick={() => {
                      setRemoved(false)
                      setStatus(t('샘플 초안을 복원했어요.'))
                    }}
                  >
                    {t('샘플 복원')}
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    size={size}
                    onClick={() => {
                      setRemoved(true)
                      setStatus(t('샘플 초안을 이 예제에서 삭제했어요.'))
                      deletionCancelRef.current?.focus()
                    }}
                  >
                    {t('샘플 삭제')}
                  </Button>
                )}
              </>
            }
          >
            {removed ? (
              <p className="modal-demo-note" role="status">
                {t('온보딩 초안을 삭제했습니다. 아래 버튼으로 복원할 수 있어요.')}
              </p>
            ) : (
              <div className="modal-demo-sample">
                <FileText aria-hidden="true" />
                <div>
                  <strong>{t('온보딩 초안')}</strong>
                  <span>{t('샘플 프로젝트 · 초안 1개')}</span>
                </div>
              </div>
            )}
          </Modal>
        </VariationTile>

        <VariationTile
          icon={<Maximize2 />}
          title={t('전체 화면')}
          description={t('긴 내용도 여유 있게')}
        >
          <Modal
            size="full"
            title={t('디자인 리뷰')}
            description={t('본문을 스크롤하며 내용을 확인하세요.')}
            open={active === 'full'}
            onOpenChange={openChange('full')}
            trigger={
              <Button variant="secondary" size={size} disabled={disabled}>
                {t('전체 화면 열기')}
              </Button>
            }
            footer={
              <Button size={size} onClick={close}>
                {t('리뷰 닫기')}
              </Button>
            }
          >
            <div className="modal-demo-review">
              <p className="modal-demo-review-intro">
                {t('기본부터 경험의 완성까지.')}
                <br />
                {t('작은 결정들을 함께 살펴봅니다.')}
              </p>
              {reviewSections.map(([title, text], index) => (
                <section key={title}>
                  <span className="modal-demo-review-number">0{index + 1}</span>
                  <div>
                    <h4>{title}</h4>
                    <p>{t(text)}</p>
                  </div>
                </section>
              ))}
            </div>
          </Modal>
        </VariationTile>
      </div>
      <p className="modal-variations-status" role="status" aria-live="polite">
        {status || t('각 모달을 열어 크기와 동작을 비교해 보세요.')}
      </p>
    </div>
  )
}
