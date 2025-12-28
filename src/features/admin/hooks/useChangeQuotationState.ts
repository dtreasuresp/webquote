'use client'

import { useState } from 'react'

export interface ExistingActiveQuotation {
  id: string
  numero: string
  emailCliente: string
  estado: string
  User?: {
    nombre?: string
    username?: string
  }
}

interface UseChangeQuotationStateReturn {
  changeState: (
    quotationId: string,
    newState: string,
    emailCliente?: string
  ) => Promise<{ success: boolean; existingQuotation?: ExistingActiveQuotation }>
  changeStateWithForce: (quotationId: string, newState: string) => Promise<void>
  loading: boolean
  error: string | null
  success: boolean
}

/**
 * Hook para cambiar el estado de una cotización
 * Con validación automática de "una cotización activa por cliente"
 * Retorna información de cotización existente si hay conflicto
 */
export function useChangeQuotationState(): UseChangeQuotationStateReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  /**
   * Cambia el estado y retorna si fue exitoso o si hay conflicto
   * Si newState es ACTIVA y el cliente ya tiene una ACTIVA, retorna los datos de la existente
   */
  const changeState = async (
    quotationId: string,
    newState: string,
    emailCliente?: string
  ): Promise<{ success: boolean; existingQuotation?: ExistingActiveQuotation }> => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Si es ACTIVA y tenemos email, verificar que no haya otra activa
      if (newState === 'ACTIVA' && emailCliente) {
        const checkResponse = await fetch(
          `/api/quotations/check-active?email=${encodeURIComponent(emailCliente)}&excludeId=${quotationId}`
        )

        if (checkResponse.ok) {
          const checkData = await checkResponse.json()
          if (checkData.exists && checkData.quotation) {
            // Hay una cotización activa existente para este cliente
            setError(null)
            setLoading(false)
            return {
              success: false,
              existingQuotation: checkData.quotation,
            }
          }
        }
      }

      // Proceder con el cambio de estado
      const response = await fetch(`/api/quotations/${quotationId}/state`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: newState }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al cambiar el estado')
      }

      setSuccess(true)
      setError(null)
      setLoading(false)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      setSuccess(false)
      setLoading(false)
      return { success: false }
    }
  }

  /**
   * Cambia el estado sin validación (fuerza el cambio incluso si hay conflicto)
   * Usado cuando usuario confirma reemplazar la cotización existente
   */
  const changeStateWithForce = async (quotationId: string, newState: string) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/quotations/${quotationId}/state`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          state: newState,
          force: true  // Indica al servidor que inactivar la anterior
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al cambiar el estado')
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

  return { changeState, changeStateWithForce, loading, error, success }
}
