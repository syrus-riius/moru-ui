import { useId } from 'react'
import { ArrowRight, Image as ImageIcon, Layers, MessageSquare } from 'lucide-react'
import { Avatar } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { InputOTP } from '../ui/input-otp'
import { Item, ItemContent, ItemDescription, ItemTitle } from '../ui/item'
import { NativeSelect } from '../ui/native-select'
import { Separator } from '../ui/separator'
import { Spinner } from '../ui/spinner'
import { Switch } from '../ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Tabs } from '../ui/tabs'
import { Textarea } from '../ui/textarea'
import { Typography } from '../ui/typography'
import type { SimAction, SimNode, SimRuntimeValue } from './simulator-types'
import { SimulatorChartNode } from './SimulatorChartNode'
import './simulator-node-view.css'

export interface SimulatorNodeViewProps {
  node: SimNode
  interactive?: boolean
  value?: SimRuntimeValue
  error?: string
  onValueChange?: (value: SimRuntimeValue) => void
  onAction?: (action: SimAction, node: SimNode) => void
}

/** One renderer is shared by the editable document and its temporary runtime. */
export function SimulatorNodeView({ node, interactive = false, value, error, onValueChange, onAction }: SimulatorNodeViewProps) {
  const fieldId = useId()
  const errorId = `${fieldId}-error`
  const props = node.props
  const disabled = props.state === 'disabled' || props.state === 'loading'
  const invalid = error || (props.state === 'error' ? '입력 내용을 확인해 주세요.' : '')
  const textValue = typeof value === 'string' ? value : props.value
  const checked = typeof value === 'boolean' ? value : props.checked
  const options = props.options.filter((option) => option.trim().length > 0)
  const selectValue = options.includes(textValue) ? String(options.indexOf(textValue)) : /^\d+$/.test(textValue) && Number(textValue) < options.length ? textValue : ''
  const label = props.label || '이름 없는 요소'
  const editableInput = interactive && !disabled
  const buttonVariant = props.variant === 'outline' ? 'secondary' : props.variant

  function change(next: SimRuntimeValue) {
    if (editableInput) onValueChange?.(next)
  }
  function activate() {
    if (!interactive || disabled) return
    onAction?.(node.action, node)
  }

  let content
  switch (node.type) {
    case 'container':
      content = <div className="sim-component-container" data-variant={props.variant} aria-hidden="true" />
      break
    case 'chart':
      content = <SimulatorChartNode node={node} interactive={interactive} />
      break
    case 'text':
      content = <Typography variant={props.textRole} as={props.textRole === 'heading' ? 'h3' : 'p'} className="sim-component-copy">{props.text || label}</Typography>
      break
    case 'button':
      content = <Button className="sim-component-button" type="button" variant={buttonVariant} data-outline={props.variant === 'outline' || undefined} loading={props.state === 'loading'} disabled={props.state === 'disabled'} previewState={props.state === 'error' ? 'error' : undefined} onClick={activate} tabIndex={interactive ? undefined : -1}>{label}</Button>
      break
    case 'input':
    case 'textarea':
    case 'input-otp':
    case 'select': {
      const shared = { id: fieldId, 'aria-label': label, 'aria-describedby': invalid ? errorId : undefined, 'aria-invalid': Boolean(invalid) || undefined, disabled, required: props.required }
      content = <div className="sim-component-field">
        <label className="sim-component-label" htmlFor={fieldId}>{label}{props.required ? <span aria-hidden="true"> *</span> : null}</label>
        {node.type === 'input' ? <Input {...shared} type={props.inputType} value={textValue} placeholder={props.placeholder} readOnly={!interactive} onValueChange={change} autoComplete="off" maxLength={500} loading={props.state === 'loading'} />
          : node.type === 'input-otp' ? <InputOTP {...shared} value={textValue} onValueChange={change} readOnly={!interactive} loading={props.state === 'loading'} length={6} />
          : node.type === 'textarea' ? <Textarea {...shared} value={textValue} placeholder={props.placeholder} readOnly={!interactive} onChange={(event) => change(event.target.value)} maxLength={2000} rows={3} loading={props.state === 'loading'} />
            : <NativeSelect {...shared} value={selectValue} onValueChange={change} items={[{ value: '', label: props.placeholder || '선택해 주세요.' }, ...options.map((option, index) => ({ value: String(index), label: option }))]} />}
        {invalid ? <p className="sim-component-error" id={errorId} role={interactive ? 'alert' : undefined}>{invalid}</p> : null}
      </div>
      break
    }
    case 'checkbox':
      content = <div className="sim-component-check"><Checkbox label={label} description={props.text || undefined} checked={checked} onCheckedChange={change} disabled={disabled} loading={props.state === 'loading'} aria-required={props.required || undefined} aria-invalid={Boolean(invalid) || undefined} aria-describedby={invalid ? errorId : undefined} />{invalid ? <p className="sim-component-error" id={errorId} role={interactive ? 'alert' : undefined}>{invalid}</p> : null}</div>
      break
    case 'switch':
      content = <div className="sim-component-check"><Switch label={label} description={props.text || undefined} checked={checked} onCheckedChange={change} disabled={disabled} aria-invalid={Boolean(invalid) || undefined} aria-describedby={invalid ? errorId : undefined} />{invalid ? <p className="sim-component-error" id={errorId} role={interactive ? 'alert' : undefined}>{invalid}</p> : null}</div>
      break
    case 'card': {
      const card = <Card className="sim-component-card"><div className="sim-component-card-heading"><span className="sim-component-card-icon" aria-hidden="true"><Layers size={17} /></span><Typography variant="label" as="strong">{label}</Typography>{node.action.type !== 'none' ? <ArrowRight size={15} className="sim-component-action-arrow" aria-hidden="true" /> : null}</div>{props.text ? <Typography variant="caption" as="p">{props.text}</Typography> : null}{props.state === 'loading' ? <Spinner size="sm" label={`${label} 불러오는 중`} /> : null}</Card>
      content = interactive ? <button type="button" className="sim-component-card-action" aria-label={label} onClick={activate} disabled={disabled}>{card}</button> : card
      break
    }
    case 'image': {
      const image = <div className="sim-component-image"><ImageIcon size={26} strokeWidth={1.2} aria-hidden="true" /><span>{label}</span>{props.text ? <span className="sim-component-image-caption">{props.text}</span> : null}</div>
      content = interactive && node.action.type !== 'none' ? <button type="button" className="sim-component-image-action" aria-label={label} onClick={activate} disabled={disabled}>{image}</button> : image
      break
    }
    case 'tabs': {
      const tabOptions = options.length ? options : ['개요', '활동', '설정']
      const numericIndex = /^\d+$/.test(textValue) ? Number(textValue) : tabOptions.indexOf(textValue)
      const selectedIndex = numericIndex >= 0 && numericIndex < tabOptions.length ? numericIndex : 0
      content = <fieldset className="sim-component-tabs-fieldset" disabled={disabled}><Tabs className="sim-component-tabs" aria-label={label} size="sm" value={String(selectedIndex)} onValueChange={change} items={tabOptions.map((option, index) => ({ value: String(index), label: option, content: <Typography variant="caption" as="p">{props.text || `${option} 화면의 내용`}</Typography> }))} /></fieldset>
      break
    }
    case 'list': {
      const rows = options.length ? options : ['첫 번째 항목', '두 번째 항목', '세 번째 항목']
      content = <div className="sim-component-list" aria-label={label}>{rows.slice(0, 12).map((row, index) => {
        const [title, ...description] = row.split('|')
        const item = <Item className="sim-component-list-item" size="sm"><span className="sim-component-list-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><ItemContent><ItemTitle>{title.trim() || `항목 ${index + 1}`}</ItemTitle>{description.length ? <ItemDescription>{description.join(' · ').trim()}</ItemDescription> : null}</ItemContent>{node.action.type !== 'none' ? <ArrowRight size={14} aria-hidden="true" /> : null}</Item>
        return interactive ? <button type="button" key={index} className="sim-component-list-action" disabled={disabled} onClick={activate} aria-label={`${title.trim() || `항목 ${index + 1}`} 열기`}>{item}</button> : <div key={index}>{item}</div>
      })}</div>
      break
    }
    case 'table': {
      const tableLines = options.length ? options : ['이름 | 상태', '첫 번째 작업 | 진행 중', '두 번째 작업 | 완료']
      const hasHeader = tableLines[0].includes('|')
      const headers = hasHeader ? tableLines[0].split('|').map((cell) => cell.trim()) : ['항목']
      const rows = (hasHeader ? tableLines.slice(1) : tableLines).slice(0, 12).map((row) => row.split('|').map((cell) => cell.trim()))
      content = <div className="sim-component-table"><Table aria-label={label} scrollLabel={`${label} 표 영역`}><TableHeader><TableRow>{headers.map((header, index) => <TableHead key={index}>{header || `열 ${index + 1}`}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row, rowIndex) => <TableRow key={rowIndex}>{headers.map((_, columnIndex) => <TableCell key={columnIndex}>{row[columnIndex] || '—'}</TableCell>)}</TableRow>)}</TableBody></Table></div>
      break
    }
    case 'avatar':
      content = <div className="sim-component-avatar"><Avatar alt={label} fallback={Array.from(label).slice(0, 2).join('')} size="lg" />{props.text ? <Typography variant="caption" as="span">{props.text}</Typography> : null}</div>
      break
    case 'badge':
      content = <div className="sim-component-badge"><Badge variant={props.variant === 'outline' ? 'outline' : props.variant === 'primary' ? 'primary' : 'secondary'} tone={props.tone}>{label}</Badge></div>
      break
    case 'separator':
      content = <div className="sim-component-separator"><Separator decorative={false} aria-label={label} /></div>
      break
    case 'dialog':
      content = <Button className="sim-component-button" type="button" variant={buttonVariant} data-outline={props.variant === 'outline' || undefined} loading={props.state === 'loading'} disabled={props.state === 'disabled'} onClick={activate} tabIndex={interactive ? undefined : -1}><MessageSquare size={15} aria-hidden="true" />{label}</Button>
      break
  }

  return <div className={`sim-component sim-component-kind-${node.type}`} data-component-type={node.type} data-sim-state={props.state} data-interactive={interactive || undefined} aria-disabled={disabled || undefined}>{content}</div>
}
