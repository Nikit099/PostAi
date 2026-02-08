import { useState, useEffect } from 'react'

interface NetworkStatus {
  isOnline: boolean
  isOffline: boolean
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  })

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: true,
        isOffline: false,
      }))
    }

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        isOffline: true,
      }))
    }

    const handleChange = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        setStatus({
          isOnline: navigator.onLine,
          isOffline: !navigator.onLine,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        })
      } else {
        setStatus({
          isOnline: navigator.onLine,
          isOffline: !navigator.onLine,
        })
      }
    }

    // Устанавливаем начальное состояние
    handleChange()

    // Добавляем обработчики событий
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Добавляем обработчик изменения соединения, если поддерживается
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', handleChange)
    }

    // Убираем обработчики при размонтировании
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)

      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        connection.removeEventListener('change', handleChange)
      }
    }
  }, [])

  return status
}