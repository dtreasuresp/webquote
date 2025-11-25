/**
 * Funciones de cálculo para cotizaciones y precios
 */

// ==================== FECHAS ====================

/**
 * Calcula fecha de vencimiento: fechaEmision + tiempoValidez (días)
 */
export function calcularFechaVencimiento(
  fechaEmision: Date,
  dias: number
): Date {
  const vencimiento = new Date(fechaEmision)
  vencimiento.setDate(vencimiento.getDate() + dias)
  return vencimiento
}

/**
 * Calcula cantidad de días entre dos fechas
 */
export function calcularDias(fecha1: Date, fecha2: Date): number {
  const diferencia = Math.abs(fecha2.getTime() - fecha1.getTime())
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
}

/**
 * Calcula fecha futura a partir de hoy
 */
export function calcularFechaFutura(dias: number): Date {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dias)
  return fecha
}

/**
 * Calcula meses desde fecha hasta hoy
 */
export function calcularMesesDesde(fecha: Date): number {
  const hoy = new Date()
  const años = hoy.getFullYear() - fecha.getFullYear()
  const meses = hoy.getMonth() - fecha.getMonth()
  return años * 12 + meses
}

// ==================== PRECIOS ====================

/**
 * Calcula precio anual considerando meses gratis y precio mensual
 * Fórmula: precio * (mesesPago + mesesGratis)
 */
export function calcularPrecioAnual(
  precioMensual: number,
  mesesGratis: number = 0,
  mesesPago: number = 12
): number {
  return precioMensual * mesesPago
}

/**
 * Calcula precio con descuento
 */
export function calcularConDescuento(
  precio: number,
  porcentajeDescuento: number
): number {
  return precio * (1 - porcentajeDescuento / 100)
}

/**
 * Calcula porcentaje de descuento aplicado
 */
export function calcularPorcentajeDescuento(
  precioOriginal: number,
  precioDescuento: number
): number {
  if (precioOriginal === 0) return 0
  return ((precioOriginal - precioDescuento) / precioOriginal) * 100
}

/**
 * Suma múltiples precios
 */
export function sumarPrecios(precios: number[]): number {
  return precios.reduce((total, precio) => total + precio, 0)
}

/**
 * Calcula el promedio de precios
 */
export function promedioPrecios(precios: number[]): number {
  if (precios.length === 0) return 0
  return sumarPrecios(precios) / precios.length
}

/**
 * Calcula rango de precios (mín y máx)
 */
export function calcularRangoPrecios(precios: number[]): {
  minimo: number
  maximo: number
} {
  return {
    minimo: Math.min(...precios),
    maximo: Math.max(...precios),
  }
}

/**
 * Calcula precio total de múltiples items
 */
export function calcularPrecioTotal(
  items: Array<{ cantidad: number; precio: number }>
): number {
  return items.reduce((total, item) => total + item.cantidad * item.precio, 0)
}

/**
 * Calcula IVA (19% Colombia por defecto)
 */
export function calcularIVA(
  precio: number,
  porcentajeIVA: number = 19
): number {
  return precio * (porcentajeIVA / 100)
}

/**
 * Calcula precio final con IVA
 */
export function calcularPrecioConIVA(
  precio: number,
  porcentajeIVA: number = 19
): number {
  return precio + calcularIVA(precio, porcentajeIVA)
}

/**
 * Calcula incremente porcentual año a año
 */
export function calcularIncrementoAnual(
  precioYear1: number,
  precioYear2: number
): number {
  if (precioYear1 === 0) return 0
  return ((precioYear2 - precioYear1) / precioYear1) * 100
}

// ==================== SERVICIOS ====================

/**
 * Calcula inversión total por servicio (desarrollo + alojamiento + dominio)
 */
export function calcularInversionTotal(
  desarrollo: number,
  hosting: number,
  dominio: number,
  descuento: number = 0
): number {
  const total = desarrollo + hosting + dominio
  return calcularConDescuento(total, descuento)
}

/**
 * Calcula inversión inicial (pago único para desarrollo)
 */
export function calcularPagoInicial(desarrollo: number): number {
  return desarrollo
}

/**
 * Calcula inversión anual (hosting + dominio)
 */
