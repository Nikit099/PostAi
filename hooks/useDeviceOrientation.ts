import { useState, useEffect } from 'react'

interface DeviceOrientation {
  alpha: number | null // Вращение вокруг оси Z (0-360 градусов)
  beta: number | null  // Вращение вокруг оси X (-180 до 180 градусов)
  gamma: number | null // Вращение вокруг оси Y (-90 до 90 градусов)
  absolute: boolean | null
  supported: boolean | 'pending'
}

export function useDeviceOrientation(): DeviceOrientation & { requestPermission: () => Promise<boolean> } {
  const [orientation, setOrientation] = useState<DeviceOrientation>({
    alpha: null,
    beta: null,
    gamma: null,
    absolute: null,
    supported: false,
  })

  useEffect(() => {
    // Проверяем поддержку Device Orientation API
    if (!('DeviceOrientationEvent' in window)) {
      setOrientation(prev => ({ ...prev, supported: false }))
      return
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute,
        supported: true,
      })
    }

    const handleOrientationPermission = () => {
      // Запрашиваем разрешение на доступ к ориентации (для iOS 13+)
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any)
          .requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation)
            }
          })
          .catch(console.error)
      } else {
        // Для других устройств просто добавляем обработчик
        window.addEventListener('deviceorientation', handleOrientation)
      }
    }

    // Проверяем, нужно ли запрашивать разрешение
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // Для iOS 13+ показываем кнопку для запроса разрешения
      setOrientation(prev => ({ ...prev, supported: 'pending' as any }))
    } else {
      // Для других устройств сразу добавляем обработчик
      window.addEventListener('deviceorientation', handleOrientation)
      setOrientation(prev => ({ ...prev, supported: true }))
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
      return true
    }

    try {
      const permissionState = await (DeviceOrientationEvent as any).requestPermission()
      if (permissionState === 'granted') {
        setOrientation(prev => ({ ...prev, supported: true }))
        return true
      }
      return false
    } catch (error) {
      console.error('Ошибка при запросе разрешения на ориентацию:', error)
      return false
    }
  }

  return {
    ...orientation,
    requestPermission,
  }
}