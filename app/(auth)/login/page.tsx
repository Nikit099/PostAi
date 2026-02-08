'use client'

import { useState, useEffect } from 'react'
import { LogIn, Mail, Key, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signInWithEmail, isLoading } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Проверяем параметры URL
    const urlEmail = searchParams.get('email')
    if (urlEmail) {
      setEmail(urlEmail)
    }
  }, [searchParams])

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Пожалуйста, заполните все поля')
      return
    }

    try {
      await signInWithEmail(email, password)
    } catch (error) {
      console.error('Email login error:', error)
      // Не показываем toast здесь, так как он уже показан в signInWithEmail
    }
  }

  return (
    <>
      <Card className="p-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary-blue to-primary-green">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">ContentGenie</h1>
          <p className="text-muted-foreground">
            Генератор постов для социальных сетей
          </p>
        </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background"
              />
            </div>

            <Button
              onClick={handleEmailLogin}
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full h-14 text-lg"
            >
              <Key className="w-5 h-5 mr-3" />
            Войти
            </Button>

          <div className="text-center text-sm text-muted-foreground">
            Нет аккаунта?
          </div>

          <Link href="/register">
            <Button
              variant="outline"
              className="w-full h-14 text-lg"
            >
              <UserPlus className="w-5 h-5 mr-3" />
              Зарегистрироваться
            </Button>
          </Link>
        </div>
      </Card>
    </>
  )
}