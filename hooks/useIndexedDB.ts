import { useState, useCallback } from 'react'

interface IndexedDBOptions {
  databaseName: string
  version?: number
  stores: Array<{
    name: string
    keyPath: string
    indexes?: Array<{
      name: string
      keyPath: string | string[]
      options?: IDBIndexParameters
    }>
  }>
}

export function useIndexedDB<T>(options: IndexedDBOptions) {
  const { databaseName, version = 1, stores } = options
  
  const [db, setDb] = useState<IDBDatabase | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Инициализация базы данных
  const initialize = useCallback(async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        const errorMsg = 'IndexedDB не поддерживается вашим браузером'
        setError(errorMsg)
        reject(new Error(errorMsg))
        return
      }

      const request = indexedDB.open(databaseName, version)

      request.onerror = () => {
        const errorMsg = `Ошибка открытия базы данных: ${request.error}`
        setError(errorMsg)
        reject(new Error(errorMsg))
      }

      request.onsuccess = () => {
        const database = request.result
        setDb(database)
        setIsInitialized(true)
        setError(null)
        resolve(database)
      }

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result
        
        // Создаем хранилища
        stores.forEach(storeConfig => {
          if (!database.objectStoreNames.contains(storeConfig.name)) {
            const store = database.createObjectStore(
              storeConfig.name,
              { keyPath: storeConfig.keyPath }
            )

            // Создаем индексы
            storeConfig.indexes?.forEach(indexConfig => {
              store.createIndex(
                indexConfig.name,
                indexConfig.keyPath,
                indexConfig.options
              )
            })
          }
        })
      }
    })
  }, [databaseName, version, stores])

  // Добавление записи
  const add = useCallback(async <T>(storeName: string, data: T): Promise<IDBValidKey> => {
    if (!db) {
      await initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }, [db, initialize])

  // Получение записи по ключу
  const get = useCallback(async <T>(storeName: string, key: IDBValidKey): Promise<T | undefined> => {
    if (!db) {
      await initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }, [db, initialize])

  // Получение всех записей
  const getAll = useCallback(async <T>(storeName: string): Promise<T[]> => {
    if (!db) {
      await initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }, [db, initialize])

  // Обновление записи
  const update = useCallback(async <T>(storeName: string, key: IDBValidKey, data: T): Promise<void> => {
    if (!db) {
      await initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data, key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }, [db, initialize])

  // Удаление записи
  const remove = useCallback(async (storeName: string, key: IDBValidKey): Promise<void> => {
    if (!db) {
      await initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }, [db, initialize])

  // Очистка хранилища
  const clear = useCallback(async (storeName: string): Promise<void> => {
    if (!db) {
      await initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }, [db, initialize])

  // Поиск по индексу
  const getByIndex = useCallback(async <T>(
    storeName: string,
    indexName: string,
    key: IDBValidKey | IDBKeyRange
  ): Promise<T[]> => {
    if (!db) {
      await initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }, [db, initialize])

  // Получение количества записей
  const count = useCallback(async (storeName: string): Promise<number> => {
    if (!db) {
      await initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.count()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }, [db, initialize])

  // Удаление базы данных
  const deleteDatabase = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(databaseName)

      request.onsuccess = () => {
        setDb(null)
        setIsInitialized(false)
        resolve()
      }
      
      request.onerror = () => reject(request.error)
      request.onblocked = () => reject(new Error('База данных заблокирована'))
    })
  }, [databaseName])

  // Инициализация при монтировании
  useState(() => {
    initialize().catch(console.error)
    
    return () => {
      if (db) {
        db.close()
      }
    }
  })

  return {
    db,
    isInitialized,
    error,
    initialize,
    add,
    get,
    getAll,
    update,
    remove,
    clear,
    getByIndex,
    count,
    deleteDatabase,
  }
}