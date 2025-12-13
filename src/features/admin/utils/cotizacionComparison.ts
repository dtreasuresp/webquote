/**
 * Utilidades para comparación de cotizaciones
 * Detecta diferencias entre versiones de cotizaciones incluyendo sus paquetes
 * 
 * @phase Comparación de Cotizaciones
 * @date 2025-12-06
 */

import type { QuotationConfig, PackageSnapshot } from '@/lib/types'

// ==================== TIPOS ====================

export type DifferenceType = 'added' | 'removed' | 'modified' | 'unchanged'
export type SeverityLevel = 'critical' | 'warning' | 'info'

export interface FieldDifference {
  field: string
  label: string
  oldValue: unknown
  newValue: unknown
  type: DifferenceType
  severity: SeverityLevel
}

export interface PackageDifference {
  packageId: string
  packageName: string
  status: 'added' | 'removed' | 'modified' | 'unchanged'
  differences: FieldDifference[]
  oldSnapshot?: PackageSnapshot
  newSnapshot?: PackageSnapshot
}

export interface CotizacionComparisonResult {
  // Cotizaciones comparadas
  cotizacion1: QuotationConfig
  cotizacion2: QuotationConfig
  
  // Diferencias en metadata
  metadataDifferences: FieldDifference[]
  
  // Diferencias en paquetes
  packageDifferences: PackageDifference[]
  
  // Resumen
  summary: {
    totalChanges: number
    criticalChanges: number
    warningChanges: number
    infoChanges: number
    packagesAdded: number
    packagesRemoved: number
    packagesModified: number
    packagesUnchanged: number
    costVariation: {
      oldTotal: number
      newTotal: number
      difference: number
      percentageChange: number
    }
  }
  
  // Estado general
  areIdentical: boolean
}

// ==================== CONFIGURACIÓN ====================

// Campos de metadata a comparar
const METADATA_FIELDS: Array<{ field: keyof QuotationConfig; label: string; severity: SeverityLevel }> = [
  { field: 'empresa', label: 'Empresa', severity: 'info' },
  { field: 'profesional', label: 'Profesional', severity: 'info' },
  { field: 'sector', label: 'Sector', severity: 'info' },
  { field: 'ubicacion', label: 'Ubicación', severity: 'info' },
  { field: 'emailCliente', label: 'Email Cliente', severity: 'info' },
  { field: 'whatsappCliente', label: 'WhatsApp Cliente', severity: 'info' },
  { field: 'moneda', label: 'Moneda', severity: 'warning' },
  { field: 'presupuesto', label: 'Presupuesto', severity: 'warning' },
  { field: 'tiempoValidez', label: 'Tiempo Validez', severity: 'info' },
  { field: 'tiempoVigenciaValor', label: 'Vigencia Contrato', severity: 'warning' },
  { field: 'tiempoVigenciaUnidad', label: 'Unidad Vigencia', severity: 'info' },
  { field: 'isGlobal', label: 'Estado Activo', severity: 'critical' },
  { field: 'heroTituloMain', label: 'Título Principal', severity: 'info' },
  { field: 'heroTituloSub', label: 'Subtítulo', severity: 'info' },
]

// Campos de paquete a comparar
const PACKAGE_FIELDS: Array<{ field: string; label: string; severity: SeverityLevel; isNested?: boolean }> = [
  { field: 'nombre', label: 'Nombre', severity: 'warning' },
  { field: 'paquete.desarrollo', label: 'Desarrollo', severity: 'critical', isNested: true },
  { field: 'paquete.descuento', label: 'Descuento', severity: 'warning', isNested: true },
  { field: 'paquete.tipo', label: 'Tipo', severity: 'info', isNested: true },
  { field: 'paquete.descripcion', label: 'Descripción', severity: 'info', isNested: true },
  { field: 'costos.inicial', label: 'Costo Inicial', severity: 'critical', isNested: true },
  { field: 'costos.año1', label: 'Costo Año 1', severity: 'critical', isNested: true },
  { field: 'costos.año2', label: 'Costo Año 2+', severity: 'warning', isNested: true },
  { field: 'activo', label: 'Activo', severity: 'critical' },
]

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Obtiene un valor anidado de un objeto usando notación de punto
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined
  
  const keys = path.split('.')
  let current: unknown = obj
  
  for (const key of keys) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  
  return current
}

