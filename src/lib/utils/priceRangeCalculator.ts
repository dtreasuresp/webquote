/**
 * Utilidades para calcular rangos de precios dinámicamente desde snapshots de paquetes
 */
import type { PackageSnapshot } from '@/lib/types'

/**
 * Formatea un rango de precios
 * Si min === max, retorna un solo valor
 * Si son diferentes, retorna el rango
 */
function formatPriceRange(min: number, max: number, suffix: string = ''): string {
  if (min === max) {
    return `$${min}${suffix}`
  }
  return `$${min} - $${max}${suffix}`
}

/**
 * Obtiene snapshots activos
 */
function getActiveSnapshots(snapshots: PackageSnapshot[]): PackageSnapshot[] {
  return snapshots.filter(s => s.activo)
}

/**
 * Calcula el rango de precios de desarrollo
 */
export function getDevelopmentRange(snapshots: PackageSnapshot[]): string {
  const active = getActiveSnapshots(snapshots)
  
  if (active.length === 0) return 'Por definir'
  
  const prices = active.map(s => s.paquete.desarrollo).filter(p => p > 0)
  
  if (prices.length === 0) return 'Por definir'
  
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  
  return formatPriceRange(min, max)
}

/**
 * Calcula el rango de precios de hosting anual
 * Considera meses gratis y meses de pago
 */
export function getHostingRange(snapshots: PackageSnapshot[]): string {
  const active = getActiveSnapshots(snapshots)
  
  if (active.length === 0) return 'Por definir'
  
  const prices = active
    .map(s => {
      const hosting = s.serviciosBase.find(srv => srv.nombre.toLowerCase() === 'hosting')
      if (!hosting || hosting.precio === 0) return null
      
      // Calcula el costo anual considerando meses de pago
      const mesesPago = hosting.mesesPago || 12
      return hosting.precio * mesesPago
    })
    .filter((p): p is number => p !== null && p > 0)
  
  if (prices.length === 0) return 'Por definir'
  
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  
  return formatPriceRange(min, max)
}

/**
 * Calcula el rango de precios de dominio anual
 */
export function getDomainRange(snapshots: PackageSnapshot[]): string {
  const active = getActiveSnapshots(snapshots)
  
  if (active.length === 0) return 'Por definir'
  
  const prices = active
    .map(s => {
      const dominio = s.serviciosBase.find(srv => srv.nombre.toLowerCase() === 'dominio')
      if (!dominio || dominio.precio === 0) return null
      
      const mesesPago = dominio.mesesPago || 12
      return dominio.precio * mesesPago
    })
    .filter((p): p is number => p !== null && p > 0)
  
  if (prices.length === 0) return 'Por definir'
  
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  
  return formatPriceRange(min, max)
}

/**
 * Calcula el rango de precios de mailbox anual
 */
export function getMailboxRange(snapshots: PackageSnapshot[]): string {
  const active = getActiveSnapshots(snapshots)
  
  if (active.length === 0) return 'Por definir'
  
  const prices = active
    .map(s => {
      const mailbox = s.serviciosBase.find(srv => srv.nombre.toLowerCase() === 'mailbox')
      if (!mailbox || mailbox.precio === 0) return null
      
      const mesesPago = mailbox.mesesPago || 12
      return mailbox.precio * mesesPago
    })
    .filter((p): p is number => p !== null && p > 0)
  
  if (prices.length === 0) return 'Por definir'
  
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  
  return formatPriceRange(min, max)
}

/**
 * Calcula el rango de precios de gestión mensual
 * NOTA: La sección de Gestión ha sido eliminada del proyecto
 * Esta función ahora retorna 'Por definir'
 */
export function getManagementRange(snapshots: PackageSnapshot[]): string {
  // Gestión ha sido eliminada del cálculo de rangos
  return 'Por definir'
}

/**
 * Obtiene el rango de inversión inicial (desarrollo + descuentos)
 */
export function getInitialInvestmentRange(snapshots: PackageSnapshot[]): string {
  const active = getActiveSnapshots(snapshots)
  
  if (active.length === 0) return 'Por definir'
  
  const prices = active
    .map(s => s.costos.inicial)
    .filter(p => p > 0)
  
  if (prices.length === 0) return 'Por definir'
  
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  
  return formatPriceRange(min, max)
}

/**
 * Calcula el rango de precios de otros servicios (servicios agregados)
 * Retorna información estructurada de cada servicio
 */
