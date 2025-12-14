'use client'

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'
import Toast from '@/components/layout/Toast'
import type { ToastType } from '@/components/layout/Toast'

interface ToastMessage {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextValue {
  messages: ToastMessage[]
  addToast: (message: string, type?: ToastType, duration?: number) => string
  removeToast: (id: string) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000) => {
      const id = Math.random().toString(36).substring(2, 9)
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

  const value = useMemo<ToastContextValue>(
    () => ({
      messages,
      addToast,
      removeToast,
      success,
      error,
      info,
      warning,
    }),
    [messages, addToast, removeToast, success, error, info, warning]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast messages={messages} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
