import { useState, useEffect } from 'react'

interface WindowSize {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setWindowSize({
        width,
        height,
        isMobile: width < 640,    // sm breakpoint
        isTablet: width >= 640 && width < 1024, // sm to lg
        isDesktop: width >= 1024, // lg and above
      })
    }

    // Устанавливаем начальные значения
    handleResize()

    // Добавляем обработчик события
    window.addEventListener('resize', handleResize)

    // Убираем обработчик при размонтировании
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}