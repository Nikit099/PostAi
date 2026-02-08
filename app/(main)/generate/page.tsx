'use client'

import { useState } from 'react'
import { Mic, Type, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'

type TabType = 'text' | 'voice'

export default function GeneratePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('text')
  const [idea, setIdea] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleVoiceRecord = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Ваш браузер не поддерживает запись аудио')
      return
    }

    setIsRecording(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Здесь будет логика записи и отправки на транскрибацию
      // Пока что просто имитация
      setTimeout(() => {
        setIsRecording(false)
        setIdea('Это пример транскрибированного текста из голосового сообщения')
      }, 2000)
    } catch (error) {
      console.error('Recording error:', error)
      setIsRecording(false)
    }
  }

  const handleGenerate = async () => {
    if (!idea.trim()) {
      alert('Введите идею для поста')
      return
    }

    setIsGenerating(true)
    try {
      // Здесь будет вызов API генерации
      // Пока что имитация
      setTimeout(() => {
        setIsGenerating(false)
        router.push('/generate/edit')
      }, 1500)
    } catch (error) {
      console.error('Generation error:', error)
      setIsGenerating(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Создать пост</h1>
        <p className="text-muted-foreground">
          Опишите идею или запишите голосовое сообщение
        </p>
      </div>

      {/* Вкладки */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'text'
              ? 'border-b-2 border-primary-blue text-primary-blue'
              : 'text-muted-foreground'
          }`}
        >
          <Type className="w-5 h-5 inline-block mr-2" />
          Текст
        </button>
        <button
          onClick={() => setActiveTab('voice')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'voice'
              ? 'border-b-2 border-primary-blue text-primary-blue'
              : 'text-muted-foreground'
          }`}
        >
          <Mic className="w-5 h-5 inline-block mr-2" />
          Голосовое
        </button>
      </div>

      {/* Контент вкладок */}
      <div className="space-y-6">
        {activeTab === 'text' ? (
          <Card className="p-4">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Опишите идею поста... Например: 'Хочу написать пост о пользе утренней зарядки для продуктивности в течение дня'"
              className="w-full min-h-[200px] p-4 rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
            />
          </Card>
        ) : (
          <Card className="p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-primary-blue/20 to-primary-green/20">
              <Mic className="w-12 h-12 text-primary-blue" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Запись голосового сообщения</h3>
              <p className="text-sm text-muted-foreground">
                Нажмите кнопку ниже и говорите. Мы автоматически преобразуем речь в текст.
              </p>
            </div>
            <Button
              onClick={handleVoiceRecord}
              disabled={isRecording}
              className={`w-32 h-32 rounded-full ${
                isRecording
                  ? 'bg-gradient-to-r from-red-500 to-pink-500'
                  : 'bg-gradient-to-r from-primary-blue to-primary-green'
              }`}
            >
              {isRecording ? (
                <div className="animate-pulse">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>
            {isRecording && (
              <p className="text-sm text-muted-foreground animate-pulse">
                Запись... Говорите сейчас
              </p>
            )}
          </Card>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (!idea.trim() && activeTab === 'text')}
            className="w-full h-14 text-lg bg-gradient-to-r from-primary-blue to-primary-green"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Генерация...
              </>
            ) : (
              'Сгенерировать пост'
            )}
          </Button>

          <Button
            onClick={handleBack}
            variant="outline"
            className="w-full h-14 text-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    </div>
  )
}