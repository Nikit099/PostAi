'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Loader2, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  onTranscriptionComplete?: (text: string) => void
  maxDuration?: number // в секундах
  className?: string
}

export function VoiceRecorder({
  onRecordingComplete,
  onTranscriptionComplete,
  maxDuration = 300, // 5 минут
  className,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      setError(null)
      
      // Запрашиваем доступ к микрофону
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      })
      
      streamRef.current = stream

      // Создаем MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      const chunks: Blob[] = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        setAudioChunks(chunks)
        
        // Создаем URL для предпрослушивания
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        
        onRecordingComplete(audioBlob)
      }

      recorder.start(1000) // Собираем данные каждую секунду
      setMediaRecorder(recorder)
      setIsRecording(true)
      setRecordingTime(0)

      // Запускаем таймер
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)

    } catch (err) {
      console.error('Recording error:', err)
      setError('Не удалось получить доступ к микрофону. Проверьте разрешения.')
    }
  }

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    setIsRecording(false)
    setMediaRecorder(null)
  }

  const handleTranscribe = async () => {
    if (!audioChunks.length || !audioUrl) return

    setIsProcessing(true)
    
    try {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      
      // Здесь будет вызов API транскрибации
      // Пока что имитация
      setTimeout(() => {
        const mockTranscription = 'Это пример транскрибированного текста из голосового сообщения.'
        
        if (onTranscriptionComplete) {
          onTranscriptionComplete(mockTranscription)
        }
        
        setIsProcessing(false)
        setAudioUrl(null)
        setAudioChunks([])
      }, 2000)

    } catch (err) {
      console.error('Transcription error:', err)
      setError('Ошибка при обработке аудио')
      setIsProcessing(false)
    }
  }

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    
    setAudioUrl(null)
    setAudioChunks([])
    setRecordingTime(0)
    setError(null)
  }

  // Очищаем ресурсы при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [audioUrl])

  return (
    <div className={cn('space-y-4', className)}>
      <Card className="p-6 text-center space-y-6">
        {/* Иконка и статус */}
        <div className={cn(
          'inline-flex items-center justify-center w-24 h-24 rounded-full mx-auto transition-all',
          isRecording 
            ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse' 
            : isProcessing
            ? 'bg-gradient-to-r from-primary-blue to-primary-green'
            : 'bg-gradient-to-r from-primary-blue/20 to-primary-green/20'
        )}>
          {isProcessing ? (
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          ) : isRecording ? (
            <div className="relative">
              <Mic className="w-12 h-12 text-white" />
              <div className="absolute -inset-4 rounded-full border-4 border-white/30 animate-ping" />
            </div>
          ) : (
            <Mic className="w-12 h-12 text-primary-blue" />
          )}
        </div>

        {/* Информация */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            {isRecording ? 'Идет запись...' : 
             isProcessing ? 'Обработка...' : 
             'Запись голосового сообщения'}
          </h3>
          
          <p className="text-sm text-muted-foreground">
            {isRecording 
              ? 'Говорите сейчас. Запись остановится автоматически через 5 минут.'
              : isProcessing
              ? 'Преобразуем аудио в текст...'
              : 'Нажмите кнопку ниже и говорите. Мы автоматически преобразуем речь в текст.'}
          </p>

          {/* Таймер */}
          {isRecording && (
            <div className="text-2xl font-mono font-bold text-primary-blue">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>

        {/* Кнопки управления */}
        <div className="flex flex-col gap-3">
          {!isRecording && !audioUrl ? (
            <Button
              onClick={startRecording}
              disabled={isProcessing}
              className="w-full h-14 text-lg bg-gradient-to-r from-primary-blue to-primary-green"
            >
              <Mic className="w-5 h-5 mr-2" />
              Начать запись
            </Button>
          ) : isRecording ? (
            <Button
              onClick={stopRecording}
              className="w-full h-14 text-lg bg-gradient-to-r from-red-500 to-pink-500"
            >
              <Square className="w-5 h-5 mr-2" />
              Остановить запись
            </Button>
          ) : audioUrl ? (
            <div className="space-y-3">
              {/* Предпрослушивание */}
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-4 h-4 text-primary-blue" />
                  <span className="font-medium">Запись сохранена</span>
                </div>
                <audio
                  src={audioUrl}
                  controls
                  className="w-full"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={clearRecording}
                  variant="outline"
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Записать заново
                </Button>
                <Button
                  onClick={handleTranscribe}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-primary-blue to-primary-green"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    'Преобразовать в текст'
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      {/* Ошибки */}
      {error && (
        <Card className="p-4 border-destructive bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {/* Подсказки */}
      {!isRecording && !audioUrl && !isProcessing && (
        <Card className="p-4">
          <div className="space-y-2">
            <h4 className="font-medium">Советы для лучшей записи:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Используйте тихое помещение без фонового шума</li>
              <li>• Держите микрофон на расстоянии 10-15 см от рта</li>
              <li>• Говорите четко и в нормальном темпе</li>
              <li>• Максимальная длительность записи: 5 минут</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  )
}