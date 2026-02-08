import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ConnectedAccount } from '@/types'
import { toast } from 'sonner'

export function useAccounts(userId?: string) {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = async () => {
    if (!userId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      
      setAccounts(data || [])
    } catch (err) {
      console.error('Error fetching accounts:', err)
      setError('Не удалось загрузить аккаунты')
      toast.error('Ошибка при загрузке аккаунтов')
    } finally {
      setIsLoading(false)
    }
  }

  const addAccount = async (accountData: Omit<ConnectedAccount, 'id' | 'created_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('connected_accounts')
        .insert([accountData])
        .select()
        .single()

      if (insertError) throw insertError
      
      if (data) {
        setAccounts(prev => [data, ...prev])
        toast.success('Аккаунт успешно добавлен')
        return data
      }
    } catch (err) {
      console.error('Error adding account:', err)
      toast.error('Ошибка при добавлении аккаунта')
      throw err
    }
  }

  const removeAccount = async (accountId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('connected_accounts')
        .delete()
        .eq('id', accountId)

      if (deleteError) throw deleteError
      
      setAccounts(prev => prev.filter(acc => acc.id !== accountId))
      toast.success('Аккаунт удален')
    } catch (err) {
      console.error('Error removing account:', err)
      toast.error('Ошибка при удалении аккаунта')
      throw err
    }
  }

  const updateAccount = async (accountId: string, updates: Partial<ConnectedAccount>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('connected_accounts')
        .update(updates)
        .eq('id', accountId)
        .select()
        .single()

      if (updateError) throw updateError
      
      if (data) {
        setAccounts(prev => prev.map(acc => 
          acc.id === accountId ? data : acc
        ))
        toast.success('Аккаунт обновлен')
        return data
      }
    } catch (err) {
      console.error('Error updating account:', err)
      toast.error('Ошибка при обновлении аккаунта')
      throw err
    }
  }

  useEffect(() => {
    if (userId) {
      fetchAccounts()
    }
  }, [userId])

  return {
    accounts,
    isLoading,
    error,
    fetchAccounts,
    addAccount,
    removeAccount,
    updateAccount,
  }
}