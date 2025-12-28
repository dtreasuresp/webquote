'use client'

import { useState } from 'react'
import DialogoGenericoDinamico from '../DialogoGenericoDinamico'

interface DialogoSolicitarExtensionProps {
  isOpen: boolean
  quotationId: string
  quotationNumber: string
  onClose: () => void
  onSuccess?: () => void
}

export function DialogoSolicitarExtension({
  isOpen,
  quotationId,
  quotationNumber,
  onClose,
  onSuccess,
}: DialogoSolicitarExtensionProps) {
  const [dias, setDias] = useState(1)
  const [razon, setRazon] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSolicitar = async () => {
    if (dias <= 0) {
      setError('Debes solicitar al menos 1 día')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/quotations/${quotationId}/request-extension`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diasSolicitados: dias,
          razon: razon || 'No especificada',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al solicitar extensión')
      }

      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const content = (
    <div className="space-y-4">
      {/* Información */}
      <div className="p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
        <p className="text-blue-400 text-sm">
          <span className="font-semibold">ℹ️ Solicita más tiempo</span> para revisar esta cotización.
        </p>
      </div>

      {/* Días */}
      <div>
        <label className="block text-xs text-gh-text-secondary uppercase tracking-wider mb-2">
          Días Adicionales Solicitados
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDias(Math.max(1, dias - 1))}
            className="w-10 h-10 rounded-lg bg-gh-bg-secondary hover:bg-gh-border text-white font-bold transition-colors"
            disabled={dias <= 1}
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max="30"
            value={dias}
            onChange={(e) => setDias(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg text-white text-center font-bold"
          />
          <button
            onClick={() => setDias(Math.min(30, dias + 1))}
            className="w-10 h-10 rounded-lg bg-gh-bg-secondary hover:bg-gh-border text-white font-bold transition-colors"
            disabled={dias >= 30}
          >
            +
          </button>
        </div>
        <p className="text-xs text-gh-text-secondary mt-2">Máximo 30 días adicionales</p>
      </div>

      {/* Razón */}
      <div>
        <label className="block text-xs text-gh-text-secondary uppercase tracking-wider mb-2">
          Razón de la Solicitud (Opcional)
        </label>
        <textarea
          value={razon}
          onChange={(e) => setRazon(e.target.value)}
          placeholder="Cuéntanos por qué necesitas más tiempo..."
          className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg text-white placeholder-gh-text-secondary text-sm resize-none h-24"
        />
      </div>

      {/* Resumen */}
      <div className="p-3 bg-gh-bg-secondary rounded-lg border border-gh-border">
        <p className="text-xs text-gh-text-secondary uppercase tracking-wider mb-2">Resumen</p>
        <div className="text-sm text-white space-y-1">
          <p>📋 Cotización: <span className="font-semibold">{quotationNumber}</span></p>
          <p>⏱️ Extensión: <span className="font-semibold">{dias} día{dias > 1 ? 's' : ''}</span></p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  )

  return (
    <DialogoGenericoDinamico
      isOpen={isOpen}
      title="Solicitar Extensión de Tiempo"
      description="¿Necesitas más tiempo para revisar la propuesta?"
      content={content}
      actions={[
        {
          id: 'cancel',
          label: 'Cancelar',
          variant: 'secondary',
          onClick: onClose,
        },
        {
          id: 'request',
          label: loading ? 'Solicitando...' : 'Solicitar Extensión',
          variant: 'primary',
          onClick: handleSolicitar,
          loading: loading || dias <= 0,
        },
      ]}
      onClose={onClose}
      maxHeight="70vh"
    />
  )
}
