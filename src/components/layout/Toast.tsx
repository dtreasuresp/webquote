'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastMessage {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  messages: ToastMessage[]
  onRemove: (id: string) => void
}

function ToastItem({ msg, onRemove, getBgColor, getIcon, getTextColor }: Readonly<{ 
  msg: ToastMessage; 
  onRemove: (id: string) => void;
  getBgColor: (type: ToastType) => string;
  getIcon: (type: ToastType) => JSX.Element;
  getTextColor: (type: ToastType) => string;
}>) {
  useEffect(() => {
    if (msg.duration !== 0) {
      const timer = setTimeout(() => {
        onRemove(msg.id)
      }, msg.duration || 3000)
      return () => clearTimeout(timer)
    }
  }, [msg.id, msg.duration, onRemove])

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 100, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${getBgColor(msg.type)} rounded-lg px-4 py-3 flex items-center gap-3 pointer-events-auto`}
    >
      {getIcon(msg.type)}
      <span className={`text-sm font-medium ${getTextColor(msg.type)}`}>
        {msg.message}
      </span>
      <button
        onClick={() => onRemove(msg.id)}
        className={`ml-2 ${getTextColor(msg.type)} hover:opacity-70 transition-opacity`}
      >
        ✕
      </button>
    </motion.div>
  )
}

export default function Toast({ messages, onRemove }: Readonly<ToastProps>) {
  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-400" size={20} />
      case 'error':
        return <FaTimesCircle className="text-red-400" size={20} />
      case 'warning':
        return <FaExclamationCircle className="text-yellow-400" size={20} />
      case 'info':
        return <FaInfoCircle className="text-blue-400" size={20} />
    }
  }

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border border-green-500/30'
      case 'error':
        return 'bg-red-500/10 border border-red-500/30'
      case 'warning':
        return 'bg-yellow-500/10 border border-yellow-500/30'
      case 'info':
        return 'bg-blue-500/10 border border-blue-500/30'
    }
  }

  const getTextColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      case 'warning':
        return 'text-yellow-400'
      case 'info':
        return 'text-blue-400'
    }
  }

  return (
    <div className="fixed bottom-8 right-4 z-[9999] space-y-2 pointer-events-none">
      <AnimatePresence>
        {messages.map((msg) => (
          <ToastItem 
            key={msg.id} 
            msg={msg} 
            onRemove={onRemove} 
            getBgColor={getBgColor}
            getIcon={getIcon}
            getTextColor={getTextColor}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
