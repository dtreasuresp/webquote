/**
 * Utilidades para comparación de snapshots
 * Detecta diferencias entre versiones de paquetes
 * 
 * @phase Phase 12 - Integración de Snapshots Mejorada
 * @date 2025-11-24
 */

import type { PackageSnapshot } from '@/lib/types'

// ==================== TIPOS ====================

export interface SnapshotDifference {
  field: string
  oldValue: any
  newValue: any
  tipo: 'added' | 'removed' | 'modified'
  severity: 'critical' | 'warning' | 'info'
  ruta: string[] // Ruta al campo (ej: ['paquete', 'desarrollo'])
}

export interface SnapshotComparison {
  snapshot1: PackageSnapshot
  snapshot2: PackageSnapshot
  diferencias: SnapshotDifference[]
  resumen: {
    totalCambios: number
    críticos: number
    advertencias: number
    info: number
    porcentajeCambio: number
  }
  sonIdénticos: boolean
}

export interface SnapshotComparisonResult {
  iguales: boolean
  diferencias: SnapshotDifference[]
  resumen: string
}

// ==================== FUNCIONES PRINCIPALES ====================

/**
 * Compara dos snapshots y retorna diferencias detalladas
 */
export function compararSnapshots(
  snapshot1: PackageSnapshot,
  snapshot2: PackageSnapshot
): SnapshotComparison {
  const diferencias: SnapshotDifference[] = []

  // Comparar campos principales
  const camposComparar = [
    'nombre',
    'paquete.desarrollo',
    'paquete.descuento',
    'paquete.tipo',
    'paquete.descripcion',
    'costos.inicial',
    'costos.año1',
    'costos.año2',
  ]

  camposComparar.forEach((campo) => {
    const valor1 = obtenerValorAnidado(snapshot1, campo)
    const valor2 = obtenerValorAnidado(snapshot2, campo)

    if (valor1 !== valor2) {
      const ruta = campo.split('.')
      const severity = determinarSeveridad(campo, valor1, valor2)

      diferencias.push({
        field: campo,
        oldValue: valor1,
        newValue: valor2,
        tipo: valor1 === undefined ? 'added' : valor2 === undefined ? 'removed' : 'modified',
        severity,
        ruta,
      })
    }
  })

  // Comparar servicios base
  const difServiciosBase = compararArrays(
    snapshot1.serviciosBase,
    snapshot2.serviciosBase,
    'serviciosBase'
  )
  diferencias.push(...difServiciosBase)

  // Comparar otros servicios
  const difOtrosServicios = compararArrays(
    snapshot1.otrosServicios,
    snapshot2.otrosServicios,
    'otrosServicios'
  )
  diferencias.push(...difOtrosServicios)

  // Calcular resumen
  const críticos = diferencias.filter((d) => d.severity === 'critical').length
  const advertencias = diferencias.filter((d) => d.severity === 'warning').length
  const info = diferencias.filter((d) => d.severity === 'info').length

  // Calcular porcentaje de cambio (heurístico)
  const totalCampos = camposComparar.length + 5 // +5 por arrays
  const porcentajeCambio = Math.round((diferencias.length / totalCampos) * 100)

  return {
    snapshot1,
    snapshot2,
    diferencias,
    resumen: {
      totalCambios: diferencias.length,
      críticos,
      advertencias,
      info,
      porcentajeCambio,
    },
    sonIdénticos: diferencias.length === 0,
  }
}

/**
 * Obtiene valor anidado usando notación de punto
 * ej: "paquete.desarrollo"
 */
function obtenerValorAnidado(obj: any, ruta: string): any {
  const partes = ruta.split('.')
  let valor = obj

  for (const parte of partes) {
    if (valor && typeof valor === 'object') {
      valor = valor[parte]
    } else {
      return undefined
    }
  }

  return valor
}

/**
 * Compara arrays de objetos
 */
function compararArrays(
  array1: any[],
  array2: any[],
  nombreCampo: string
): SnapshotDifference[] {
  const diferencias: SnapshotDifference[] = []

  // Diferencia en cantidad
  if (array1.length !== array2.length) {
    diferencias.push({
      field: `${nombreCampo}.length`,
      oldValue: array1.length,
      newValue: array2.length,
      tipo: 'modified',
      severity: 'warning',
      ruta: [nombreCampo, 'length'],
    })
  }

  // Comparar elementos
  const maxLen = Math.max(array1.length, array2.length)
  for (let i = 0; i < maxLen; i++) {
    const item1 = array1[i]
    const item2 = array2[i]

    if (!item1 && item2) {
      diferencias.push({
        field: `${nombreCampo}[${i}]`,
        oldValue: undefined,
        newValue: item2,
        tipo: 'added',
        severity: 'info',
        ruta: [nombreCampo, `[${i}]`],
      })
    } else if (item1 && !item2) {
      diferencias.push({
        field: `${nombreCampo}[${i}]`,
        oldValue: item1,
        newValue: undefined,
        tipo: 'removed',
        severity: 'warning',
        ruta: [nombreCampo, `[${i}]`],
      })
    } else if (item1 && item2 && JSON.stringify(item1) !== JSON.stringify(item2)) {
      diferencias.push({
        field: `${nombreCampo}[${i}]`,
        oldValue: item1,
        newValue: item2,
        tipo: 'modified',
        severity: 'warning',
        ruta: [nombreCampo, `[${i}]`],
      })
    }
  }

  return diferencias
}