/**
 * Compara dos valores y determina si son diferentes
 */
function areValuesEqual(val1: unknown, val2: unknown): boolean {
  // Ambos undefined o null
  if (val1 == null && val2 == null) return true
  
  // Solo uno es null/undefined
  if (val1 == null || val2 == null) return false
  
  // Comparación de arrays
  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) return false
    return JSON.stringify(val1) === JSON.stringify(val2)
  }
  
  // Comparación de objetos
  if (typeof val1 === 'object' && typeof val2 === 'object') {
    return JSON.stringify(val1) === JSON.stringify(val2)
  }
  
  // Comparación primitiva
  return val1 === val2
}

/**
 * Formatea un valor para mostrar
 */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '(vacío)'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'number') return value.toLocaleString('es-CO')
  if (typeof value === 'string') return value || '(vacío)'
  if (Array.isArray(value)) return `${value.length} elementos`
  if (typeof value === 'object') return JSON.stringify(value).substring(0, 50) + '...'
  return String(value)
}

/**
 * Calcula el costo total de una cotización basado en sus paquetes
 */
function calcularCostoTotal(snapshots: PackageSnapshot[]): number {
  return snapshots
    .filter(s => s.activo)
    .reduce((sum, s) => sum + (s.costos?.año1 || 0), 0)
}

// ==================== FUNCIÓN PRINCIPAL ====================

/**
 * Compara dos cotizaciones y retorna diferencias detalladas
 */
export function compararCotizaciones(
  cotizacion1: QuotationConfig,
  cotizacion2: QuotationConfig,
  snapshots1: PackageSnapshot[],
  snapshots2: PackageSnapshot[]
): CotizacionComparisonResult {
  const metadataDifferences: FieldDifference[] = []
  const packageDifferences: PackageDifference[] = []
  
  // ==================== COMPARAR METADATA ====================
  for (const { field, label, severity } of METADATA_FIELDS) {
    const oldValue = cotizacion1[field]
    const newValue = cotizacion2[field]
    
    if (!areValuesEqual(oldValue, newValue)) {
      metadataDifferences.push({
        field,
        label,
        oldValue,
        newValue,
        type: 'modified',
        severity,
      })
    }
  }
  
  // ==================== COMPARAR PAQUETES ====================
  
  // Filtrar paquetes de cada cotización
  // Para la versión antigua (v1): incluir TODOS los paquetes del quotationConfigId
  // (aunque tengan activo=false, ya que fueron archivados al crear nueva versión)
  // Para la versión nueva (v2): incluir TODOS también para comparación justa
  // La clave es que cada cotización tiene sus propios snapshots por quotationConfigId
  const paquetes1 = snapshots1.filter(s => s.quotationConfigId === cotizacion1.id)
  const paquetes2 = snapshots2.filter(s => s.quotationConfigId === cotizacion2.id)
  
  // Crear mapas por nombre para facilitar comparación
  const map1 = new Map(paquetes1.map(p => [p.nombre.toLowerCase(), p]))
  const map2 = new Map(paquetes2.map(p => [p.nombre.toLowerCase(), p]))
  
  // Buscar paquetes modificados o eliminados
  for (const [nombreKey, snapshot1] of map1) {
    const snapshot2 = map2.get(nombreKey)
    
    if (!snapshot2) {
      // Paquete eliminado
      packageDifferences.push({
        packageId: snapshot1.id,
        packageName: snapshot1.nombre,
        status: 'removed',
        differences: [],
        oldSnapshot: snapshot1,
        newSnapshot: undefined,
      })
    } else {
      // Paquete existe en ambos - comparar campos
      const diffs = compararPaquetes(snapshot1, snapshot2)
      
      packageDifferences.push({
        packageId: snapshot1.id,
        packageName: snapshot1.nombre,
        status: diffs.length > 0 ? 'modified' : 'unchanged',
        differences: diffs,
        oldSnapshot: snapshot1,
        newSnapshot: snapshot2,
      })
    }
  }
  
  // Buscar paquetes agregados
  for (const [nombreKey, snapshot2] of map2) {
    if (!map1.has(nombreKey)) {
      packageDifferences.push({
        packageId: snapshot2.id,
        packageName: snapshot2.nombre,
        status: 'added',
        differences: [],
        oldSnapshot: undefined,
        newSnapshot: snapshot2,
      })
    }
  }
  
  // ==================== CALCULAR RESUMEN ====================
  
  const allFieldDiffs = [
    ...metadataDifferences,
    ...packageDifferences.flatMap(p => p.differences)
  ]
  
  const costoOld = calcularCostoTotal(paquetes1)
  const costoNew = calcularCostoTotal(paquetes2)
  const costDiff = costoNew - costoOld
  const costPercent = costoOld > 0 ? (costDiff / costoOld) * 100 : 0
  
  const summary = {
    totalChanges: allFieldDiffs.length + 
      packageDifferences.filter(p => p.status === 'added' || p.status === 'removed').length,
    criticalChanges: allFieldDiffs.filter(d => d.severity === 'critical').length,
    warningChanges: allFieldDiffs.filter(d => d.severity === 'warning').length,
    infoChanges: allFieldDiffs.filter(d => d.severity === 'info').length,
    packagesAdded: packageDifferences.filter(p => p.status === 'added').length,
    packagesRemoved: packageDifferences.filter(p => p.status === 'removed').length,
    packagesModified: packageDifferences.filter(p => p.status === 'modified').length,
    packagesUnchanged: packageDifferences.filter(p => p.status === 'unchanged').length,
    costVariation: {
      oldTotal: costoOld,
      newTotal: costoNew,
      difference: costDiff,
      percentageChange: Math.round(costPercent * 100) / 100,
    },
  }
  
  const areIdentical = summary.totalChanges === 0 && 
    summary.packagesAdded === 0 && 
    summary.packagesRemoved === 0
  
  return {
    cotizacion1,
    cotizacion2,
    metadataDifferences,
    packageDifferences,
    summary,
    areIdentical,
  }
}

