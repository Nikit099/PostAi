import { useState, useCallback } from 'react'

interface UseClipboardOptions {
  timeout?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useClipboard({
  timeout = 2000,
  onSuccess,
  onError,
}: UseClipboardOptions = {}) {
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      // Проверяем поддержку Clipboard API
      if (!navigator.clipboard) {
        throw new Error('Clipboard API не поддерживается')
      }

      await navigator.clipboard.writeText(text)
      
      setIsCopied(true)
      setError(null)
      
      if (onSuccess) {
        onSuccess()
      }

      // Сбрасываем состояние через указанное время
      const timer = setTimeout(() => {
        setIsCopied(false)
      }, timeout)

      return () => clearTimeout(timer)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Ошибка копирования')
      setError(error)
      setIsCopied(false)
      
      if (onError) {
        onError(error)
      }
      
      // Пробуем использовать fallback метод
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        
        // Сделаем textarea невидимой
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          setIsCopied(true)
          setError(null)
          
          if (onSuccess) {
            onSuccess()
          }
          
          const timer = setTimeout(() => {
            setIsCopied(false)
          }, timeout)
          
          return () => clearTimeout(timer)
        } else {
          throw new Error('Fallback метод копирования не сработал')
        }
      } catch (fallbackError) {
        const finalError = fallbackError instanceof Error 
          ? fallbackError 
          : new Error('Ошибка при использовании fallback метода')
        setError(finalError)
        
        if (onError) {
          onError(finalError)
        }
      }
    }
  }, [timeout, onSuccess, onError])

  const readFromClipboard = useCallback(async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API не поддерживается')
      }

      const text = await navigator.clipboard.readText()
      return text
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Ошибка чтения из буфера обмена')
      setError(error)
      
      if (onError) {
        onError(error)
      }
      
      throw error
    }
  }, [onError])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isCopied,
    error,
    copyToClipboard,
    readFromClipboard,
    clearError,
  }
}