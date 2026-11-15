import { createContext, useContext } from 'react'

export const FieldContext = createContext<{
  controlId: string
  labelId?: string
  describedBy?: string
  invalid: boolean
} | null>(null)

export function useFieldContext() {
  return useContext(FieldContext)
}

export function mergeDescriptionIds(...ids: Array<string | undefined>) {
  return ids.filter(Boolean).join(' ') || undefined
}
