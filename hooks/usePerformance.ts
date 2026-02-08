import { useState, useEffect, useCallback } from 'react'

interface PerformanceMetrics {
  navigation: PerformanceNavigationTiming | null
  paint: {
    firstPaint: number | null
    firstContentfulPaint: number | null
    largestContentfulPaint: number | null
  }
  loading: {
    domContentLoaded: number | null
    load: number | null
  }
  resources: PerformanceResourceTiming[]
  memory: {
    usedJSHeapSize: number | null
    totalJSHeapSize: number | null
    jsHeapSizeLimit: number | null
  }
  longTasks: PerformanceEntry[]
}

interface UsePerformanceOptions {
  onMetricsReady?: (metrics: PerformanceMetrics) => void
  onLongTask?: (task: PerformanceEntry) => void
  longTaskThreshold?: number
}

export function usePerformance(options: UsePerformanceOptions = {}) {
  const {
    onMetricsReady,
    onLongTask,
    longTaskThreshold = 50,
  } = options

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    navigation: null,
    paint: {
      firstPaint: null,
      firstContentfulPaint: null,
      largestContentfulPaint: null,
    },
    loading: {
      domContentLoaded: null,
      load: null,
    },
    resources: [],
    memory: {
      usedJSHeapSize: null,
      totalJSHeapSize: null,
      jsHeapSizeLimit: null,
    },
    longTasks: [],
  })

  // Получение метрик навигации
  const getNavigationMetrics = useCallback((): PerformanceNavigationTiming | null => {
    if (typeof performance === 'undefined') {
      return null
    }

    const entries = performance.getEntriesByType('navigation')
    return entries.length > 0 ? entries[0] as PerformanceNavigationTiming : null
  }, [])

  // Получение метрик отрисовки
  const getPaintMetrics = useCallback(() => {
    if (typeof performance === 'undefined') {
      return {
        firstPaint: null,
        firstContentfulPaint: null,
        largestContentfulPaint: null,
      }
    }

    const paintEntries = performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')

    const largestContentfulPaintEntries = performance.getEntriesByType('largest-contentful-paint')
    const largestContentfulPaint = largestContentfulPaintEntries.length > 0 
      ? largestContentfulPaintEntries[largestContentfulPaintEntries.length - 1]
      : null

    return {
      firstPaint: firstPaint ? Math.round(firstPaint.startTime) : null,
      firstContentfulPaint: firstContentfulPaint ? Math.round(firstContentfulPaint.startTime) : null,
      largestContentfulPaint: largestContentfulPaint ? Math.round(largestContentfulPaint.startTime) : null,
    }
  }, [])

  // Получение метрик загрузки
  const getLoadingMetrics = useCallback(() => {
    if (typeof performance === 'undefined') {
      return {
        domContentLoaded: null,
        load: null,
      }
    }

    const navigation = getNavigationMetrics()
    
    return {
      domContentLoaded: navigation ? Math.round(navigation.domContentLoadedEventEnd) : null,
      load: navigation ? Math.round(navigation.loadEventEnd) : null,
    }
  }, [getNavigationMetrics])

  // Получение метрик ресурсов
  const getResourceMetrics = useCallback((): PerformanceResourceTiming[] => {
    if (typeof performance === 'undefined') {
      return []
    }

    return performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  }, [])

  // Получение метрик памяти
  const getMemoryMetrics = useCallback(() => {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      return {
        usedJSHeapSize: null,
        totalJSHeapSize: null,
        jsHeapSizeLimit: null,
      }
    }

    const memory = (performance as any).memory
    
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    }
  }, [])

  // Получение длительных задач
  const getLongTasks = useCallback((): PerformanceEntry[] => {
    if (typeof performance === 'undefined') {
      return []
    }

    const observer = new PerformanceObserver((list) => {
      const newTasks = list.getEntries().filter(entry => entry.duration > longTaskThreshold)
      
      if (newTasks.length > 0) {
        setMetrics(prev => ({
          ...prev,
          longTasks: [...prev.longTasks, ...newTasks],
        }))

        newTasks.forEach(task => {
          if (onLongTask) {
            onLongTask(task)
          }
        })
      }
    })

    observer.observe({ entryTypes: ['longtask'] })

    return []
  }, [longTaskThreshold, onLongTask])

  // Обновление всех метрик
  const updateMetrics = useCallback(() => {
    const navigation = getNavigationMetrics()
    const paint = getPaintMetrics()
    const loading = getLoadingMetrics()
    const resources = getResourceMetrics()
    const memory = getMemoryMetrics()
    const longTasks = getLongTasks()

    const newMetrics: PerformanceMetrics = {
      navigation,
      paint,
      loading,
      resources,
      memory,
      longTasks,
    }

    setMetrics(newMetrics)

    if (onMetricsReady) {
      onMetricsReady(newMetrics)
    }

    return newMetrics
  }, [
    getNavigationMetrics,
    getPaintMetrics,
    getLoadingMetrics,
    getResourceMetrics,
    getMemoryMetrics,
    getLongTasks,
    onMetricsReady,
  ])

  // Получение метрик ресурсов по типу
  const getResourcesByType = useCallback((type: string): PerformanceResourceTiming[] => {
    return metrics.resources.filter(resource => 
      resource.initiatorType === type || resource.name.includes(type)
    )
  }, [metrics.resources])

  // Получение медленных ресурсов
  const getSlowResources = useCallback((threshold: number = 1000): PerformanceResourceTiming[] => {
    return metrics.resources.filter(resource => 
      resource.duration > threshold
    )
  }, [metrics.resources])

  // Расчет общего времени загрузки ресурсов
  const getTotalResourceLoadTime = useCallback((): number => {
    return metrics.resources.reduce((total, resource) => total + resource.duration, 0)
  }, [metrics.resources])

  // Форматирование времени
  const formatTime = useCallback((ms: number): string => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`
    }
    return `${(ms / 1000).toFixed(2)}s`
  }, [])

  // Форматирование размера
  const formatSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  // Экспорт метрик
  const exportMetrics = useCallback((): string => {
    return JSON.stringify(metrics, null, 2)
  }, [metrics])

  // Инициализация при монтировании
  useEffect(() => {
    if (typeof performance === 'undefined') {
      return
    }

    // Ждем полной загрузки страницы
    if (document.readyState === 'complete') {
      updateMetrics()
    } else {
      window.addEventListener('load', updateMetrics)
    }

    // Периодическое обновление метрик
    const interval = setInterval(updateMetrics, 30000) // Каждые 30 секунд

    return () => {
      window.removeEventListener('load', updateMetrics)
      clearInterval(interval)
    }
  }, [updateMetrics])

  return {
    metrics,
    updateMetrics,
    getResourcesByType,
    getSlowResources,
    getTotalResourceLoadTime,
    formatTime,
    formatSize,
    exportMetrics,
  }
}