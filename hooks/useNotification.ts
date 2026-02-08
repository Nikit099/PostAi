import { useState, useCallback } from 'react'

// Определяем интерфейс для действий уведомлений
interface CustomNotificationAction {
  action: string
  title: string
  icon?: string
}

// Используем встроенный тип NotificationOptions из TypeScript
// и расширяем его для дополнительных свойств
interface CustomNotificationOptions {
  title: string
  body?: string
  icon?: string
  badge?: string
  image?: string // Нестандартное свойство, но поддерживается в некоторых браузерах
  tag?: string
  data?: any
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number | number[] // Нестандартное свойство
  actions?: CustomNotificationAction[]
}

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof Notification === 'undefined') {
      return 'denied'
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } catch (error) {
      console.error('Ошибка при запросе разрешения на уведомления:', error)
      return 'denied'
    }
  }, [])

  const showNotification = useCallback(async (options: CustomNotificationOptions) => {
    if (typeof Notification === 'undefined') {
      console.warn('Web Notifications не поддерживаются')
      return null
    }

    if (permission !== 'granted') {
      const newPermission = await requestPermission()
      if (newPermission !== 'granted') {
        console.warn('Разрешение на уведомления не получено')
        return null
      }
    }

    try {
      // Создаем базовый объект опций для Notification
      const notificationOptions: any = {
        body: options.body,
        icon: options.icon,
        badge: options.badge,
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction,
        silent: options.silent,
      }

      // Добавляем нестандартные свойства, если они есть
      if (options.vibrate !== undefined) {
        notificationOptions.vibrate = options.vibrate
      }
      
      if (options.actions !== undefined) {
        notificationOptions.actions = options.actions
      }
      
      if (options.image !== undefined) {
        notificationOptions.image = options.image
      }

      const notification = new Notification(options.title, notificationOptions)

      return notification
    } catch (error) {
      console.error('Ошибка при показе уведомления:', error)
      return null
    }
  }, [permission, requestPermission])

  const showSuccessNotification = useCallback((title: string, body?: string) => {
    return showNotification({
      title,
      body,
      icon: '/icons/success.png',
      tag: 'success',
    })
  }, [showNotification])

  const showErrorNotification = useCallback((title: string, body?: string) => {
    return showNotification({
      title,
      body,
      icon: '/icons/error.png',
      tag: 'error',
      requireInteraction: true,
    })
  }, [showNotification])

  const showInfoNotification = useCallback((title: string, body?: string) => {
    return showNotification({
      title,
      body,
      icon: '/icons/info.png',
      tag: 'info',
    })
  }, [showNotification])

  const showWarningNotification = useCallback((title: string, body?: string) => {
    return showNotification({
      title,
      body,
      icon: '/icons/warning.png',
      tag: 'warning',
    })
  }, [showNotification])

  const isSupported = typeof Notification !== 'undefined'

  return {
    permission,
    requestPermission,
    showNotification,
    showSuccessNotification,
    showErrorNotification,
    showInfoNotification,
    showWarningNotification,
    isSupported,
  }
}