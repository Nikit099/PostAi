import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  callback: () => void
  preventDefault?: boolean
}

export function useKeyboardShortcut(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    shortcuts.forEach(({ key, ctrl, shift, alt, meta, callback, preventDefault = true }) => {
      const keyMatches = event.key.toLowerCase() === key.toLowerCase()
      const ctrlMatches = ctrl ? event.ctrlKey : !event.ctrlKey
      const shiftMatches = shift ? event.shiftKey : !event.shiftKey
      const altMatches = alt ? event.altKey : !event.altKey
      const metaMatches = meta ? event.metaKey : !event.metaKey

      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        if (preventDefault) {
          event.preventDefault()
        }
        callback()
      }
    })
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

// Предопределенные комбинации клавиш
export const KEYBOARD_SHORTCUTS = {
  SAVE: {
    key: 's',
    ctrl: true,
    description: 'Сохранить',
  },
  NEW: {
    key: 'n',
    ctrl: true,
    description: 'Создать новый',
  },
  DELETE: {
    key: 'Delete',
    description: 'Удалить',
  },
  ESCAPE: {
    key: 'Escape',
    description: 'Отмена/Закрыть',
  },
  SEARCH: {
    key: 'f',
    ctrl: true,
    description: 'Поиск',
  },
  HELP: {
    key: '/',
    ctrl: true,
    description: 'Помощь',
  },
  DARK_MODE: {
    key: 'd',
    ctrl: true,
    shift: true,
    description: 'Переключить тему',
  },
}