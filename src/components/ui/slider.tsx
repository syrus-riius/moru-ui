import { Slider as BaseSlider } from '@base-ui/react/slider'
import { cn } from '../../lib/cn'
import { mergeDescriptionIds, useFieldContext } from './field-context'

/** A horizontal, single-thumb slider. Range values deliberately use a separate API. */
export interface SliderProps extends Omit<BaseSlider.Root.Props<number>,
  'children' | 'className' | 'value' | 'defaultValue' | 'onValueChange' | 'orientation' | 'minStepsBetweenValues' | 'thumbCollisionBehavior'> {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  label?: string
  showValue?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Slider({
  value, defaultValue, onValueChange, label, showValue = false,
  className, disabled, id, size = 'md', min = 0, max = 100, step = 1,
  'aria-label': ariaLabel, 'aria-labelledby': labelledBy,
  'aria-describedby': describedBy, 'aria-invalid': invalid, ...props
}: SliderProps) {
  const field = useFieldContext()
  const invalidState = invalid ?? (field?.invalid || undefined)

  return (
    <BaseSlider.Root
      {...props}
      id={id ?? field?.controlId}
      className={cn('ui-slider', className)}
      data-size={size}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(nextValue) => { if (!disabled) onValueChange?.(nextValue) }}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      orientation="horizontal"
      thumbAlignment="edge"
      aria-invalid={invalidState}
      aria-labelledby={labelledBy}
    >
      {(label || showValue) && (
        <div className="ui-slider-heading">
          {label && <BaseSlider.Label className="ui-slider-label">{label}</BaseSlider.Label>}
          {showValue && <BaseSlider.Value className="ui-slider-value" />}
        </div>
      )}
      <BaseSlider.Control className="ui-slider-control">
        <BaseSlider.Track className="ui-slider-track">
          <BaseSlider.Indicator className="ui-slider-indicator" />
        </BaseSlider.Track>
        <BaseSlider.Thumb
          className="ui-slider-thumb"
          index={0}
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          aria-describedby={mergeDescriptionIds(describedBy, field?.describedBy)}
          aria-invalid={invalidState}
        />
      </BaseSlider.Control>
    </BaseSlider.Root>
  )
}
