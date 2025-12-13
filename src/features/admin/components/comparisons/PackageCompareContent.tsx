'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Info,
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowLeftRight
} from 'lucide-react'
import type { PackageSnapshot } from '@/lib/types'

// ============================================================================
// Tipos
// ============================================================================
interface PackageFieldDifference {
  field: string
  label: string
  oldValue: unknown
  newValue: unknown
  severity: 'info'  // Siempre INFO para comparación individual
}

interface ComparisonStats {
  total: number
  different: number
  identical: number
}

export interface PackageCompareContentProps {
  /** Primer paquete seleccionado para comparar */
  paquete1: PackageSnapshot
  /** Segundo paquete seleccionado para comparar */
  paquete2: PackageSnapshot
}

// ============================================================================
// Configuración de TODOS los campos para comparar (todos con severidad INFO)
// ============================================================================
const ALL_PACKAGE_FIELDS: Array<{ 
  field: string
  label: string
  category: string
  getValue: (s: PackageSnapshot) => unknown
}> = [
  // Información General
  { field: 'nombre', label: 'Nombre', category: 'General', getValue: (s) => s.nombre },
  { field: 'tipo', label: 'Tipo', category: 'General', getValue: (s) => s.paquete?.tipo },
  { field: 'activo', label: 'Estado Activo', category: 'General', getValue: (s) => s.activo },
  { field: 'emoji', label: 'Emoji', category: 'General', getValue: (s) => s.paquete?.emoji },
  { field: 'tagline', label: 'Tagline', category: 'General', getValue: (s) => s.paquete?.tagline },
  { field: 'descripcion', label: 'Descripción', category: 'General', getValue: (s) => s.paquete?.descripcion },
  { field: 'tiempoEntrega', label: 'Tiempo de Entrega', category: 'General', getValue: (s) => s.paquete?.tiempoEntrega },
  { field: 'cantidadPaginas', label: 'Cantidad de Páginas', category: 'General', getValue: (s) => s.paquete?.cantidadPaginas },
  
  // Desarrollo y Descuentos
  { field: 'desarrollo', label: 'Desarrollo ($)', category: 'Desarrollo', getValue: (s) => s.paquete?.desarrollo },
  { field: 'descuento', label: 'Descuento (%)', category: 'Desarrollo', getValue: (s) => s.paquete?.descuento },
  { field: 'tipoDescuento', label: 'Tipo de Descuento', category: 'Desarrollo', getValue: (s) => s.paquete?.configDescuentos?.tipoDescuento },
  { field: 'descuentoPagoUnico', label: 'Descuento Pago Único (%)', category: 'Desarrollo', getValue: (s) => s.paquete?.descuentoPagoUnico },
  
  // Costos Calculados
  { field: 'costoInicial', label: 'Costo Inicial ($)', category: 'Costos', getValue: (s) => s.costos?.inicial },
  { field: 'costoAño1', label: 'Costo Año 1 ($)', category: 'Costos', getValue: (s) => s.costos?.año1 },
  { field: 'costoAño2', label: 'Costo Año 2+ ($)', category: 'Costos', getValue: (s) => s.costos?.año2 },
  
  // Servicios
  { field: 'serviciosBaseCount', label: 'Servicios Base (cantidad)', category: 'Servicios', getValue: (s) => s.serviciosBase?.length || 0 },
  { field: 'serviciosBaseNombres', label: 'Servicios Base (nombres)', category: 'Servicios', getValue: (s) => s.serviciosBase?.map(sb => sb.nombre).sort((a, b) => a.localeCompare(b)).join(', ') || '(ninguno)' },
  { field: 'serviciosBaseTotalMensual', label: 'Servicios Base - Total Mensual', category: 'Servicios', getValue: (s) => s.serviciosBase?.reduce((sum, sb) => sum + (sb.precio || 0), 0) || 0 },
  { field: 'otrosServiciosCount', label: 'Otros Servicios (cantidad)', category: 'Servicios', getValue: (s) => s.otrosServicios?.length || 0 },
  { field: 'otrosServiciosNombres', label: 'Otros Servicios (nombres)', category: 'Servicios', getValue: (s) => s.otrosServicios?.map(os => os.nombre).sort((a, b) => a.localeCompare(b)).join(', ') || '(ninguno)' },
  
  // Opciones de Pago
  { field: 'opcionesPagoCount', label: 'Opciones de Pago (cantidad)', category: 'Pagos', getValue: (s) => s.paquete?.opcionesPago?.length || 0 },
  { field: 'tituloSeccionPago', label: 'Título Sección Pago', category: 'Pagos', getValue: (s) => s.paquete?.tituloSeccionPago },
  { field: 'subtituloSeccionPago', label: 'Subtítulo Sección Pago', category: 'Pagos', getValue: (s) => s.paquete?.subtituloSeccionPago },
  { field: 'metodosPreferidosCount', label: 'Métodos Preferidos (cantidad)', category: 'Pagos', getValue: (s) => s.paquete?.metodosPreferidos?.length || 0 },
  { field: 'notasPago', label: 'Notas de Pago', category: 'Pagos', getValue: (s) => s.paquete?.notasPago },
  
  // Contenido
  { field: 'featuresCount', label: 'Features (cantidad)', category: 'Contenido', getValue: (s) => s.contenido?.features?.length || 0 },
  { field: 'beneficiosCount', label: 'Beneficios (cantidad)', category: 'Contenido', getValue: (s) => s.contenido?.beneficios?.length || 0 },
  { field: 'incluidosCount', label: 'Incluidos (cantidad)', category: 'Contenido', getValue: (s) => s.contenido?.incluidos?.length || 0 },
  { field: 'exclusionesCount', label: 'Exclusiones (cantidad)', category: 'Contenido', getValue: (s) => s.contenido?.exclusiones?.length || 0 },
  { field: 'terminosCondiciones', label: 'Términos y Condiciones', category: 'Contenido', getValue: (s) => s.contenido?.terminosCondiciones ? 'Definido' : '(vacío)' },
  { field: 'informacionAdicional', label: 'Información Adicional', category: 'Contenido', getValue: (s) => s.contenido?.informacionAdicional ? 'Definido' : '(vacío)' },
  
  // Metadatos
  { field: 'createdAt', label: 'Fecha de Creación', category: 'Metadatos', getValue: (s) => s.createdAt ? new Date(s.createdAt).toLocaleDateString('es-ES') : '(vacío)' },
  { field: 'quotationConfigId', label: 'ID de Cotización', category: 'Metadatos', getValue: (s) => s.quotationConfigId || '(ninguno)' },
]

