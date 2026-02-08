import { useCallback } from 'react'

interface VibrationPattern {
  duration: number
  pause?: number
}

export function useVibration() {
  const vibrate = useCallback((pattern: number | number[] | VibrationPattern[]) => {
    // Проверяем поддержку Vibration API
    if (!navigator.vibrate) {
      console.warn('Vibration API не поддерживается вашим устройством')
      return false
    }

    try {
      let vibrationPattern: number | number[]
      
      if (Array.isArray(pattern)) {
        // Если pattern - массив объектов VibrationPattern
        if (pattern.length > 0 && typeof pattern[0] === 'object') {
          const typedPattern = pattern as VibrationPattern[]
          vibrationPattern = typedPattern.flatMap(p => [p.duration, p.pause || 0])
          // Убираем последнюю паузу, если она есть
          if (vibrationPattern.length > 0) {
            vibrationPattern = vibrationPattern.slice(0, -1)
          }
        } else {
          // Если pattern - уже массив чисел
          vibrationPattern = pattern as number[]
        }
      } else {
        // Если pattern - одно число
        vibrationPattern = pattern
      }

      return navigator.vibrate(vibrationPattern)
    } catch (error) {
      console.error('Ошибка при вызове вибрации:', error)
      return false
    }
  }, [])

  const vibrateOnce = useCallback((duration: number = 100) => {
    return vibrate(duration)
  }, [vibrate])

  const vibrateSuccess = useCallback(() => {
    return vibrate([50, 50, 50])
  }, [vibrate])

  const vibrateError = useCallback(() => {
    return vibrate([200, 100, 200])
  }, [vibrate])

  const vibrateWarning = useCallback(() => {
    return vibrate([100, 50, 100, 50, 100])
  }, [vibrate])

  const vibrateNotification = useCallback(() => {
    return vibrate([100, 50, 100])
  }, [vibrate])

  const cancelVibration = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(0)
    }
  }, [])

  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

  return {
    vibrate,
    vibrateOnce,
    vibrateSuccess,
    vibrateError,
    vibrateWarning,
    vibrateNotification,
    cancelVibration,
    isSupported,
  }
}