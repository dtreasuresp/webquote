'use client'

import { useState } from 'react'
import DialogoGenericoDinamico from '../DialogoGenericoDinamico'
import { useChangeQuotationState } from '../../hooks/useChangeQuotationState'

interface DialogoCambiarEstadoProps {
  isOpen: boolean
  quotationId: string
  quotationNumber: string
  currentState: string
  onClose: () => void
  onSuccess?: () => void
}

export function DialogoCambiarEstado({
  isOpen,
  quotationId,
  quotationNumber,
  currentState,
  onClose,
  onSuccess,
}: DialogoCambiarEstadoProps) {
  const { changeState, loading, error } = useChangeQuotationState()
  const [selectedState, setSelectedState] = useState<string>(currentState)

  const estados = [
    { value: 'CARGADA', label: 'Cargada', description: 'En edición', color: 'from-gray-600 to-gray-700', icon: '✏️' },
    { value: 'ACTIVA', label: 'Activa', description: 'Publicada al cliente', color: 'from-green-600 to-green-700', icon: '✅' },
    { value: 'INACTIVA', label: 'Inactiva', description: 'Archivada', color: 'from-yellow-600 to-yellow-700', icon: '🚫' },
    { value: 'ACEPTADA', label: 'Aceptada', description: 'Cliente aceptó', color: 'from-emerald-600 to-emerald-700', icon: '🎉' },
    { value: 'RECHAZADA', label: 'Rechazada', description: 'Cliente rechazó', color: 'from-red-600 to-red-700', icon: '❌' },
    { value: 'NUEVA_PROPUESTA', label: 'Nueva Propuesta', description: 'Cliente propone cambios', color: 'from-blue-600 to-blue-700', icon: '💡' },
    { value: 'EXPIRADA', label: 'Expirada', description: 'Tiempo agotado', color: 'from-slate-600 to-slate-700', icon: '⏰' },
  ]

  const handleChangeState = async () => {
    if (selectedState === currentState) {
      onClose()
      return
    }

    await changeState(quotationId, selectedState)
    if (onSuccess) onSuccess()
    onClose()
  }

  const content = (
    <div className="space-y-4">
      {/* Estado actual */}
      <div className="p-3 bg-gh-bg-secondary rounded-lg border border-gh-border">
        <p className="text-xs text-gh-text-secondary uppercase tracking-wider mb-1">Estado Actual</p>
        <p className="font-semibold text-white">{currentState}</p>
      </div>

      {/* Selector de nuevos estados */}
      <div className="space-y-2">
        <p className="text-xs text-gh-text-secondary uppercase tracking-wider">Cambiar a:</p>
        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
          {estados.map((estado) => (
            <button
              key={estado.value}
              onClick={() => setSelectedState(estado.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedState === estado.value
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gh-border bg-gh-bg-secondary hover:border-gh-border-focus'
              } ${currentState === estado.value ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={currentState === estado.value}
            >
              <span className="text-lg">{estado.icon}</span>
              <p className="font-medium text-white text-sm mt-1">{estado.label}</p>
              <p className="text-xs text-gh-text-secondary">{estado.description}</p>
            </button>
          ))}
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
      title="Cambiar Estado de Cotización"
      description={`Cotización: ${quotationNumber}`}
      content={content}
      actions={[
        {
          id: 'cancel',
          label: 'Cancelar',
          variant: 'secondary',
          onClick: onClose,
        },
        {
          id: 'change',
          label: loading ? 'Procesando...' : 'Cambiar Estado',
          variant: 'primary',
          onClick: handleChangeState,
          loading: loading || selectedState === currentState,
        },
      ]}
      onClose={onClose}
      maxHeight="70vh"
    />
  )
}
