import { useState, useCallback } from 'react'
import {
  validarConfiguracionCompleta,
  type AdvancedValidationResult,
  type ValidationContext,
} from '../utils/advancedValidators'
import type { QuotationConfig, Servicio, Package } from '@/lib/types'

/**
 * Hook para manejar validación avanzada en AdminPage
 * Encapsula la lógica de validación y proporciona funciones para validar
 */
export const useAdvancedValidation = () => {
  const [validationResult, setValidationResult] = useState<AdvancedValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  /**
   * Ejecuta validación completa basada en el contexto actual
   */
  const validarTodo = useCallback(
    async (context: ValidationContext): Promise<AdvancedValidationResult> => {
      setIsValidating(true)
      try {
        const result = validarConfiguracionCompleta(context)
        setValidationResult(result)
        return result
      } finally {
        setIsValidating(false)
      }
    },
    []
  )

  /**
   * Valida si la configuración es válida para guardar
   */
  const esValidoParaGuardar = useCallback(
    (context: ValidationContext): boolean => {
      const result = validarConfiguracionCompleta(context)
      setValidationResult(result)
      return result.valido === true
    },
    []
  )

  /**
   * Limpia el resultado de validación
   */
  const limpiarValidacion = useCallback(() => {
    setValidationResult(null)
  }, [])

  /**
   * Obtiene el contexto de validación
   */
  const getValidationContext = (
    quotationConfig: QuotationConfig | null,
    packages: Package[],
    servicios: Servicio[]
  ): ValidationContext => ({
    config: quotationConfig || ({} as QuotationConfig),
    packages,
    servicios,
    forceStrict: false,
  })

  return {
    validationResult,
    isValidating,
    validarTodo,
    esValidoParaGuardar,
    limpiarValidacion,
    getValidationContext,
  }
}
