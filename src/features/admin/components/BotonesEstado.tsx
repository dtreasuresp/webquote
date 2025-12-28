'use client'

import { useState } from 'react'
import { DialogoCambiarEstado } from './dialogs/DialogoCambiarEstado'
import { DialogoVerRespuestaCliente } from './dialogs/DialogoVerRespuestaCliente'

interface EstadoBoton {
  value: string
  label: string
  icon: string
  color: string // Clase de color Tailwind
  colorBorder: string
}

interface BotonesEstadoProps {
  quotationId: string
  quotationNumber: string
  currentState: string
  clientResponse?: any
  onStateChanged?: () => void
}

const ESTADO_BOTONES: Record<string, EstadoBoton> = {
  CARGADA: {
    value: 'CARGADA',
    label: 'Cargada',
    icon: '✏️',
    color: 'text-gray-400',
    colorBorder: 'border-gray-500',
  },
  ACTIVA: {
    value: 'ACTIVA',
    label: 'Activa',
    icon: '✅',
    color: 'text-green-400',
    colorBorder: 'border-green-500',
  },
  INACTIVA: {
    value: 'INACTIVA',
    label: 'Inactiva',
    icon: '🚫',
    color: 'text-yellow-400',
    colorBorder: 'border-yellow-500',
  },
  ACEPTADA: {
    value: 'ACEPTADA',
    label: 'Aceptada',
    icon: '🎉',
    color: 'text-emerald-400',
    colorBorder: 'border-emerald-500',
  },
  RECHAZADA: {
    value: 'RECHAZADA',
    label: 'Rechazada',
    icon: '❌',
    color: 'text-red-400',
    colorBorder: 'border-red-500',
  },
  NUEVA_PROPUESTA: {
    value: 'NUEVA_PROPUESTA',
    label: 'Nueva Propuesta',
    icon: '💡',
    color: 'text-blue-400',
    colorBorder: 'border-blue-500',
  },
  EXPIRADA: {
    value: 'EXPIRADA',
    label: 'Expirada',
    icon: '⏰',
    color: 'text-slate-400',
    colorBorder: 'border-slate-500',
  },
}

export function BotonesEstado({
  quotationId,
  quotationNumber,
  currentState,
  clientResponse,
  onStateChanged,
}: BotonesEstadoProps) {
  const [showEstadoDialog, setShowEstadoDialog] = useState(false)
  const [showResponseDialog, setShowResponseDialog] = useState(false)

  const estadoActual = ESTADO_BOTONES[currentState as keyof typeof ESTADO_BOTONES] || ESTADO_BOTONES.CARGADA

  return (
    <>
      {/* Grid de botones de estado */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* Botón de estado actual */}
        <div className="flex flex-col items-center gap-1">
          <div className={`px-3 py-2 rounded-lg border-2 ${estadoActual.colorBorder} bg-gh-bg-secondary text-center min-w-24`}>
            <p className="text-xl">{estadoActual.icon}</p>
            <p className={`text-xs font-semibold ${estadoActual.color}`}>{estadoActual.label}</p>
          </div>
          <p className="text-xs text-gh-text-secondary">Estado Actual</p>
        </div>

        {/* Botón para cambiar estado */}
        <button
          onClick={() => setShowEstadoDialog(true)}
          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gh-bg-secondary transition-colors group"
        >
          <div className="px-3 py-2 rounded-lg border-2 border-blue-500 bg-blue-500/10 text-center w-full group-hover:bg-blue-500/20">
            <p className="text-xl">🔄</p>
            <p className="text-xs font-semibold text-blue-400">Cambiar</p>
          </div>
          <p className="text-xs text-gh-text-secondary">Modificar</p>
        </button>

        {/* Botón para ver respuesta del cliente (si existe) */}
        {clientResponse && (
          <button
            onClick={() => setShowResponseDialog(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gh-bg-secondary transition-colors group"
          >
            <div className="px-3 py-2 rounded-lg border-2 border-purple-500 bg-purple-500/10 text-center w-full group-hover:bg-purple-500/20">
              <p className="text-xl">💬</p>
              <p className="text-xs font-semibold text-purple-400">Respuesta</p>
            </div>
            <p className="text-xs text-gh-text-secondary">Detalle</p>
          </button>
        )}

        {/* Botón de información */}
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg">
          <div className="px-3 py-2 rounded-lg border-2 border-gh-border bg-gh-bg-secondary text-center w-full">
            <p className="text-xl">ℹ️</p>
            <p className="text-xs font-semibold text-gh-text-secondary">Información</p>
          </div>
          <p className="text-xs text-gh-text-secondary">ID: {quotationId.slice(0, 8)}...</p>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="mt-4 p-3 bg-gh-bg-secondary rounded-lg border border-gh-border">
        <p className="text-xs text-gh-text-secondary uppercase tracking-wider mb-2">Significado de Estados</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span>✏️</span>
            <span className="text-gh-text-secondary">En edición</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span className="text-gh-text-secondary">Publicada</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🚫</span>
            <span className="text-gh-text-secondary">Archivada</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎉</span>
            <span className="text-gh-text-secondary">Aceptada</span>
          </div>
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span className="text-gh-text-secondary">Rechazada</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span className="text-gh-text-secondary">Propuesta</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⏰</span>
            <span className="text-gh-text-secondary">Expirada</span>
          </div>
        </div>
      </div>

      {/* Diálogos */}
      <DialogoCambiarEstado
        isOpen={showEstadoDialog}
        quotationId={quotationId}
        quotationNumber={quotationNumber}
        currentState={currentState}
        onClose={() => setShowEstadoDialog(false)}
        onSuccess={() => {
          onStateChanged?.()
        }}
      />

      {clientResponse && (
        <DialogoVerRespuestaCliente
          isOpen={showResponseDialog}
          clientResponse={clientResponse}
          quotationNumber={quotationNumber}
          onClose={() => setShowResponseDialog(false)}
        />
      )}
    </>
  )
}
