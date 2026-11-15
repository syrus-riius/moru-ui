import type { ComponentId } from '../../catalog/component-catalog'
import { ChoiceVariations } from './forms/ChoiceVariations'
import { DateVariations } from './forms/DateVariations'
import { FormContentVariations } from './forms/FormContentVariations'
import { TextControlVariations } from './forms/TextControlVariations'

/** Independent, live comparisons using each form component's public API. */
export function FormVariations({ id }: { id: ComponentId }) {
  switch (id) {
    case 'field':
    case 'textarea':
    case 'input-group':
    case 'input-otp':
    case 'label':
    case 'native-select':
    case 'file-input':
    case 'number-input':
    case 'password-input':
      return <TextControlVariations id={id} />
    case 'checkbox':
    case 'select':
    case 'multi-select':
    case 'switch':
    case 'radio-group':
    case 'slider':
    case 'combobox':
    case 'toggle-group':
      return <ChoiceVariations id={id} />
    case 'calendar':
    case 'date-picker':
    case 'date-range-picker':
    case 'time-picker':
    case 'time-range-picker':
      return <DateVariations id={id} />
    case 'attachment':
    case 'questionnaire':
      return <FormContentVariations id={id} />
    default:
      return null
  }
}