/**
 * Determina severidad del cambio
 */
function determinarSeveridad(campo: string, valor1: any, valor2: any): 'critical' | 'warning' | 'info' {
  // Campos críticos
  const críticos = ['paquete.desarrollo', 'costos.inicial', 'costos.año1']
  if (críticos.includes(campo)) return 'critical'

  // Cambios de números grandes
  if (typeof valor1 === 'number' && typeof valor2 === 'number') {
    const diferencia = Math.abs(valor1 - valor2)
    if (diferencia > 1000) return 'critical'
    if (diferencia > 100) return 'warning'
  }

  // Resto son información
  return 'info'
}

/**
 * Genera un resumen legible de las diferencias
 */
export function generarResumenDiferencias(comparison: SnapshotComparison): string {
  const { resumen } = comparison

  let mensaje = `Comparación entre snapshots:\n`
  mensaje += `Total de cambios: ${resumen.totalCambios}\n`

  if (resumen.críticos > 0) {
    mensaje += `🔴 Críticos: ${resumen.críticos}\n`
  }
  if (resumen.advertencias > 0) {
    mensaje += `🟡 Advertencias: ${resumen.advertencias}\n`
  }
  if (resumen.info > 0) {
    mensaje += `🔵 Info: ${resumen.info}\n`
  }

  mensaje += `Porcentaje de cambio: ${resumen.porcentajeCambio}%`

  return mensaje
}

/**
 * Detecta si hay cambios críticos que podrían afectar presupuesto
 */
export function hayChangesCríticos(comparison: SnapshotComparison): boolean {
  return comparison.resumen.críticos > 0
}

/**
 * Obtiene solo las diferencias críticas
 */
export function obtenerDiferenciasCríticas(comparison: SnapshotComparison): SnapshotDifference[] {
  return comparison.diferencias.filter((d) => d.severity === 'critical')
}

/**
 * Obtiene solo las diferencias de advertencia
 */
export function obtenerDiferenciasAdvertencia(comparison: SnapshotComparison): SnapshotDifference[] {
  return comparison.diferencias.filter((d) => d.severity === 'warning')
}

/**
 * Obtiene el campo que más cambió (para highlighting)
 */
export function obtenerCampoMayorCambio(comparison: SnapshotComparison): SnapshotDifference | null {
  if (comparison.diferencias.length === 0) return null

  // Priorizar críticos
  const crítico = comparison.diferencias.find((d) => d.severity === 'critical')
  if (crítico) return crítico

  // Luego advertencias
  const advertencia = comparison.diferencias.find((d) => d.severity === 'warning')
  if (advertencia) return advertencia

  // Finalmente info
  return comparison.diferencias[0] || null
}

/**
 * Valida si un rollback es seguro
 */
export function esRollbackSeguro(comparison: SnapshotComparison): {
  seguro: boolean
  razon: string
} {
  if (comparison.sonIdénticos) {
    return {
      seguro: false,
      razon: 'Los snapshots son idénticos, no hay cambios para revertir',
    }
  }

  if (hayChangesCríticos(comparison)) {
    const críticos = obtenerDiferenciasCríticas(comparison)
    return {
      seguro: false,
      razon: `Hay ${críticos.length} cambios críticos: ${críticos.map((c) => c.field).join(', ')}`,
    }
  }

  return {
    seguro: true,
    razon: 'El rollback es seguro de realizar',
  }
}

/**
 * Obtiene historial de cambios en formato timeline
 */
export function generarTimelineChanges(snapshots: PackageSnapshot[]): {
  fecha: string
  snapshot: PackageSnapshot
  cambio: string
}[] {
  return snapshots.map((snapshot, index) => {
    let cambio = 'Snapshot original'

    if (index > 0) {
      const prevSnapshot = snapshots[index - 1]
      const comparison = compararSnapshots(prevSnapshot, snapshot)
      cambio = generarResumenDiferencias(comparison)
    }

    return {
      fecha: new Date(snapshot.createdAt || new Date()).toLocaleDateString('es-ES'),
      snapshot,
      cambio,
    }
  })
}
