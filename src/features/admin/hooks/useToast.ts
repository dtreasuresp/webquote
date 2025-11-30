import { useState, useCallback } from 'react'
import type { ToastType } from '@/components/layout/Toast'

interface ToastMessage {
  id: string
  message: string
  type: ToastType
  duration?: number
}

export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newMessage: ToastMessage = {
        id,
        message,
        type,
        duration,
      }
      setMessages((prev) => [...prev, newMessage])
      return id
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id))
  }, [])

  const success = useCallback(
    (message: string, duration?: number) => addToast(message, 'success', duration),
    [addToast]
  )

  const error = useCallback(
    (message: string, duration?: number) => addToast(message, 'error', duration),
    [addToast]
  )

  const info = useCallback(
    (message: string, duration?: number) => addToast(message, 'info', duration),
    [addToast]
  )

  const warning = useCallback(
    (message: string, duration?: number) => addToast(message, 'warning', duration),
    [addToast]
  )

  return {
    messages,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  }
}
