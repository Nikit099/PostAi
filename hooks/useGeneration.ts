import { useState } from 'react'
import { toast } from 'sonner'

interface GenerationOptions {
  idea: string
  userId: string
}

interface RegenerationOptions {
  text: string
  userId: string
}

export function useGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const generatePost = async ({ idea, userId }: GenerationOptions) => {
    if (!idea.trim()) {
      toast.error('Введите идею для поста')
      throw new Error('Idea is required')
    }

    if (!userId) {
      toast.error('Пользователь не авторизован')
      throw new Error('User not authenticated')
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea, userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка генерации')
      }

      toast.success('Пост успешно сгенерирован')
      return data
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Ошибка генерации')
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  const transcribeAudio = async (audioFile: File, userId: string) => {
    if (!audioFile) {
      toast.error('Аудиофайл не выбран')
      throw new Error('Audio file is required')
    }

    if (!userId) {
      toast.error('Пользователь не авторизован')
      throw new Error('User not authenticated')
    }

    setIsTranscribing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioFile)
      formData.append('userId', userId)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка транскрибации')
      }

      toast.success('Аудио успешно транскрибировано')
      return data
    } catch (error) {
      console.error('Transcription error:', error)
      toast.error(error instanceof Error ? error.message : 'Ошибка транскрибации')
      throw error
    } finally {
      setIsTranscribing(false)
    }
  }

  const regeneratePost = async ({ text, userId }: RegenerationOptions) => {
    if (!text.trim()) {
      toast.error('Текст для перегенерации отсутствует')
      throw new Error('Text is required')
    }

    if (!userId) {
      toast.error('Пользователь не авторизован')
      throw new Error('User not authenticated')
    }

    setIsGenerating(true)
    
    try {
      // Используем текущий текст как идею для перегенерации
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idea: `Улучши этот текст, сделай его более живым и интересным: ${text}`,
          userId 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка перегенерации')
      }

      toast.success('Пост успешно перегенерирован')
      return data
    } catch (error) {
      console.error('Regeneration error:', error)
      toast.error(error instanceof Error ? error.message : 'Ошибка перегенерации')
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generatePost,
    transcribeAudio,
    regeneratePost,
    isGenerating,
    isTranscribing,
  }
}