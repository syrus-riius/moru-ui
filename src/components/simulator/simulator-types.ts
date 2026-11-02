export const nodeTypes = ['text', 'button', 'input', 'input-otp', 'textarea', 'select', 'checkbox', 'switch', 'card', 'image', 'tabs', 'list', 'table', 'avatar', 'badge', 'separator', 'dialog', 'chart', 'container'] as const
export type SimNodeType = typeof nodeTypes[number]
export type SimStyle = 'wireframe' | 'moru'
export type SimNodeState = 'default' | 'disabled' | 'error' | 'loading'
export interface SimLayout {
  mode: 'free' | 'vertical' | 'horizontal' | 'grid'
  gap: number
  padding: number
  align: 'start' | 'center' | 'end' | 'stretch'
  justify: 'start' | 'center' | 'end' | 'between'
  columns: number
  tabletColumns: number
  mobileColumns: number
  stackOnMobile: boolean
}
export interface SimLayoutItem {
  width: 'fill' | 'fixed'
  height: 'hug' | 'fixed'
}
export interface SimProps {
  label: string
  text: string
  placeholder: string
  value: string
  options: string[]
  variant: 'primary' | 'secondary' | 'outline' | 'ghost'
  state: SimNodeState
  tone: 'info' | 'success' | 'warning' | 'danger'
  checked: boolean
  required: boolean
  inputType: 'text' | 'email' | 'password'
  textRole: 'heading' | 'body' | 'caption'
}
export interface SimAction {
  type: 'none' | 'navigate' | 'back' | 'dialog' | 'toast'
  targetScreenId: string
  message: string
  validate: boolean
}
export interface SimNode {
  id: string
  type: SimNodeType
  x: number
  y: number
  width: number
  height: number
  props: SimProps
  action: SimAction
  /** Children store local coordinates; the layout resolver returns absolute frame coordinates. */
  parentId?: string
  layout?: SimLayout
  layoutItem?: SimLayoutItem
}
export interface SimScreen {
  id: string
  name: string
  width: number
  height: number
  nodes: SimNode[]
  layout?: SimLayout
}
export interface SimProject {
  schemaVersion: 1
  name: string
  startScreenId: string
  style: SimStyle
  screens: SimScreen[]
}
export interface SimComponentDefinition {
  type: SimNodeType
  label: string
  description: string
  category: '레이아웃' | '기본' | '입력' | '콘텐츠'
  width: number
  height: number
}
export type SimRuntimeValue = string | boolean
export type SimRuntimeValues = Record<string, SimRuntimeValue>
export type SimNodePatch = Partial<Omit<SimNode, 'id' | 'type' | 'props' | 'action'>> & { props?: Partial<SimProps>; action?: Partial<SimAction> }
