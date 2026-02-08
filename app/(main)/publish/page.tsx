'use client'

import { useState } from 'react'
import { MessageSquare, Instagram, Globe, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'

// Моковые данные
const mockAccounts = [
  { id: 1, service: 'telegram', name: 'Мой канал', username: '@my_channel' },
  { id: 2, service: 'instagram', name: 'Личный блог', username: '@personal_blog' },
  { id: 3, service: 'vk', name: 'Группа ВК', username: 'vk.com/group' },
  { id: 4, service: 'telegram', name: 'Рабочий чат', username: '@work_chat' },
]

const serviceIcons = {
  telegram: MessageSquare,
  instagram: Instagram,
  vk: Globe,
}

export default function PublishPage() {
  const router = useRouter()
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishStatus, setPublishStatus] = useState<Record<number, 'pending' | 'success' | 'error'>>({})

  const toggleAccount = (accountId: number) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }

  const handlePublish = async () => {
    if (selectedAccounts.length === 0) {
      alert('Выберите хотя бы один аккаунт для публикации')
      return
    }

    setIsPublishing(true)
    
    // Имитация процесса публикации
    selectedAccounts.forEach(accountId => {
      setPublishStatus(prev => ({ ...prev, [accountId]: 'pending' }))
      
      setTimeout(() => {
        setPublishStatus(prev => ({ 
          ...prev, 
          [accountId]: Math.random() > 0.2 ? 'success' : 'error' 
        }))
      }, Math.random() * 2000 + 1000)
    })

    // После завершения всех публикаций
    setTimeout(() => {
      const allDone = selectedAccounts.every(id => 
        publishStatus[id] === 'success' || publishStatus[id] === 'error'
      )
      
      if (allDone) {
        const successCount = selectedAccounts.filter(id => publishStatus[id] === 'success').length
        if (successCount > 0) {
          router.push('/success')
        } else {
          setIsPublishing(false)
        }
      }
    }, 3000)
  }

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Публикация поста</h1>
        <p className="text-muted-foreground">
          Выберите аккаунты для публикации
        </p>
      </div>

      <div className="space-y-6">
        {/* Предпросмотр поста */}
        <Card className="p-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center justify-between w-full"
          >
            <span className="font-medium">Предпросмотр поста</span>
            {showPreview ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          
          {showPreview && (
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <h3 className="font-bold text-lg mb-2">Утренняя зарядка для продуктивности</h3>
                <p className="whitespace-pre-line">
                  🔥 Начинайте свой день с зарядки! Всего 15 минут утренних упражнений могут повысить вашу продуктивность на целый день.

                  💡 Почему это работает:
                  • Пробуждает организм
                  • Улучшает кровообращение
                  • Повышает концентрацию
                  • Дает заряд энергии

                  🚀 Попробуйте завтра утром и почувствуйте разницу!

                  #продуктивность #зарядка #утро #здоровье #энергия
                </p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Список аккаунтов */}
        <div className="space-y-3">
          <h2 className="font-medium">Выберите аккаунты:</h2>
          {mockAccounts.map((account) => {
            const Icon = serviceIcons[account.service as keyof typeof serviceIcons]
            const isSelected = selectedAccounts.includes(account.id)
            const status = publishStatus[account.id]

            return (
              <Card
                key={account.id}
                onClick={() => !isPublishing && toggleAccount(account.id)}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-2 border-primary-green bg-primary-green/5'
                    : 'border border-input opacity-60 hover:opacity-100'
                } ${isPublishing ? 'cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isSelected 
                        ? 'bg-gradient-to-r from-primary-blue/30 to-primary-green/30' 
                        : 'bg-muted'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isSelected ? 'text-primary-blue' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{account.name}</h3>
                      <p className="text-sm text-muted-foreground">{account.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {status === 'pending' && (
                      <div className="w-6 h-6 border-2 border-primary-blue border-t-transparent rounded-full animate-spin" />
                    )}
                    {status === 'success' && (
                      <Check className="w-6 h-6 text-primary-green" />
                    )}
                    {status === 'error' && (
                      <span className="text-destructive text-sm">Ошибка</span>
                    )}
                    {!status && isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary-green flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Статус публикации */}
        {isPublishing && (
          <Card className="p-4">
            <div className="space-y-3">
              <h3 className="font-medium">Статус публикации:</h3>
              {selectedAccounts.map(accountId => {
                const account = mockAccounts.find(a => a.id === accountId)
                const status = publishStatus[accountId]
                
                return (
                  <div key={accountId} className="flex items-center justify-between">
                    <span>{account?.name}</span>
                    <div className="flex items-center gap-2">
                      {status === 'pending' && (
                        <>
                          <div className="w-3 h-3 bg-primary-blue rounded-full animate-pulse" />
                          <span className="text-sm">Публикация...</span>
                        </>
                      )}
                      {status === 'success' && (
                        <span className="text-sm text-primary-green">✓ Опубликовано</span>
                      )}
                      {status === 'error' && (
                        <span className="text-sm text-destructive">✗ Ошибка</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Кнопки управления */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex-1"
            disabled={isPublishing}
          >
            Назад
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing || selectedAccounts.length === 0}
            className="flex-1 bg-gradient-to-r from-primary-blue to-primary-green"
          >
            {isPublishing ? 'Публикация...' : 'Опубликовать'}
          </Button>
        </div>
      </div>
    </div>
  )
}