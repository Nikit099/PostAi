import { useEffect, useRef } from 'react'

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  // Запоминаем последний callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Устанавливаем интервал
  useEffect(() => {
    // Не запускаем, если delay не установлен
    if (delay === null) {
      return
    }

    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}