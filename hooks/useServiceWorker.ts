import { useState, useEffect, useCallback } from 'react'

interface ServiceWorkerState {
  registration: ServiceWorkerRegistration | null
  updateFound: boolean
  waiting: ServiceWorker | null
  controlling: ServiceWorker | null
  isSupported: boolean
}

interface UseServiceWorkerOptions {
  scriptURL: string
  scope?: string
  onUpdateFound?: (registration: ServiceWorkerRegistration) => void
  onUpdateReady?: (registration: ServiceWorkerRegistration) => void
  onSuccess?: (registration: ServiceWorkerRegistration) => void
  onError?: (error: Error) => void
}

export function useServiceWorker(options: UseServiceWorkerOptions) {
  const {
    scriptURL,
    scope = '/',
    onUpdateFound,
    onUpdateReady,
    onSuccess,
    onError,
  } = options

  const [state, setState] = useState<ServiceWorkerState>({
    registration: null,
    updateFound: false,
    waiting: null,
    controlling: null,
    isSupported: 'serviceWorker' in navigator,
  })

  // Регистрация Service Worker
  const register = useCallback(async () => {
    if (!state.isSupported) {
      const error = new Error('Service Worker не поддерживается')
      if (onError) onError(error)
      return null
    }

    try {
      const registration = await navigator.serviceWorker.register(scriptURL, { scope })
      
      setState(prev => ({
        ...prev,
        registration,
        controlling: registration.installing || registration.waiting || registration.active,
      }))

      // Обработчик обновления Service Worker
      registration.onupdatefound = () => {
        const installingWorker = registration.installing
        if (!installingWorker) return

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Новый Service Worker установлен и готов к активации
              setState(prev => ({
                ...prev,
                updateFound: true,
                waiting: installingWorker,
              }))

              if (onUpdateReady) {
                onUpdateReady(registration)
              }
            } else {
              // Первая установка Service Worker
              if (onSuccess) {
                onSuccess(registration)
              }
            }
          }
        }

        if (onUpdateFound) {
          onUpdateFound(registration)
        }
      }

      return registration
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Ошибка регистрации Service Worker')
      if (onError) onError(err)
      return null
    }
  }, [scriptURL, scope, state.isSupported, onUpdateFound, onUpdateReady, onSuccess, onError])

  // Обновление Service Worker
  const update = useCallback(async () => {
    if (!state.registration) {
      const error = new Error('Service Worker не зарегистрирован')
      if (onError) onError(error)
      return false
    }

    try {
      await state.registration.update()
      return true
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Ошибка обновления Service Worker')
      if (onError) onError(err)
      return false
    }
  }, [state.registration, onError])

  // Активация нового Service Worker
  const activateUpdate = useCallback(async () => {
    if (!state.waiting) {
      const error = new Error('Нет ожидающего Service Worker')
      if (onError) onError(error)
      return false
    }

    try {
      // Отправляем сообщение о готовности к активации
      state.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Перезагружаем страницу после активации
      window.location.reload()
      
      return true
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Ошибка активации Service Worker')
      if (onError) onError(err)
      return false
    }
  }, [state.waiting, onError])

  // Отправка сообщения Service Worker
  const sendMessage = useCallback(async (message: any) => {
    if (!state.registration?.active) {
      const error = new Error('Service Worker не активен')
      if (onError) onError(error)
      return null
    }

    try {
      return new Promise((resolve, reject) => {
        const messageChannel = new MessageChannel()
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data.error) {
            reject(new Error(event.data.error))
          } else {
            resolve(event.data)
          }
        }

        state.registration!.active!.postMessage(message, [messageChannel.port2])
      })
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Ошибка отправки сообщения')
      if (onError) onError(err)
      return null
    }
  }, [state.registration, onError])

  // Проверка состояния кэша
  const checkCache = useCallback(async () => {
    try {
      const response = await sendMessage({ type: 'GET_CACHE_INFO' })
      return response
    } catch (error) {
      console.error('Ошибка проверки кэша:', error)
      return null
    }
  }, [sendMessage])

  // Очистка кэша
  const clearCache = useCallback(async () => {
    try {
      const response = await sendMessage({ type: 'CLEAR_CACHE' })
      return response
    } catch (error) {
      console.error('Ошибка очистки кэша:', error)
      return null
    }
  }, [sendMessage])

  // Удаление Service Worker
  const unregister = useCallback(async () => {
    if (!state.registration) {
      return false
    }

    try {
      const unregistered = await state.registration.unregister()
      
      if (unregistered) {
        setState({
          registration: null,
          updateFound: false,
          waiting: null,
          controlling: null,
          isSupported: state.isSupported,
        })
      }
      
      return unregistered
    } catch (error) {
      console.error('Ошибка удаления Service Worker:', error)
      return false
    }
  }, [state.registration, state.isSupported])

  // Инициализация при монтировании
  useEffect(() => {
    if (state.isSupported) {
      register()
    }

    // Обработчик изменения состояния Service Worker
    const handleControllerChange = () => {
      setState(prev => ({
        ...prev,
        controlling: navigator.serviceWorker.controller,
      }))
    }

    if (state.isSupported) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
    }

    return () => {
      if (state.isSupported) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      }
    }
  }, [state.isSupported, register])

  return {
    ...state,
    register,
    update,
    activateUpdate,
    sendMessage,
    checkCache,
    clearCache,
    unregister,
  }
}