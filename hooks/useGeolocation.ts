import { useState, useEffect } from 'react'

// Удаляем кастомный интерфейс и используем встроенные типы
// Встроенный тип GeolocationPosition уже имеет структуру { coords: GeolocationCoordinates, timestamp: number }

// Удаляем кастомный GeolocationError, используем встроенный GeolocationPositionError

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watch?: boolean
}

// Интерфейс для нашего состояния
interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  altitude: number | null
  altitudeAccuracy: number | null
  heading: number | null
  speed: number | null
  timestamp: number | null
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false,
  } = options

  const [position, setPosition] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
  })

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается вашим браузером')
      return
    }

    const handleSuccess = (pos: GeolocationPosition) => {
      setPosition({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        altitude: pos.coords.altitude,
        altitudeAccuracy: pos.coords.altitudeAccuracy,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
        timestamp: pos.timestamp,
      })
      setError(null)
      setIsLoading(false)
    }

    const handleError = (err: GeolocationPositionError) => {
      let message = 'Не удалось получить геолокацию'
      
      switch (err.code) {
        case 1:
          message = 'Доступ к геолокации запрещен'
          break
        case 2:
          message = 'Не удалось определить местоположение'
          break
        case 3:
          message = 'Время ожидания истекло'
          break
      }
      
      setError(message)
      setIsLoading(false)
    }

    const geoOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
    }

    setIsLoading(true)

    let watchId: number | null = null

    if (watch) {
      watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        geoOptions
      )
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        geoOptions
      )
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [enableHighAccuracy, timeout, maximumAge, watch])

  return {
    position,
    error,
    isLoading,
    hasPosition: position.latitude !== null && position.longitude !== null,
  }
}