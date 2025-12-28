'use client'

import { useState } from 'react'
import DialogoGenericoDinamico from '@/features/admin/components/DialogoGenericoDinamico'

interface DialogoClienteAceptarProps {
  isOpen: boolean
  quotationId: string
  quotationNumber: string
  onClose: () => void
  onSubmit: (clientName: string, clientEmail: string) => Promise<void>
  isLoading?: boolean
}

/**
 * Dialog para aceptación de cotización por cliente
 * Solicita: Nombre y Email del cliente
 * Envía: POST /api/quotations/[id]/client-response con responseType: 'ACEPTADA'
 */
export default function DialogoClienteAceptar({
  isOpen,
  quotationId,
  quotationNumber,
  onClose,
  onSubmit,
  isLoading = false,
}: Readonly<DialogoClienteAceptarProps>) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [localLoading, setLocalLoading] = useState(false)

  // Validar email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'El nombre es requerido'
    } else if (formData.clientName.trim().length < 3) {
      newErrors.clientName = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'El email es requerido'
    } else if (!isValidEmail(formData.clientEmail)) {
      newErrors.clientEmail = 'Ingrese un email válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar cambios en inputs
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validateForm()) return

    setLocalLoading(true)
    try {
      await onSubmit(formData.clientName, formData.clientEmail)
      // Reset formulario después de éxito
      setFormData({ clientName: '', clientEmail: '' })
    } finally {
      setLocalLoading(false)
    }
  }

  const combinedLoading = isLoading || localLoading

  return (
    <DialogoGenericoDinamico
      isOpen={isOpen}
      onClose={onClose}
      title="✅ Aceptar Cotización"
      description={`Cotización #${quotationNumber}`}
      type="success"
      size="md"
      content={
        <div className="space-y-4">
          <p className="text-gh-text-secondary">
            Para aceptar esta cotización, por favor proporcione sus datos de contacto:
          </p>

          {/* Campo: Nombre */}
          <div>
            <label className="block text-sm font-medium text-gh-text mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              placeholder="Ej: Juan Pérez"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              disabled={combinedLoading}
              className={`w-full px-3 py-2 rounded-lg bg-gh-bg-secondary border transition-colors
                ${
                  errors.clientName
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-gh-border hover:border-gh-text-secondary focus:border-gh-text-primary'
                }
                text-gh-text placeholder-gh-text-secondary
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none`}
            />
            {errors.clientName && (
              <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>
            )}
          </div>

          {/* Campo: Email */}
          <div>
            <label className="block text-sm font-medium text-gh-text mb-1">
              Email de Contacto *
            </label>
            <input
              type="email"
              placeholder="ej@empresa.com"
              value={formData.clientEmail}
              onChange={(e) => handleInputChange('clientEmail', e.target.value)}
              disabled={combinedLoading}
              className={`w-full px-3 py-2 rounded-lg bg-gh-bg-secondary border transition-colors
                ${
                  errors.clientEmail
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-gh-border hover:border-gh-text-secondary focus:border-gh-text-primary'
                }
                text-gh-text placeholder-gh-text-secondary
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none`}
            />
            {errors.clientEmail && (
              <p className="text-red-500 text-xs mt-1">{errors.clientEmail}</p>
            )}
          </div>

          {/* Resumen */}
          <div className="bg-gh-bg-tertiary p-3 rounded-lg border border-gh-border">
            <p className="text-xs text-gh-text-secondary">
              ✓ Al aceptar, esta cotización cambiará a estado <strong>ACEPTADA</strong> y se
              notificará al proveedor.
            </p>
          </div>
        </div>
      }
      actions={[
        {
          id: 'cancel',
          label: 'Cancelar',
          variant: 'secondary',
          onClick: onClose,
        },
        {
          id: 'submit',
          label: combinedLoading ? 'Enviando...' : 'Aceptar Cotización',
          variant: 'success',
          onClick: handleSubmit,
          loading: combinedLoading,
        },
      ]}
    />
  )
}
