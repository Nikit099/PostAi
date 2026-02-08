'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MessageSquare, Instagram, Globe, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const serviceConfigs = {
  telegram: {
    name: 'Telegram',
    icon: MessageSquare,
    steps: [
      'Найдите нашего бота @ContentGenieBot в Telegram',
      'Отправьте боту команду /connect',
      'Бот пришлет вам уникальный токен подключения',
      'Введите токен в поле ниже',
    ],
    fields: [
      { name: 'token', label: 'Токен подключения', placeholder: 'Введите токен из Telegram' },
      { name: 'chat_id', label: 'ID чата/канала', placeholder: 'Например: -1001234567890' },
    ],
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    steps: [
      'Войдите в свой аккаунт Instagram',
      'Перейдите в настройки разработчика',
      'Создайте новое приложение и получите токен доступа',
      'Введите данные ниже',
    ],
    fields: [
      { name: 'access_token', label: 'Токен доступа', placeholder: 'Введите токен доступа' },
      { name: 'username', label: 'Имя пользователя', placeholder: 'Ваш username в Instagram' },
    ],
  },
  vk: {
    name: 'VK',
    icon: Globe,
    steps: [
      'Перейдите в настройки вашего сообщества VK',
      'В разделе "Работа с API" создайте ключ доступа',
      'Скопируйте полученный токен',
      'Введите данные ниже',
    ],
    fields: [
      { name: 'access_token', label: 'Токен доступа', placeholder: 'Введите токен доступа VK' },
      { name: 'group_id', label: 'ID группы', placeholder: 'ID вашей группы VK' },
    ],
  },
}

export default function AddServicePage() {
  const params = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)

  const service = params.service as keyof typeof serviceConfigs
  const config = serviceConfigs[service] || serviceConfigs.telegram
  const Icon = config.icon

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // Проверяем заполнение всех полей
    const allFieldsFilled = config.fields.every(field => formData[field.name]?.trim())
    if (!allFieldsFilled) {
      alert('Заполните все поля')
      return
    }

    setIsLoading(true)
    try {
      // Здесь будет отправка данных на бэкенд
      // Пока что имитация
      setTimeout(() => {
        setIsLoading(false)
        router.push('/accounts')
      }, 1500)
    } catch (error) {
      console.error('Connection error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="container px-4 py-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-accent rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-blue/20 to-primary-green/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-blue" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Подключение {config.name}</h1>
            <p className="text-sm text-muted-foreground">
              Следуйте инструкциям ниже
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Пошаговая инструкция */}
        <Card className="p-6">
          <h2 className="font-bold text-lg mb-4">Инструкция по подключению</h2>
          <div className="space-y-4">
            {config.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-blue/20 text-primary-blue flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm">{step}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Поля для ввода */}
        <Card className="p-6">
          <h2 className="font-bold text-lg mb-4">Данные для подключения</h2>
          <div className="space-y-4">
            {config.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="text-sm font-medium">{field.label}</label>
                <input
                  type="text"
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Кнопка поддержки */}
        <Button
          onClick={() => setShowSupportModal(true)}
          variant="outline"
          className="w-full"
        >
          <HelpCircle className="w-5 h-5 mr-2" />
          Написать в поддержку
        </Button>

        {/* Кнопки управления */}
        <div className="sticky bottom-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 -mx-4 -mb-6 border-t">
          <div className="flex gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Назад
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary-blue to-primary-green"
            >
              {isLoading ? 'Подключение...' : 'Готово'}
            </Button>
          </div>
        </div>
      </div>

      {/* Модалка поддержки */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Поддержка</h2>
              <p className="text-muted-foreground">
                Если у вас возникли проблемы с подключением {config.name}, напишите нашему боту поддержки:
              </p>
              <div className="p-4 rounded-lg bg-muted text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-primary-blue" />
                <p className="font-medium">@ContentGenieSupportBot</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Наш специалист поможет вам в течение 15 минут
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowSupportModal(false)}
                variant="outline"
                className="flex-1"
              >
                Закрыть
              </Button>
              <Button
                onClick={() => {
                  window.open('https://t.me/ContentGenieSupportBot', '_blank')
                  setShowSupportModal(false)
                }}
                className="flex-1 bg-gradient-to-r from-primary-blue to-primary-green"
              >
                Написать в Telegram
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}