import { useState, useEffect, RefObject } from 'react'

interface ElementSize {
  width: number
  height: number
}

export function useElementSize<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>
): ElementSize {
  const [size, setSize] = useState<ElementSize>({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const updateSize = () => {
      setSize({
        width: element.offsetWidth,
        height: element.offsetHeight,
      })
    }

    // Устанавливаем начальный размер
    updateSize()

    // Создаем ResizeObserver для отслеживания изменений размера
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(element)

    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', updateSize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [ref])

  return size
}