import { Check } from 'lucide-react'
import { useI18n } from '../../../../i18n'
import type { ComponentId } from '../../../catalog/component-catalog'
import { Calendar, type CalendarDayData } from '../../../ui/calendar'
import { DatePicker } from '../../../ui/date-picker'
import { DateRangePicker } from '../../../ui/date-range-picker'
import { Field } from '../../../ui/field'
import { TimePicker } from '../../../ui/time-picker'
import { TimeRangePicker } from '../../../ui/time-range-picker'
import { VariationExample, VariationGroup } from '../VariationLayout'
import { FormSizeExamples, type ControlSize } from './FormVariationLayout'

// Local date-only examples stay stable across time zones and all size comparisons.
const date = (day: number) => new Date(2026, 10, day)
const dateRange = () => ({ start: date(12), end: date(18) })
type PickerId = 'date-picker' | 'date-range-picker' | 'time-picker' | 'time-range-picker'
type PickerState = 'default' | 'disabled' | 'loading' | 'readOnly' | 'error'

function PickerExample({
  id,
  size = 'md',
  state = 'default',
}: {
  id: PickerId
  size?: ControlSize
  state?: PickerState
}) {
  const { t } = useI18n()
  const props = {
    size,
    disabled: state === 'disabled',
    loading: state === 'loading',
    readOnly: state === 'readOnly',
  }
  const labels: Record<PickerId, string> = {
    'date-picker': '날짜 선택',
    'date-range-picker': '날짜 범위 선택',
    'time-picker': '시간 선택',
    'time-range-picker': '시간 범위 선택',
  }
  return (
    <Field
      label={t(labels[id])}
      error={state === 'error' ? t('입력 내용을 확인해 주세요.') : undefined}
    >
      {id === 'date-picker' && <DatePicker {...props} defaultValue={date(15)} />}
      {id === 'date-range-picker' && <DateRangePicker {...props} defaultValue={dateRange()} />}
      {id === 'time-picker' && <TimePicker {...props} defaultValue="09:30" step={15} />}
      {id === 'time-range-picker' && (
        <TimeRangePicker {...props} defaultValue={{ start: '09:00', end: '10:30' }} step={15} />
      )}
    </Field>
  )
}

