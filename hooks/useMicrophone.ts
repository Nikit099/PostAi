import { useState, useRef, useCallback } from 'react'

interface MicrophoneConstraints {
  echoCancellation?: boolean
  noiseSuppression?: boolean
  autoGainControl?: boolean
  sampleRate?: number
  channelCount?: number
}

interface UseMicrophoneOptions {
  constraints?: MicrophoneConstraints
  onError?: (error: string) => void
}

export function useMicrophone(options: UseMicrophoneOptions = {}) {
  const { constraints = {}, onError } = options
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolume] = useState(0)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  const getMicrophoneDevices = useCallback(async () => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices()
      const audioDevices = mediaDevices.filter(device => device.kind === 'audioinput')
      setDevices(audioDevices)
      return audioDevices
    } catch (err) {
      const errorMsg = 'Не удалось получить список микрофонов'
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return []
    }
  }, [onError])

  const startMicrophone = useCallback(async (deviceId?: string) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      const errorMsg = 'Микрофон не поддерживается вашим браузером'
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const defaultConstraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: constraints.echoCancellation ?? true,
          noiseSuppression: constraints.noiseSuppression ?? true,
          autoGainControl: constraints.autoGainControl ?? true,
          sampleRate: constraints.sampleRate ?? 44100,
          channelCount: constraints.channelCount ?? 1,
          ...(deviceId && { deviceId: { exact: deviceId } }),
        },
        video: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(defaultConstraints)
      streamRef.current = stream

      // Создаем AudioContext для анализа звука
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioContext()
      
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.8
      
      source.connect(analyserRef.current)

      // Запускаем мониторинг громкости
      const monitorVolume = () => {
        if (!analyserRef.current || !isActive) return

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)
        
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        
        const average = sum / dataArray.length
        const normalizedVolume = Math.min(average / 128, 1) // Нормализуем от 0 до 1
        
        setVolume(normalizedVolume)
        
        if (isActive) {
          requestAnimationFrame(monitorVolume)
        }
      }

      setIsActive(true)
      setSelectedDeviceId(deviceId || null)
      monitorVolume()

      // Получаем список устройств после успешного запуска
      await getMicrophoneDevices()

      return true
    } catch (err) {
      let errorMsg = 'Не удалось получить доступ к микрофону'
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMsg = 'Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.'
        } else if (err.name === 'NotFoundError') {
          errorMsg = 'Микрофон не найден'
        } else if (err.name === 'NotReadableError') {
          errorMsg = 'Микрофон уже используется другим приложением'
        } else if (err.name === 'OverconstrainedError') {
          errorMsg = 'Запрошенные настройки микрофона не поддерживаются'
        }
      }
      
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [constraints, getMicrophoneDevices, onError])

  const stopMicrophone = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    setIsActive(false)
    setSelectedDeviceId(null)
    setVolume(0)
  }, [])

  const switchMicrophone = useCallback(async () => {
    if (!devices.length) {
      await getMicrophoneDevices()
    }

    if (devices.length < 2) {
      const errorMsg = 'Доступен только один микрофон'
      setError(errorMsg)
      return false
    }

    const currentIndex = devices.findIndex(device => device.deviceId === selectedDeviceId)
    const nextIndex = (currentIndex + 1) % devices.length
    const nextDevice = devices[nextIndex]

    stopMicrophone()
    return startMicrophone(nextDevice.deviceId)
  }, [devices, selectedDeviceId, startMicrophone, stopMicrophone, getMicrophoneDevices])

  const getAudioStream = useCallback((): MediaStream | null => {
    return streamRef.current
  }, [])

  const toggleMicrophone = useCallback(() => {
    if (isActive) {
      stopMicrophone()
    } else {
      startMicrophone()
    }
  }, [isActive, startMicrophone, stopMicrophone])

  // Очищаем ресурсы при размонтировании
  useState(() => {
    return () => {
      stopMicrophone()
    }
  })

  return {
    isActive,
    isLoading,
    error,
    volume,
    devices,
    selectedDeviceId,
    startMicrophone,
    stopMicrophone,
    switchMicrophone,
    getAudioStream,
    toggleMicrophone,
    getMicrophoneDevices,
  }
}