import { useState, useEffect } from 'react'

export function useActiveElement(): Element | null {
  const [activeElement, setActiveElement] = useState<Element | null>(null)

  useEffect(() => {
    const handleFocusIn = () => {
      setActiveElement(document.activeElement)
    }

    const handleFocusOut = () => {
      setActiveElement(document.activeElement)
    }

    // Устанавливаем начальное значение
    setActiveElement(document.activeElement)

    // Добавляем обработчики событий
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [])

  return activeElement
}