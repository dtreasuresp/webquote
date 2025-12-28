'use client'

import { useState } from 'react'
import DialogoGenericoDinamico from '@/features/admin/components/DialogoGenericoDinamico'
import { useClientResponse } from '@/features/admin/hooks/useClientResponse'

interface DialogoNuevaProuestaProps {
  isOpen: boolean
  quotationId: string
  quotationNumber: string
  clientName?: string
  onClose: () => void
  onSuccess?: () => void
}

/**
 * Diálogo para que el cliente solicite una nueva propuesta
 */
export function DialogoNuevaProuesta({
  isOpen,
  quotationId,
  quotationNumber,
  clientName = 'cliente',
  onClose,
  onSuccess,
}: DialogoNuevaProuestaProps) {
  const { submitResponse, loading, error } = useClientResponse()
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [cambios, setCambios] = useState('')

  const handleSubmit = async () => {
    if (!nombre.trim() || !email.trim() || !cambios.trim()) {
      alert('Por favor completa todos los campos')
      return
    }

    await submitResponse(quotationId, {
      responseType: 'NUEVA_PROPUESTA',
      clientName: nombre,
      clientEmail: email,
      mensaje: cambios,
    })

    onSuccess?.()
    onClose()
  }

  const content = (
    <div className="space-y-4">
      {/* Propuesta de cambios */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-semibold text-blue-400">¿Qué cambios necesitas?</p>
            <p className="text-sm text-gh-text-secondary mt-1">
              Cuéntanos qué ajustes te gustaría que hagamos
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
            className="w-full px-3 py-2 bg-gh-bg-primary border border-gh-border rounded text-white placeholder-gh-text-secondary focus:border-blue-500 focus:outline-none transition"
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
            className="w-full px-3 py-2 bg-gh-bg-primary border border-gh-border rounded text-white placeholder-gh-text-secondary focus:border-blue-500 focus:outline-none transition"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-xs text-gh-text-secondary uppercase tracking-wider mb-2">
            ¿Qué cambios deseas?
          </label>
          <textarea
            value={cambios}
            onChange={(e) => setCambios(e.target.value)}
            placeholder="Describe los cambios que necesitas en la propuesta..."
            rows={4}
            className="w-full px-3 py-2 bg-gh-bg-primary border border-gh-border rounded text-white placeholder-gh-text-secondary focus:border-blue-500 focus:outline-none transition resize-none"
            disabled={loading}
          />
        </div>
      </div>

      {/* Resumen */}
      <div className="p-3 bg-gh-bg-primary border border-gh-border rounded">
        <p className="text-xs text-gh-text-secondary mb-2">Cotización #{quotationNumber}</p>
        <p className="font-semibold text-white">Solicitud de ajustes enviada</p>
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
      title="Solicitar Nueva Propuesta"
      description="Cuéntanos qué cambios necesitas"
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
          label: loading ? 'Enviando...' : 'Solicitar Cambios',
          variant: 'primary',
          onClick: handleSubmit,
          loading: loading,
        },
      ]}
      onClose={onClose}
      maxHeight="70vh"
    />
  )
}
