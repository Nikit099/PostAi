import { useState, useCallback } from 'react'

export function useHistoryState<T>(
  initialValue: T,
  maxHistory: number = 50
) {
  const [history, setHistory] = useState<T[]>([initialValue])
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentValue = history[currentIndex]

  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setHistory(prevHistory => {
      const value = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prevHistory[currentIndex])
        : newValue

      // Удаляем все состояния после текущего индекса
      const newHistory = prevHistory.slice(0, currentIndex + 1)
      
      // Добавляем новое состояние
      newHistory.push(value)
      
      // Ограничиваем историю максимальным размером
      if (newHistory.length > maxHistory) {
        newHistory.shift()
      }
      
      return newHistory
    })
    
    setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1))
  }, [currentIndex, maxHistory])

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      return true
    }
    return false
  }, [currentIndex])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1)
      return true
    }
    return false
  }, [currentIndex, history.length])

  const clearHistory = useCallback(() => {
    setHistory([initialValue])
    setCurrentIndex(0)
  }, [initialValue])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  return {
    value: currentValue,
    setValue,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    history,
    currentIndex,
  }
}