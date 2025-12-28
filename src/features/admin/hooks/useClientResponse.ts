'use client'

import { useState } from 'react'

interface UseClientResponseReturn {
  submitResponse: (quotationId: string, data: {
    responseType: 'ACEPTADA' | 'RECHAZADA' | 'NUEVA_PROPUESTA'
    clientName: string
    clientEmail: string
    mensaje?: string
  }) => Promise<void>
  loading: boolean
  error: string | null
  success: boolean
}

export function useClientResponse(): UseClientResponseReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const submitResponse = async (quotationId: string, data: any) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/quotations/${quotationId}/client-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const responseData = await response.json()
        throw new Error(responseData.error || 'Error al registrar respuesta')
      }

      setSuccess(true)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return { submitResponse, loading, error, success }
}
