'use client'

import { useState } from 'react'
import { Upload, X, RefreshCw, Smile } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'

const popularEmojis = ['🔥', '😊', '📢', '🎯', '💡', '🚀', '✨', '👏', '📈', '💪']

export default function EditPage() {
  const router = useRouter()
  const [title, setTitle] = useState('Утренняя зарядка для продуктивности')
  const [content, setContent] = useState(`🔥 Начинайте свой день с зарядки! Всего 15 минут утренних упражнений могут повысить вашу продуктивность на целый день.

💡 Почему это работает:
• Пробуждает организм
• Улучшает кровообращение
• Повышает концентрацию
• Дает заряд энергии

🚀 Попробуйте завтра утром и почувствуйте разницу!

#продуктивность #зарядка #утро #здоровье #энергия`)
  
  const [files, setFiles] = useState<File[]>([])
  const [regenerationsLeft, setRegenerationsLeft] = useState(6)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 4,
    onDrop: (acceptedFiles) => {
      if (files.length + acceptedFiles.length > 4) {
        alert('Можно загрузить не более 4 изображений')
        return
      }
      setFiles([...files, ...acceptedFiles])
    }
  })

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const insertEmoji = (emoji: string) => {
    const textarea = document.querySelector('textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.substring(0, start) + emoji + content.substring(end)
      setContent(newContent)
    } else {
      setContent(content + emoji)
    }
  }

  const handleRegenerate = async () => {
    if (regenerationsLeft <= 0) return
    
    setIsRegenerating(true)
    try {
      // Здесь будет вызов API для перегенерации
      setTimeout(() => {
        setRegenerationsLeft(regenerationsLeft - 1)
        setIsRegenerating(false)
        // Обновляем контент (в реальном приложении будет ответ от API)
        setContent(content + '\n\n✨ Перегенерировано с улучшениями!')
      }, 1500)
    } catch (error) {
      console.error('Regeneration error:', error)
      setIsRegenerating(false)
    }
  }

  const handleNext = () => {
    // Сохраняем пост в состояние/стор и переходим к публикации
    router.push('/publish')
  }

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Редактирование поста</h1>
        <p className="text-muted-foreground">
          Отредактируйте сгенерированный пост и добавьте медиа
        </p>
      </div>

      <div className="space-y-6">
        {/* Заголовок */}
        <Card className="p-4">
          <label className="block text-sm font-medium mb-2">Заголовок</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
            placeholder="Введите заголовок поста"
          />
        </Card>

        {/* Контент */}
        <Card className="p-4">
          <label className="block text-sm font-medium mb-2">Текст поста</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[300px] p-4 rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
            placeholder="Текст поста..."
          />
        </Card>

        {/* Эмодзи */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Smile className="w-5 h-5 text-primary-blue" />
            <span className="font-medium">Быстрые эмодзи</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="w-10 h-10 rounded-lg border hover:bg-accent transition-colors text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </Card>

        {/* Медиа */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="w-5 h-5 text-primary-blue" />
            <span className="font-medium">Медиафайлы</span>
            <span className="text-sm text-muted-foreground ml-auto">
              {files.length}/4 файлов
            </span>
          </div>

          <div
            {...getRootProps()}
            className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary-blue transition-colors cursor-pointer"
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">Перетащите изображения сюда</p>
            <p className="text-sm text-muted-foreground mt-1">
              или нажмите для выбора файлов
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Поддерживаются: PNG, JPG, GIF (макс. 4 файла)
            </p>
          </div>

          {/* Препросмотр файлов */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {files.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Перегенерация */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary-blue" />
                <span className="font-medium">Перегенерировать</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Осталось перегенераций: {regenerationsLeft}/6
              </p>
            </div>
            <Button
              onClick={handleRegenerate}
              disabled={regenerationsLeft <= 0 || isRegenerating}
              variant="outline"
              className="min-w-[140px]"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Перегенерация...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Перегенерировать
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Кнопки управления */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex-1"
          >
            Назад
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-primary-blue to-primary-green"
          >
            Далее ➔
          </Button>
        </div>
      </div>
    </div>
  )
}