'use client'

import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import DialogoGenericoDinamico from '@/features/admin/components/DialogoGenericoDinamico'

interface DialogoClienteProponeProps {
  isOpen: boolean
  quotationId: string
  quotationNumber: string
  onClose: () => void
  onSubmit: (clientName: string, clientEmail: string, sugerencias: string) => Promise<void>
  isLoading?: boolean
}

/**
 * Dialog para propuesta de cambios en cotización por cliente
 * Solicita: Nombre, Email y Sugerencias
 * Envía: POST /api/quotations/[id]/client-response con responseType: 'NUEVA_PROPUESTA'
 */
export default function DialogoClienteProponer({
  isOpen,
  quotationId,
  quotationNumber,
  onClose,
  onSubmit,
  isLoading = false,
}: DialogoClienteProponeProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    sugerencias: '',
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

    if (!formData.sugerencias.trim()) {
      newErrors.sugerencias = 'Por favor indique sus sugerencias'
    } else if (formData.sugerencias.trim().length < 10) {
      newErrors.sugerencias = 'Las sugerencias deben tener al menos 10 caracteres'
    } else if (formData.sugerencias.trim().length > 1000) {
      newErrors.sugerencias = 'Las sugerencias no pueden exceder 1000 caracteres'
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
      await onSubmit(formData.clientName, formData.clientEmail, formData.sugerencias)
      // Reset formulario después de éxito
      setFormData({ clientName: '', clientEmail: '', sugerencias: '' })
    } finally {
      setLocalLoading(false)
    }
  }

  const combinedLoading = isLoading || localLoading
  const sugerenciasLength = formData.sugerencias.trim().length

  return (
    <DialogoGenericoDinamico
      isOpen={isOpen}
      onClose={onClose}
      title="💡 Proponer Cambios"
      description={`Cotización #${quotationNumber}`}
      type="info"
      size="md"
      content={
        <div className="space-y-4">
          <p className="text-gh-text-secondary">
            ¿Qué cambios o mejoras sugiere para esta cotización?
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

          {/* Campo: Sugerencias */}
          <div>
            <label className="block text-sm font-medium text-gh-text mb-1">
              Sugerencias y Cambios * ({sugerenciasLength}/1000)
            </label>
            <textarea
              placeholder="Describa los cambios o mejoras que sugiere (mínimo 10 caracteres)..."
              value={formData.sugerencias}
              onChange={(e) => handleInputChange('sugerencias', e.target.value)}
              disabled={combinedLoading}
              maxLength={1000}
              rows={5}
              className={`w-full px-3 py-2 rounded-lg bg-gh-bg-secondary border transition-colors
                ${
                  errors.sugerencias
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-gh-border hover:border-gh-text-secondary focus:border-gh-text-primary'
                }
                text-gh-text placeholder-gh-text-secondary
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none resize-none`}
            />
            {errors.sugerencias && (
              <p className="text-red-500 text-xs mt-1">{errors.sugerencias}</p>
            )}
          </div>

          {/* Resumen */}
          <div className="bg-gh-bg-tertiary p-3 rounded-lg border border-gh-border">
            <p className="text-xs text-gh-text-secondary">
              ✓ Al enviar sus sugerencias, esta cotización cambiará a estado{' '}
              <strong>NUEVA_PROPUESTA</strong> y el proveedor las revisará.
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
          label: combinedLoading ? 'Enviando...' : 'Enviar Sugerencias',
          variant: 'primary',
          onClick: handleSubmit,
          loading: combinedLoading,
        },
      ]}
    />
  )
}
