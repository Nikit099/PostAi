import { useState, useEffect, useCallback } from 'react'

interface PWAState {
  isInstalled: boolean
  canInstall: boolean
  isStandalone: boolean
  deferredPrompt: any | null
  isOnline: boolean
  isUpdateAvailable: boolean
}

interface UsePWAOptions {
  onBeforeInstallPrompt?: (event: any) => void
  onAppInstalled?: () => void
  onUpdateAvailable?: () => void
}

export function usePWA(options: UsePWAOptions = {}) {
  const {
    onBeforeInstallPrompt,
    onAppInstalled,
    onUpdateAvailable,
  } = options

  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    canInstall: false,
    isStandalone: false,
    deferredPrompt: null,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
  })

  // Проверка, установлено ли приложение
  const checkInstallation = useCallback(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInstalled = isStandalone || (window.navigator as any).standalone
    
    setState(prev => ({
      ...prev,
      isInstalled,
      isStandalone,
    }))
  }, [])

  // Проверка возможности установки
  const checkInstallability = useCallback(() => {
    const canInstall = 'BeforeInstallPromptEvent' in window
    
    setState(prev => ({
      ...prev,
      canInstall,
    }))
  }, [])

  // Обработчик события beforeinstallprompt
  const handleBeforeInstallPrompt = useCallback((event: any) => {
    // Предотвращаем автоматическое отображение подсказки
    event.preventDefault()
    
    // Сохраняем событие для использования позже
    setState(prev => ({
      ...prev,
      deferredPrompt: event,
    }))

    if (onBeforeInstallPrompt) {
      onBeforeInstallPrompt(event)
    }
  }, [onBeforeInstallPrompt])

  // Обработчик события appinstalled
  const handleAppInstalled = useCallback(() => {
    setState(prev => ({
      ...prev,
      isInstalled: true,
      deferredPrompt: null,
    }))

    if (onAppInstalled) {
      onAppInstalled()
    }
  }, [onAppInstalled])

  // Обработчик изменения онлайн-статуса
  const handleOnlineStatus = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOnline: navigator.onLine,
    }))
  }, [])

  // Запрос на установку приложения
  const install = useCallback(async (): Promise<boolean> => {
    if (!state.deferredPrompt) {
      console.warn('Нет отложенного события установки')
      return false
    }

    try {
      // Показываем подсказку установки
      state.deferredPrompt.prompt()
      
      // Ждем выбора пользователя
      const { outcome } = await state.deferredPrompt.userChoice
      
      // Очищаем отложенное событие
      setState(prev => ({
        ...prev,
        deferredPrompt: null,
      }))

      return outcome === 'accepted'
    } catch (error) {
      console.error('Ошибка при установке:', error)
      return false
    }
  }, [state.deferredPrompt])

  // Проверка обновлений
  const checkForUpdates = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update().then(() => {
          // Проверяем, есть ли ожидающий Service Worker
          if (registration.waiting) {
            setState(prev => ({
              ...prev,
              isUpdateAvailable: true,
            }))

            if (onUpdateAvailable) {
              onUpdateAvailable()
            }
          }
        })
      })
    }
  }, [onUpdateAvailable])

  // Активация обновления
  const activateUpdate = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          // Отправляем сообщение о готовности к активации
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          
          // Перезагружаем страницу
          window.location.reload()
        }
      })
    }
  }, [])

  // Открытие приложения в полноэкранном режиме
  const openFullscreen = useCallback(() => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    } else if ((document.documentElement as any).webkitRequestFullscreen) {
      (document.documentElement as any).webkitRequestFullscreen()
    } else if ((document.documentElement as any).mozRequestFullScreen) {
      (document.documentElement as any).mozRequestFullScreen()
    } else if ((document.documentElement as any).msRequestFullscreen) {
      (document.documentElement as any).msRequestFullscreen()
    }
  }, [])

  // Выход из полноэкранного режима
  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen()
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen()
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen()
    }
  }, [])

  // Инициализация при монтировании
  useEffect(() => {
    // Проверяем начальное состояние
    checkInstallation()
    checkInstallability()
    checkForUpdates()

    // Добавляем обработчики событий
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)

    // Периодическая проверка обновлений
    const updateInterval = setInterval(checkForUpdates, 5 * 60 * 1000) // Каждые 5 минут

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
      clearInterval(updateInterval)
    }
  }, [checkInstallation, checkInstallability, checkForUpdates, handleBeforeInstallPrompt, handleAppInstalled, handleOnlineStatus])

  return {
    ...state,
    install,
    activateUpdate,
    openFullscreen,
    exitFullscreen,
    checkForUpdates,
  }
}