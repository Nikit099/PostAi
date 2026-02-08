import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Устанавливаем таймер для обновления значения после задержки
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Очищаем таймер при каждом изменении value или при размонтировании
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}