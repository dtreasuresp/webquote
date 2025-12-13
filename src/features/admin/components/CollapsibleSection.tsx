'use client'

import React, { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, type LucideIcon } from 'lucide-react'

interface CollapsibleSectionProps {
  readonly id: string
  readonly title: string
  readonly subtitle?: string
  readonly icon?: LucideIcon
  readonly isCollapsed?: boolean
  readonly onToggle?: () => void
  readonly defaultOpen?: boolean
  readonly children: ReactNode
  readonly rightContent?: ReactNode
  readonly className?: string
  readonly headerClassName?: string
  readonly contentClassName?: string
  /** Variante de estilo: 'default' (bg-gh-bg-overlay) o 'card' (bg-gh-bg-secondary con header) */
  readonly variant?: 'default' | 'card'
}

/**
 * Componente wrapper para secciones colapsables con animación
 * Soporta dos modos:
 * - Controlado: usar isCollapsed + onToggle
 * - No controlado: usar defaultOpen (el estado se maneja internamente)
 * 
 * Variantes:
 * - 'default': Estilo original con bg-gh-bg-overlay
 * - 'card': Estilo PreferenciasTab con header separado
 */
export default function CollapsibleSection({
  id,
  title,
  subtitle,
  icon: Icon,
  isCollapsed: controlledIsCollapsed,
  onToggle: controlledOnToggle,
  defaultOpen = true,
  children,
  rightContent,
  className = '',
  headerClassName = '',
  contentClassName = '',
  variant = 'default',
}: CollapsibleSectionProps) {
  // Estado interno para modo no controlado
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen)
  
  // Determinar si estamos en modo controlado o no controlado
  const isControlled = controlledIsCollapsed !== undefined && controlledOnToggle !== undefined
  const isCollapsed = isControlled ? controlledIsCollapsed : !internalIsOpen
  const onToggle = isControlled ? controlledOnToggle : () => setInternalIsOpen(prev => !prev)

  // Variante 'card' - estilo PreferenciasTab
  if (variant === 'card') {
    return (
      <div className={`bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden ${className}`}>
        {/* Header con estilo PreferenciasTab */}
        <button
          onClick={onToggle}
          className={`w-full px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 flex items-center justify-between hover:bg-gh-bg-tertiary/50 transition-colors ${headerClassName}`}
          aria-expanded={!isCollapsed}
          aria-controls={`collapsible-content-${id}`}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-3.5 h-3.5 text-gh-accent" />}
            <div className="text-left">
              <h5 className="text-xs font-medium text-gh-text">{title}</h5>
              {subtitle && (
                <p className="text-[11px] text-gh-text-muted mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {rightContent && (
              <div onClick={(e) => e.stopPropagation()}>
                {rightContent}
              </div>
            )}
            <motion.span
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
              className="text-gh-text-muted"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.span>
          </div>
        </button>

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
              <div className={contentClassName}>
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Variante 'default' - estilo original
  return (
    <div className={`p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg ${className}`}>
      <div className={`flex items-center justify-between ${headerClassName}`}>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-left flex-1"
          aria-expanded={!isCollapsed}
          aria-controls={`collapsible-content-${id}`}
        >
          <span className="flex items-center gap-2 text-xs font-medium text-gh-text font-medium">
            {Icon && <Icon className="w-3.5 h-3.5 text-gh-accent" />}
            {title}
          </span>
          <motion.span
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
            className="text-gh-text-muted"
          >
            <ChevronDown className="w-3 h-3" />
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
  subtitle,
  icon: Icon,
  isCollapsed,
  onToggle,
  children,
  rightContent,
}: Omit<CollapsibleSectionProps, 'className' | 'headerClassName' | 'contentClassName' | 'variant' | 'defaultOpen'> & { isCollapsed: boolean; onToggle: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-left"
          aria-expanded={!isCollapsed}
          aria-controls={`collapsible-content-${id}`}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-3.5 h-3.5 text-gh-accent" />}
            <div>
              <span className="text-xs font-medium text-gh-text">{title}</span>
              {subtitle && (
                <p className="text-[11px] text-gh-text-muted">{subtitle}</p>
              )}
            </div>
          </div>
          <motion.span
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
            className="text-gh-text-muted ml-2"
          >
            <ChevronDown className="w-3 h-3" />
          </motion.span>
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