/**
 * Compara dos paquetes (snapshots) y retorna las diferencias
 */
function compararPaquetes(snapshot1: PackageSnapshot, snapshot2: PackageSnapshot): FieldDifference[] {
  const differences: FieldDifference[] = []
  
  for (const { field, label, severity, isNested } of PACKAGE_FIELDS) {
    const oldValue = isNested ? getNestedValue(snapshot1, field) : (snapshot1 as unknown as Record<string, unknown>)[field]
    const newValue = isNested ? getNestedValue(snapshot2, field) : (snapshot2 as unknown as Record<string, unknown>)[field]
    
    if (!areValuesEqual(oldValue, newValue)) {
      differences.push({
        field,
        label,
        oldValue,
        newValue,
        type: 'modified',
        severity,
      })
    }
  }
  
  // Comparar cantidad de servicios base
  const serviciosBase1 = snapshot1.serviciosBase?.length || 0
  const serviciosBase2 = snapshot2.serviciosBase?.length || 0
  if (serviciosBase1 !== serviciosBase2) {
    differences.push({
      field: 'serviciosBase.length',
      label: 'Servicios Base',
      oldValue: serviciosBase1,
      newValue: serviciosBase2,
      type: 'modified',
      severity: 'warning',
    })
  }
  
  // Comparar cantidad de otros servicios
  const otrosServicios1 = snapshot1.otrosServicios?.length || 0
  const otrosServicios2 = snapshot2.otrosServicios?.length || 0
  if (otrosServicios1 !== otrosServicios2) {
    differences.push({
      field: 'otrosServicios.length',
      label: 'Servicios Opcionales',
      oldValue: otrosServicios1,
      newValue: otrosServicios2,
      type: 'modified',
      severity: 'info',
    })
  }
  
  return differences
}

// ==================== FUNCIONES DE EXPORTACIÓN ====================

/**
 * Exporta la comparación a formato CSV
 */
