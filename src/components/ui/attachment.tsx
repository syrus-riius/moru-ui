import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { FileText, RotateCcw, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from './button'
import './content-completion.css'

export type AttachmentStatus = 'idle' | 'uploading' | 'processing' | 'error' | 'done'
export function formatFileSize(bytes: number, locale = 'ko-KR') {
  if (!Number.isFinite(bytes) || bytes < 0) return '크기 알 수 없음'
  if (bytes < 1024) return `${Math.round(bytes)} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)) - 1, units.length - 1)
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / (1024 ** (index + 1)))} ${units[index]}`
}
export function getFileExtension(name: string) {
  const lastDot = name.lastIndexOf('.')
  return lastDot > 0 && lastDot < name.length - 1 ? name.slice(lastDot + 1).toUpperCase() : 'FILE'
}
export interface AttachmentProps extends HTMLAttributes<HTMLDivElement> {
  fileName?: string
  fileSize?: number
  media?: ReactNode
  status?: AttachmentStatus
  progress?: number
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
  onRemove?: () => void
  onRetry?: () => void
}
export const Attachment = forwardRef<HTMLDivElement, AttachmentProps>(function Attachment({
  fileName, fileSize, media, status = 'idle', progress, size = 'md', orientation = 'horizontal', disabled, onRemove, onRetry, className, children, ...props
}, ref) {
  const percent = typeof progress === 'number' && Number.isFinite(progress) ? Math.round(Math.max(0, Math.min(100, progress))) : undefined
  const stateText = status === 'uploading' ? `업로드 중${percent === undefined ? '' : ` · ${percent}%`}` : status === 'processing' ? '처리 중' : status === 'error' ? '업로드 실패' : status === 'done' ? '완료' : null
  return <div {...props} ref={ref} className={cn('ui-attachment', className)} data-status={status} data-size={size} data-orientation={orientation} aria-busy={status === 'uploading' || status === 'processing' || undefined}>
    {fileName ? <>
      <AttachmentMedia>{media ?? <FileText aria-hidden="true" />}</AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{fileName}</AttachmentTitle>
        <AttachmentDescription>{getFileExtension(fileName)}{fileSize === undefined ? '' : ` · ${formatFileSize(fileSize)}`}</AttachmentDescription>
        {stateText && <span className="ui-attachment-state" role={status === 'error' ? 'alert' : 'status'}>{stateText}</span>}
        {status === 'uploading' && <progress className="ui-attachment-progress" max={100} value={percent} aria-label={`${fileName} 업로드`} />}
      </AttachmentContent>
      {(onRemove || (status === 'error' && onRetry)) && <AttachmentActions>
        {status === 'error' && onRetry && <Button variant="ghost" size="sm" aria-label={`${fileName} 다시 시도`} disabled={disabled} onClick={onRetry}><RotateCcw size={14} aria-hidden="true" /></Button>}
        {onRemove && <Button variant="ghost" size="sm" aria-label={`${fileName} 제거`} disabled={disabled} onClick={onRemove}><X size={14} aria-hidden="true" /></Button>}
      </AttachmentActions>}
    </> : children}
  </div>
})
export function AttachmentMedia({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-attachment-media', className)} /> }
export function AttachmentContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-attachment-content', className)} /> }
export function AttachmentTitle({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-attachment-title', className)} /> }
export function AttachmentDescription({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-attachment-description', className)} /> }
export function AttachmentActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-attachment-actions', className)} /> }
export function AttachmentGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-attachment-group', className)} /> }
