'use client'

import React, { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

interface CollapsibleSectionProps {
  readonly id: string
  readonly title: string
  readonly icon?: ReactNode
  readonly isCollapsed?: boolean
  readonly onToggle?: () => void
  readonly defaultOpen?: boolean
  readonly children: ReactNode
  readonly rightContent?: ReactNode
  readonly className?: string
  readonly headerClassName?: string
  readonly contentClassName?: string
}

/**
 * Componente wrapper para secciones colapsables con animación
 * Soporta dos modos:
 * - Controlado: usar isCollapsed + onToggle
 * - No controlado: usar defaultOpen (el estado se maneja internamente)
 */
export default function CollapsibleSection({
  id,
  title,
  icon,
  isCollapsed: controlledIsCollapsed,
  onToggle: controlledOnToggle,
  defaultOpen = true,
  children,
  rightContent,
  className = '',
  headerClassName = '',
  contentClassName = '',
}: CollapsibleSectionProps) {
  // Estado interno para modo no controlado
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen)
  
  // Determinar si estamos en modo controlado o no controlado
  const isControlled = controlledIsCollapsed !== undefined && controlledOnToggle !== undefined
  const isCollapsed = isControlled ? controlledIsCollapsed : !internalIsOpen
  const onToggle = isControlled ? controlledOnToggle : () => setInternalIsOpen(prev => !prev)

  return (
    <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg ${className}`}>
      <div className={`flex items-center justify-between ${headerClassName}`}>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-left flex-1"
          aria-expanded={!isCollapsed}
          aria-controls={`collapsible-content-${id}`}
        >
          <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
            {icon}
            {title}
          </span>
          <motion.span
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
            className="text-gh-text-muted"
          >
            <FaChevronDown size={12} />
          </motion.span>
        </button>
        
        {rightContent && (
          <div className="ml-3" onClick={(e) => e.stopPropagation()}>
            {rightContent}
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            id={`collapsible-content-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={`mt-4 ${contentClassName}`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Wrapper simple sin estilos de contenedor (para usar dentro de contenedores existentes)
 */
export function CollapsibleContent({
  id,
  title,
  icon,
  isCollapsed,
  onToggle,
  children,
  rightContent,
}: Omit<CollapsibleSectionProps, 'className' | 'headerClassName' | 'contentClassName'>) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-left"
          aria-expanded={!isCollapsed}
          aria-controls={`collapsible-content-${id}`}
        >
          <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
            {icon}
            {title}
          </span>
          {isCollapsed ? (
            <FaChevronDown size={12} className="text-gh-text-muted" />
          ) : (
            <FaChevronUp size={12} className="text-gh-text-muted" />
          )}
        </button>
        
        {rightContent && (
          <div onClick={(e) => e.stopPropagation()}>
            {rightContent}
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            id={`collapsible-content-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
