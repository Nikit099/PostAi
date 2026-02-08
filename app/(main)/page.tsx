'use client'

import { useState } from 'react'
import { Plus, MessageSquare, Instagram, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

// Моковые данные для демонстрации
const mockAccounts = [
  { id: 1, service: 'telegram', name: 'Мой канал', username: '@my_channel' },
  { id: 2, service: 'instagram', name: 'Личный блог', username: '@personal_blog' },
  { id: 3, service: 'vk', name: 'Группа ВК', username: 'vk.com/group' },
]

const serviceIcons = {
  telegram: MessageSquare,
  instagram: Instagram,
  vk: Globe,
}

export default function HomePage() {
  const [showAddModal, setShowAddModal] = useState(false)

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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-blue/20 to-primary-green/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-blue" />
                  </div>
                  <div>
                    <h3 className="font-medium">{account.name}</h3>
                    <p className="text-sm text-muted-foreground">{account.username}</p>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-destructive">
                  ×
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* FAB для генерации */}
      <Link href="/generate">
        <button className="fab">
          <span className="text-2xl">➔</span>
        </button>
      </Link>

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
    </div>
  )
}