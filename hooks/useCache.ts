import { useState, useCallback } from 'react'

interface CacheOptions {
  ttl?: number // Time to live в миллисекундах
  version?: string // Версия кэша для инвалидации
}

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
  version: string
}

export function useCache<T>(cacheName: string, options: CacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, version = '1.0' } = options

  const [cache, setCache] = useState<Map<string, CacheItem<T>>>(new Map())

  // Инициализация кэша из localStorage
  const initializeCache = useCallback(() => {
    try {
      const storedCache = localStorage.getItem(`cache_${cacheName}`)
      if (storedCache) {
        const parsedCache = JSON.parse(storedCache)
        const cacheMap = new Map<string, CacheItem<T>>()

        // Фильтруем просроченные элементы
        const now = Date.now()
        Object.entries(parsedCache).forEach(([key, value]: [string, any]) => {
          if (value.expiresAt > now && value.version === version) {
            cacheMap.set(key, value)
          }
        })

        setCache(cacheMap)
        return cacheMap
      }
    } catch (error) {
      console.error('Ошибка при инициализации кэша:', error)
    }
    
    return new Map<string, CacheItem<T>>()
  }, [cacheName, version])

  // Сохранение кэша в localStorage
  const saveCache = useCallback((cacheMap: Map<string, CacheItem<T>>) => {
    try {
      const cacheObject = Object.fromEntries(cacheMap)
      localStorage.setItem(`cache_${cacheName}`, JSON.stringify(cacheObject))
    } catch (error) {
      console.error('Ошибка при сохранении кэша:', error)
    }
  }, [cacheName])

  // Получение элемента из кэша
  const get = useCallback((key: string): T | null => {
    const item = cache.get(key)
    
    if (!item) {
      return null
    }

    // Проверяем срок действия
    if (Date.now() > item.expiresAt) {
      cache.delete(key)
      saveCache(cache)
      return null
    }

    // Проверяем версию
    if (item.version !== version) {
      cache.delete(key)
      saveCache(cache)
      return null
    }

    return item.data
  }, [cache, version, saveCache])

  // Сохранение элемента в кэш
  const set = useCallback((key: string, data: T, customTtl?: number) => {
    const now = Date.now()
    const expiresAt = now + (customTtl || ttl)
    
    const newItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt,
      version,
    }

    const newCache = new Map(cache)
    newCache.set(key, newItem)
    
    setCache(newCache)
    saveCache(newCache)
  }, [cache, ttl, version, saveCache])

  // Удаление элемента из кэша
  const remove = useCallback((key: string) => {
    const newCache = new Map(cache)
    newCache.delete(key)
    
    setCache(newCache)
    saveCache(newCache)
  }, [cache, saveCache])

  // Очистка всего кэша
  const clear = useCallback(() => {
    const newCache = new Map<string, CacheItem<T>>()
    setCache(newCache)
    saveCache(newCache)
  }, [saveCache])

  // Получение всех ключей кэша
  const keys = useCallback((): string[] => {
    return Array.from(cache.keys())
  }, [cache])

  // Проверка наличия ключа в кэше
  const has = useCallback((key: string): boolean => {
    return cache.has(key)
  }, [cache])

  // Получение размера кэша
  const size = useCallback((): number => {
    return cache.size
  }, [cache])

  // Очистка просроченных элементов
  const cleanup = useCallback(() => {
    const now = Date.now()
    const newCache = new Map<string, CacheItem<T>>()

    cache.forEach((item, key) => {
      if (item.expiresAt > now && item.version === version) {
        newCache.set(key, item)
      }
    })

    setCache(newCache)
    saveCache(newCache)
    
    return cache.size - newCache.size // Количество удаленных элементов
  }, [cache, version, saveCache])

  // Получение элемента с автоматическим обновлением
  const getWithRefresh = useCallback(async (
    key: string,
    fetchFunction: () => Promise<T>,
    forceRefresh: boolean = false
  ): Promise<T> => {
    // Если не принудительное обновление, пробуем получить из кэша
    if (!forceRefresh) {
      const cachedData = get(key)
      if (cachedData !== null) {
        return cachedData
      }
    }

    // Получаем свежие данные
    try {
      const freshData = await fetchFunction()
      set(key, freshData)
      return freshData
    } catch (error) {
      // В случае ошибки пробуем вернуть кэшированные данные, если они есть
      const cachedData = get(key)
      if (cachedData !== null) {
        return cachedData
      }
      throw error
    }
  }, [get, set])

  // Инициализация кэша при монтировании
  useState(() => {
    initializeCache()
    
    // Периодическая очистка просроченных элементов
    const cleanupInterval = setInterval(cleanup, 60 * 1000) // Каждую минуту
    
    return () => {
      clearInterval(cleanupInterval)
    }
  })

  return {
    get,
    set,
    remove,
    clear,
    keys,
    has,
    size,
    cleanup,
    getWithRefresh,
    initializeCache,
  }
}