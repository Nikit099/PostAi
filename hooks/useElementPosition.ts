import { useState, useEffect, RefObject } from 'react'

interface ElementPosition {
  x: number
  y: number
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

export function useElementPosition<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>
): ElementPosition {
  const [position, setPosition] = useState<ElementPosition>({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const updatePosition = () => {
      const rect = element.getBoundingClientRect()
      
      setPosition({
        x: rect.x,
        y: rect.y,
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      })
    }

    // Устанавливаем начальную позицию
    updatePosition()

    // Создаем ResizeObserver для отслеживания изменений
    const resizeObserver = new ResizeObserver(updatePosition)
    resizeObserver.observe(element)

    // Добавляем обработчики событий
    window.addEventListener('scroll', updatePosition, { passive: true })
    window.addEventListener('resize', updatePosition)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    }
  }, [ref])

  return position
}