export function exportarComparacionCSV(result: CotizacionComparisonResult): void {
  const lines: string[] = []
  
  // Header
  lines.push(`Comparación: #${result.cotizacion1.numero} v.${result.cotizacion1.versionNumber} vs v.${result.cotizacion2.versionNumber}`)
  lines.push(`Fecha: ${new Date().toLocaleDateString('es-CO')}`)
  lines.push('')
  
  // Metadata
  lines.push('METADATA,Campo,Anterior,Actual')
  for (const diff of result.metadataDifferences) {
    lines.push(`,"${diff.label}","${formatValue(diff.oldValue)}","${formatValue(diff.newValue)}"`)
  }
  lines.push('')
  
  // Paquetes
  lines.push('PAQUETES,Nombre,Estado,Campo,Anterior,Actual')
  for (const pkg of result.packageDifferences) {
    if (pkg.status === 'added') {
      lines.push(`,"${pkg.packageName}",AGREGADO,,,`)
    } else if (pkg.status === 'removed') {
      lines.push(`,"${pkg.packageName}",ELIMINADO,,,`)
    } else if (pkg.status === 'modified') {
      for (const diff of pkg.differences) {
        lines.push(`,"${pkg.packageName}",MODIFICADO,"${diff.label}","${formatValue(diff.oldValue)}","${formatValue(diff.newValue)}"`)
      }
    }
  }
  lines.push('')
  
  // Resumen
  lines.push('RESUMEN')
  lines.push(`Total cambios,${result.summary.totalChanges}`)
  lines.push(`Cambios críticos,${result.summary.criticalChanges}`)
  lines.push(`Paquetes agregados,${result.summary.packagesAdded}`)
  lines.push(`Paquetes eliminados,${result.summary.packagesRemoved}`)
  lines.push(`Variación costo,${result.summary.costVariation.percentageChange}%`)
  
  // Descargar
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `comparacion-${result.cotizacion1.numero}-v${result.cotizacion1.versionNumber}-vs-v${result.cotizacion2.versionNumber}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Exporta la comparación a formato JSON
 */
export function exportarComparacionJSON(result: CotizacionComparisonResult): void {
  const exportData = {
    generatedAt: new Date().toISOString(),
    cotizacion: result.cotizacion1.numero,
    version1: result.cotizacion1.versionNumber,
    version2: result.cotizacion2.versionNumber,
    summary: result.summary,
    metadataChanges: result.metadataDifferences.map(d => ({
      field: d.label,
      from: d.oldValue,
      to: d.newValue,
      severity: d.severity,
    })),
    packageChanges: result.packageDifferences.map(p => ({
      name: p.packageName,
      status: p.status,
      changes: p.differences.map(d => ({
        field: d.label,
        from: d.oldValue,
        to: d.newValue,
        severity: d.severity,
      })),
    })),
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `comparacion-${result.cotizacion1.numero}-v${result.cotizacion1.versionNumber}-vs-v${result.cotizacion2.versionNumber}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Genera un resumen textual de la comparación
 */
export function generarResumenTexto(result: CotizacionComparisonResult): string {
  if (result.areIdentical) {
    return 'Las versiones son idénticas. No se detectaron cambios.'
  }
  
  const parts: string[] = []
  
  if (result.summary.totalChanges > 0) {
    parts.push(`${result.summary.totalChanges} cambio${result.summary.totalChanges !== 1 ? 's' : ''}`)
  }
  
  if (result.summary.packagesAdded > 0) {
    parts.push(`${result.summary.packagesAdded} paquete${result.summary.packagesAdded !== 1 ? 's' : ''} agregado${result.summary.packagesAdded !== 1 ? 's' : ''}`)
  }
  
  if (result.summary.packagesRemoved > 0) {
    parts.push(`${result.summary.packagesRemoved} paquete${result.summary.packagesRemoved !== 1 ? 's' : ''} eliminado${result.summary.packagesRemoved !== 1 ? 's' : ''}`)
  }
  
  if (result.summary.costVariation.difference !== 0) {
    const sign = result.summary.costVariation.difference > 0 ? '+' : ''
    parts.push(`${sign}$${result.summary.costVariation.difference.toLocaleString('es-CO')} (${sign}${result.summary.costVariation.percentageChange}%)`)
  }
  
  return parts.join(' | ')
}
