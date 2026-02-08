import { useEffect, RefObject } from 'react'

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window
): void

export function useEventListener<K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLElement>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: RefObject<T>
): void

export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element?: Document
): void

export function useEventListener<
  KW extends keyof WindowEventMap,
  KH extends keyof HTMLElementEventMap,
  T extends HTMLElement = HTMLElement
>(
  eventName: KW | KH,
  handler: (
    event: WindowEventMap[KW] | HTMLElementEventMap[KH] | Event
  ) => void,
  element?: RefObject<T> | Window | Document | null
) {
  useEffect(() => {
    // Определяем целевой элемент
    const targetElement: Window | Document | HTMLElement | null = 
      element instanceof Window || element instanceof Document
        ? element
        : element?.current || window

    if (!targetElement?.addEventListener) {
      return
    }

    // Создаем обработчик события
    const eventListener: EventListener = (event) => handler(event as any)

    // Добавляем обработчик
    targetElement.addEventListener(eventName, eventListener)

    // Убираем обработчик при размонтировании
    return () => {
      targetElement.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element, handler])
}