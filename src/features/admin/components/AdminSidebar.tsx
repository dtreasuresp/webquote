'use client'

import React, { useState } from 'react'
import { IconType } from 'react-icons'
import { FaBars, FaTimes } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

export interface SidebarItem {
  id: string
  label: string
  icon: IconType
  badge?: number
  description?: string
}

export interface AdminSidebarProps {
  items: SidebarItem[]
  activeItem: string
  onItemClick: (id: string) => void
  title?: string
  className?: string
}

export default function AdminSidebar({
  items,
  activeItem,
  onItemClick,
  title,
  className = '',
}: Readonly<AdminSidebarProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const handleItemClick = (id: string) => {
    onItemClick(id)
    setIsOpen(false)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header opcional */}
      {title && (
        <div className="px-3 py-2.5 border-b border-gh-border/30">
          <span className="text-[10px] font-medium text-gh-text-secondary uppercase tracking-wide">
            {title}
          </span>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 p-1.5 space-y-0.5">
        {items.map((item, index) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          const isHovered = hoveredItem === item.id

          return (
            <motion.button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.2 }}
              className={`
                group relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm
                transition-colors duration-150
                ${isActive 
                  ? 'bg-gh-bg-tertiary/70 text-gh-text' 
                  : 'text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary/40'
                }
              `}
            >
              {/* Indicador activo */}
              {isActive && (
                <motion.div
                  layoutId="sidebarIndicator"
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-gh-success rounded-r"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon con contenedor sutil */}
              {(() => {
                let iconClass = 'text-gh-text-muted'
                if (isActive) {
                  iconClass = 'bg-gh-success/10 text-gh-success'
                } else if (isHovered) {
                  iconClass = 'bg-gh-border/20 text-gh-text'
                }
                return (
                  <div className={`
                    flex items-center justify-center w-6 h-6 rounded transition-colors duration-150
                    ${iconClass}
                  `}>
                    <Icon className="text-xs" />
                  </div>
                )
              })()}

              {/* Label y descripción */}
              <div className="flex-1 text-left min-w-0">
                <span className={`
                  block font-medium text-[13px] truncate
                  ${isActive ? 'text-gh-text' : ''}
                `}>
                  {item.label}
                </span>
                {item.description && (
                  <span className="block text-[10px] text-gh-text-secondary truncate mt-0.5 opacity-70">
                    {item.description}
                  </span>
                )}
              </div>

              {/* Badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`
                  px-1.5 py-0.5 text-[10px] font-semibold rounded-full transition-colors
                  ${isActive 
                    ? 'bg-gh-success/20 text-gh-success' 
                    : 'bg-gh-border/50 text-gh-text-muted group-hover:bg-gh-border/70'
                  }
                `}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}

              {/* Flecha hover sutil */}
              <motion.div
                initial={{ opacity: 0, x: -2 }}
                animate={{ 
                  opacity: isHovered && !isActive ? 0.5 : 0, 
                  x: isHovered && !isActive ? 0 : -2 
                }}
                transition={{ duration: 0.15 }}
                className="text-gh-text-muted"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            </motion.button>
          )
        })}
      </nav>

      {/* Footer sutil */}
      <div className="px-3 py-2 border-t border-gh-border/20">
        <span className="text-[9px] text-gh-text-secondary/60">
          Selecciona una sección
        </span>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile: FAB discreto */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
        className={`
          md:hidden fixed bottom-5 left-5 z-50 
          w-10 h-10 rounded-full
          bg-gh-bg-tertiary/95 border border-gh-border/50
          text-gh-text-muted hover:text-gh-text
          flex items-center justify-center
          shadow-md shadow-black/20
          transition-colors
        `}
        aria-label="Toggle menu"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <FaTimes size={14} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <FaBars size={14} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile: Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile: Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={`
              md:hidden fixed top-0 left-0 bottom-0 w-60
              bg-gh-bg-secondary/98 backdrop-blur-sm
              border-r border-gh-border/30 z-50
              ${className}
            `}
          >
            <div className="pt-3 h-full flex flex-col">
              {sidebarContent}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop: Sidebar transparente y limpio */}
      <aside
        className={`
          hidden md:flex flex-col w-48
          bg-transparent
          ${className}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
