'use client'

import React from 'react'
import { Clock, Check, Save, Undo, type LucideIcon } from 'lucide-react'

export interface ContentHeaderAction {
  label: string
  icon: LucideIcon
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

interface ContentHeaderProps {
  readonly title: string
  readonly subtitle?: string
  readonly icon: LucideIcon
  /** Tipo de indicador de estado (para modo nuevo/simple) */
  readonly statusIndicator?: 'sin-modificar' | 'guardado' | 'cambios-pendientes'
  /** Timestamp de última modificación */
  readonly updatedAt?: string | null
  /** Badge adicional (contador, etc) */
  readonly badge?: string | number
  /** Array de acciones personalizadas (para modo nuevo/flexible) */
  readonly actions?: ContentHeaderAction[]
  
  // Props para modo legacy (ContenidoTAB con botones Guardar/Descartar)
  /** Handler para guardar (modo legacy) */
  readonly onGuardar?: () => void
  /** Handler para resetear/descartar (modo legacy) */
  readonly onReset?: () => void
  /** Indica si está guardando (modo legacy) */
  readonly guardando?: boolean
  /** Indica si hay cambios pendientes (modo legacy) */
  readonly hasChanges?: boolean
}

// Helper para formatear fecha de última modificación
function formatUpdatedAt(isoDate?: string | null): string {
  if (!isoDate) return 'Sin modificar'
  try {
    const date = new Date(isoDate)
    return date.toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Sin modificar'
  }
}

// Helper para obtener estilos de acción según variante
function getActionStyles(variant?: 'primary' | 'secondary' | 'danger', disabled?: boolean): string {
  const baseStyles = 'px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5'
  
  if (disabled) {
    return `${baseStyles} text-gh-text-muted/50 bg-gh-bg-secondary/50 border border-gh-border/30 cursor-not-allowed`
  }

  switch (variant) {
    case 'primary':
      return `${baseStyles} bg-gh-success/10 text-gh-success border border-gh-success/30 hover:bg-gh-success/20`
    case 'danger':
      return `${baseStyles} bg-gh-danger/10 text-gh-danger border border-gh-danger/30 hover:bg-gh-danger/20`
    case 'secondary':
    default:
      return `${baseStyles} text-gh-text-muted hover:text-gh-text bg-gh-bg-secondary border border-gh-border/30 hover:bg-gh-bg-tertiary`
  }
}

export default function ContentHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  statusIndicator,
  updatedAt,
  badge,
  actions = [],
  // Props legacy
  onGuardar,
  onReset,
  guardando = false,
  hasChanges = false,
}: ContentHeaderProps) {
  const formattedDate = formatUpdatedAt(updatedAt)
  const hasBeenModified = Boolean(updatedAt)
  
  // Determinar si estamos en modo legacy (ContenidoTAB) o modo nuevo (OfertaTAB)
  const isLegacyMode = Boolean(onGuardar) && Boolean(onReset)

  // Badge de estado para modo nuevo (OfertaTAB)
  const getStatusBadge = () => {
    // En modo legacy, determinar automáticamente el indicador basado en hasChanges
    const getIndicatorForLegacy = () => {
      if (hasChanges) return 'cambios-pendientes'
      if (hasBeenModified) return 'guardado'
      return 'sin-modificar'
    }
    const indicator = isLegacyMode 
      ? getIndicatorForLegacy()
      : (statusIndicator || 'sin-modificar')
    
    switch (indicator) {
      case 'cambios-pendientes':
        return (
          <span className="text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 bg-gh-warning/15 text-gh-warning border border-gh-warning/30">
            <Clock className="w-2.5 h-2.5" />
            Cambios sin guardar
          </span>
        )
      case 'guardado':
        return (
          <span className={`text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 border ${
            hasBeenModified 
              ? 'bg-gh-success/10 text-gh-success border-gh-success/30' 
              : 'bg-gh-bg-secondary text-gh-text-muted border-gh-border/30'
          }`}>
            {hasBeenModified ? <Check className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
            {hasBeenModified ? `Guardado: ${formattedDate}` : formattedDate}
          </span>
        )
      case 'sin-modificar':
      default:
        return (
          <span className="text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 bg-gh-bg-secondary text-gh-text-muted border border-gh-border/30">
            <Check className="w-2.5 h-2.5" />
            Sin modificar
          </span>
        )
    }
  }

  // Renderizar botones legacy (Guardar/Descartar para ContenidoTAB)
  const renderLegacyButtons = () => {
    if (!isLegacyMode) return null
    
    return (
      <div className="flex gap-2">
        <button
          onClick={onReset}
          disabled={!hasChanges}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
            hasChanges
              ? 'text-gh-text-muted hover:text-gh-text bg-gh-bg-secondary border border-gh-border/30 hover:bg-gh-bg-tertiary'
              : 'text-gh-text-muted/50 bg-gh-bg-secondary/50 border border-gh-border/30 cursor-not-allowed'
          }`}
          title={hasChanges ? 'Descartar cambios' : 'No hay cambios que descartar'}
        >
          <Undo className="w-2.5 h-2.5" /> Descartar
        </button>
        <button
          onClick={onGuardar}
          disabled={guardando || !hasChanges}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
            hasChanges
              ? 'bg-gh-success/10 text-gh-success border border-gh-success/30 hover:bg-gh-success/20'
              : 'bg-gh-success/10 text-gh-success/50 border border-gh-success/30 cursor-not-allowed'
          } disabled:opacity-50`}
        >
          <Save className="w-2.5 h-2.5" /> {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    )
  }

  // Renderizar acciones personalizadas (para OfertaTAB)
  const renderCustomActions = () => {
    if (isLegacyMode || actions.length === 0) return null
    
    return (
      <div className="flex gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            disabled={action.disabled}
            className={getActionStyles(action.variant, action.disabled)}
            title={action.label}
          >
            <action.icon className="w-3 h-3" />
            {action.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-base font-semibold text-gh-text flex items-center gap-2">
          <Icon className="w-4 h-4 text-gh-accent" />
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-gh-text-muted mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {/* Status badge */}
        {getStatusBadge()}
        
        {/* Optional badge (item count, etc) - solo en modo nuevo */}
        {!isLegacyMode && badge !== undefined && (
          <span className="text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 bg-gh-bg-secondary text-gh-text-muted border border-gh-border/30">
            {badge}
          </span>
        )}
        
        {/* Botones: legacy o custom actions */}
        {renderLegacyButtons()}
        {renderCustomActions()}
      </div>
    </div>
  )
}




