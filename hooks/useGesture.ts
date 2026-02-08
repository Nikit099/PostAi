import { useState, useRef, RefObject, useEffect } from 'react'

interface GestureState {
  isDragging: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
  velocityX: number
  velocityY: number
}

interface UseGestureOptions {
  onDragStart?: (state: GestureState) => void
  onDrag?: (state: GestureState) => void
  onDragEnd?: (state: GestureState) => void
  onTap?: (state: GestureState) => void
  onLongPress?: (state: GestureState) => void
  threshold?: number
  longPressDelay?: number
}

export function useGesture<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  options: UseGestureOptions = {}
) {
  const {
    onDragStart,
    onDrag,
    onDragEnd,
    onTap,
    onLongPress,
    threshold = 5,
    longPressDelay = 500,
  } = options

  const [state, setState] = useState<GestureState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    velocityX: 0,
    velocityY: 0,
  })

  const lastTimeRef = useRef<number>(0)
  const lastXRef = useRef<number>(0)
  const lastYRef = useRef<number>(0)
  const longPressTimerRef = useRef<NodeJS.Timeout>()
  const isLongPressRef = useRef(false)

  const handleTouchStart = (event: TouchEvent) => {
    event.preventDefault()
    const touch = event.touches[0]
    const startX = touch.clientX
    const startY = touch.clientY

    const newState: GestureState = {
      isDragging: false,
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      deltaX: 0,
      deltaY: 0,
      velocityX: 0,
      velocityY: 0,
    }

    setState(newState)

    // Запускаем таймер для long press
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      if (onLongPress) {
        onLongPress(newState)
      }
    }, longPressDelay)

    lastTimeRef.current = Date.now()
    lastXRef.current = startX
    lastYRef.current = startY
  }

  const handleTouchMove = (event: TouchEvent) => {
    event.preventDefault()
    const touch = event.touches[0]
    const currentX = touch.clientX
    const currentY = touch.clientY
    const deltaX = currentX - state.startX
    const deltaY = currentY - state.startY

    // Вычисляем скорость
    const currentTime = Date.now()
    const deltaTime = currentTime - lastTimeRef.current
    const velocityX = (currentX - lastXRef.current) / deltaTime
    const velocityY = (currentY - lastYRef.current) / deltaTime

    const newState: GestureState = {
      ...state,
      currentX,
      currentY,
      deltaX,
      deltaY,
      velocityX,
      velocityY,
    }

    // Проверяем, превышен ли порог для начала drag
    if (!state.isDragging && (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)) {
      newState.isDragging = true
      
      // Отменяем long press, если начался drag
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        isLongPressRef.current = false
      }

      if (onDragStart) {
        onDragStart(newState)
      }
    }

    if (state.isDragging || newState.isDragging) {
      setState(newState)
      
      if (onDrag) {
        onDrag(newState)
      }
    }

    lastTimeRef.current = currentTime
    lastXRef.current = currentX
    lastYRef.current = currentY
  }

  const handleTouchEnd = (event: TouchEvent) => {
    event.preventDefault()

    // Отменяем таймер long press
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }

    if (state.isDragging) {
      if (onDragEnd) {
        onDragEnd(state)
      }
    } else if (!isLongPressRef.current) {
      // Если не было long press и не было drag, то это tap
      if (onTap) {
        onTap(state)
      }
    }

    // Сбрасываем состояние
    isLongPressRef.current = false
    setState({
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0,
      velocityX: 0,
      velocityY: 0,
    })
  }

  // Добавляем обработчики событий
  useEffect(() => {
    const element = ref.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [ref, onDragStart, onDrag, onDragEnd, onTap, onLongPress, threshold, longPressDelay])

  return state
}