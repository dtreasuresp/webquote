'use client'

import { useEffect, useState } from 'react'
import type { QuotationConfig } from '@/lib/types'

export const useQuotationConfig = () => {
  const [cotizacion, setCotizacion] = useState<QuotationConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarCotizacion = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/quotation-config')
        
        if (response.status === 404) {
          setCotizacion(null)
          return
        }
        
        if (!response.ok) {
          throw new Error('Error al cargar cotización')
        }

        const data = await response.json()
        setCotizacion(data)
      } catch (err) {
        console.error('Error cargando cotización:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    cargarCotizacion()
  }, [])

  return { cotizacion, loading, error }
}
