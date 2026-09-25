import { createContext, useContext, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Json, NavigationHistory } from './history'

function compatible(saved: Json, initial: Json): boolean {
  if (initial === null) return saved === null || typeof saved === 'string'
  if (Array.isArray(initial)) return Array.isArray(saved) && saved.every(v => typeof v === 'string' || typeof v === 'number')
  if (typeof initial === 'object') return saved !== null && typeof saved === 'object' && !Array.isArray(saved) && Object.entries(initial).every(([key, value]) => key in saved && compatible(saved[key], value))
  return typeof saved === typeof initial
}

export const NavigationContext = createContext<NavigationHistory | null>(null)
export function usePageState<T extends Json>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const navigation = useContext(NavigationContext)
  const [value, setValue] = useState<T>(() => {
    const saved = navigation?.current.ui[key]
    return saved !== undefined && compatible(saved, initial) ? saved as T : initial
  })
  const valueRef = useRef(value)
  const update: Dispatch<SetStateAction<T>> = next => {
    const result = typeof next === 'function' ? next(valueRef.current) : next
    if (Object.is(result, valueRef.current)) return
    valueRef.current = result
    navigation?.saveUI(key, result)
    setValue(result)
  }
  return [value, update]
}
