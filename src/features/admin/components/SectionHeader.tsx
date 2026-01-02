'use client'

import React from 'react'
import { Plus, RefreshCw, Settings, Clock, Check, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface SectionHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  onAdd?: () => void
  onRefresh?: () => void
  onSettings?: () => void
  isLoading?: boolean
  itemCount?: number
  badges?: Array<{ label: string; value: string | number; color?: string }>
  variant?: 'default' | 'success' | 'accent' | 'warning'
  updatedAt?: string | null
  statusIndicator?: 'sin-modificar' | 'guardado' | 'cambios-pendientes' | 'modificado'
  actions?: React.ReactNode
}

export default function SectionHeader({
  title,
  description,
  icon,
  onAdd,
  onRefresh,
  onSettings,
  isLoading,
  itemCount,
  badges,
  variant = 'default',
  updatedAt,
  statusIndicator,
  actions
}: Readonly<SectionHeaderProps>) {
  const variantColors = {
    default: 'text-gh-text',
    success: 'text-gh-success',
    accent: 'text-gh-accent',
    warning: 'text-gh-warning'
  }

  const buttonHoverColors = {
    default: 'hover:bg-gh-border/30 text-gh-text-muted hover:text-gh-text',
    success: 'hover:bg-gh-success/10 text-gh-text-muted hover:text-gh-success',
    accent: 'hover:bg-gh-accent/10 text-gh-text-muted hover:text-gh-accent',
    warning: 'hover:bg-gh-warning/10 text-gh-text-muted hover:text-gh-warning'
  }

  const addButtonColors = {
    default: 'bg-gh-border/30 text-gh-text hover:bg-gh-border/50',
    success: 'bg-gh-success/20 text-gh-success hover:bg-gh-success/30',
    accent: 'bg-gh-accent/20 text-gh-accent hover:bg-gh-accent/30',
    warning: 'bg-gh-warning/20 text-gh-warning hover:bg-gh-warning/30'
  }

  // Helper para formatear fecha
  const formatUpdatedAt = (isoDate?: string | null) => {
    if (!isoDate) return null
    try {
      const date = new Date(isoDate)
      return date.toLocaleString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return null
    }
  }

  const formattedDate = formatUpdatedAt(updatedAt)

  return (
    <div className="flex-shrink-0 border-b border-white/10 bg-white/5 backdrop-blur-md px-6 py-4 rounded-t-xl">
      {/* Título y descripción */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {icon && <div className={`flex-shrink-0 text-xl ${variantColors[variant]}`}>{icon}</div>}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gh-text">{title}</h3>
              {statusIndicator === 'guardado' && (
                <Check className="w-3 h-3 text-gh-success" />
              )}
              {statusIndicator === 'cambios-pendientes' && (
                <AlertCircle className="w-3 h-3 text-gh-warning" />
              )}
            </div>
            {description && (
              <p className="text-[11px] text-gh-text-muted mt-0.5">{description}</p>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {formattedDate && (
            <div className="hidden md:flex items-center gap-1.5 text-[10px] text-gh-text-muted mr-2">
              <Clock className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          )}

          {onRefresh && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${buttonHoverColors[variant]}`}
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </motion.button>
          )}

          {onSettings && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSettings}
              className={`p-2 rounded-lg transition-colors ${buttonHoverColors[variant]}`}
              title="Configuración"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          )}

          {actions}

          {onAdd && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAdd}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-semibold text-xs ${addButtonColors[variant]}`}
              title="Agregar nuevo"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Badges de información */}
      {((badges && badges.length > 0) || itemCount !== undefined) && (
        <div className="flex items-center gap-2 flex-wrap">
          {itemCount !== undefined && (
            <div className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-gh-border/10 text-gh-text-muted border-gh-border/20">
              {itemCount} {itemCount === 1 ? 'elemento' : 'elementos'}
            </div>
          )}
          {badges?.map((badge) => (
            <div
              key={badge.label}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                badge.color || 'bg-gh-border/10 text-gh-text-muted border-gh-border/20'
              }`}
            >
              <span>{badge.label}</span>
              <span className="font-bold">{badge.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
