import { useState, useRef, useCallback } from 'react'

interface MediaPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playbackRate: number
  isLoading: boolean
  error: string | null
}

interface UseMediaPlayerOptions {
  src: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  volume?: number
  playbackRate?: number
  onEnded?: () => void
  onError?: (error: string) => void
  onTimeUpdate?: (currentTime: number) => void
}

export function useMediaPlayer(options: UseMediaPlayerOptions) {
  const {
    src,
    autoplay = false,
    loop = false,
    muted = false,
    volume = 1,
    playbackRate = 1,
    onEnded,
    onError,
    onTimeUpdate,
  } = options

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<MediaPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume,
    isMuted: muted,
    playbackRate,
    isLoading: true,
    error: null,
  })

  // Инициализация аудио элемента
  const initializeAudio = useCallback(() => {
    if (typeof Audio === 'undefined') {
      setState(prev => ({ ...prev, error: 'Audio API не поддерживается' }))
      return null
    }

    const audio = new Audio(src)
    audioRef.current = audio

    // Устанавливаем начальные свойства
    audio.autoplay = autoplay
    audio.loop = loop
    audio.muted = muted
    audio.volume = volume
    audio.playbackRate = playbackRate

    // Обработчики событий
    const handleLoadedMetadata = () => {
      setState(prev => ({
        ...prev,
        duration: audio.duration,
        isLoading: false,
      }))
    }

    const handleTimeUpdate = () => {
      setState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
      }))
      if (onTimeUpdate) {
        onTimeUpdate(audio.currentTime)
      }
    }

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }))
    }

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }))
    }

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }))
      if (onEnded) {
        onEnded()
      }
    }

    const handleError = () => {
      const error = audio.error
        ? `Ошибка аудио: ${audio.error.message}`
        : 'Неизвестная ошибка при загрузке аудио'
      
      setState(prev => ({
        ...prev,
        error,
        isLoading: false,
      }))
      
      if (onError) {
        onError(error)
      }
    }

    const handleVolumeChange = () => {
      setState(prev => ({
        ...prev,
        volume: audio.volume,
        isMuted: audio.muted,
      }))
    }

    const handleRateChange = () => {
      setState(prev => ({
        ...prev,
        playbackRate: audio.playbackRate,
      }))
    }

    // Добавляем обработчики событий
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('volumechange', handleVolumeChange)
    audio.addEventListener('ratechange', handleRateChange)

    // Загружаем аудио
    audio.load()

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('volumechange', handleVolumeChange)
      audio.removeEventListener('ratechange', handleRateChange)
      
      audio.pause()
      audioRef.current = null
    }
  }, [src, autoplay, loop, muted, volume, playbackRate, onEnded, onError, onTimeUpdate])

  // Инициализируем при монтировании
  useState(() => {
    const cleanup = initializeAudio()
    return cleanup
  })

  const play = useCallback(async () => {
    if (!audioRef.current) return

    try {
      await audioRef.current.play()
    } catch (error) {
      console.error('Ошибка при воспроизведении:', error)
      setState(prev => ({ ...prev, error: 'Не удалось воспроизвести аудио' }))
    }
  }, [])

  const pause = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
  }, [])

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause()
    } else {
      play()
    }
  }, [state.isPlaying, play, pause])

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return
    
    if (time >= 0 && time <= state.duration) {
      audioRef.current.currentTime = time
      setState(prev => ({ ...prev, currentTime: time }))
    }
  }, [state.duration])

  const setVolume = useCallback((newVolume: number) => {
    if (!audioRef.current) return
    
    const volume = Math.max(0, Math.min(1, newVolume))
    audioRef.current.volume = volume
    setState(prev => ({ ...prev, volume }))
  }, [])

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return
    
    audioRef.current.muted = !audioRef.current.muted
    setState(prev => ({ ...prev, isMuted: audioRef.current!.muted }))
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    if (!audioRef.current) return
    
    const playbackRate = Math.max(0.1, Math.min(4, rate))
    audioRef.current.playbackRate = playbackRate
    setState(prev => ({ ...prev, playbackRate }))
  }, [])

  const restart = useCallback(() => {
    seek(0)
    play()
  }, [seek, play])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    ...state,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    restart,
    formatTime,
    audioRef,
  }
}