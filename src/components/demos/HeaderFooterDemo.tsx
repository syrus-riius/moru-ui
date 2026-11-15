import { useI18n } from '../../i18n'
import { useState } from 'react'
import { ArrowLeft, Bell, Plus } from 'lucide-react'
import { Header, type HeaderProps } from '../ui/header'
import { Footer, type FooterColumn } from '../ui/footer'
import { Button } from '../ui/button'
import './header-footer-demo.css'

const headerVariants: { value: HeaderProps['variant']; label: string; note: string }[] = [
  { value: 'navigation', label: 'Navigation', note: '브랜드 · 탐색 · 주요 동작' },
  { value: 'centered', label: 'Centered', note: '브랜드를 가운데 두는 구성' },
  { value: 'app', label: 'App toolbar', note: '작업 맥락과 도구를 함께 배치' },
]

interface DemoControls {
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  onNotice?: (message: string) => void
}

function HeaderExamples({ disabled = false, size = 'md', onNotice }: DemoControls) {
  const { t } = useI18n()
  const [active, setActive] = useState('개요')
  const [status, setStatus] = useState('메뉴와 버튼을 눌러 동작을 확인하세요.')
  const [projects, setProjects] = useState(0)
  const announce = (message: string) => {
    setStatus(message)
    onNotice?.(t(message))
  }
  const navigation = (['개요', '프로젝트', '팀'] as const).map((label) => (
    <button
      type="button"
      key={t(label)}
      disabled={disabled}
      aria-current={active === label ? 'page' : undefined}
      onClick={() => {
        setActive(label)
        announce(t('{label} 화면을 선택했어요.', { label: t(label) }))
      }}
    >
      {t(label)}
    </button>
  ))

  return (
    <div className="page-chrome-demo">
      {headerVariants.map(({ value, label, note }) => (
        <section
          className="page-chrome-demo-example"
          key={value}
          aria-label={t('{label} Header 예제', { label: t(label) })}
        >
          <div className="page-chrome-demo-caption">
            <strong>{t(label)}</strong>
            <span>{t(note)}</span>
          </div>
          <div className="page-chrome-demo-canvas">
            <Header
              size={size}
              inert={disabled || undefined}
              variant={value}
              navigationLabel={t('{label} 예제 탐색', { label: t(label) })}
              menuLabel={t('{label} 메뉴', { label: t(label) })}
              brand={
                value === 'app' ? (
                  <span className="page-chrome-demo-brand">
                    <Button
                      variant="ghost"
                      size={size}
                      disabled={disabled}
                      aria-label={t('프로젝트 개요로 돌아가기')}
                      onClick={() => {
                        setActive('개요')
                        announce(t('프로젝트 개요로 돌아왔어요.'))
                      }}
                    >
                      <ArrowLeft size={16} aria-hidden="true" />
                    </Button>
                    {t('프로젝트 보드')}
                  </span>
                ) : (
                  <span className="page-chrome-demo-brand">
                    <span aria-hidden="true">M</span>Moru Studio
                  </span>
                )
              }
              navigation={navigation}
              actions={
                value === 'app' ? (
                  <Button
                    variant="secondary"
                    size={size}
                    disabled={disabled}
                    onClick={() => announce(t('새 알림이 없어요. 모든 소식을 확인했어요.'))}
                  >
                    <Bell size={14} aria-hidden="true" />
                    {t('알림')}
                  </Button>
                ) : (
                  <Button
                    size={size}
                    disabled={disabled}
                    onClick={() => {
                      setProjects((count) => count + 1)
                      announce(
                        t('예제 프로젝트 {value1}개를 만들었어요.', { value1: projects + 1 }),
                      )
                    }}
                  >
                    <Plus size={14} aria-hidden="true" />
                    {t('새 프로젝트')}
                  </Button>
                )
              }
            />
          </div>
        </section>
      ))}
      <p className="page-chrome-demo-status" role="status">
        {t(status)}
      </p>
      <p className="page-chrome-demo-help">
        {t('좁은 화면에서는 탐색 메뉴가 접힙니다. 메뉴를 펼친 뒤 Escape로 닫을 수 있어요.')}
      </p>
    </div>
  )
}

