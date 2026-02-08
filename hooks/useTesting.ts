import { useState, useCallback, useEffect } from 'react'

interface TestCase {
  id: string
  name: string
  description?: string
  run: () => Promise<TestResult>
  timeout?: number
}

interface TestResult {
  id: string
  name: string
  passed: boolean
  error?: Error
  duration: number
  timestamp: Date
}

interface TestSuite {
  id: string
  name: string
  description?: string
  tests: TestCase[]
  beforeAll?: () => Promise<void>
  afterAll?: () => Promise<void>
  beforeEach?: () => Promise<void>
  afterEach?: () => Promise<void>
}

interface UseTestingOptions {
  onTestStart?: (test: TestCase) => void
  onTestComplete?: (result: TestResult) => void
  onSuiteStart?: (suite: TestSuite) => void
  onSuiteComplete?: (suite: TestSuite, results: TestResult[]) => void
  onError?: (error: Error) => void
  autoRun?: boolean
  timeout?: number
}

export function useTesting(options: UseTestingOptions = {}) {
  const {
    onTestStart,
    onTestComplete,
    onSuiteStart,
    onSuiteComplete,
    onError,
    autoRun = false,
    timeout = 5000,
  } = options

  const [suites, setSuites] = useState<TestSuite[]>([])
  const [results, setResults] = useState<Record<string, TestResult[]>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [currentSuite, setCurrentSuite] = useState<string | null>(null)
  const [currentTest, setCurrentTest] = useState<string | null>(null)

  // Добавление тестового набора
  const addSuite = useCallback((suite: TestSuite) => {
    setSuites(prev => {
      // Проверяем, существует ли уже набор с таким ID
      const exists = prev.find(s => s.id === suite.id)
      if (exists) {
        console.warn(`Test suite with id "${suite.id}" already exists`)
        return prev
      }
      return [...prev, suite]
    })
  }, [])

  // Удаление тестового набора
  const removeSuite = useCallback((suiteId: string) => {
    setSuites(prev => prev.filter(suite => suite.id !== suiteId))
    setResults(prev => {
      const newResults = { ...prev }
      delete newResults[suiteId]
      return newResults
    })
  }, [])

  // Запуск одного теста
  const runTest = useCallback(async (suiteId: string, testId: string): Promise<TestResult | null> => {
    const suite = suites.find(s => s.id === suiteId)
    if (!suite) {
      const error = new Error(`Test suite "${suiteId}" not found`)
      if (onError) onError(error)
      return null
    }

    const test = suite.tests.find(t => t.id === testId)
    if (!test) {
      const error = new Error(`Test "${testId}" not found in suite "${suiteId}"`)
      if (onError) onError(error)
      return null
    }

    setCurrentSuite(suiteId)
    setCurrentTest(testId)

    if (onTestStart) {
      onTestStart(test)
    }

    const startTime = Date.now()
    let passed = false
    let error: Error | undefined

    try {
      // Выполняем beforeEach, если есть
      if (suite.beforeEach) {
        await suite.beforeEach()
      }

      // Запускаем тест с таймаутом
      const testPromise = test.run()
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Test timeout after ${test.timeout || timeout}ms`)), test.timeout || timeout)
      })

      await Promise.race([testPromise, timeoutPromise])
      passed = true
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))
      passed = false
    } finally {
      // Выполняем afterEach, если есть
      if (suite.afterEach) {
        try {
          await suite.afterEach()
        } catch (err) {
          console.error('Error in afterEach:', err)
        }
      }
    }

    const duration = Date.now() - startTime
    const result: TestResult = {
      id: testId,
      name: test.name,
      passed,
      error,
      duration,
      timestamp: new Date(),
    }

    // Сохраняем результат
    setResults(prev => ({
      ...prev,
      [suiteId]: [...(prev[suiteId] || []).filter(r => r.id !== testId), result],
    }))

    setCurrentTest(null)

    if (onTestComplete) {
      onTestComplete(result)
    }

    return result
  }, [suites, timeout, onTestStart, onTestComplete, onError])

  // Запуск всех тестов в наборе
  const runSuite = useCallback(async (suiteId: string): Promise<TestResult[]> => {
    const suite = suites.find(s => s.id === suiteId)
    if (!suite) {
      const error = new Error(`Test suite "${suiteId}" not found`)
      if (onError) onError(error)
      return []
    }

    setCurrentSuite(suiteId)
    setIsRunning(true)

    if (onSuiteStart) {
      onSuiteStart(suite)
    }

    const results: TestResult[] = []

    try {
      // Выполняем beforeAll, если есть
      if (suite.beforeAll) {
        await suite.beforeAll()
      }

      // Запускаем все тесты последовательно
      for (const test of suite.tests) {
        const result = await runTest(suiteId, test.id)
        if (result) {
          results.push(result)
        }
      }

      // Выполняем afterAll, если есть
      if (suite.afterAll) {
        await suite.afterAll()
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)))
      }
    } finally {
      setCurrentSuite(null)
      setIsRunning(false)
    }

    if (onSuiteComplete) {
      onSuiteComplete(suite, results)
    }

    return results
  }, [suites, runTest, onSuiteStart, onSuiteComplete, onError])

  // Запуск всех тестовых наборов
  const runAllSuites = useCallback(async (): Promise<Record<string, TestResult[]>> => {
    setIsRunning(true)

    const allResults: Record<string, TestResult[]> = {}

    for (const suite of suites) {
      const results = await runSuite(suite.id)
      allResults[suite.id] = results
    }

    setIsRunning(false)
    return allResults
  }, [suites, runSuite])

  // Получение статистики
  const getStats = useCallback(() => {
    const stats = {
      totalSuites: suites.length,
      totalTests: suites.reduce((sum, suite) => sum + suite.tests.length, 0),
      passedTests: 0,
      failedTests: 0,
      totalDuration: 0,
    }

    Object.values(results).forEach(suiteResults => {
      suiteResults.forEach(result => {
        if (result.passed) {
          stats.passedTests++
        } else {
          stats.failedTests++
        }
        stats.totalDuration += result.duration
      })
    })

    return stats
  }, [suites, results])

  // Получение результатов по набору
  const getSuiteResults = useCallback((suiteId: string): TestResult[] => {
    return results[suiteId] || []
  }, [results])

  // Получение результата теста
  const getTestResult = useCallback((suiteId: string, testId: string): TestResult | null => {
    const suiteResults = results[suiteId]
    if (!suiteResults) return null
    return suiteResults.find(result => result.id === testId) || null
  }, [results])

  // Очистка результатов
  const clearResults = useCallback((suiteId?: string) => {
    if (suiteId) {
      setResults(prev => {
        const newResults = { ...prev }
        delete newResults[suiteId]
        return newResults
      })
    } else {
      setResults({})
    }
  }, [])

  // Экспорт результатов
  const exportResults = useCallback((): string => {
    return JSON.stringify({
      suites: suites.map(suite => ({
        id: suite.id,
        name: suite.name,
        description: suite.description,
        tests: suite.tests.map(test => ({
          id: test.id,
          name: test.name,
          description: test.description,
        })),
      })),
      results,
      stats: getStats(),
      timestamp: new Date().toISOString(),
    }, null, 2)
  }, [suites, results, getStats])

  // Инициализация при монтировании
  useEffect(() => {
    if (autoRun && suites.length > 0) {
      runAllSuites()
    }
  }, [autoRun, suites.length, runAllSuites])

  return {
    suites,
    results,
    isRunning,
    currentSuite,
    currentTest,
    addSuite,
    removeSuite,
    runTest,
    runSuite,
    runAllSuites,
    getStats,
    getSuiteResults,
    getTestResult,
    clearResults,
    exportResults,
  }
}