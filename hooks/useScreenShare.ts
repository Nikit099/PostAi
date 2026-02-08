import { useState, useRef, useCallback } from 'react'

interface ScreenShareOptions {
  audio?: boolean
  video?: boolean | MediaTrackConstraints
  surface?: 'window' | 'screen' | 'browser'
  onError?: (error: string) => void
}

export function useScreenShare(options: ScreenShareOptions = {}) {
  const {
    audio = false,
    video = true,
    surface = 'screen',
    onError,
  } = options
  
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAudioSupported, setIsAudioSupported] = useState(false)

  const checkAudioSupport = useCallback(async () => {
    try {
      // Проверяем поддержку захвата аудио с экрана
      const displayMedia = navigator.mediaDevices as any
      if (displayMedia && displayMedia.getDisplayMedia) {
        const stream = await displayMedia.getDisplayMedia({ video: true, audio: true })
        const hasAudio = stream.getAudioTracks().length > 0
        stream.getTracks().forEach(track => track.stop())
        setIsAudioSupported(hasAudio)
        return hasAudio
      }
      return false
    } catch {
      return false
    }
  }, [])

  const startScreenShare = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      const errorMsg = 'Демонстрация экрана не поддерживается вашим браузером'
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const displayMedia = navigator.mediaDevices as any
      const constraints: any = {
        video: video === true ? {} : video,
      }

      // Добавляем аудио, если поддерживается и запрошено
      if (audio) {
        const hasAudioSupport = await checkAudioSupport()
        if (hasAudioSupport) {
          constraints.audio = true
        }
      }

      // Указываем тип поверхности для захвата
      if (surface && displayMedia.getDisplayMedia) {
        constraints.video = {
          ...constraints.video,
          displaySurface: surface,
        }
      }

      const stream = await displayMedia.getDisplayMedia(constraints)
      streamRef.current = stream

      // Обработчик остановки демонстрации экрана пользователем
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare()
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setIsActive(true)
      return true
    } catch (err) {
      let errorMsg = 'Не удалось начать демонстрацию экрана'
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMsg = 'Доступ к демонстрации экрана запрещен'
        } else if (err.name === 'NotFoundError') {
          errorMsg = 'Нет доступных источников для демонстрации'
        } else if (err.name === 'NotReadableError') {
          errorMsg = 'Не удалось получить доступ к источнику демонстрации'
        } else if (err.name === 'OverconstrainedError') {
          errorMsg = 'Запрошенные настройки демонстрации не поддерживаются'
        }
      }
      
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [audio, video, surface, onError, checkAudioSupport])

  const stopScreenShare = useCallback(() => {
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
  }, [])

  const toggleScreenShare = useCallback(() => {
    if (isActive) {
      stopScreenShare()
    } else {
      startScreenShare()
    }
  }, [isActive, startScreenShare, stopScreenShare])

  const getScreenStream = useCallback((): MediaStream | null => {
    return streamRef.current
  }, [])

  const takeScreenshot = useCallback((): string | null => {
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
    
    return canvas.toDataURL('image/png')
  }, [isActive])

  // Очищаем ресурсы при размонтировании
  useState(() => {
    return () => {
      stopScreenShare()
    }
  })

  return {
    videoRef,
    isActive,
    isLoading,
    error,
    isAudioSupported,
    startScreenShare,
    stopScreenShare,
    toggleScreenShare,
    getScreenStream,
    takeScreenshot,
    checkAudioSupport,
  }
}