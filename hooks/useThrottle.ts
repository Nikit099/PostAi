import { useRef, useCallback } from 'react'

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout>()

  const throttledFunction = useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    const timeSinceLastRun = now - lastRan.current

    if (timeSinceLastRun >= delay) {
      // Выполняем сразу, если прошло достаточно времени
      callback(...args)
      lastRan.current = now
    } else {
      // Очищаем предыдущий таймаут
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Устанавливаем новый таймаут
      timeoutRef.current = setTimeout(() => {
        callback(...args)
        lastRan.current = Date.now()
      }, delay - timeSinceLastRun)
    }
  }, [callback, delay])

  // Очищаем таймаут при размонтировании
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  // Используем useEffect для очистки, но возвращаем функцию
  return useCallback((...args: Parameters<T>) => {
    throttledFunction(...args)
    return cleanup
  }, [throttledFunction, cleanup]) as T
}