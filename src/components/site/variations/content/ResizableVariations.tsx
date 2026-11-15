import { useI18n } from '../../../../i18n'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../../ui/resizable'
import { VariationExample, VariationGroup } from '../VariationLayout'

export default function ResizableVariations() {
  return (
    <VariationGroup title="베리에이션" wide>
      <VariationExample label="가로" code={'orientation="horizontal"'}>
        <Panels />
      </VariationExample>
      <VariationExample label="세로" code={'orientation="vertical"'}>
        <Panels orientation="vertical" />
      </VariationExample>
      <VariationExample
        label="비활성"
        code="<ResizablePanelGroup disabled>…<ResizableHandle disabled /></ResizablePanelGroup>"
      >
        <Panels disabled />
      </VariationExample>
      <VariationExample label="손잡이 없음" code="<ResizableHandle withHandle={false} />">
        <Panels withHandle={false} />
      </VariationExample>
    </VariationGroup>
  )
}

function Panels({
  orientation = 'horizontal',
  disabled = false,
  withHandle = true,
}: {
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
  withHandle?: boolean
}) {
  const { t } = useI18n()
  return (
    <ResizablePanelGroup orientation={orientation} disabled={disabled} style={{ height: 200 }}>
      <ResizablePanel defaultSize="40%" minSize="20%">
        <div style={{ padding: 'calc(var(--ui-control-gap) * 2)' }}>{t('탐색')}</div>
      </ResizablePanel>
      <ResizableHandle disabled={disabled} withHandle={withHandle} />
      <ResizablePanel minSize="20%">
        <div style={{ padding: 'calc(var(--ui-control-gap) * 2)' }}>{t('작업 공간')}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
