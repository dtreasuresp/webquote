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
}

export interface AdminSidebarProps {
  items: SidebarItem[]
  activeItem: string
  onItemClick: (id: string) => void
  className?: string
}

export default function AdminSidebar({
  items,
  activeItem,
  onItemClick,
  className = '',
}: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleItemClick = (id: string) => {
    onItemClick(id)
    setIsOpen(false) // Cerrar en móvil después de seleccionar
  }

  const sidebarContent = (
    <nav className="flex flex-col gap-1 p-3">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = activeItem === item.id

        return (
          <motion.button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all
              ${
                isActive
                  ? 'bg-gh-success/10 text-gh-success border-l-2 border-gh-success'
                  : 'text-gh-text-muted hover:bg-gh-bg-tertiary hover:text-gh-text'
              }
            `}
          >
            {/* Indicator bar para item activo */}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-0 bottom-0 w-0.5 bg-gh-success rounded-r"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            {/* Icon */}
            <Icon className={`text-base ${isActive ? 'text-gh-success' : ''}`} />

            {/* Label */}
            <span className="flex-1 text-left">{item.label}</span>

            {/* Badge opcional */}
            {item.badge !== undefined && item.badge > 0 && (
              <span
                className={`
                  px-2 py-0.5 rounded-full text-[10px] font-semibold
                  ${
                    isActive
                      ? 'bg-gh-success text-white'
                      : 'bg-gh-border text-gh-text-muted'
                  }
                `}
              >
                {item.badge}
              </span>
            )}
          </motion.button>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile: Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gh-bg-secondary border border-gh-border rounded-md text-gh-text hover:bg-gh-bg-tertiary transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Mobile: Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile: Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`
              md:hidden fixed top-0 left-0 bottom-0 w-64 bg-gh-bg-secondary border-r border-gh-border z-40
              overflow-y-auto ${className}
            `}
          >
            <div className="pt-16">{sidebarContent}</div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop: Fixed Sidebar */}
      <aside
        className={`
          hidden md:block w-56 bg-gh-bg-secondary border-r border-gh-border
          sticky top-0 h-screen overflow-y-auto ${className}
        `}
      >
        <div className="pt-6">{sidebarContent}</div>
      </aside>
    </>
  )
}
