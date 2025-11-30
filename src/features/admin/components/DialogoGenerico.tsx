'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'
import { IconType } from 'react-icons'

// Tab definition for tabbed dialogs
export interface DialogTab {
  id: string
  label: string
  icon?: IconType
  content: React.ReactNode
}

export interface DialogoGenericoProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  type?: 'info' | 'warning' | 'error' | 'success' | 'neutral'
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  maxHeight?: string
  // New props for extended functionality
  variant?: 'default' | 'premium'
  icon?: IconType
  iconClassName?: string
  tabs?: DialogTab[]
  defaultTab?: string
  onTabChange?: (tabId: string) => void
  headerContent?: React.ReactNode
  zIndex?: number
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
}

const typeColors = {
  info: 'border-l-4 border-gh-accent-blue bg-gh-accent-blue/5',
  warning: 'border-l-4 border-gh-accent-orange bg-gh-accent-orange/5',
  error: 'border-l-4 border-gh-accent-red bg-gh-accent-red/5',
  success: 'border-l-4 border-gh-accent-green bg-gh-accent-green/5',
  neutral: '',
}

const titleColors = {
  info: 'text-gh-accent-blue',
  warning: 'text-gh-accent-orange',
  error: 'text-gh-accent-red',
  success: 'text-gh-accent-green',
  neutral: 'text-white',
}

const iconBgColors = {
  info: 'from-[#58a6ff] to-[#388bfd]',
  warning: 'from-[#d29922] to-[#e3b341]',
  error: 'from-[#f85149] to-[#da3633]',
  success: 'from-[#238636] to-[#2ea043]',
  neutral: 'from-[#58a6ff] to-[#388bfd]',
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
  closeOnEscape = true,
  maxHeight = 'max-h-[80vh]',
  // Extended props
  variant = 'default',
  icon: Icon,
  iconClassName,
  tabs,
  defaultTab,
  onTabChange,
  headerContent,
  zIndex = 50,
}: DialogoGenericoProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs?.[0]?.id || '')

  // Update active tab when defaultTab changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab)
    }
  }, [defaultTab])

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape) {
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
  }, [isOpen, onClose, closeOnEscape])

  // Get active tab content
  const activeTabContent = tabs?.find(tab => tab.id === activeTab)?.content

  // Premium variant styles
  const isPremium = variant === 'premium'

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
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            style={{ zIndex: zIndex - 10 }}
            aria-label="Dialog backdrop"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: isPremium ? -10 : 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: isPremium ? -10 : 20 }}
            transition={isPremium 
              ? { type: 'spring', damping: 30, stiffness: 400 }
              : { duration: 0.3, ease: 'easeOut' }
            }
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex }}
          >
            <div
              className={`
                pointer-events-auto w-full mx-4
                ${sizeClasses[size]}
                ${isPremium 
                  ? 'bg-gradient-to-b from-[#161b22] to-[#0d1117] border border-[#30363d] shadow-2xl shadow-black/60 ring-1 ring-white/5'
                  : `bg-gradient-to-br from-gh-bg-overlay to-gh-bg-secondary border border-gh-border-color shadow-2xl ${typeColors[type]}`
                }
                rounded-xl overflow-hidden
              `}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className={`
                flex items-center justify-between 
                ${isPremium 
                  ? 'p-4 border-b border-[#30363d] bg-gradient-to-r from-[#161b22] via-[#1c2128] to-[#161b22]'
                  : 'p-6 border-b border-gh-border-color/30'
                }
              `}>
                <div className="flex items-center gap-3 flex-1">
                  {/* Icon (premium style) */}
                  {Icon && isPremium && (
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${iconBgColors[type]} flex items-center justify-center shadow-lg shadow-${type === 'success' ? '[#238636]' : '[#58a6ff]'}/20`}>
                      <Icon className={iconClassName || 'text-white text-sm'} />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h2 className={`${isPremium ? 'text-lg font-semibold text-white' : `text-xl font-bold ${titleColors[type]}`}`}>
                      {title}
                    </h2>
                    {description && (
                      <p className={`text-sm mt-1 ${isPremium ? 'text-[#8b949e]' : 'text-gh-text-secondary'}`}>
                        {description}
                      </p>
                    )}
                  </div>
                  
                  {/* Custom header content */}
                  {headerContent}
                </div>

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-lg
                      transition-all duration-200 ml-4 flex-shrink-0
                      ${isPremium 
                        ? 'text-[#8b949e] hover:text-white hover:bg-white/10'
                        : 'hover:bg-gh-bg-tertiary text-gh-text-secondary hover:text-gh-text-primary'
                      }
                    `}
                    aria-label="Close dialog"
                  >
                    <FaTimes className={isPremium ? 'w-4 h-4' : 'w-5 h-5'} />
                  </button>
                )}
              </div>

              {/* Tabs (if provided) */}
              {tabs && tabs.length > 0 && (
                <div className={`flex border-b ${isPremium ? 'border-[#30363d] bg-[#0d1117]/80' : 'border-gh-border-color/30 bg-gh-bg-tertiary/30'}`}>
                  {tabs.map((tab) => {
                    const TabIcon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`
                          flex-1 px-4 py-3 text-sm font-medium transition-colors
                          ${activeTab === tab.id
                            ? isPremium 
                              ? 'text-[#3fb950] border-b-2 border-[#238636] bg-[#238636]/10'
                              : 'text-gh-accent-green border-b-2 border-gh-accent-green bg-gh-accent-green/10'
                            : isPremium
                              ? 'text-[#8b949e] hover:text-[#c9d1d9]'
                              : 'text-gh-text-secondary hover:text-gh-text-primary'
                          }
                        `}
                      >
                        {TabIcon && <TabIcon className="inline mr-2" />}
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Content */}
              <div className={`
                ${isPremium ? 'p-4 bg-[#0d1117]' : 'p-6'}
                ${maxHeight} overflow-y-auto
              `}>
                {tabs && tabs.length > 0 ? (
                  activeTabContent || <p className="text-gh-text-secondary">No hay contenido para esta pestaña</p>
                ) : children ? (
                  children
                ) : (
                  <p className={isPremium ? 'text-[#8b949e]' : 'text-gh-text-secondary'}>
                    No hay contenido para mostrar
                  </p>
                )}
              </div>

              {/* Footer */}
              {footer && (
                <div className={`
                  flex justify-end gap-3
                  ${isPremium 
                    ? 'p-4 border-t border-[#30363d] bg-[#161b22]/80'
                    : 'p-6 border-t border-gh-border-color/30 bg-gh-bg-tertiary/30'
                  }
                `}>
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
