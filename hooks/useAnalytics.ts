import { useCallback, useEffect } from 'react'

interface AnalyticsEvent {
  category: string
  action: string
  label?: string
  value?: number
  [key: string]: any
}

interface PageView {
  path: string
  title?: string
  [key: string]: any
}

interface UseAnalyticsOptions {
  trackingId?: string
  enabled?: boolean
  debug?: boolean
  onError?: (error: Error) => void
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const {
    trackingId,
    enabled = true,
    debug = false,
    onError,
  } = options

  // Проверка поддержки аналитики
  const isSupported = typeof window !== 'undefined' && 'gtag' in window

  // Инициализация аналитики
  const initialize = useCallback(() => {
    if (!enabled || !isSupported || !trackingId) {
      return false
    }

    try {
      // Инициализация Google Analytics
      ;(window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).gtag = function() {
        ;(window as any).dataLayer.push(arguments)
      }
      
      ;(window as any).gtag('js', new Date())
      ;(window as any).gtag('config', trackingId, {
        page_path: window.location.pathname,
        debug_mode: debug,
      })

      if (debug) {
        console.log('Analytics initialized with tracking ID:', trackingId)
      }

      return true
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Ошибка инициализации аналитики')
      if (onError) onError(err)
      return false
    }
  }, [enabled, isSupported, trackingId, debug, onError])

  // Отправка события
  const sendEvent = useCallback((event: AnalyticsEvent) => {
    if (!enabled || !isSupported) {
      return false
    }

    try {
      const { category, action, label, value, ...customParams } = event
      
      ;(window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        ...customParams,
      })

      if (debug) {
        console.log('Analytics event sent:', event)
      }

      return true
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Ошибка отправки события аналитики')
      if (onError) onError(err)
      return false
    }
  }, [enabled, isSupported, debug, onError])

  // Отправка просмотра страницы
  const sendPageView = useCallback((pageView: PageView) => {
    if (!enabled || !isSupported || !trackingId) {
      return false
    }

    try {
      const { path, title, ...customParams } = pageView
      
      ;(window as any).gtag('config', trackingId, {
        page_path: path,
        page_title: title,
        ...customParams,
      })

      if (debug) {
        console.log('Page view sent:', pageView)
      }

      return true
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Ошибка отправки просмотра страницы')
      if (onError) onError(err)
      return false
    }
  }, [enabled, isSupported, trackingId, debug, onError])

  // Отправка исключения
  const sendException = useCallback((description: string, fatal: boolean = false) => {
    return sendEvent({
      category: 'Exceptions',
      action: 'exception',
      label: description,
      value: fatal ? 1 : 0,
    })
  }, [sendEvent])

  // Отправка времени загрузки
  const sendTiming = useCallback((category: string, variable: string, value: number, label?: string) => {
    return sendEvent({
      category: 'Timing',
      action: 'timing_complete',
      label: `${category}.${variable}${label ? `.${label}` : ''}`,
      value: Math.round(value),
      timing_category: category,
      timing_var: variable,
      timing_value: value,
      timing_label: label,
    })
  }, [sendEvent])

  // Предопределенные события
  const trackButtonClick = useCallback((buttonName: string, location?: string) => {
    return sendEvent({
      category: 'UI',
      action: 'button_click',
      label: buttonName,
      location: location || 'unknown',
    })
  }, [sendEvent])

  const trackFormSubmit = useCallback((formName: string, success: boolean = true) => {
    return sendEvent({
      category: 'Forms',
      action: 'form_submit',
      label: formName,
      value: success ? 1 : 0,
    })
  }, [sendEvent])

  const trackLogin = useCallback((method: string, success: boolean = true) => {
    return sendEvent({
      category: 'Auth',
      action: 'login',
      label: method,
      value: success ? 1 : 0,
    })
  }, [sendEvent])

  const trackSignUp = useCallback((method: string, success: boolean = true) => {
    return sendEvent({
      category: 'Auth',
      action: 'sign_up',
      label: method,
      value: success ? 1 : 0,
    })
  }, [sendEvent])

  const trackPurchase = useCallback((
    transactionId: string,
    value: number,
    currency: string = 'RUB',
    items: Array<{ id: string; name: string; price: number; quantity: number }>
  ) => {
    return sendEvent({
      category: 'Ecommerce',
      action: 'purchase',
      label: transactionId,
      value: value,
      currency: currency,
      items: items,
    })
  }, [sendEvent])

  const trackSearch = useCallback((searchTerm: string, resultsCount?: number) => {
    return sendEvent({
      category: 'Search',
      action: 'search',
      label: searchTerm,
      value: resultsCount,
    })
  }, [sendEvent])

  const trackShare = useCallback((contentType: string, method: string, contentId?: string) => {
    return sendEvent({
      category: 'Social',
      action: 'share',
      label: contentType,
      method: method,
      content_id: contentId,
    })
  }, [sendEvent])

  // Инициализация при монтировании
  useEffect(() => {
    if (enabled && trackingId) {
      initialize()
    }
  }, [enabled, trackingId, initialize])

  // Отслеживание изменения пути
  useEffect(() => {
    if (enabled && trackingId) {
      sendPageView({
        path: window.location.pathname,
        title: document.title,
      })
    }
  }, [enabled, trackingId, sendPageView])

  return {
    isSupported,
    isEnabled: enabled,
    initialize,
    sendEvent,
    sendPageView,
    sendException,
    sendTiming,
    trackButtonClick,
    trackFormSubmit,
    trackLogin,
    trackSignUp,
    trackPurchase,
    trackSearch,
    trackShare,
  }
}