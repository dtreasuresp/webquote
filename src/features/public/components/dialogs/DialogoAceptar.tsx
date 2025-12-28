'use client'

import { useState } from 'react'
import DialogoGenericoDinamico from '@/features/admin/components/DialogoGenericoDinamico'
import { useClientResponse } from '@/features/admin/hooks/useClientResponse'

interface DialogoAceptarProps {
  isOpen: boolean
  quotationId: string
  quotationNumber: string
  clientName?: string
  onClose: () => void
  onSuccess?: () => void
}

/**
 * Diálogo para que el cliente acepte la cotización
 */
export function DialogoAceptar({
  isOpen,
  quotationId,
  quotationNumber,
  clientName = 'cliente',
  onClose,
  onSuccess,
}: DialogoAceptarProps) {
  const { submitResponse, loading, error } = useClientResponse()
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')

  const handleSubmit = async () => {
    if (!nombre.trim() || !email.trim()) {
      alert('Por favor completa todos los campos')
      return
    }

    await submitResponse(quotationId, {
      responseType: 'ACEPTADA',
      clientName: nombre,
      clientEmail: email,
      mensaje: 'Acepto la cotización propuesta',
    })

    onSuccess?.()
    onClose()
  }

  const content = (
    <div className="space-y-4">
      {/* Confirmación */}
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold text-emerald-400">¡Excelente decisión!</p>
            <p className="text-sm text-gh-text-secondary mt-1">
              Procederemos a los siguientes pasos
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
            className="w-full px-3 py-2 bg-gh-bg-primary border border-gh-border rounded text-white placeholder-gh-text-secondary focus:border-emerald-500 focus:outline-none transition"
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
            className="w-full px-3 py-2 bg-gh-bg-primary border border-gh-border rounded text-white placeholder-gh-text-secondary focus:border-emerald-500 focus:outline-none transition"
            disabled={loading}
          />
        </div>
      </div>

      {/* Resumen */}
      <div className="p-3 bg-gh-bg-primary border border-gh-border rounded">
        <p className="text-xs text-gh-text-secondary mb-2">Cotización #{quotationNumber}</p>
        <p className="font-semibold text-white">Aceptación confirmada</p>
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
      title="Aceptar Cotización"
      description="Confirma tu aceptación de la propuesta"
      content={content}
      actions={[
        {
          id: 'cancel',
          label: 'Cancelar',
          variant: 'secondary',
          onClick: onClose,
        },
        {
          id: 'accept',
          label: loading ? 'Procesando...' : 'Confirmar Aceptación',
          variant: 'success',
          onClick: handleSubmit,
          loading: loading,
        },
      ]}
      onClose={onClose}
      maxHeight="70vh"
    />
  )
}
