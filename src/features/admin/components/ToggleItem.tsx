'use client'

import React from 'react'
import { ToggleLeft, ToggleRight } from 'lucide-react'

interface ToggleItemProps {
  /** Estado del toggle */
  enabled: boolean
  /** Callback cuando cambia el estado */
  onChange: (enabled: boolean) => void
  /** Título del toggle */
  title: string
  /** Descripción opcional */
  description?: string
  /** Mostrar badge de estado (Activo/Inactivo) */
  showBadge?: boolean
  /** Si está deshabilitado */
  disabled?: boolean
}

/**
 * Componente ToggleItem basado en el patrón de PreferenciasTab
 * 
 * Muestra un toggle con:
 * - Ícono de toggle a la izquierda (ToggleLeft/ToggleRight)
 * - Título y badge de estado
 * - Descripción opcional debajo
 */
export default function ToggleItem({
  enabled,
  onChange,
  title,
  description,
  showBadge = true,
  disabled = false
}: Readonly<ToggleItemProps>) {
  return (
    <label 
      className={`flex items-center gap-4 cursor-pointer px-4 py-3 hover:bg-gh-bg-tertiary/20 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex-shrink-0">
        {enabled ? (
          <ToggleRight className="w-6 h-6 text-gh-success" />
        ) : (
          <ToggleLeft className="w-6 h-6 text-gh-text-muted" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gh-text">{title}</span>
          {showBadge && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              enabled 
                ? 'bg-gh-success/10 text-gh-success' 
                : 'bg-gh-border/20 text-gh-text-muted'
            }`}>
              {enabled ? '✓ Activo' : 'Inactivo'}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-gh-text-muted mt-0.5">
            {description}
          </p>
        )}
      </div>
    </label>
  )
}

/**
 * Contenedor para grupos de ToggleItems
 * Proporciona el layout de sección con header y separadores
 */
interface ToggleGroupProps {
  /** Título del grupo */
  title: string
  /** Children (ToggleItems) */
  children: React.ReactNode
}

export function ToggleGroup({ title, children }: Readonly<ToggleGroupProps>) {
  return (
    <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
        <h5 className="text-xs font-medium text-gh-text">
          {title}
        </h5>
      </div>
      <div className="divide-y divide-gh-border/10">
        {children}
      </div>
    </div>
  )
}
