'use client'

import { useState } from 'react'
import DialogoGenericoDinamico from '@/features/admin/components/DialogoGenericoDinamico'
import { useClientResponse } from '@/features/admin/hooks/useClientResponse'

interface DialogoRechazarProps {
  isOpen: boolean
  quotationId: string
  quotationNumber: string
  clientName?: string
  onClose: () => void
  onSuccess?: () => void
}

/**
 * Diálogo para que el cliente rechace la cotización
 */
export function DialogoRechazar({
  isOpen,
  quotationId,
  quotationNumber,
  clientName = 'cliente',
  onClose,
  onSuccess,
}: DialogoRechazarProps) {
  const { submitResponse, loading, error } = useClientResponse()
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [motivo, setMotivo] = useState('')

  const handleSubmit = async () => {
    if (!nombre.trim() || !email.trim()) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    await submitResponse(quotationId, {
      responseType: 'RECHAZADA',
      clientName: nombre,
      clientEmail: email,
      mensaje: motivo || 'No especificado',
    })

    onSuccess?.()
    onClose()
  }

  const content = (
    <div className="space-y-4">
      {/* Advertencia */}
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-semibold text-red-400">Cotización rechazada</p>
            <p className="text-sm text-gh-text-secondary mt-1">
              Nos gustaría saber por qué
            </p>
          </div>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gh-text-secondary uppercase tracking-wider mb-2">
            Tu Nombre
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            className="w-full px-3 py-2 bg-gh-bg-primary border border-gh-border rounded text-white placeholder-gh-text-secondary focus:border-red-500 focus:outline-none transition"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-xs text-gh-text-secondary uppercase tracking-wider mb-2">
            Tu Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full px-3 py-2 bg-gh-bg-primary border border-gh-border rounded text-white placeholder-gh-text-secondary focus:border-red-500 focus:outline-none transition"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-xs text-gh-text-secondary uppercase tracking-wider mb-2">
            Motivo del rechazo (opcional)
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ayúdanos a entender por qué..."
            rows={3}
            className="w-full px-3 py-2 bg-gh-bg-primary border border-gh-border rounded text-white placeholder-gh-text-secondary focus:border-red-500 focus:outline-none transition resize-none"
            disabled={loading}
          />
        </div>
      </div>

      {/* Resumen */}
      <div className="p-3 bg-gh-bg-primary border border-gh-border rounded">
        <p className="text-xs text-gh-text-secondary mb-2">Cotización #{quotationNumber}</p>
        <p className="font-semibold text-white">Rechazo confirmado</p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  )

  return (
    <DialogoGenericoDinamico
      isOpen={isOpen}
      title="Rechazar Cotización"
      description="Confirma tu rechazo de la propuesta"
      content={content}
      actions={[
        {
          id: 'cancel',
          label: 'Cancelar',
          variant: 'secondary',
          onClick: onClose,
        },
        {
          id: 'reject',
          label: loading ? 'Procesando...' : 'Confirmar Rechazo',
          variant: 'danger',
          onClick: handleSubmit,
          loading: loading,
        },
      ]}
      onClose={onClose}
      maxHeight="70vh"
    />
  )
}
