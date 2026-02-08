import { useCallback } from 'react'

interface UsePrintOptions {
  onBeforePrint?: () => void
  onAfterPrint?: () => void
}

export function usePrint(options: UsePrintOptions = {}) {
  const { onBeforePrint, onAfterPrint } = options

  const print = useCallback(() => {
    if (onBeforePrint) {
      onBeforePrint()
    }

    window.print()

    if (onAfterPrint) {
      // Используем setTimeout, чтобы убедиться, что печать завершена
      setTimeout(onAfterPrint, 100)
    }
  }, [onBeforePrint, onAfterPrint])

  const printElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error(`Элемент с id "${elementId}" не найден`)
      return
    }

    if (onBeforePrint) {
      onBeforePrint()
    }

    // Сохраняем исходный HTML
    const originalContents = document.body.innerHTML
    
    // Заменяем содержимое body на элемент для печати
    document.body.innerHTML = element.innerHTML
    
    // Печатаем
    window.print()
    
    // Восстанавливаем исходное содержимое
    document.body.innerHTML = originalContents

    if (onAfterPrint) {
      setTimeout(onAfterPrint, 100)
    }
  }, [onBeforePrint, onAfterPrint])

  const printHTML = useCallback((html: string) => {
    if (onBeforePrint) {
      onBeforePrint()
    }

    // Сохраняем исходный HTML
    const originalContents = document.body.innerHTML
    
    // Заменяем содержимое body на переданный HTML
    document.body.innerHTML = html
    
    // Печатаем
    window.print()
    
    // Восстанавливаем исходное содержимое
    document.body.innerHTML = originalContents

    if (onAfterPrint) {
      setTimeout(onAfterPrint, 100)
    }
  }, [onBeforePrint, onAfterPrint])

  return {
    print,
    printElement,
    printHTML,
  }
}