import { useState, useEffect, RefObject } from 'react'

interface VisibilityOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
}

export function useElementVisibility<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  options: VisibilityOptions = {}
): boolean {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const {
      threshold = 0,
      root = null,
      rootMargin = '0px',
    } = options

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        threshold,
        root,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [ref, options.threshold, options.root, options.rootMargin])

  return isVisible
}