function FooterExamples({ disabled = false, size = 'md', onNotice }: DemoControls) {
  const { t } = useI18n()
  const [selection, setSelection] = useState('제품 소개')
  const notes: Record<string, string> = {
    '제품 소개': 'Moru의 공통 컴포넌트와 디자인 토큰으로 제품의 기본을 만드세요.',
    '사용 가이드': '컴포넌트를 조합한 뒤 크기와 밀도를 앱에 맞게 조절하세요.',
    지원: '제품에서 도움이 필요한 경로를 푸터에 모아 둘 수 있어요.',
    이용약관: '서비스의 이용 조건을 연결하는 자리입니다.',
    개인정보: '개인정보 처리 내용을 연결하는 자리입니다.',
    업데이트: '변경 사항과 릴리스 소식을 이곳에 연결할 수 있어요.',
  }
  const links = (labels: string[]) =>
    labels.map((label) => (
      <button
        key={t(label)}
        type="button"
        disabled={disabled}
        onClick={() => {
          setSelection(label)
          onNotice?.(t('{label} 안내를 확인하고 있어요.', { label: t(label) }))
        }}
      >
        {t(label)}
      </button>
    ))
  const columns: FooterColumn[] = [
    {
      title: t('제품'),
      label: t('제품 예제 링크'),
      content: (
        <ul>
          {['제품 소개', '사용 가이드', '업데이트'].map((label) => (
            <li key={t(label)}>{links([label])}</li>
          ))}
        </ul>
      ),
    },
    {
      title: t('안내'),
      label: t('안내 예제 링크'),
      content: (
        <ul>
          {['지원', '이용약관', '개인정보'].map((label) => (
            <li key={t(label)}>{links([label])}</li>
          ))}
        </ul>
      ),
    },
  ]

  return (
    <div className="page-chrome-demo">
      <section className="page-chrome-demo-example" aria-label={t('Simple Footer 예제')}>
        <div className="page-chrome-demo-caption">
          <strong>Simple</strong>
          <span>{t('브랜드와 필요한 링크')}</span>
        </div>
        <div className="page-chrome-demo-canvas">
          <Footer
            size={size}
            inert={disabled || undefined}
            brand="Moru Studio"
            navigation={links(['제품 소개', '사용 가이드', '지원'])}
            navigationLabel={t('Simple 푸터 예제 탐색')}
            copyright="© Moru Studio"
            meta="Made for people."
          />
        </div>
      </section>
      <section className="page-chrome-demo-example" aria-label={t('Columns Footer 예제')}>
        <div className="page-chrome-demo-caption">
          <strong>Columns</strong>
          <span>{t('정보를 목적별로 묶은 구성')}</span>
        </div>
        <div className="page-chrome-demo-canvas">
          <Footer
            size={size}
            inert={disabled || undefined}
            variant="columns"
            brand="Moru Studio"
            description={t('단단한 기본에서 자연스러운 경험까지.')}
            columns={columns}
            copyright="© Moru Studio"
            meta={
              <span className="page-chrome-demo-system">
                <i aria-hidden="true" />
                {t('모든 시스템 정상')}
              </span>
            }
          />
        </div>
      </section>
      <section className="page-chrome-demo-example" aria-label={t('Compact Footer 예제')}>
        <div className="page-chrome-demo-caption">
          <strong>Compact</strong>
          <span>{t('앱 화면을 위한 작은 마무리')}</span>
        </div>
        <div className="page-chrome-demo-canvas">
          <Footer
            size={size}
            inert={disabled || undefined}
            variant="compact"
            navigation={links(['이용약관', '개인정보'])}
            navigationLabel={t('Compact 푸터 예제 탐색')}
            copyright="© Moru"
            meta="v1.0"
          />
        </div>
      </section>
      <div className="page-chrome-demo-detail" role="status">
        <strong>{t(selection)}</strong>
        <p>{t(notes[selection])}</p>
      </div>
    </div>
  )
}

export function HeaderFooterDemo({ id, ...controls }: { id: 'header' | 'footer' } & DemoControls) {
  return id === 'header' ? <HeaderExamples {...controls} /> : <FooterExamples {...controls} />
}
