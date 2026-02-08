import { useEffect, useRef } from 'react'

export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  // Запоминаем последний callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Устанавливаем таймаут
  useEffect(() => {
    // Не запускаем, если delay не установлен
    if (delay === null) {
      return
    }

    const id = setTimeout(() => savedCallback.current(), delay)
    return () => clearTimeout(id)
  }, [delay])
}