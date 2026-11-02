import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
export type NativeLabScreen = 'wallet' | 'tasks' | 'activity'
export type NativeLabTabStyle = 'standard' | 'floating' | 'pill'
export type Task = { id: string; title: string; date: string; done: boolean }
export type Transaction = { id: string; title: string; subtitle: string; amount: number }
type LabState = { embedded: boolean; screen: NativeLabScreen; setScreen: Dispatch<SetStateAction<NativeLabScreen>>; tabStyle: NativeLabTabStyle; setTabStyle: Dispatch<SetStateAction<NativeLabTabStyle>>; centerAction: boolean; setCenterAction: Dispatch<SetStateAction<boolean>>; mode: 'light' | 'dark'; setMode: Dispatch<SetStateAction<'light' | 'dark'>>; tasks: Task[]; setTasks: Dispatch<SetStateAction<Task[]>>; transactions: Transaction[]; setTransactions: Dispatch<SetStateAction<Transaction[]>> }
const Context = createContext<LabState | null>(null)
export function LabStateProvider({ children, embedded = false }: { children: ReactNode; embedded?: boolean }) {
  const [screen, setScreen] = useState<NativeLabScreen>('wallet')
  const [tabStyle, setTabStyle] = useState<NativeLabTabStyle>('floating')
  const [centerAction, setCenterAction] = useState(true)
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const [tasks, setTasks] = useState<Task[]>([{ id: '1', title: '모바일 첫 화면 다듬기', date: '2026-10-26', done: false }, { id: '2', title: '디자인 토큰 공유하기', date: '2026-10-26', done: true }, { id: '3', title: '다음 흐름 검토하기', date: '2026-10-27', done: false }])
  const [transactions, setTransactions] = useState<Transaction[]>([{ id: '1', title: 'Workspace', subtitle: '오늘 · 구독', amount: -15.49 }, { id: '2', title: 'Monthly savings', subtitle: '어제 · 저축', amount: 240 }, { id: '3', title: 'Design resources', subtitle: '10월 24일', amount: -32 }])
  return <Context.Provider value={{ embedded, screen, setScreen, tabStyle, setTabStyle, centerAction, setCenterAction, mode, setMode, tasks, setTasks, transactions, setTransactions }}>{children}</Context.Provider>
}
export function useLabState() { const value = useContext(Context); if (!value) throw new Error('LabStateProvider is required'); return value }
