'use client'

import React, { useState } from 'react'
import { LucideIcon, Menu, X, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface SidebarItem {
  id: string
  label: string
  icon: LucideIcon
  badge?: number
  description?: string
}

export interface AdminSidebarProps {
  items: SidebarItem[]
  activeItem: string
  onItemClick: (id: string) => void
  title?: string
  titleIcon?: LucideIcon
  className?: string
}

export default function AdminSidebar({
  items,
  activeItem,
  onItemClick,
  title,
  titleIcon: TitleIcon,
  className = '',
}: Readonly<AdminSidebarProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const handleItemClick = (id: string) => {
    onItemClick(id)
    setIsOpen(false)
  }

  const sidebarContent = (
    <div className="h-full bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      {title && (
        <div className="px-3 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
          <div className="flex items-center gap-2">
            {TitleIcon && <TitleIcon className="w-4 h-4 text-gh-accent" />}
            <span className="text-xs font-medium text-gh-text">{title}</span>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 p-1.5 space-y-0.5">
        {items.map((item, index) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          const isHovered = hoveredItem === item.id

          // Calcular clase del botón (igual que PreferenciasSidebar)
          const getButtonClass = () => {
            if (isActive) return 'bg-gh-accent/10 text-gh-accent'
            return 'text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary/40'
          }

          return (
            <motion.button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.15 }}
              className={`
                group relative w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs
                transition-colors duration-150
                ${getButtonClass()}
              `}
            >
              {/* Indicador activo */}
              {isActive && (
                <motion.div
                  layoutId="adminSidebarIndicator"
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-gh-accent rounded-r"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon (sin fondo, solo color - igual que PreferenciasSidebar) */}
              {(() => {
                let iconClass = 'text-gh-text-muted'
                if (isActive) {
                  iconClass = 'text-gh-accent'
                } else if (isHovered) {
                  iconClass = 'text-gh-text'
                }
                return (
                  <div className={`flex items-center justify-center w-5 h-5 rounded transition-colors duration-150 ${iconClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                )
              })()}

              {/* Label */}
              <span className="flex-1 text-left truncate">
                {item.label}
              </span>

              {/* Badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`
                  px-1.5 py-0.5 text-[10px] font-semibold rounded-full transition-colors
                  ${isActive 
                    ? 'bg-gh-accent/20 text-gh-accent' 
                    : 'bg-gh-border/50 text-gh-text-muted group-hover:bg-gh-border/70'
                  }
                `}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}

              {/* Chevron para item activo (igual que PreferenciasSidebar) */}
              {isActive && (
                <ChevronRight className="w-3 h-3 text-gh-accent/60" />
              )}
            </motion.button>
          )
        })}
      </nav>
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
              <X className="w-3.5 h-3.5" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <Menu className="w-3.5 h-3.5" />
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
              md:hidden fixed top-0 left-0 bottom-0 w-56
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

      {/* Desktop: Sidebar */}
      <aside
        className={`
          hidden md:block w-52 flex-shrink-0 self-stretch
          ${className}
        `}
      >
        <div className="h-full">
          {sidebarContent}
        </div>
      </aside>
    </>
  )
}


