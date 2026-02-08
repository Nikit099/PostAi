import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAState {
  isInstalled: boolean
  canInstall: boolean
  isStandalone: boolean
  deferredPrompt: BeforeInstallPromptEvent | null
  isOnline: boolean
  isUpdateAvailable: boolean
}

interface UsePWAOptions {
  onBeforeInstallPrompt?: (event: BeforeInstallPromptEvent) => void
  onAppInstalled?: () => void
  onUpdateAvailable?: () => void
}

declare global {
  interface Window {
    BeforeInstallPromptEvent?: typeof Event
  }
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
  const handleBeforeInstallPrompt = useCallback((event: Event) => {
    const beforeInstallEvent = event as BeforeInstallPromptEvent
    
    // Предотвращаем автоматическое отображение подсказки
    event.preventDefault()
    
    // Сохраняем событие для использования позже
    setState(prev => ({
      ...prev,
      deferredPrompt: beforeInstallEvent,
    }))

    if (onBeforeInstallPrompt) {
      onBeforeInstallPrompt(beforeInstallEvent)
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
    const docElement = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>
      mozRequestFullScreen?: () => Promise<void>
      msRequestFullscreen?: () => Promise<void>
    }
    
    if (docElement.requestFullscreen) {
      docElement.requestFullscreen()
    } else if (docElement.webkitRequestFullscreen) {
      docElement.webkitRequestFullscreen()
    } else if (docElement.mozRequestFullScreen) {
      docElement.mozRequestFullScreen()
    } else if (docElement.msRequestFullscreen) {
      docElement.msRequestFullscreen()
    }
  }, [])

  // Выход из полноэкранного режима
  const exitFullscreen = useCallback(() => {
    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void>
      mozCancelFullScreen?: () => Promise<void>
      msExitFullscreen?: () => Promise<void>
    }
    
    if (doc.exitFullscreen) {
      doc.exitFullscreen()
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen()
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen()
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen()
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