// ============================================================================
// Funciones auxiliares
// ============================================================================
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '(vacío)'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'number') return value.toLocaleString('es-CO')
  if (typeof value === 'string') return value || '(vacío)'
  if (Array.isArray(value)) return `${value.length} elementos`
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value).substring(0, 50) + '...'
  }
  // Para tipos primitivos restantes (symbol, bigint, function)
  return '(tipo desconocido)'
}

function areValuesEqual(val1: unknown, val2: unknown): boolean {
  if (val1 == null && val2 == null) return true
  if (val1 == null || val2 == null) return false
  if (Array.isArray(val1) && Array.isArray(val2)) {
    return JSON.stringify(val1) === JSON.stringify(val2)
  }
  if (typeof val1 === 'object' && typeof val2 === 'object') {
    return JSON.stringify(val1) === JSON.stringify(val2)
  }
  return val1 === val2
}

// ============================================================================
// Componente Principal
// ============================================================================
export function PackageCompareContent({
  paquete1,
  paquete2
}: Readonly<PackageCompareContentProps>) {
  // Estado para categorías expandidas y filtro
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['General', 'Desarrollo', 'Costos']))
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'diferentes' | 'iguales'>('diferentes')

  // ============================================================================
  // Lógica de comparación - Todos los campos con severidad INFO
  // ============================================================================
  const allDifferences = useMemo<PackageFieldDifference[]>(() => {
    const differences: PackageFieldDifference[] = []
    
    for (const fieldConfig of ALL_PACKAGE_FIELDS) {
      const val1 = fieldConfig.getValue(paquete1)
      const val2 = fieldConfig.getValue(paquete2)
      
      differences.push({
        field: fieldConfig.field,
        label: fieldConfig.label,
        oldValue: val1,
        newValue: val2,
        severity: 'info'  // Siempre INFO
      })
    }
    
    return differences
  }, [paquete1, paquete2])

  // Agrupar por categoría
  const differencesByCategory = useMemo(() => {
    const grouped: Record<string, { field: string; label: string; val1: unknown; val2: unknown; isDifferent: boolean }[]> = {}
    
    for (const fieldConfig of ALL_PACKAGE_FIELDS) {
      const val1 = fieldConfig.getValue(paquete1)
      const val2 = fieldConfig.getValue(paquete2)
      const isDifferent = !areValuesEqual(val1, val2)
      
      if (!grouped[fieldConfig.category]) {
        grouped[fieldConfig.category] = []
      }
      
      grouped[fieldConfig.category].push({
        field: fieldConfig.field,
        label: fieldConfig.label,
        val1,
        val2,
        isDifferent
      })
    }
    
    return grouped
  }, [paquete1, paquete2])

  // Estadísticas
  const stats = useMemo<ComparisonStats>(() => {
    const different = allDifferences.filter(d => !areValuesEqual(d.oldValue, d.newValue)).length
    return {
      total: allDifferences.length,
      different,
      identical: allDifferences.length - different,
    }
  }, [allDifferences])

  // Categorías ordenadas
  const orderedCategories = ['General', 'Desarrollo', 'Costos', 'Gestión', 'Servicios', 'Pagos', 'Contenido', 'Metadatos']

  // ============================================================================
  // Handlers
  // ============================================================================
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  const expandAll = () => {
    setExpandedCategories(new Set(orderedCategories))
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  // ============================================================================
  // Export CSV
  // ============================================================================
  const exportarCSV = () => {
    const lines = [
      'COMPARACIÓN INDIVIDUAL DE PAQUETES',
      `"${paquete1.nombre}" vs "${paquete2.nombre}"`,
      '',
      'Categoría,Campo,Paquete 1,Paquete 2,¿Diferente?',
    ]

    for (const category of orderedCategories) {
      const fields = differencesByCategory[category] || []
      for (const f of fields) {
        lines.push(`"${category}","${f.label}","${formatValue(f.val1)}","${formatValue(f.val2)}","${f.isDifferent ? 'Sí' : 'No'}"`)
      }
    }

    lines.push(
      '', 
      'RESUMEN',
      `Total campos comparados,${stats.total}`,
      `Campos diferentes,${stats.different}`,
      `Campos idénticos,${stats.identical}`
    )

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `comparacion-${paquete1.nombre.replaceAll(' ', '_')}-vs-${paquete2.nombre.replaceAll(' ', '_')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // ============================================================================
  // Export JSON
  // ============================================================================
  const exportarJSON = () => {
    const data = {
      titulo: 'Comparación Individual de Paquetes',
      paquete1: {
        nombre: paquete1.nombre,
        id: paquete1.id,
        fechaCreacion: paquete1.createdAt
      },
      paquete2: {
        nombre: paquete2.nombre,
        id: paquete2.id,
        fechaCreacion: paquete2.createdAt
      },
      resumen: stats,
      comparacion: differencesByCategory,
      exportadoEn: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `comparacion-${paquete1.nombre.replaceAll(' ', '_')}-vs-${paquete2.nombre.replaceAll(' ', '_')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const areAllIdentical = stats.different === 0

  // ============================================================================
  // Renderizado
  // ============================================================================
  return (
    <div className="flex flex-col h-full">
      {/* HEADER CON PAQUETES */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-gh-border">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-xs text-gh-text-muted">Paquete 1</p>
            <p className="text-sm font-bold text-gh-text">{paquete1.nombre}</p>
            <p className="text-[10px] text-gh-text-muted">{new Date(paquete1.createdAt).toLocaleDateString('es-ES')}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20">
            <ArrowLeftRight className="text-purple-400" />
          </div>
          <div className="text-center">
            <p className="text-xs text-gh-text-muted">Paquete 2</p>
            <p className="text-sm font-bold text-gh-text">{paquete2.nombre}</p>
            <p className="text-[10px] text-gh-text-muted">{new Date(paquete2.createdAt).toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="px-4 py-3 bg-gh-bg-secondary/50 border-b border-gh-border">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gh-text-muted">Total campos:</span>
              <span className="text-sm font-bold text-gh-text">{stats.total}</span>
            </div>
            <div className="h-4 w-px bg-gh-border" />
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs">
                <Info className="text-gh-accent-blue w-2.5 h-2.5" />
                <span className="text-gh-accent-blue font-medium">{stats.different} diferentes</span>
              </span>
              <span className="flex items-center gap-1 text-xs">
                <CheckCircle2 className="text-gh-text-muted w-2.5 h-2.5" />
                <span className="text-gh-text-muted font-medium">{stats.identical} iguales</span>
              </span>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filtros */}
            <div className="flex items-center gap-1">
              {(['diferentes', 'todos', 'iguales'] as const).map((tipo) => {
                const labelMap = { diferentes: 'Diferentes', todos: 'Todos', iguales: 'Iguales' }
                return (
                  <button
                    key={tipo}
                    onClick={() => setFiltroTipo(tipo)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      filtroTipo === tipo
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                        : 'bg-gh-bg text-gh-text-muted hover:text-gh-text border border-gh-border'
                    }`}
                  >
                    {labelMap[tipo]}
                  </button>
                )
              })}
            </div>

            {/* Expandir/Colapsar */}
            <div className="flex items-center gap-1">
              <button
                onClick={expandAll}
                className="px-2 py-1 text-xs font-medium rounded-md bg-gh-bg text-gh-text-muted hover:text-gh-text border border-gh-border transition-colors"
              >
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={collapseAll}
                className="px-2 py-1 text-xs font-medium rounded-md bg-gh-bg text-gh-text-muted hover:text-gh-text border border-gh-border transition-colors"
              >
                <ChevronUp className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Export */}
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportarCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-bg hover:bg-gh-border text-gh-text-muted hover:text-gh-text text-xs font-medium rounded-md border border-gh-border transition-colors"
              >
                <Download className="w-2.5 h-2.5" /> CSV
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportarJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-bg hover:bg-gh-border text-gh-text-muted hover:text-gh-text text-xs font-medium rounded-md border border-gh-border transition-colors"
              >
                <Download className="w-2.5 h-2.5" /> JSON
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">
        {areAllIdentical ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-gh-success/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="text-gh-success text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-gh-text mb-2">¡Paquetes idénticos!</h3>
            <p className="text-xs font-medium text-gh-text-muted text-center max-w-md">
              No hay diferencias entre &ldquo;{paquete1.nombre}&rdquo; y &ldquo;{paquete2.nombre}&rdquo;.
              Todos los {stats.total} campos comparados son iguales.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {orderedCategories.map((category, index) => {
              const fields = differencesByCategory[category] || []
              if (fields.length === 0) return null

              // Filtrar según tipo
              let filteredFields = fields
              if (filtroTipo === 'diferentes') {
                filteredFields = fields.filter(f => f.isDifferent)
              } else if (filtroTipo === 'iguales') {
                filteredFields = fields.filter(f => !f.isDifferent)
              }

              if (filteredFields.length === 0) return null

              const differentCount = fields.filter(f => f.isDifferent).length
              const isExpanded = expandedCategories.has(category)

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gh-border/30 rounded-lg overflow-hidden bg-gh-bg-secondary/30"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gh-bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-semibold text-gh-text">{category}</h4>
                      {differentCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-400">
                          {differentCount} {differentCount === 1 ? 'diferencia' : 'diferencias'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gh-text-muted">{fields.length} campos</span>
                      {isExpanded ? (
                        <ChevronUp className="text-gh-text-muted w-3 h-3" />
                      ) : (
                        <ChevronDown className="text-gh-text-muted w-3 h-3" />
                      )}
                    </div>
                  </button>

                  {/* Category Details (expanded) */}
                  {isExpanded && (
                    <div className="border-t border-gh-border bg-gh-bg">
                      <div className="p-4">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-gh-border">
                              <th className="text-left py-2 px-3 text-gh-text-muted font-semibold w-1/4">Campo</th>
                              <th className="text-left py-2 px-3 text-gh-text-muted font-semibold w-5/16">{paquete1.nombre}</th>
                              <th className="text-left py-2 px-3 text-gh-text-muted font-semibold w-5/16">{paquete2.nombre}</th>
                              <th className="text-center py-2 px-3 text-gh-text-muted font-semibold w-1/8">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredFields.map((field) => (
                              <tr 
                                key={field.field} 
                                className={`border-b border-gh-border/50 ${
                                  field.isDifferent ? 'bg-purple-500/5' : 'hover:bg-gh-bg-secondary/30'
                                }`}
                              >
                                <td className="py-2 px-3 text-gh-text font-medium">{field.label}</td>
                                <td className={`py-2 px-3 font-mono ${field.isDifferent ? 'text-gh-error' : 'text-gh-text-muted'}`}>
                                  {formatValue(field.val1)}
                                </td>
                                <td className={`py-2 px-3 font-mono ${field.isDifferent ? 'text-gh-success' : 'text-gh-text-muted'}`}>
                                  {formatValue(field.val2)}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    field.isDifferent 
                                      ? 'text-gh-accent-blue bg-gh-accent-blue/10' 
                                      : 'text-gh-text-muted bg-gh-bg-secondary'
                                  }`}>
                                    {field.isDifferent ? 'INFO' : '='}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* FOOTER INFO */}
      <div className="px-4 py-3 bg-gh-bg-secondary/30 border-t border-gh-border">
        <p className="text-xs text-gh-text-muted text-center">
          Comparando {stats.total} campos entre &ldquo;{paquete1.nombre}&rdquo; y &ldquo;{paquete2.nombre}&rdquo; • {stats.different} {stats.different === 1 ? 'diferencia encontrada' : 'diferencias encontradas'}
        </p>
      </div>
    </div>
  )
}

export default PackageCompareContent