export function calcularInversionAnual(
  hosting: number,
  dominio: number,
  descuento: number = 0
): number {
  const total = hosting + dominio
  return calcularConDescuento(total, descuento)
}

/**
 * Calcula cantidad de meses de servicio considerando meses gratis
 */
export function calcularMesesServicio(
  mesesGratis: number,
  mesesPago: number
): number {
  return mesesGratis + mesesPago
}

/**
 * Calcula ROI (Retorno de Inversión)
 */
export function calcularROI(
  ganancia: number,
  inversion: number
): number {
  if (inversion === 0) return 0
  return (ganancia / inversion) * 100
}

/**
 * Calcula amortización de inversión
 */
export function calcularAmortizacion(
  inversionTotal: number,
  mesesContratacion: number
): number {
  if (mesesContratacion === 0) return 0
  return inversionTotal / mesesContratacion
}

// ==================== SNAPSHOTS ====================

/**
 * Obtiene snapshots activos (no eliminados)
 */
export function obtenerSnapshotsActivos(snapshots: any[]): any[] {
  return snapshots.filter((snap) => !snap.eliminado && snap.activo !== false)
}

/**
 * Calcula el rango mínimo y máximo de un campo en snapshots
 */
export function calcularRangoSnapshots(
  snapshots: any[],
  campo: string
): { minimo: number; maximo: number } {
  const valores = snapshots
    .map((snap) => snap[campo])
    .filter((val) => typeof val === 'number')

  if (valores.length === 0) {
    return { minimo: 0, maximo: 0 }
  }

  return {
    minimo: Math.min(...valores),
    maximo: Math.max(...valores),
  }
}

/**
 * Agrupa snapshots por tipo de paquete
 */
export function agruparSnapshotsPorTipo(
  snapshots: any[]
): Record<string, any[]> {
  return snapshots.reduce(
    (acc, snap) => {
      const tipo = snap.paquete?.tipo || 'sin_tipo'
      if (!acc[tipo]) {
        acc[tipo] = []
      }
      acc[tipo].push(snap)
      return acc
    },
    {} as Record<string, any[]>
  )
}

/**
 * Obtiene estadísticas de snapshots
 */
export function obtenerEstadisticasSnapshots(snapshots: any[]) {
  const activos = obtenerSnapshotsActivos(snapshots)
  const total = snapshots.length
  const eliminados = total - activos.length

  return {
    total,
    activos: activos.length,
    eliminados,
    porcentajeActivos: total === 0 ? 0 : (activos.length / total) * 100,
  }
}

// ==================== PAQUETES ====================

/**
 * Calcula disponibilidad de paquete (vigencia)
 */
export function calcularVigenciaPaquete(
  fechaCreacion: Date,
  diasValidez: number
): {
  vigente: boolean
  diasRestantes: number
  fechaVencimiento: Date
} {
  const fechaVencimiento = new Date(fechaCreacion)
  fechaVencimiento.setDate(fechaVencimiento.getDate() + diasValidez)

  const hoy = new Date()
  const diasRestantes = calcularDias(hoy, fechaVencimiento)

  return {
    vigente: hoy <= fechaVencimiento,
    diasRestantes: Math.max(0, diasRestantes),
    fechaVencimiento,
  }
}

/**
 * Calcula estado de validez de una cotización
 */
export function obtenerEstadoValidez(diasRestantes: number): 'vigente' | 'proxima_vencer' | 'vencida' {
  if (diasRestantes > 7) return 'vigente'
  if (diasRestantes > 0) return 'proxima_vencer'
  return 'vencida'
}

/**
 * Calcula descuento progresivo por volumen
 */
export function calcularDescuentoPorVolumen(
  cantidad: number,
  precioUnitario: number
): {
  descuento: number
  precioFinal: number
} {
  let descuento = 0

  if (cantidad >= 100) descuento = 0.15 // 15%
  else if (cantidad >= 50) descuento = 0.1 // 10%
  else if (cantidad >= 20) descuento = 0.05 // 5%

  const precioFinal = precioUnitario * (1 - descuento) * cantidad

  return {
    descuento: descuento * 100,
    precioFinal,
  }
}
