import { useState, useEffect } from 'react'

interface DeviceMotion {
  acceleration: {
    x: number | null
    y: number | null
    z: number | null
  }
  accelerationIncludingGravity: {
    x: number | null
    y: number | null
    z: number | null
  }
  rotationRate: {
    alpha: number | null
    beta: number | null
    gamma: number | null
  }
  interval: number | null
  supported: boolean | 'pending'
}

export function useDeviceMotion(): DeviceMotion & { requestPermission: () => Promise<boolean> } {
  const [motion, setMotion] = useState<DeviceMotion>({
    acceleration: { x: null, y: null, z: null },
    accelerationIncludingGravity: { x: null, y: null, z: null },
    rotationRate: { alpha: null, beta: null, gamma: null },
    interval: null,
    supported: false,
  })

  useEffect(() => {
    // Проверяем поддержку Device Motion API
    if (!('DeviceMotionEvent' in window)) {
      setMotion(prev => ({ ...prev, supported: false }))
      return
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      setMotion({
        acceleration: {
          x: event.acceleration?.x ?? null,
          y: event.acceleration?.y ?? null,
          z: event.acceleration?.z ?? null,
        },
        accelerationIncludingGravity: {
          x: event.accelerationIncludingGravity?.x ?? null,
          y: event.accelerationIncludingGravity?.y ?? null,
          z: event.accelerationIncludingGravity?.z ?? null,
        },
        rotationRate: {
          alpha: event.rotationRate?.alpha ?? null,
          beta: event.rotationRate?.beta ?? null,
          gamma: event.rotationRate?.gamma ?? null,
        },
        interval: event.interval ?? null,
        supported: true,
      })
    }

    const handleMotionPermission = () => {
      // Запрашиваем разрешение на доступ к движению (для iOS 13+)
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        (DeviceMotionEvent as any)
          .requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              window.addEventListener('devicemotion', handleMotion)
            }
          })
          .catch(console.error)
      } else {
        // Для других устройств просто добавляем обработчик
        window.addEventListener('devicemotion', handleMotion)
      }
    }

    // Проверяем, нужно ли запрашивать разрешение
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      // Для iOS 13+ показываем кнопку для запроса разрешения
      setMotion(prev => ({ ...prev, supported: 'pending' as any }))
    } else {
      // Для других устройств сразу добавляем обработчик
      window.addEventListener('devicemotion', handleMotion)
      setMotion(prev => ({ ...prev, supported: true }))
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion)
    }
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    if (typeof (DeviceMotionEvent as any).requestPermission !== 'function') {
      return true
    }

    try {
      const permissionState = await (DeviceMotionEvent as any).requestPermission()
      if (permissionState === 'granted') {
        setMotion(prev => ({ ...prev, supported: true }))
        return true
      }
      return false
    } catch (error) {
      console.error('Ошибка при запросе разрешения на движение:', error)
      return false
    }
  }

  return {
    ...motion,
    requestPermission,
  }
}