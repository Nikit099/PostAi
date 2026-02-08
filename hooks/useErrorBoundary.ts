import { useState, useCallback, useEffect } from 'react'

interface ErrorInfo {
  error: Error
  errorInfo?: React.ErrorInfo
  timestamp: Date
  componentStack?: string
}

interface UseErrorBoundaryOptions {
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onReset?: () => void
  fallback?: React.ReactNode
  maxErrors?: number
}

export function useErrorBoundary(options: UseErrorBoundaryOptions = {}) {
  const {
    onError,
    onReset,
    fallback,
    maxErrors = 10,
  } = options

  const [error, setError] = useState<Error | null>(null)
  const [errorInfo, setErrorInfo] = useState<React.ErrorInfo | null>(null)
  const [errorHistory, setErrorHistory] = useState<ErrorInfo[]>([])

  // Обработчик ошибок
  const handleError = useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    const errorWithInfo: ErrorInfo = {
      error,
      errorInfo,
      timestamp: new Date(),
      componentStack: errorInfo?.componentStack,
    }

    setError(error)
    setErrorInfo(errorInfo || null)
    
    // Сохраняем ошибку в историю
    setErrorHistory(prev => {
      const newHistory = [errorWithInfo, ...prev]
      if (newHistory.length > maxErrors) {
        newHistory.pop()
      }
      return newHistory
    })

    if (onError) {
      onError(error, errorInfo || { componentStack: '' })
    }

    // Логируем ошибку в консоль
    console.error('Error Boundary caught an error:', error)
    if (errorInfo) {
      console.error('Error Info:', errorInfo)
    }
  }, [onError, maxErrors])

  // Сброс ошибки
  const resetError = useCallback(() => {
    setError(null)
    setErrorInfo(null)
    
    if (onReset) {
      onReset()
    }
  }, [onReset])

  // Очистка истории ошибок
  const clearErrorHistory = useCallback(() => {
    setErrorHistory([])
  }, [])

  // Получение последней ошибки
  const getLastError = useCallback((): ErrorInfo | null => {
    return errorHistory[0] || null
  }, [errorHistory])

  // Получение ошибок за период
  const getErrorsByPeriod = useCallback((startDate: Date, endDate: Date): ErrorInfo[] => {
    return errorHistory.filter(error => 
      error.timestamp >= startDate && error.timestamp <= endDate
    )
  }, [errorHistory])

  // Группировка ошибок по типу
  const getErrorsByType = useCallback((): Record<string, ErrorInfo[]> => {
    return errorHistory.reduce((groups, errorInfo) => {
      const errorType = errorInfo.error.constructor.name
      if (!groups[errorType]) {
        groups[errorType] = []
      }
      groups[errorType].push(errorInfo)
      return groups
    }, {} as Record<string, ErrorInfo[]>)
  }, [errorHistory])

  // Форматирование ошибки для отображения
  const formatError = useCallback((errorInfo: ErrorInfo): string => {
    const { error, timestamp, componentStack } = errorInfo
    const time = timestamp.toLocaleString()
    
    let formatted = `[${time}] ${error.name}: ${error.message}\n`
    
    if (error.stack) {
      formatted += `Stack Trace:\n${error.stack}\n`
    }
    
    if (componentStack) {
      formatted += `Component Stack:\n${componentStack}\n`
    }
    
    return formatted
  }, [])

  // Экспорт истории ошибок
  const exportErrorHistory = useCallback((): string => {
    return JSON.stringify(errorHistory.map(errorInfo => ({
      ...errorInfo,
      error: {
        name: errorInfo.error.name,
        message: errorInfo.error.message,
        stack: errorInfo.error.stack,
      },
      timestamp: errorInfo.timestamp.toISOString(),
    })), null, 2)
  }, [errorHistory])

  // Импорт истории ошибок
  const importErrorHistory = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json)
      const parsedHistory: ErrorInfo[] = imported.map((item: any) => ({
        error: new Error(item.error.message),
        errorInfo: item.errorInfo,
        timestamp: new Date(item.timestamp),
        componentStack: item.componentStack,
      }))
      
      setErrorHistory(parsedHistory)
      return true
    } catch {
      return false
    }
  }, [])

  // Глобальный обработчик ошибок
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      handleError(event.error)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)))
    }

    window.addEventListener('error', handleGlobalError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleGlobalError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [handleError])

  return {
    error,
    errorInfo,
    errorHistory,
    hasError: !!error,
    handleError,
    resetError,
    clearErrorHistory,
    getLastError,
    getErrorsByPeriod,
    getErrorsByType,
    formatError,
    exportErrorHistory,
    importErrorHistory,
    fallback: error ? (fallback || null) : null,
  }
}