export function getOtherServicesInfo(snapshots: PackageSnapshot[]): Array<{
  nombre: string
  precioMin: number
  precioMax: number
}> {
  const active = getActiveSnapshots(snapshots)
  
  if (active.length === 0) return []
  
  // Recolectar todos los otros servicios únicos
  const serviciosMap = new Map<string, number[]>()
  
  for (const snapshot of active) {
    if (snapshot.otrosServicios && snapshot.otrosServicios.length > 0) {
      for (const servicio of snapshot.otrosServicios) {
        if (!serviciosMap.has(servicio.nombre)) {
          serviciosMap.set(servicio.nombre, [])
        }
        serviciosMap.get(servicio.nombre)!.push(servicio.precio || 0)
      }
    }
  }
  
  // Convertir a array de objetos con min/max
  return Array.from(serviciosMap.entries())
    .map(([nombre, precios]) => ({
      nombre,
      precioMin: Math.min(...precios),
      precioMax: Math.max(...precios),
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
}

/**
 * Retorna string formateado de otros servicios con rangos
 */
export function getOtherServicesRange(snapshots: PackageSnapshot[]): string {
  const servicios = getOtherServicesInfo(snapshots)
  
  if (servicios.length === 0) return 'Sin servicios adicionales'
  
  return servicios
    .map(s => {
      const rango = s.precioMin === s.precioMax 
        ? `$${s.precioMin}` 
        : `$${s.precioMin} - $${s.precioMax}`
      return `${s.nombre}: ${rango}`
    })
    .join(' | ')
}

/**
 * Obtiene información detallada de todos los paquetes activos
 * Incluye: nombre, desarrollo, servicios base, servicios opcionales
 * SIN asumir nombres específicos de servicios
 */
export interface PaqueteDesglose {
  id: string
  nombre: string
  emoji: string
  tagline: string
  tiempoEntrega: string
  desarrollo: number
  serviciosBase: Array<{
    nombre: string
    precio: number
    mesesGratis: number
    mesesPago: number
    costoAnual: number
  }>
  serviciosOpcionales: Array<{
    nombre: string
    precio: number
    mesesPago?: number
  }>
  costoInicial: number
  costoAnio1: number
}

export function getPaquetesDesglose(snapshots: PackageSnapshot[]): PaqueteDesglose[] {
  const active = getActiveSnapshots(snapshots)
  
  return active.map(snap => {
    const serviciosBase = snap.serviciosBase.map(srv => ({
      nombre: srv.nombre,
      precio: srv.precio,
      mesesGratis: srv.mesesGratis || 0,
      mesesPago: srv.mesesPago || 12,
      costoAnual: srv.precio * (srv.mesesPago || 12),
    }))
    
    const serviciosOpcionales = (snap.otrosServicios || []).map(srv => ({
      nombre: srv.nombre,
      precio: srv.precio || 0,
      mesesPago: srv.mesesPago || 12,
    }))
    
    return {
      id: snap.id,
      nombre: snap.nombre,
      emoji: snap.paquete.emoji || '📦',
      tagline: snap.paquete.tagline || '',
      tiempoEntrega: snap.paquete.tiempoEntrega || '',
      desarrollo: snap.paquete.desarrollo,
      serviciosBase,
      serviciosOpcionales,
      costoInicial: snap.costos.inicial,
      costoAnio1: snap.costos.año1,
    }
  })
}

/**
 * Obtiene todos los nombres únicos de servicios base de todos los paquetes
 */
export function getServiciosBaseUnicos(snapshots: PackageSnapshot[]): string[] {
  const active = getActiveSnapshots(snapshots)
  const nombres = new Set<string>()
  
  for (const snap of active) {
    for (const srv of snap.serviciosBase) {
      nombres.add(srv.nombre)
    }
  }
  
  return Array.from(nombres).sort((a, b) => a.localeCompare(b))
}

/**
 * Obtiene el rango de precios de un servicio base específico (por nombre dinámico)
 */
export function getServicioBaseRange(snapshots: PackageSnapshot[], nombreServicio: string): string {
  const active = getActiveSnapshots(snapshots)
  
  if (active.length === 0) return 'Por definir'
  
  const prices = active
    .map(s => {
      const servicio = s.serviciosBase.find(srv => srv.nombre.toLowerCase() === nombreServicio.toLowerCase())
      if (!servicio || servicio.precio === 0) return null
      return servicio.precio
    })
    .filter((p): p is number => p !== null && p > 0)
  
  if (prices.length === 0) return 'Por definir'
  
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  
  return formatPriceRange(min, max, '/mes')
}
