import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { User } from '@/types'
import { toast } from 'sonner'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Проверяем текущую сессию
    const checkSession = async () => {
      setIsLoading(true)
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Получаем профиль пользователя
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUser({
              id: profile.id,
              email: session.user.email,
              username: profile.username,
              avatar_url: profile.avatar_url,
              daily_credits: profile.daily_credits,
            })
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Слушаем изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Получаем профиль пользователя
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUser({
              id: profile.id,
              email: session.user.email,
              username: profile.username,
              avatar_url: profile.avatar_url,
              daily_credits: profile.daily_credits,
            })
          }
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      toast.success('Успешный вход')
      router.push('/')
    } catch (error) {
      console.error('Email sign in error:', error)
      toast.error(error instanceof Error ? error.message : 'Ошибка входа через email')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUpWithEmail = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true)

      // Создаем пользователя
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      })

      if (authError) throw authError

      // Если пользователь создан, создаем профиль
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: username,
            daily_credits: 6,
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Если ошибка не связана с дублированием, пробрасываем дальше
          if (profileError.code !== '23505') {
            throw profileError
          }
        }
      }

      toast.success('Регистрация успешна! Проверьте вашу почту для подтверждения.')
      router.push('/login')
    } catch (error) {
      console.error('Email sign up error:', error)
      toast.error(error instanceof Error ? error.message : 'Ошибка регистрации')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      toast.success('Вы успешно вышли')
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Ошибка при выходе')
      throw error
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      toast.error('Пользователь не авторизован')
      throw new Error('User not authenticated')
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error
      
      setUser(prev => prev ? { ...prev, ...updates } : null)
      toast.success('Профиль обновлен')
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Ошибка обновления профиля')
      throw error
    }
  }

  return {
    user,
    isLoading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
  }
}