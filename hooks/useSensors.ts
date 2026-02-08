import { useState, useEffect } from 'react'

interface SensorData {
  accelerometer: {
    x: number | null
    y: number | null
    z: number | null
  }
  gyroscope: {
    alpha: number | null
    beta: number | null
    gamma: number | null
  }
  magnetometer: {
    x: number | null
    y: number | null
    z: number | null
  }
  orientation: {
    alpha: number | null
    beta: number | null
    gamma: number | null
  }
  supported: {
    accelerometer: boolean
    gyroscope: boolean
    magnetometer: boolean
    orientation: boolean
  }
}

export function useSensors() {
  const [data, setData] = useState<SensorData>({
    accelerometer: { x: null, y: null, z: null },
    gyroscope: { alpha: null, beta: null, gamma: null },
    magnetometer: { x: null, y: null, z: null },
    orientation: { alpha: null, beta: null, gamma: null },
    supported: {
      accelerometer: false,
      gyroscope: false,
      magnetometer: false,
      orientation: false,
    },
  })

  useEffect(() => {
    // Проверяем поддержку различных датчиков
    const checkSensorSupport = () => {
      const supported = {
        accelerometer: 'Accelerometer' in window,
        gyroscope: 'Gyroscope' in window,
        magnetometer: 'Magnetometer' in window,
        orientation: 'DeviceOrientationEvent' in window,
      }

      setData(prev => ({
        ...prev,
        supported,
      }))

      return supported
    }

    const sensorSupport = checkSensorSupport()

    // Инициализация акселерометра
    if (sensorSupport.accelerometer) {
      try {
        const accelerometer = new (window as any).Accelerometer({ frequency: 60 })
        
        accelerometer.addEventListener('reading', () => {
          setData(prev => ({
            ...prev,
            accelerometer: {
              x: accelerometer.x,
              y: accelerometer.y,
              z: accelerometer.z,
            },
          }))
        })

        accelerometer.start()
      } catch (error) {
        console.error('Ошибка инициализации акселерометра:', error)
      }
    }

    // Инициализация гироскопа
    if (sensorSupport.gyroscope) {
      try {
        const gyroscope = new (window as any).Gyroscope({ frequency: 60 })
        
        gyroscope.addEventListener('reading', () => {
          setData(prev => ({
            ...prev,
            gyroscope: {
              alpha: gyroscope.x,
              beta: gyroscope.y,
              gamma: gyroscope.z,
            },
          }))
        })

        gyroscope.start()
      } catch (error) {
        console.error('Ошибка инициализации гироскопа:', error)
      }
    }

    // Инициализация магнитометра
    if (sensorSupport.magnetometer) {
      try {
        const magnetometer = new (window as any).Magnetometer({ frequency: 60 })
        
        magnetometer.addEventListener('reading', () => {
          setData(prev => ({
            ...prev,
            magnetometer: {
              x: magnetometer.x,
              y: magnetometer.y,
              z: magnetometer.z,
            },
          }))
        })

        magnetometer.start()
      } catch (error) {
        console.error('Ошибка инициализации магнитометра:', error)
      }
    }

    // Инициализация ориентации устройства
    if (sensorSupport.orientation) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        setData(prev => ({
          ...prev,
          orientation: {
            alpha: event.alpha,
            beta: event.beta,
            gamma: event.gamma,
          },
        }))
      }

      window.addEventListener('deviceorientation', handleOrientation)

      return () => {
        window.removeEventListener('deviceorientation', handleOrientation)
      }
    }
  }, [])

  // Вычисление наклона устройства на основе акселерометра
  const calculateTilt = () => {
    const { x, y, z } = data.accelerometer
    
    if (x === null || y === null || z === null) {
      return { tiltX: 0, tiltY: 0 }
    }

    // Вычисляем углы наклона
    const tiltX = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI)
    const tiltY = Math.atan2(-x, Math.sqrt(y * y + z * z)) * (180 / Math.PI)

    return { tiltX, tiltY }
  }

  // Вычисление направления на основе магнитометра
  const calculateHeading = () => {
    const { x, y } = data.magnetometer
    
    if (x === null || y === null) {
      return null
    }

    // Вычисляем направление в градусах
    let heading = Math.atan2(y, x) * (180 / Math.PI)
    
    // Нормализуем от 0 до 360
    if (heading < 0) {
      heading += 360
    }

    return heading
  }

  // Проверка встряхивания устройства
  const isShaking = (threshold: number = 15): boolean => {
    const { x, y, z } = data.accelerometer
    
    if (x === null || y === null || z === null) {
      return false
    }

    // Вычисляем общее ускорение
    const acceleration = Math.sqrt(x * x + y * y + z * z)
    
    // Порог для определения встряхивания
    return acceleration > threshold
  }

  return {
    data,
    calculateTilt,
    calculateHeading,
    isShaking,
  }
}