'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import DialogoGenericoDinamico from '@/features/admin/components/DialogoGenericoDinamico'

interface DialogoClienteRechazarProps {
  isOpen: boolean
  quotationId: string
  quotationNumber: string
  onClose: () => void
  onSubmit: (clientName: string, clientEmail: string, razon: string) => Promise<void>
  isLoading?: boolean
}

/**
 * Dialog para rechazo de cotización por cliente
 * Solicita: Nombre, Email y Razón del rechazo
 * Envía: POST /api/quotations/[id]/client-response con responseType: 'RECHAZADA'
 */
export default function DialogoClienteRechazar({
  isOpen,
  quotationId,
  quotationNumber,
  onClose,
  onSubmit,
  isLoading = false,
}: DialogoClienteRechazarProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    razon: '',
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

    if (!formData.razon.trim()) {
      newErrors.razon = 'Por favor indique la razón del rechazo'
    } else if (formData.razon.trim().length < 10) {
      newErrors.razon = 'La razón debe tener al menos 10 caracteres'
    } else if (formData.razon.trim().length > 500) {
      newErrors.razon = 'La razón no puede exceder 500 caracteres'
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
      await onSubmit(formData.clientName, formData.clientEmail, formData.razon)
      // Reset formulario después de éxito
      setFormData({ clientName: '', clientEmail: '', razon: '' })
    } finally {
      setLocalLoading(false)
    }
  }

  const combinedLoading = isLoading || localLoading
  const razonLength = formData.razon.trim().length

  return (
    <DialogoGenericoDinamico
      isOpen={isOpen}
      onClose={onClose}
      title="❌ Rechazar Cotización"
      description={`Cotización #${quotationNumber}`}
      type="warning"
      size="md"
      content={
        <div className="space-y-4">
          <p className="text-gh-text-secondary">
            Lamentamos que rechace esta propuesta. Ayúdenos a entender por qué:
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

          {/* Campo: Razón */}
          <div>
            <label className="block text-sm font-medium text-gh-text mb-1">
              ¿Por qué rechaza esta cotización? * ({razonLength}/500)
            </label>
            <textarea
              placeholder="Indique la razón o motivo del rechazo (mínimo 10 caracteres)..."
              value={formData.razon}
              onChange={(e) => handleInputChange('razon', e.target.value)}
              disabled={combinedLoading}
              maxLength={500}
              rows={4}
              className={`w-full px-3 py-2 rounded-lg bg-gh-bg-secondary border transition-colors
                ${
                  errors.razon
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-gh-border hover:border-gh-text-secondary focus:border-gh-text-primary'
                }
                text-gh-text placeholder-gh-text-secondary
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none resize-none`}
            />
            {errors.razon && (
              <p className="text-red-500 text-xs mt-1">{errors.razon}</p>
            )}
          </div>

          {/* Resumen */}
          <div className="bg-gh-bg-tertiary p-3 rounded-lg border border-gh-border">
            <p className="text-xs text-gh-text-secondary">
              ✓ Al rechazar, esta cotización cambiará a estado <strong>RECHAZADA</strong> y el
              proveedor recibirá su retroalimentación.
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
          label: combinedLoading ? 'Enviando...' : 'Rechazar Cotización',
          variant: 'danger',
          onClick: handleSubmit,
          loading: combinedLoading,
        },
      ]}
    />
  )
}
