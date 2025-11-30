'use client'

import React from 'react'
import { FaClock, FaSave, FaUndo, FaCheck } from 'react-icons/fa'

interface ContentHeaderProps {
  readonly title: string
  readonly icon: React.ReactNode
  readonly updatedAt?: string | null
  readonly onGuardar: () => void
  readonly onReset: () => void
  readonly guardando: boolean
  /** Si hay cambios pendientes en esta sección específica */
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

export default function ContentHeader({ title, icon, updatedAt, onGuardar, onReset, guardando, hasChanges = false }: ContentHeaderProps) {
  const formattedDate = formatUpdatedAt(updatedAt)
  const hasBeenModified = Boolean(updatedAt)

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h4 className="text-sm font-semibold text-gh-text flex items-center gap-2 uppercase tracking-wide">
          {icon} {title}
        </h4>
        {/* Badge de estado: cambios pendientes vs última modificación */}
        {hasChanges ? (
          <span className="text-xs px-2 py-1 rounded flex items-center gap-1.5 bg-gh-warning/15 text-gh-warning border border-gh-warning/30 animate-pulse">
            <FaClock size={10} />
            Cambios sin guardar
          </span>
        ) : (
          <span className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 ${
            hasBeenModified 
              ? 'bg-gh-success/10 text-gh-success' 
              : 'bg-gh-bg-tertiary text-gh-text-muted'
          }`}>
            {hasBeenModified ? <FaCheck size={10} /> : <FaClock size={10} />}
            {hasBeenModified ? `Guardado: ${formattedDate}` : formattedDate}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onReset}
          disabled={!hasChanges}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
            hasChanges
              ? 'text-gh-text-muted hover:text-gh-text bg-gh-bg-secondary border border-gh-border hover:bg-gh-bg-tertiary'
              : 'text-gh-text-muted/50 bg-gh-bg-secondary/50 border border-gh-border/50 cursor-not-allowed'
          }`}
          title={hasChanges ? 'Descartar cambios' : 'No hay cambios que descartar'}
        >
          <FaUndo size={10} /> Descartar
        </button>
        <button
          onClick={onGuardar}
          disabled={guardando || !hasChanges}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
            hasChanges
              ? 'text-white bg-gh-success hover:bg-gh-success/90'
              : 'text-white/70 bg-gh-success/50 cursor-not-allowed'
          } disabled:opacity-50`}
        >
          <FaSave size={10} /> {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
