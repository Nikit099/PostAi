import { useState, useRef, useCallback, useEffect } from 'react'

interface UseWebWorkerOptions<T, R> {
  workerScript: string | (() => Worker)
  onMessage?: (result: R) => void
  onError?: (error: Error) => void
  autoTerminate?: boolean
}

export function useWebWorker<T, R>(options: UseWebWorkerOptions<T, R>) {
  const {
    workerScript,
    onMessage,
    onError,
    autoTerminate = true,
  } = options

  const workerRef = useRef<Worker | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<R | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [progress, setProgress] = useState(0)

  // Инициализация воркера
  const initializeWorker = useCallback(() => {
    if (workerRef.current) {
      terminateWorker()
    }

    try {
      let worker: Worker

      if (typeof workerScript === 'string') {
        // Создаем воркер из URL
        worker = new Worker(workerScript)
      } else {
        // Создаем воркер из функции
        worker = workerScript()
      }

      workerRef.current = worker
      setIsRunning(true)
      setError(null)
      setProgress(0)

      // Обработчик сообщений от воркера
      worker.onmessage = (event: MessageEvent) => {
        const { type, data, progress } = event.data

        switch (type) {
          case 'result':
            setResult(data)
            setIsRunning(false)
            if (onMessage) {
              onMessage(data)
            }
            break

          case 'progress':
            setProgress(progress)
            break

          case 'error':
            const error = new Error(data.message || 'Ошибка в воркере')
            setError(error)
            setIsRunning(false)
            if (onError) {
              onError(error)
            }
            break
        }
      }

      // Обработчик ошибок воркера
      worker.onerror = (event: ErrorEvent) => {
        const error = new Error(event.message || 'Ошибка в воркере')
        setError(error)
        setIsRunning(false)
        if (onError) {
          onError(error)
        }
      }

      // Обработчик завершения воркера
      worker.onmessageerror = (event: MessageEvent) => {
        const error = new Error('Ошибка при обработке сообщения воркера')
        setError(error)
        setIsRunning(false)
        if (onError) {
          onError(error)
        }
      }

      return worker
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Не удалось создать воркер')
      setError(error)
      if (onError) {
        onError(error)
      }
      return null
    }
  }, [workerScript, onMessage, onError])

  // Запуск задачи в воркере
  const runTask = useCallback((data: T, transfer?: Transferable[]) => {
    if (!workerRef.current) {
      initializeWorker()
    }

    if (!workerRef.current) {
      const error = new Error('Воркер не инициализирован')
      setError(error)
      if (onError) {
        onError(error)
      }
      return
    }

    setIsRunning(true)
    setResult(null)
    setError(null)
    setProgress(0)

    try {
      if (transfer) {
        workerRef.current.postMessage(data, transfer)
      } else {
        workerRef.current.postMessage(data)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Ошибка при отправке данных воркеру')
      setError(error)
      setIsRunning(false)
      if (onError) {
        onError(error)
      }
    }
  }, [initializeWorker, onError])

  // Завершение воркера
  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
    
    setIsRunning(false)
    setResult(null)
    setError(null)
    setProgress(0)
  }, [])

  // Перезапуск воркера
  const restartWorker = useCallback(() => {
    terminateWorker()
    initializeWorker()
  }, [terminateWorker, initializeWorker])

  // Отправка сообщения воркеру
  const sendMessage = useCallback((message: any, transfer?: Transferable[]) => {
    if (!workerRef.current) {
      const error = new Error('Воркер не инициализирован')
      setError(error)
      return false
    }

    try {
      if (transfer) {
        workerRef.current.postMessage(message, transfer)
      } else {
        workerRef.current.postMessage(message)
      }
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Ошибка при отправке сообщения')
      setError(error)
      return false
    }
  }, [])

  // Инициализация при монтировании
  useEffect(() => {
    initializeWorker()

    return () => {
      if (autoTerminate) {
        terminateWorker()
      }
    }
  }, [initializeWorker, autoTerminate, terminateWorker])

  return {
    isRunning,
    result,
    error,
    progress,
    runTask,
    terminateWorker,
    restartWorker,
    sendMessage,
    worker: workerRef.current,
  }
}