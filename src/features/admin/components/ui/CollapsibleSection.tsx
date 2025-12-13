'use client'

import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ToggleSwitch from '../ToggleSwitch'

// ═══════════════════════════════════════════════════════════════════════════
// CollapsibleSection - Patrón "Configuraciones Financieras Guardadas"
// ═══════════════════════════════════════════════════════════════════════════

interface CollapsibleSectionProps {
  /** Título de la sección */
  readonly title: string
  /** Icono para mostrar junto al título */
  readonly icon?: React.ReactNode
  /** Si la sección está expandida */
  readonly isExpanded: boolean
  /** Callback cuando se hace toggle */
  readonly onToggle: () => void
  /** Si la sección tiene toggle de visibilidad */
  readonly showVisibilityToggle?: boolean
  /** Estado del toggle de visibilidad */
  readonly visibilityEnabled?: boolean
  /** Callback del toggle de visibilidad */
  readonly onVisibilityChange?: (enabled: boolean) => void
  /** Contador opcional para mostrar junto al título */
  readonly count?: number
  /** Contenido de la sección */
  readonly children: React.ReactNode
  /** Si el contenido tiene padding interno */
  readonly hasPadding?: boolean
  /** Si se muestra con opacidad reducida */
  readonly dimmed?: boolean
  /** Animación de framer-motion */
  readonly animated?: boolean
  /** Clase adicional para el container */
  readonly className?: string
}

export function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  showVisibilityToggle = false,
  visibilityEnabled = true,
  onVisibilityChange,
  count,
  children,
  hasPadding = true,
  dimmed = false,
  animated = false,
  className = ''
}: CollapsibleSectionProps) {
  return (
    <div 
      className={`bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden transition-opacity duration-200 ${
        dimmed ? 'opacity-50' : ''
      } ${className}`}
    >
      {/* Header estilo "Configuraciones Financieras Guardadas" */}
      <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 flex items-center justify-between">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 text-xs font-medium text-gh-text hover:text-gh-info transition-colors"
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{title}</span>
          {typeof count === 'number' && (
            <span className="text-gh-text-muted font-normal">({count})</span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gh-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gh-text-muted" />
          )}
        </button>
        
        {showVisibilityToggle && onVisibilityChange && (
          <ToggleSwitch 
            enabled={visibilityEnabled} 
            onChange={onVisibilityChange}
          />
        )}
      </div>
      
      {/* Contenido colapsable */}
      {animated ? (
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className={hasPadding ? 'p-4' : ''}>
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        isExpanded && (
          <div className={hasPadding ? 'p-4' : ''}>
            {children}
          </div>
        )
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CollapsibleSectionSimple - Versión sin header separado (inline toggle)
// Para mantener compatibilidad con estructuras existentes
// ═══════════════════════════════════════════════════════════════════════════

interface CollapsibleSectionSimpleProps {
  /** Título de la sección */
  readonly title: string
  /** Icono para mostrar junto al título */
  readonly icon?: React.ReactNode
  /** Si la sección está expandida */
  readonly isExpanded: boolean
  /** Callback cuando se hace toggle */
  readonly onToggle: () => void
  /** Si la sección tiene toggle de visibilidad */
  readonly showVisibilityToggle?: boolean
  /** Estado del toggle de visibilidad */
  readonly visibilityEnabled?: boolean
  /** Callback del toggle de visibilidad */
  readonly onVisibilityChange?: (enabled: boolean) => void
  /** Contador opcional para mostrar junto al título */
  readonly count?: number
  /** Contenido de la sección */
  readonly children: React.ReactNode
  /** Si se muestra con opacidad reducida */
  readonly dimmed?: boolean
  /** Clase adicional para el container */
  readonly className?: string
}

export function CollapsibleSectionSimple({
  title,
  icon,
  isExpanded,
  onToggle,
  showVisibilityToggle = false,
  visibilityEnabled = true,
  onVisibilityChange,
  count,
  children,
  dimmed = false,
  className = ''
}: CollapsibleSectionSimpleProps) {
  return (
    <div 
      className={`p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg transition-opacity duration-200 ${
        dimmed ? 'opacity-50' : ''
      } ${className}`}
    >
      {/* Header inline */}
      <div className="flex items-center justify-between mb-0">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 text-xs font-medium text-gh-text hover:text-gh-info transition-colors"
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{title}</span>
          {typeof count === 'number' && (
            <span className="text-gh-text-muted font-normal">({count})</span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gh-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gh-text-muted" />
          )}
        </button>
        
        {showVisibilityToggle && onVisibilityChange && (
          <ToggleSwitch 
            enabled={visibilityEnabled} 
            onChange={onVisibilityChange}
          />
        )}
      </div>
      
      {/* Contenido colapsable */}
      {isExpanded && (
        <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
          {children}
        </div>
      )}
    </div>
  )
}

export default CollapsibleSection
