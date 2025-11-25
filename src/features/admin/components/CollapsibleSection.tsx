'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, ReactNode } from 'react'
import { FaChevronDown } from 'react-icons/fa'

interface CollapsibleSectionProps {
  readonly id: string
  readonly title: string
  readonly children: ReactNode
  readonly defaultOpen?: boolean
  readonly icon?: ReactNode
  readonly validationBadge?: ReactNode
}

export default function CollapsibleSection({
  id,
  title,
  children,
  defaultOpen = true,
  icon,
  validationBadge
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Recuperar estado del localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem(`section-${id}`)
    if (saved !== null) {
      setIsOpen(JSON.parse(saved))
    }
  }, [id])

  // Guardar estado al cambiar
  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    localStorage.setItem(`section-${id}`, JSON.stringify(newState))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gh-bg-secondary rounded-md border border-gh-border overflow-hidden"
    >
      {/* Header colapsable */}
      <button
        onClick={handleToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gh-border transition-colors group"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-lg">{icon}</span>}
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gh-text group-hover:text-white transition-colors">
              {title}
            </h3>
            {validationBadge}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronDown className="text-gh-text-muted group-hover:text-gh-text transition-colors" />
        </motion.div>
      </button>

      {/* Contenido colapsable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-gh-border"
          >
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
