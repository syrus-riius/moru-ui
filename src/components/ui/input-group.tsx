import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Input, type InputProps } from './input'
import { Textarea, type TextareaProps } from './textarea'
import { Button, type ButtonProps } from './button'
import './controls-completion.css'

export type InputGroupProps = HTMLAttributes<HTMLDivElement>
export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={cn('ui-input-group', className)} />
})
export type InputGroupAddonProps = HTMLAttributes<HTMLDivElement> & { align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end' }
export function InputGroupAddon({ align = 'inline-start', className, ...props }: InputGroupAddonProps) {
  return <div {...props} className={cn('ui-input-group-addon', className)} data-align={align} />
}
export const InputGroupInput = forwardRef<HTMLInputElement, InputProps>(function InputGroupInput({ className, ...props }, ref) {
  return <Input {...props} ref={ref} className={cn('ui-input-group-input', className)} />
})
export const InputGroupTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function InputGroupTextarea({ className, ...props }, ref) {
  return <Textarea {...props} ref={ref} className={cn('ui-input-group-textarea', className)} />
})
export const InputGroupButton = forwardRef<HTMLButtonElement, ButtonProps>(function InputGroupButton({ variant = 'ghost', size = 'sm', className, ...props }, ref) {
  return <Button {...props} ref={ref} variant={variant} size={size} className={cn('ui-input-group-button', className)} />
})
