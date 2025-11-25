/**
 * Utilidades para generar visualización de diffs entre snapshots
 * Formatea diferencias para visualización clara
 * 
 * @phase Phase 12 - Integración de Snapshots Mejorada
 * @date 2025-11-24
 */

import type { SnapshotDifference, SnapshotComparison } from './snapshotComparison'

// ==================== TIPOS ====================

export interface DiffLine {
  tipo: 'added' | 'removed' | 'modified' | 'unchanged'
  campo: string
  valorAntiguo: string
  valorNuevo: string
  icon: string
  color: string
}

export interface FormattedDiff {
  lineas: DiffLine[]
  resumenHtml: string
  resumenText: string
}

export interface DiffViewerConfig {
  mostrarSinCambios?: boolean
  maxLineas?: number
  formatoSalida?: 'html' | 'text' | 'json'
}

// ==================== FORMATTERS ====================

/**
 * Convierte un valor a string de forma legible
 */
function formatearValor(valor: any, truncate = true): string {
  if (valor === null || valor === undefined) {
    return '(vacío)'
  }

  if (typeof valor === 'boolean') {
    return valor ? 'Sí' : 'No'
  }

  if (typeof valor === 'number') {
    // Formatear números con separadores de miles
    if (Number.isInteger(valor)) {
      return valor.toLocaleString('es-ES')
    } else {
      return valor.toFixed(2).replace('.', ',')
    }
  }

  if (typeof valor === 'string') {
    return truncate && valor.length > 50 ? valor.substring(0, 50) + '...' : valor
  }

  if (Array.isArray(valor)) {
    return `[Array ${valor.length} items]`
  }

  if (typeof valor === 'object') {
    return '[Object]'
  }

  return String(valor)
}

/**
 * Obtiene el ícono según el tipo de cambio
 */
function obtenerIcono(tipo: 'added' | 'removed' | 'modified' | 'unchanged'): string {
  const iconos = {
    added: '✅',
    removed: '❌',
    modified: '📝',
    unchanged: '➡️',
  }
  return iconos[tipo]
}

/**
 * Obtiene color/clase Tailwind según tipo
 */
function obtenerColor(tipo: 'added' | 'removed' | 'modified' | 'unchanged'): string {
  const colores = {
    added: 'bg-gh-success/10 text-gh-success border-gh-success/30',
    removed: 'bg-gh-error/10 text-gh-error border-gh-error/30',
    modified: 'bg-gh-warning/10 text-gh-warning border-gh-warning/30',
    unchanged: 'bg-gh-bg-secondary text-gh-text-muted border-gh-border/30',
  }
  return colores[tipo]
}

/**
 * Formatea una diferencia como línea de diff
 */
export function formatearDifferenciaComoLinea(diff: SnapshotDifference): DiffLine {
  return {
    tipo: diff.tipo === 'added' ? 'added' : diff.tipo === 'removed' ? 'removed' : 'modified',
    campo: diff.field,
    valorAntiguo: formatearValor(diff.oldValue),
    valorNuevo: formatearValor(diff.newValue),
    icon: obtenerIcono(diff.tipo === 'added' ? 'added' : diff.tipo === 'removed' ? 'removed' : 'modified'),
    color: obtenerColor(diff.tipo === 'added' ? 'added' : diff.tipo === 'removed' ? 'removed' : 'modified'),
  }
}

/**
 * Genera un diff formateado a partir de una comparación
 */
export function generarDiffFormateado(
  comparison: SnapshotComparison,
  config: DiffViewerConfig = {}
): FormattedDiff {
  const {
    mostrarSinCambios = false,
    maxLineas = 100,
    formatoSalida = 'text',
  } = config

  let lineas: DiffLine[] = comparison.diferencias
    .map((diff) => formatearDifferenciaComoLinea(diff))
    .slice(0, maxLineas)

  // Generar resumen HTML
  let resumenHtml = '<div class="space-y-2">'
  resumenHtml += `<p class="font-semibold">Total: ${lineas.length} cambios</p>`

  if (comparison.resumen.críticos > 0) {
    resumenHtml += `<p class="text-gh-error">🔴 Críticos: ${comparison.resumen.críticos}</p>`
  }
  if (comparison.resumen.advertencias > 0) {
    resumenHtml += `<p class="text-gh-warning">🟡 Advertencias: ${comparison.resumen.advertencias}</p>`
  }
  if (comparison.resumen.info > 0) {
    resumenHtml += `<p class="text-gh-text-muted">🔵 Info: ${comparison.resumen.info}</p>`
  }

  resumenHtml += '</div>'

  // Generar resumen texto
  let resumenText = `Total: ${lineas.length} cambios\n`
  if (comparison.resumen.críticos > 0) {
    resumenText += `🔴 Críticos: ${comparison.resumen.críticos}\n`
  }
  if (comparison.resumen.advertencias > 0) {
    resumenText += `🟡 Advertencias: ${comparison.resumen.advertencias}\n`
  }
  if (comparison.resumen.info > 0) {
    resumenText += `🔵 Info: ${comparison.resumen.info}`
  }

  return {
    lineas,
    resumenHtml,
    resumenText,
  }
}