export function DateVariations({ id }: { id: ComponentId }) {
  const { t } = useI18n()
  if (id === 'calendar') {
    const dayData: Record<string, CalendarDayData> = {
      '2026-11-12': { label: t('디자인 리뷰'), tone: 'accent', count: 2 },
      '2026-11-15': { label: t('팀 회의'), tone: 'info', count: 1 },
      '2026-11-18': {
        label: t('완료'),
        tone: 'success',
        completed: true,
        icon: <Check size={14} aria-hidden="true" />,
      },
    }
    return (
      <>
        <FormSizeExamples wide>
          {(size) => <Calendar size={size} defaultValue={date(15)} />}
        </FormSizeExamples>
        <VariationGroup title="형태 비교" wide>
          <VariationExample label="기본" code={'variant="default" dayShape="rounded"'}>
            <Calendar defaultValue={date(15)} />
          </VariationExample>
          <VariationExample label="미니멀" code={'variant="minimal" dayShape="square"'}>
            <Calendar variant="minimal" dayShape="square" defaultValue={date(15)} />
          </VariationExample>
          <VariationExample label="일정" code={'variant="schedule" dayData'}>
            <Calendar variant="schedule" defaultValue={date(15)} dayData={dayData} />
          </VariationExample>
          <VariationExample label="활동" code={'variant="activity" dayShape="circle"'}>
            <Calendar
              variant="activity"
              dayShape="circle"
              defaultValue={date(15)}
              dayData={dayData}
            />
          </VariationExample>
        </VariationGroup>
        <VariationGroup title="상태 비교" wide>
          <VariationExample label="날짜 범위 선택" code={'mode="range"'}>
            <Calendar mode="range" defaultValue={dateRange()} />
          </VariationExample>
          <VariationExample label="비활성" code="disabled">
            <Calendar defaultValue={date(15)} disabled />
          </VariationExample>
          <VariationExample label="날짜 제한" code="minDate / maxDate">
            <Calendar defaultValue={date(15)} minDate={date(10)} maxDate={date(22)} />
          </VariationExample>
          <VariationExample label="월요일 시작" code="weekStartsOn={1} showOutsideDays={false}">
            <Calendar
              defaultValue={date(15)}
              weekStartsOn={1}
              showOutsideDays={false}
              fixedWeeks={false}
            />
          </VariationExample>
        </VariationGroup>
      </>
    )
  }

  if (
    id !== 'date-picker' &&
    id !== 'date-range-picker' &&
    id !== 'time-picker' &&
    id !== 'time-range-picker'
  )
    return null
  const wide = id === 'date-range-picker' || id === 'time-range-picker'
  return (
    <>
      <FormSizeExamples wide={wide}>
        {(size) => <PickerExample id={id} size={size} />}
      </FormSizeExamples>
      <VariationGroup title="상태 비교" wide={wide}>
        <VariationExample label="기본">
          <PickerExample id={id} />
        </VariationExample>
        <VariationExample label="비활성" code="disabled">
          <PickerExample id={id} state="disabled" />
        </VariationExample>
        <VariationExample label="로딩" code="loading">
          <PickerExample id={id} state="loading" />
        </VariationExample>
        <VariationExample label="읽기 전용" code="readOnly">
          <PickerExample id={id} state="readOnly" />
        </VariationExample>
        <VariationExample label="오류" code="Field error">
          <PickerExample id={id} state="error" />
        </VariationExample>
      </VariationGroup>
      {(id === 'date-picker' || id === 'date-range-picker') && (
        <VariationGroup title="형태 비교" wide={wide}>
          <VariationExample label="날짜 제한" code="minDate / maxDate">
            <Field label={t('날짜 선택')}>
              {id === 'date-picker' ? (
                <DatePicker defaultValue={date(15)} minDate={date(10)} maxDate={date(22)} />
              ) : (
                <DateRangePicker defaultValue={dateRange()} minDate={date(10)} maxDate={date(22)} />
              )}
            </Field>
          </VariationExample>
          <VariationExample
            label="미니멀"
            code={'calendarOptions={{ variant: "minimal", weekStartsOn: 1 }}'}
          >
            <Field label={t('날짜 선택')}>
              {id === 'date-picker' ? (
                <DatePicker
                  defaultValue={date(15)}
                  calendarOptions={{ variant: 'minimal', weekStartsOn: 1, dayShape: 'circle' }}
                />
              ) : (
                <DateRangePicker
                  defaultValue={dateRange()}
                  calendarOptions={{ variant: 'minimal', weekStartsOn: 1, dayShape: 'circle' }}
                />
              )}
            </Field>
          </VariationExample>
        </VariationGroup>
      )}
      {id === 'time-picker' && (
        <VariationGroup title="형태 비교">
          <VariationExample label="기본" code="step={1}">
            <Field label={t('시간 선택')}>
              <TimePicker defaultValue="09:15" step={1} />
            </Field>
          </VariationExample>
          <VariationExample label="시간 제한" code={'min="09:00" max="18:00" step={30}'}>
            <Field label={t('시간 선택')}>
              <TimePicker defaultValue="10:00" min="09:00" max="18:00" step={30} />
            </Field>
          </VariationExample>
          <VariationExample label="필수" code="required clearable={false}">
            <Field label={t('시간 선택')}>
              <TimePicker required clearable={false} defaultValue="09:00" />
            </Field>
          </VariationExample>
        </VariationGroup>
      )}
      {id === 'time-range-picker' && (
        <VariationGroup title="형태 비교" wide>
          <VariationExample label="시간 제한" code={'min="09:00" max="18:00" step={30}'}>
            <TimeRangePicker
              label={t('시간 범위 선택')}
              defaultValue={{ start: '10:00', end: '11:30' }}
              min="09:00"
              max="18:00"
              step={30}
            />
          </VariationExample>
          <VariationExample label="다음 날 허용" code="allowOvernight">
            <TimeRangePicker
              label={t('시간 범위 선택')}
              defaultValue={{ start: '22:00', end: '02:00' }}
              allowOvernight
              step={30}
            />
          </VariationExample>
          <VariationExample label="오류" code="allowOvernight={false}">
            <TimeRangePicker
              label={t('시간 범위 선택')}
              defaultValue={{ start: '11:00', end: '09:00' }}
            />
          </VariationExample>
        </VariationGroup>
      )}
    </>
  )
}
