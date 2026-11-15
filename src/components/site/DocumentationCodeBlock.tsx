import { cn } from '../../lib/cn'
import { CodeBlock, type CodeBlockProps } from '../ui/code-block'
import './documentation-code-block.css'

/** Documentation chrome is explicit so it never restyles live component examples. */
export function DocumentationCodeBlock({ className, ...props }: CodeBlockProps) {
  return <CodeBlock {...props} className={cn('moru-doc-code', className)} />
}
