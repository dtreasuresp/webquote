/**
 * Componente wrapper para validación de TABs
 * Proporciona validación en tiempo real y feedback visual
 * 
 * @phase Phase 11 - Validación Avanzada de TABs
 * @date 2025-11-24
 */

'use client'

import React from 'react'
import { CheckCircle2, XCircle, Info } from 'lucide-react'
import {
  validarConsistenciaFechas,
  validarConsistenciaCliente,
  validarConsistenciaProveedor,
  validarConsistenciaPrecios,
  type ValidationContext,
  type AdvancedValidationResult,
} from '../utils/advancedValidators'
import type { ValidationRule } from '../utils/validationRules'

// ==================== TIPOS ====================

export type TabType = 'cotizacion' | 'cliente' | 'proveedor' | 'presupuesto' | 'otros'

interface TabValidatorProps {
  tab: TabType
  context: ValidationContext
  onValidationChange?: (resultado: AdvancedValidationResult) => void
  mostrarErrores?: boolean
  mostrarAdvertencias?: boolean
}

interface ErrorFieldProps {
  campo: string
  errores: string[]
  advertencias?: string[]
}

// ==================== UTILIDADES ====================

/**
 * Obtiene el validador específico para cada TAB
 */
function obtenerValidadorTab(tab: TabType): (context: ValidationContext) => string[] {
  const validadores: Record<TabType, (context: ValidationContext) => string[]> = {
    cotizacion: validarConsistenciaFechas,
    cliente: validarConsistenciaCliente,
    proveedor: validarConsistenciaProveedor,
    presupuesto: validarConsistenciaPrecios,
    otros: () => [], // Sin validación especial
  }

  return validadores[tab]
}

/**
 * Obtiene el ícono según el estado de validación
 */
function obtenerIcono(esValido: boolean, tamaño = 16) {
  return esValido
    ? <CheckCircle2 size={tamaño} className="text-gh-success" />
    : <XCircle size={tamaño} className="text-gh-error" />
}

/**
 * Obtiene la clase CSS según el estado
 */
function obtenerClaseEstado(esValido: boolean, base = '') {
  return esValido
    ? `${base} border-gh-success/30 bg-gh-success/5`
    : `${base} border-gh-error/30 bg-gh-error/5`
}

// ==================== COMPONENTE PRINCIPAL ====================

/**
 * Hook para validar un TAB
 */
export function useTabValidation(tab: TabType, context: ValidationContext) {
  const [resultado, setResultado] = React.useState<AdvancedValidationResult | null>(null)
  const [loading, setLoading] = React.useState(false)

  const validar = React.useCallback(() => {
    setLoading(true)
    try {
      const validador = obtenerValidadorTab(tab)
      const errores = validador(context)

      setResultado({
        valido: errores.length === 0,
        errores,
        advertencias: [],
        erroresPorTab: { [tab]: errores },
        erroresPorCampo: {},
        dependenciasRotas: [],
      })
    } catch (error) {
      console.error(`Error validando TAB ${tab}:`, error)
    } finally {
      setLoading(false)
    }
  }, [tab, context])

  return {
    resultado,
    loading,
    validar,
    valido: resultado?.valido ?? true,
    errores: resultado?.errores ?? [],
  }
}

/**
 * Componente TabValidator
 * Envuelve un TAB y proporciona validación
 */
