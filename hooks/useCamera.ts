import { useState, useRef, useCallback } from 'react'

interface CameraConstraints {
  facingMode?: 'user' | 'environment'
  width?: number
  height?: number
  aspectRatio?: number
  frameRate?: number
}

interface UseCameraOptions {
  constraints?: CameraConstraints
  onError?: (error: string) => void
}

export function useCamera(options: UseCameraOptions = {}) {
  const { constraints = {}, onError } = options
  
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  const getCameraDevices = useCallback(async () => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput')
      setDevices(videoDevices)
      return videoDevices
    } catch (err) {
      const errorMsg = 'Не удалось получить список камер'
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return []
    }
  }, [onError])

  const startCamera = useCallback(async (deviceId?: string) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      const errorMsg = 'Камера не поддерживается вашим браузером'
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const defaultConstraints: MediaStreamConstraints = {
        video: {
          facingMode: constraints.facingMode || 'environment',
          width: constraints.width || { ideal: 1280 },
          height: constraints.height || { ideal: 720 },
          aspectRatio: constraints.aspectRatio || 16/9,
          frameRate: constraints.frameRate || { ideal: 30 },
          ...(deviceId && { deviceId: { exact: deviceId } }),
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(defaultConstraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setIsActive(true)
      setSelectedDeviceId(deviceId || null)

      // Получаем список устройств после успешного запуска
      await getCameraDevices()

      return true
    } catch (err) {
      let errorMsg = 'Не удалось получить доступ к камере'
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMsg = 'Доступ к камере запрещен. Разрешите доступ в настройках браузера.'
        } else if (err.name === 'NotFoundError') {
          errorMsg = 'Камера не найдена'
        } else if (err.name === 'NotReadableError') {
          errorMsg = 'Камера уже используется другим приложением'
        } else if (err.name === 'OverconstrainedError') {
          errorMsg = 'Запрошенные настройки камеры не поддерживаются'
        }
      }
      
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [constraints, getCameraDevices, onError])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsActive(false)
    setSelectedDeviceId(null)
  }, [])

  const switchCamera = useCallback(async () => {
    if (!devices.length) {
      await getCameraDevices()
    }

    if (devices.length < 2) {
      const errorMsg = 'Доступна только одна камера'
      setError(errorMsg)
      return false
    }

    const currentIndex = devices.findIndex(device => device.deviceId === selectedDeviceId)
    const nextIndex = (currentIndex + 1) % devices.length
    const nextDevice = devices[nextIndex]

    stopCamera()
    return startCamera(nextDevice.deviceId)
  }, [devices, selectedDeviceId, startCamera, stopCamera, getCameraDevices])

  const takePhoto = useCallback((): string | null => {
    if (!videoRef.current || !isActive) {
      return null
    }

    const canvas = document.createElement('canvas')
    const video = videoRef.current
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const context = canvas.getContext('2d')
    if (!context) {
      return null
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    return canvas.toDataURL('image/jpeg', 0.9)
  }, [isActive])

  const toggleCamera = useCallback(() => {
    if (isActive) {
      stopCamera()
    } else {
      startCamera()
    }
  }, [isActive, startCamera, stopCamera])

  // Очищаем ресурсы при размонтировании
  useState(() => {
    return () => {
      stopCamera()
    }
  })

  return {
    videoRef,
    isActive,
    isLoading,
    error,
    devices,
    selectedDeviceId,
    startCamera,
    stopCamera,
    switchCamera,
    takePhoto,
    toggleCamera,
    getCameraDevices,
  }
}