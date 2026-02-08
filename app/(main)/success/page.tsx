'use client'

import { CheckCircle, Home, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="container px-4 py-6 space-y-6">
      <Card className="p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-primary-green/20 to-primary-blue/20">
          <CheckCircle className="w-12 h-12 text-primary-green" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Пост успешно опубликован!</h1>
          <p className="text-muted-foreground">
            Ваш пост был опубликован в выбранных социальных сетях.
            Вы можете создать новый пост или вернуться на главную.
          </p>
        </div>

        <div className="grid gap-3">
          <Link href="/generate">
            <Button className="w-full h-14 text-lg bg-gradient-to-r from-primary-blue to-primary-green">
              <Plus className="w-5 h-5 mr-2" />
              Создать новый пост
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full h-14 text-lg">
              <Home className="w-5 h-5 mr-2" />
              На главную
            </Button>
          </Link>
        </div>
      </Card>

      {/* Статистика */}
      <Card className="p-6">
        <h2 className="font-bold text-lg mb-4">Статистика публикации</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted">
            <div className="text-2xl font-bold text-primary-blue">3</div>
            <div className="text-sm text-muted-foreground">Аккаунта</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted">
            <div className="text-2xl font-bold text-primary-green">245</div>
            <div className="text-sm text-muted-foreground">Символов</div>
          </div>
        </div>
      </Card>
    </div>
  )
}