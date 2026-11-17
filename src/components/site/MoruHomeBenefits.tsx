import { useId } from 'react'
import { ArrowUpRight, Braces, Keyboard, SlidersHorizontal } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { ThemeMode, ThemeTokens } from '../../theme/tokens'
import { AiContextButton } from '../ai/AiContextButton'
import { Card } from '../ui/card'
import './moru-home-benefits.css'

const aiExamples = ['button', 'input', 'field'] as const

export function MoruHomeBenefits({ tokens, mode }: { tokens: ThemeTokens; mode: ThemeMode }) {
  const { t } = useI18n()
  const heading = useId()

  return (
    <section className="moru-home-benefits" aria-labelledby={heading}>
      <h2 id={heading}>{t('Moru를 선택하는 이유')}</h2>
      <div className="moru-home-benefits__grid">
        <Card className="moru-home-benefit" role="article">
          <div className="moru-home-benefit__label">
            <SlidersHorizontal size={18} aria-hidden="true" />
            <span>DESIGN TOKENS</span>
          </div>
          <h3>{t('한 번의 설정, 일관된 화면.')}</h3>
          <p>
            {t(
              '컬러·타이포·간격·밀도를 공통 토큰으로 조절하고, JSON과 Provider 코드로 내 프로젝트에 이어 쓰세요.',
            )}
          </p>
          <div className="moru-home-benefit__action">
            <a href="#guide/tokens">
              {t('내 프로젝트에 토큰 적용하기')}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </Card>

        <Card className="moru-home-benefit" role="article">
          <div className="moru-home-benefit__label">
            <Keyboard size={18} aria-hidden="true" />
            <span>HUMAN EXPERIENCE</span>
          </div>
          <h3>{t('다음 행동까지 이어지는 입력.')}</h3>
          <p>
            {t(
              '인증번호 붙여넣기, 방향키 탐색, 오류 안내까지. 자주 필요한 동작을 함께 제공해 화면의 흐름에 집중할 수 있습니다.',
            )}
          </p>
          <div className="moru-home-benefit__action">
            <a href="#components/forms/input-otp">
              {t('입력 경험 직접 써보기')}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </Card>

        <Card className="moru-home-benefit" role="article">
          <div className="moru-home-benefit__label">
            <Braces size={18} aria-hidden="true" />
            <span>AI CONTEXT</span>
          </div>
          <h3>{t('AI에도 전해지는 디자인 기준.')}</h3>
          <p>
            {t(
              '선택한 컴포넌트의 실제 API와 디자인 토큰을 함께 전달하세요. AI가 같은 기준을 참고해 화면을 조합할 수 있습니다.',
            )}
          </p>
          <div className="moru-home-benefit__action moru-home-benefit__action--ai">
            <AiContextButton
              tokens={tokens}
              mode={mode}
              initialItems={aiExamples}
              defaultTarget="web-starter"
              className="moru-home-benefit__ai"
            />
            <span>{t('컴포넌트 소스·스타터용 명세')}</span>
          </div>
        </Card>
      </div>
    </section>
  )
}
