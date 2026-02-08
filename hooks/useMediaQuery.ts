import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Проверяем, что код выполняется на клиенте
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(query)
    
    // Устанавливаем начальное значение
    setMatches(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Добавляем обработчик для современных браузеров
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback для старых браузеров
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [query])

  return matches
}

// Предопределенные медиа-запросы для Tailwind CSS breakpoints
export const MEDIA_QUERIES = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
  
  hover: '(hover: hover)',
  noHover: '(hover: none)',
  
  touch: '(pointer: coarse)',
  finePointer: '(pointer: fine)',
  
  reducedMotion: '(prefers-reduced-motion: reduce)',
  noReducedMotion: '(prefers-reduced-motion: no-preference)',
  
  highContrast: '(prefers-contrast: high)',
  lowContrast: '(prefers-contrast: low)',
}