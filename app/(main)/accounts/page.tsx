'use client'

import { useState } from 'react'
import { Plus, MessageSquare, Instagram, Globe, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

// Моковые данные
const mockAccounts = [
  { id: 1, service: 'telegram', name: 'Мой канал', username: '@my_channel', isActive: true },
  { id: 2, service: 'instagram', name: 'Личный блог', username: '@personal_blog', isActive: true },
  { id: 3, service: 'vk', name: 'Группа ВК', username: 'vk.com/group', isActive: false },
]

const serviceIcons = {
  telegram: MessageSquare,
  instagram: Instagram,
  vk: Globe,
}

export default function AccountsPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мои аккаунты</h1>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-primary-blue to-primary-green"
        >
          <Plus className="w-5 h-5 mr-2" />
          Добавить аккаунт
        </Button>
      </div>

      <div className="grid gap-4">
        {mockAccounts.map((account) => {
          const Icon = serviceIcons[account.service as keyof typeof serviceIcons]
          return (
            <Card key={account.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    account.isActive 
                      ? 'bg-gradient-to-r from-primary-blue/20 to-primary-green/20' 
                      : 'bg-muted'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      account.isActive ? 'text-primary-blue' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{account.name}</h3>
                      {!account.isActive && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Неактивен
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{account.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-muted-foreground hover:text-destructive p-2">
                    ×
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Кнопка поддержки */}
      <Button
        onClick={() => setShowSupportModal(true)}
        variant="outline"
        className="w-full"
      >
        <HelpCircle className="w-5 h-5 mr-2" />
        Написать в поддержку
      </Button>

      {/* Модалка добавления аккаунта */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50">
          <Card className="w-full max-w-md rounded-t-2xl rounded-b-none p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Добавить аккаунт</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { service: 'telegram', label: 'Telegram', icon: MessageSquare },
                  { service: 'instagram', label: 'Instagram', icon: Instagram },
                  { service: 'vk', label: 'VK', icon: Globe },
                  { service: 'twitter', label: 'Twitter', icon: Globe },
                ].map((item) => (
                  <Link
                    key={item.service}
                    href={`/accounts/add/${item.service}`}
                    className="flex flex-col items-center justify-center p-4 rounded-lg border hover:bg-accent transition-colors"
                    onClick={() => setShowAddModal(false)}
                  >
                    <item.icon className="w-8 h-8 mb-2 text-primary-blue" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setShowAddModal(false)}
              variant="outline"
              className="w-full"
            >
              Отмена
            </Button>
          </Card>
        </div>
      )}

      {/* Модалка поддержки */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Поддержка</h2>
              <p className="text-muted-foreground">
                Если у вас возникли проблемы с подключением аккаунтов, напишите нашему боту поддержки:
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