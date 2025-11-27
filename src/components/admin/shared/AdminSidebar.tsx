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
  title = 'Navegación',
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
      {/* Header con título estilo GitHub */}
      <div className="px-4 py-3 border-b border-gh-border/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gh-success animate-pulse" />
          <span className="text-[10px] font-semibold text-gh-text-muted uppercase tracking-wider">
            {title}
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-1">
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
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm
                transition-all duration-200 ease-out
                ${isActive 
                  ? 'bg-gh-bg-tertiary text-gh-text' 
                  : 'text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary/50'
                }
              `}
            >
              {/* Left accent bar - Estilo GitHub */}
              <motion.div
                initial={false}
                animate={{
                  scaleY: isActive ? 1 : 0,
                  opacity: isActive ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gh-success rounded-r-full"
              />

              {/* Icon container con efecto hover */}
              {(() => {
                let iconBgClass = 'text-gh-text-muted'
                if (isActive) {
                  iconBgClass = 'bg-gh-success/15 text-gh-success'
                } else if (isHovered) {
                  iconBgClass = 'bg-gh-border/30 text-gh-text'
                }
                return (
                  <div className={`
                    relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200
                    ${iconBgClass}
                  `}>
                    <Icon className="text-base" />
                    
                    {/* Glow effect on active */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gh-success/10 rounded-md blur-sm" />
                    )}
                  </div>
                )
              })()}

              {/* Label y descripción */}
              <div className="flex-1 text-left min-w-0">
                <span className={`
                  block font-medium text-[13px] truncate transition-colors
                  ${isActive ? 'text-gh-text' : ''}
                `}>
                  {item.label}
                </span>
                {item.description && (
                  <span className="block text-[10px] text-gh-text-secondary truncate mt-0.5">
                    {item.description}
                  </span>
                )}
              </div>

              {/* Badge con diseño mejorado */}
              {item.badge !== undefined && item.badge > 0 && (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`
                    inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
                    text-[10px] font-bold rounded-full transition-all
                    ${isActive 
                      ? 'bg-gh-success text-white shadow-sm shadow-gh-success/30' 
                      : 'bg-gh-border/80 text-gh-text-muted group-hover:bg-gh-border'
                    }
                  `}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </motion.span>
              )}

              {/* Hover indicator arrow */}
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ 
                  opacity: isHovered && !isActive ? 1 : 0, 
                  x: isHovered && !isActive ? 0 : -4 
                }}
                className="text-gh-text-muted"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            </motion.button>
          )
        })}
      </nav>

      {/* Footer con información contextual estilo GitHub */}
      <div className="px-4 py-3 border-t border-gh-border/50">
        <div className="flex items-center gap-2 text-[10px] text-gh-text-secondary">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Selecciona una sección</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile: Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          md:hidden fixed bottom-6 left-6 z-50 
          w-12 h-12 rounded-full
          bg-gh-bg-tertiary border border-gh-border
          text-gh-text shadow-lg shadow-black/30
          flex items-center justify-center
          transition-colors hover:bg-gh-border
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
              transition={{ duration: 0.15 }}
            >
              <FaTimes size={18} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <FaBars size={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile: Overlay con blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile: Sidebar Drawer mejorado */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`
              md:hidden fixed top-0 left-0 bottom-0 w-72
              bg-gradient-to-b from-gh-bg-secondary to-gh-bg-overlay
              border-r border-gh-border z-50
              overflow-hidden ${className}
            `}
          >
            {/* Efecto de brillo superior */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gh-border-light/50 to-transparent" />
            
            <div className="pt-4 h-full flex flex-col">
              {sidebarContent}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop: Fixed Sidebar con diseño premium */}
      <aside
        className={`
          hidden md:flex flex-col
          w-52 min-h-[400px]
          bg-gradient-to-b from-gh-bg-secondary/80 to-gh-bg-overlay/80
          backdrop-blur-sm
          border border-gh-border/60 rounded-lg
          overflow-hidden
          ${className}
        `}
      >
        {/* Efecto de brillo superior */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gh-border-light/30 to-transparent" />
        
        {sidebarContent}
      </aside>
    </>
  )
}