/**
 * Genera una tabla HTML de diferencias
 */
export function generarTablaHTML(
  comparison: SnapshotComparison,
  title = 'Comparación de Snapshots'
): string {
  const lineas = comparison.diferencias.map((diff) => formatearDifferenciaComoLinea(diff))

  let html = `
    <div class="diff-viewer">
      <h3 class="text-lg font-bold mb-4">${title}</h3>
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gh-bg-secondary">
            <th class="border border-gh-border p-2 text-left">Cambio</th>
            <th class="border border-gh-border p-2 text-left">Campo</th>
            <th class="border border-gh-border p-2 text-left">Valor Anterior</th>
            <th class="border border-gh-border p-2 text-left">Valor Nuevo</th>
          </tr>
        </thead>
        <tbody>
  `

  lineas.forEach((linea) => {
    html += `
      <tr class="${linea.color}">
        <td class="border border-gh-border p-2 text-center">${linea.icon}</td>
        <td class="border border-gh-border p-2 font-mono text-sm">${linea.campo}</td>
        <td class="border border-gh-border p-2"><code>${linea.valorAntiguo}</code></td>
        <td class="border border-gh-border p-2"><code>${linea.valorNuevo}</code></td>
      </tr>
    `
  })

  html += `
        </tbody>
      </table>
    </div>
  `

  return html
}

/**
 * Exporta diff como CSV
 */
export function exportarDiffCSV(comparison: SnapshotComparison, filename = 'snapshot-diff.csv'): void {
  let csv = 'Tipo,Campo,Valor Anterior,Valor Nuevo,Severidad\n'

  comparison.diferencias.forEach((diff) => {
    const tipo = diff.tipo.toUpperCase()
    const campo = diff.field
    const anterior = formatearValor(diff.oldValue).replace(/"/g, '""')
    const nuevo = formatearValor(diff.newValue).replace(/"/g, '""')
    const severidad = diff.severity

    csv += `"${tipo}","${campo}","${anterior}","${nuevo}","${severidad}"\n`
  })

  // Descargar archivo
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Exporta diff como JSON
 */
export function exportarDiffJSON(comparison: SnapshotComparison, filename = 'snapshot-diff.json'): void {
  const exportData = {
    timestamp: new Date().toISOString(),
    snapshot1: {
      id: comparison.snapshot1.id,
      nombre: comparison.snapshot1.nombre,
      createdAt: comparison.snapshot1.createdAt,
    },
    snapshot2: {
      id: comparison.snapshot2.id,
      nombre: comparison.snapshot2.nombre,
      createdAt: comparison.snapshot2.createdAt,
    },
    diferencias: comparison.diferencias.map((diff) => ({
      field: diff.field,
      oldValue: diff.oldValue,
      newValue: diff.newValue,
      tipo: diff.tipo,
      severity: diff.severity,
    })),
    resumen: comparison.resumen,
  }

  const json = JSON.stringify(exportData, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Genera un resumen de side-by-side
 */
export function generarComparacionSideBySide(
  comparison: SnapshotComparison
): {
  izquierda: Record<string, string>
  derecha: Record<string, string>
} {
  const izquierda: Record<string, string> = {}
  const derecha: Record<string, string> = {}

  comparison.diferencias.forEach((diff) => {
    izquierda[diff.field] = formatearValor(diff.oldValue)
    derecha[diff.field] = formatearValor(diff.newValue)
  })

  return { izquierda, derecha }
}

/**
 * Resalta campos con cambios críticos
 */
export function highlightCamposCríticos(comparison: SnapshotComparison): Set<string> {
  return new Set(
    comparison.diferencias
      .filter((d) => d.severity === 'critical')
      .map((d) => d.field)
  )
}

/**
 * Genera estadísticas de cambios por categoría
 */
export function generarEstadísticasCambios(comparison: SnapshotComparison): {
  por_tipo: Record<string, number>
  por_severidad: Record<string, number>
  campos_mas_modificados: Array<{ campo: string; veces: number }>
} {
  const por_tipo = {
    added: 0,
    removed: 0,
    modified: 0,
  }

  const por_severidad = {
    critical: 0,
    warning: 0,
    info: 0,
  }

  const frecuenciaCampos: Record<string, number> = {}

  comparison.diferencias.forEach((diff) => {
    // Por tipo
    if (diff.tipo in por_tipo) {
      por_tipo[diff.tipo as keyof typeof por_tipo]++
    }

    // Por severidad
    if (diff.severity in por_severidad) {
      por_severidad[diff.severity]++
    }

    // Frecuencia de campos
    frecuenciaCampos[diff.field] = (frecuenciaCampos[diff.field] || 0) + 1
  })

  const campos_mas_modificados = Object.entries(frecuenciaCampos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([campo, veces]) => ({ campo, veces }))

  return {
    por_tipo,
    por_severidad,
    campos_mas_modificados,
  }
}
