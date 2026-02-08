import { useState, RefObject } from 'react'
import { useEventListener } from './useEventListener'

export function useFocus<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>
): boolean {
  const [isFocused, setIsFocused] = useState(false)

  useEventListener('focus', () => setIsFocused(true), ref)
  useEventListener('blur', () => setIsFocused(false), ref)

  return isFocused
}