import { useEffect, useState } from 'react'
import { useTheme as useNextTheme } from 'next-themes'

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const currentTheme = theme === 'system' ? systemTheme : theme

  return {
    theme: currentTheme,
    systemTheme,
    setTheme,
    toggleTheme,
    mounted,
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light',
  }
}