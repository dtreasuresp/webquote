'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'

export interface DialogoGenericoProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  type?: 'info' | 'warning' | 'error' | 'success'
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  maxHeight?: string
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

const typeColors = {
  info: 'border-l-4 border-gh-accent-blue bg-gh-accent-blue/5',
  warning: 'border-l-4 border-gh-accent-orange bg-gh-accent-orange/5',
  error: 'border-l-4 border-gh-accent-red bg-gh-accent-red/5',
  success: 'border-l-4 border-gh-accent-green bg-gh-accent-green/5',
}

const titleColors = {
  info: 'text-gh-accent-blue',
  warning: 'text-gh-accent-orange',
  error: 'text-gh-accent-red',
  success: 'text-gh-accent-green',
}

export default function DialogoGenerico({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  type = 'info',
  showCloseButton = true,
  closeOnBackdropClick = true,
  maxHeight = 'max-h-[80vh]',
}: DialogoGenericoProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdropClick ? onClose : undefined}
            className="fixed inset-0 bg-black/50 z-40"
            aria-label="Dialog backdrop"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`
              fixed inset-0 flex items-center justify-center z-50
              pointer-events-none
            `}
          >
            <div
              className={`
                pointer-events-auto w-full mx-4
                ${sizeClasses[size]}
                bg-gradient-to-br from-gh-bg-overlay to-gh-bg-secondary
                border border-gh-border-color
                rounded-xl shadow-2xl
                overflow-hidden
                ${typeColors[type]}
              `}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gh-border-color/30">
                <div className="flex-1">
                  <h2 className={`text-xl font-bold ${titleColors[type]}`}>
                    {title}
                  </h2>
                  {description && (
                    <p className="text-sm text-gh-text-secondary mt-1">
                      {description}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-lg
                      transition-all duration-200
                      hover:bg-gh-bg-tertiary
                      text-gh-text-secondary hover:text-gh-text-primary
                      ml-4 flex-shrink-0
                    `}
                    aria-label="Close dialog"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className={`p-6 ${maxHeight} overflow-y-auto`}>
                {children ? (
                  children
                ) : (
                  <p className="text-gh-text-secondary">
                    No hay contenido para mostrar
                  </p>
                )}
              </div>

              {/* Footer */}
              {footer && (
                <div className="p-6 border-t border-gh-border-color/30 bg-gh-bg-tertiary/30 flex justify-end space-x-2">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
