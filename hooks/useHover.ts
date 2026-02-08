import { useState, RefObject } from 'react'
import { useEventListener } from './useEventListener'

export function useHover<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>
): boolean {
  const [isHovered, setIsHovered] = useState(false)

  useEventListener('mouseenter', () => setIsHovered(true), ref)
  useEventListener('mouseleave', () => setIsHovered(false), ref)

  return isHovered
}