'use client'

import { useState } from 'react'
import { UserPlus, Mail, Key, User, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const { signUpWithEmail, isLoading } = useAuth()

  const handleRegister = async () => {
    // Валидация
    if (!email.trim() || !password.trim() || !username.trim()) {
      toast.error('Пожалуйста, заполните все поля')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают')
      return
    }

    if (password.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов')
      return
    }

    if (!email.includes('@')) {
      toast.error('Введите корректный email')
      return
    }

    try {
      await signUpWithEmail(email, password, username)
    } catch (error) {
      console.error('Registration error:', error)
      // Не показываем toast здесь, так как он уже показан в signUpWithEmail
    }
  }

  return (
    <>
      <Card className="p-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary-blue to-primary-green">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Регистрация</h1>
          <p className="text-muted-foreground">
            Создайте аккаунт в ContentGenie
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Имя пользователя</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите имя пользователя"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background"
            />
          </div>
          
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
              placeholder="Минимум 6 символов"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Подтвердите пароль</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background"
            />
          </div>

          <Button
            onClick={handleRegister}
            disabled={isLoading || !email.trim() || !password.trim() || !username.trim() || !confirmPassword.trim()}
            className="w-full h-14 text-lg"
          >
            <UserPlus className="w-5 h-5 mr-3" />
            Зарегистрироваться
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?
          </div>

          <Link href="/login">
            <Button
              variant="outline"
              className="w-full h-14 text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              Войти в аккаунт
            </Button>
          </Link>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Регистрируясь, вы соглашаетесь с условиями использования и политикой конфиденциальности
        </div>
      </Card>
    </>
  )
}