export const TabValidator: React.FC<{
  tab: TabType
  context: ValidationContext
  children: (validacion: { valido: boolean; errores: string[] }) => React.ReactNode
  onValidationChange?: (resultado: AdvancedValidationResult) => void
  validarAlMontarse?: boolean
}> = ({ tab, context, children, onValidationChange, validarAlMontarse = true }) => {
  const { resultado, valido, errores, validar } = useTabValidation(tab, context)

  React.useEffect(() => {
    if (validarAlMontarse) {
      validar()
    }
  }, [validarAlMontarse, validar])

  React.useEffect(() => {
    if (resultado && onValidationChange) {
      onValidationChange(resultado)
    }
  }, [resultado, onValidationChange])

  return (
    <div className={obtenerClaseEstado(valido, 'rounded-lg border p-4')}>
      {/* ENCABEZADO DEL TAB */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {obtenerIcono(valido, 18)}
          <span className="font-medium capitalize text-gh-text">{tab}</span>
        </div>
        {!valido && (
          <span className="text-xs px-2 py-1 rounded bg-gh-error/10 text-gh-error">
            {errores.length} error(es)
          </span>
        )}
      </div>

      {/* CONTENIDO */}
      <div>{children({ valido, errores })}</div>

      {/* LISTA DE ERRORES */}
      {!valido && errores.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gh-border/30 space-y-2">
          {errores.map((error) => (
            <div key={error} className="flex items-start gap-2 text-sm">
              <XCircle className="w-3.5 h-3.5 text-gh-error flex-shrink-0 mt-0.5" />
              <span className="text-gh-text-secondary">{error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== COMPONENTE DE FEEDBACK PARA CAMPO ====================

/**
 * Muestra errores y advertencias para un campo específico
 */
export const FieldValidationFeedback: React.FC<ErrorFieldProps> = ({
  campo,
  errores,
  advertencias = [],
}) => {
  const tieneErrores = errores.length > 0
  const tieneAdvertencias = advertencias.length > 0

  if (!tieneErrores && !tieneAdvertencias) {
    return null
  }

  return (
    <div className="mt-2 space-y-1">
      {/* ERRORES */}
      {tieneErrores && (
        <div className="space-y-1">
          {errores.map((error) => (
            <div key={error} className="flex items-start gap-2 text-sm">
              <XCircle className="w-3 h-3 text-gh-error flex-shrink-0 mt-1" />
              <span className="text-gh-error">{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* ADVERTENCIAS */}
      {tieneAdvertencias && (
        <div className="space-y-1">
          {advertencias.map((adv) => (
            <div key={adv} className="flex items-start gap-2 text-sm">
              <Info className="w-3 h-3 text-gh-warning flex-shrink-0 mt-1" />
              <span className="text-gh-warning">{adv}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== VALIDADOR DE INPUT ====================

interface ValidatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  advertencia?: string
  requerido?: boolean
  regla?: ValidationRule
}

/**
 * Input con validación integrada
 */
export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  error,
  advertencia,
  requerido = false,
  regla,
  className,
  value,
  onChange,
  ...props
}) => {
  const tieneError = !!error
  const tieneAdvertencia = !!advertencia && !tieneError

  const inputClass = `
    w-full px-3 py-2 rounded border transition
    ${tieneError ? 'border-gh-error/50 bg-gh-error/5 focus:border-gh-error' : ''}
    ${tieneAdvertencia ? 'border-gh-warning/50 bg-gh-warning/5 focus:border-gh-warning' : ''}
    ${!tieneError && !tieneAdvertencia ? 'border-gh-border hover:border-gh-border-hover focus:border-gh-primary' : ''}
    focus:outline-none
    ${className}
  `

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gh-text">
          {label}
          {requerido && <span className="text-gh-error ml-1">*</span>}
        </label>
      )}

      <input
        {...props}
        value={value}
        onChange={onChange}
        className={inputClass}
        aria-invalid={tieneError}
      />

      {/* FEEDBACK */}
      {tieneError && (
        <p className="text-xs text-gh-error flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          {error}
        </p>
      )}

      {tieneAdvertencia && (
        <p className="text-xs text-gh-warning flex items-center gap-1">
          <Info className="w-3 h-3" />
          {advertencia}
        </p>
      )}

      {regla && !tieneError && !tieneAdvertencia && (
        <p className="text-xs text-gh-text-secondary flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-gh-success" />
          {regla.descripcion}
        </p>
      )}
    </div>
  )
}

// ==================== STATUS BAR ====================

interface ValidationStatusBarProps {
  contexto: ValidationContext
  mostrarTabs?: TabType[]
}

/**
 * Barra de estado mostrando validación de todos los TABs
 */
export const ValidationStatusBar: React.FC<ValidationStatusBarProps> = ({
  contexto,
  mostrarTabs = ['cotizacion', 'cliente', 'proveedor', 'presupuesto'],
}) => {
  const [estadoTabs, setEstadoTabs] = React.useState<
    Record<TabType, { valido: boolean; errores: number }>
  >({
    cotizacion: { valido: true, errores: 0 },
    cliente: { valido: true, errores: 0 },
    proveedor: { valido: true, errores: 0 },
    presupuesto: { valido: true, errores: 0 },
    otros: { valido: true, errores: 0 },
  })

  React.useEffect(() => {
    // Validar cada TAB
    const nuevoEstado = { ...estadoTabs }

    mostrarTabs.forEach((tab) => {
      const validador = obtenerValidadorTab(tab)
      const errores = validador(contexto)
      nuevoEstado[tab] = {
        valido: errores.length === 0,
        errores: errores.length,
      }
    })

    setEstadoTabs(nuevoEstado)
  }, [contexto])

  const tabsConErrores = mostrarTabs.filter((tab) => !estadoTabs[tab]?.valido)
  const todosValidos = tabsConErrores.length === 0

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-gh-card border border-gh-border/30">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {todosValidos ? (
            <>
              <CheckCircle2 className="text-gh-success" />
              <span className="text-xs font-medium text-gh-text">Todos los TABs validados</span>
            </>
          ) : (
            <>
              <XCircle className="text-gh-error" />
              <span className="text-xs font-medium text-gh-text">
                {tabsConErrores.length} TAB(s) con errores
              </span>
            </>
          )}
        </div>
      </div>

      {/* CHIPS DE TABS */}
      <div className="flex items-center gap-2">
        {mostrarTabs.map((tab) => {
          const estado = estadoTabs[tab]
          return (
            <div
              key={tab}
              className={`
                flex items-center gap-1 px-2 py-1 rounded text-xs font-medium capitalize
                ${estado?.valido ? 'bg-gh-success/10 text-gh-success' : 'bg-gh-error/10 text-gh-error'}
              `}
            >
              {estado?.valido ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
              <span>{tab}</span>
              {!estado?.valido && <span>({estado?.errores})</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}


