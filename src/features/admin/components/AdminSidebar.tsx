'use client'

import React, { useState } from 'react'
import { LucideIcon, Menu, X, ChevronRight, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSidebarStore } from '@/stores/sidebarStore'

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
  const { isInternalSidebarCollapsed, toggleInternalSidebar } = useSidebarStore()

  const handleItemClick = (id: string) => {
    onItemClick(id)
    setIsOpen(false)
  }

  const sidebarContent = (
    <div className={`h-full backdrop-blur-md overflow-hidden flex flex-col flex-shrink-0 transition-all duration-300 ${isInternalSidebarCollapsed ? 'w-16' : 'w-56'}`}>
      {/* Header */}
      <div className="px-3 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
        {!isInternalSidebarCollapsed && title && (
          <div className="flex items-center gap-2 overflow-hidden">
            {TitleIcon && <TitleIcon className="w-4 h-4 text-gh-success shrink-0" />}
            <span className="text-[11px] font-bold text-gh-text uppercase tracking-wider truncate">{title}</span>
          </div>
        )}
        <button 
          onClick={toggleInternalSidebar}
          className={`p-1.5 rounded-lg hover:bg-white/10 text-gh-text-muted hover:text-gh-text transition-all ${isInternalSidebarCollapsed ? 'mx-auto' : ''}`}
          title={isInternalSidebarCollapsed ? "Expandir" : "Colapsar"}
        >
          {isInternalSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-none">
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
              transition={{ delay: index * 0.03, duration: 0.15 }}
              className={`
                group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px]
                transition-all duration-200
                ${isActive 
                  ? 'bg-gh-success/10 text-gh-success font-semibold border border-gh-success/20' 
                  : 'text-gh-text-muted hover:text-gh-text hover:bg-white/5 border border-transparent'}
              `}
              title={isInternalSidebarCollapsed ? item.label : undefined}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 ${isActive ? 'text-gh-success' : 'group-hover:text-gh-success'} transition-colors`}>
                <Icon className="w-4 h-4" />
              </div>

              {/* Label */}
              {!isInternalSidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}

              {/* Badge */}
              {!isInternalSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full bg-gh-success/20 text-gh-success text-[10px] font-bold">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}

              {/* Chevron para item activo */}
              {!isInternalSidebarCollapsed && isActive && (
                <ChevronRight className="w-3 h-3 text-gh-success/60 ml-auto" />
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
        className={`hidden md:block flex-shrink-0 self-stretch transition-all duration-300 ${isInternalSidebarCollapsed ? 'w-16' : 'w-56'}${className}`}
      >
        <div className="h-full">
          {sidebarContent}
        </div>
      </aside>
    </>
  )
}


