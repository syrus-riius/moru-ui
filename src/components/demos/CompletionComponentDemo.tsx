import { LoadingOverlayDemo, StatusIndicatorDemo } from './MotionFeedbackDemo'
import { useI18n } from '../../i18n'
import { HeaderFooterDemo } from './HeaderFooterDemo'
import { CompletionControlsDemo } from './CompletionControlsDemo'
import { CompletionNavigationDemo } from './CompletionNavigationDemo'
import { CompletionContentDemo } from './CompletionContentDemo'
import { CompletionDataDemo } from './CompletionDataDemo'
import type { CompletionComponentId } from '../catalog/component-catalog'
import { EnhancedInputsDemo } from './EnhancedInputsDemo'
import { WorkflowPatternsDemo } from './WorkflowPatternsDemo'
import { Field } from '../ui/field'
import { FileInput } from '../ui/file-input'
import { DateTimeComponentDemo } from './DateTimeComponentDemo'

export function CompletionComponentDemo({
  id,
  ...props
}: {
  id: CompletionComponentId
  disabled: boolean
  size: 'sm' | 'md' | 'lg'
  onNotice?: (message: string) => void
}) {
  const { t } = useI18n()
  switch (id) {
    case 'loading-overlay':
      return <LoadingOverlayDemo {...props} />
    case 'status-indicator':
      return <StatusIndicatorDemo {...props} />
    case 'header':
    case 'footer':
      return <HeaderFooterDemo id={id} {...props} />
    case 'date-range-picker':
    case 'time-picker':
    case 'time-range-picker':
      return <DateTimeComponentDemo id={id} {...props} />
    case 'number-input':
    case 'password-input':
    case 'multi-select':
      return <EnhancedInputsDemo id={id} {...props} />
    case 'stepper':
    case 'ring-progress':
      return <WorkflowPatternsDemo id={id} {...props} />
    case 'file-input':
      return (
        <Field
          label={t('프로젝트 문서')}
          description={t('PDF·이미지, 파일당 5MB 이하 · 최대 3개. 브라우저에서만 선택합니다.')}
        >
          <FileInput
            name="brief"
            accept=".pdf,image/*"
            multiple
            maxSize={5 * 1024 * 1024}
            maxFiles={3}
            size={props.size}
            disabled={props.disabled}
          />
        </Field>
      )
    case 'aspect-ratio':
    case 'button-group':
    case 'direction':
    case 'input-group':
    case 'input-otp':
    case 'item':
    case 'kbd':
    case 'label':
    case 'native-select':
    case 'spinner':
    case 'toggle':
      return <CompletionControlsDemo id={id} {...props} />
    case 'breadcrumb':
    case 'collapsible':
    case 'context-menu':
    case 'drawer':
    case 'hover-card':
    case 'menubar':
    case 'navigation-menu':
    case 'sidebar':
      return <CompletionNavigationDemo id={id} {...props} />
    case 'attachment':
    case 'bubble':
    case 'code-block':
    case 'marker':
    case 'message':
    case 'message-scroller':
    case 'questionnaire':
    case 'trace':
      return <CompletionContentDemo id={id} {...props} />
    default:
      return <CompletionDataDemo id={id} {...props} />
  }
}
