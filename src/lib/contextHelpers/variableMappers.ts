/**
 * Mapea un PackageSnapshot a variables nominadas con prefijo de paquete
 * Ejemplo: snapshot "Constructor" → variables constructorDesarrollo, constructorEmoji, etc
 */

import type { PackageSnapshot, ServicioBase } from '@/lib/types'
import { calcularPreviewDescuentos } from '@/lib/utils/discountCalculator'

export interface NormalizedPackageVariables {
  // Paquete base
  nombre: string
  desarrollo: number
  descuento: number
  tipo: string
  descripcion: string
  emoji: string
  tagline: string
  tiempoEntrega: string
  activo: boolean

  // Servicios base (array normalizado)
  serviciosBase: Array<{
    id: string
    nombre: string
    precio: number
    mesesGratis: number
    mesesPago: number
  }>

  // Servicios opcionales
  serviciosOpcionales: Array<{
    nombre: string
    precio: number
    mesesGratis: number
    mesesPago: number
  }>

  // Costos calculados
  costoInicial: number
  costoAño1: number
  costoAño2: number
}

/**
 * Convierte un snapshot a variables normalizadas
 */
export function normalizeSnapshot(snapshot: PackageSnapshot): NormalizedPackageVariables {
  const preview = calcularPreviewDescuentos(snapshot)
  // Usar descuentoDirectoAplicado del nuevo sistema, o calcular ahorro total
  const descuentoEfectivo = preview.descuentoDirectoAplicado > 0 ? preview.descuentoDirectoAplicado : Math.round(preview.porcentajeAhorro)
  
  return {
    nombre: snapshot.nombre,
    desarrollo: snapshot.paquete.desarrollo,
    descuento: descuentoEfectivo,
    tipo: snapshot.paquete.tipo || '',
    descripcion: snapshot.paquete.descripcion || '',
    emoji: snapshot.paquete.emoji || '📦',
    tagline: snapshot.paquete.tagline || '',
    tiempoEntrega: snapshot.paquete.tiempoEntrega || '',
    activo: snapshot.activo,

    serviciosBase: snapshot.serviciosBase.map(s => ({
      id: s.id,
      nombre: s.nombre,
      precio: s.precio,
      mesesGratis: s.mesesGratis,
      mesesPago: s.mesesPago,
    })),

    serviciosOpcionales: snapshot.otrosServicios,

    costoInicial: snapshot.costos.inicial,
    costoAño1: snapshot.costos.año1,
    costoAño2: snapshot.costos.año2,
  }
}

/**
 * Crea variables nominadas con prefijo de paquete
 * Ejemplo: constructor + "Desarrollo" → constructorDesarrollo
 */
export function createNominatedVariables(
  paqueteName: string,
  normalized: NormalizedPackageVariables
): Record<string, any> {
  const prefix = paqueteName.toLowerCase()

  const variables: Record<string, any> = {}

  // Variables de paquete base
  variables[`${prefix}Nombre`] = normalized.nombre
  variables[`${prefix}Desarrollo`] = normalized.desarrollo
  variables[`${prefix}Descuento`] = normalized.descuento
  variables[`${prefix}Tipo`] = normalized.tipo
  variables[`${prefix}Descripcion`] = normalized.descripcion
  variables[`${prefix}Emoji`] = normalized.emoji
  variables[`${prefix}Tagline`] = normalized.tagline
  variables[`${prefix}TiempoEntrega`] = normalized.tiempoEntrega
  variables[`${prefix}Activo`] = normalized.activo

  // Array de servicios base
  variables[`${prefix}ServiciosBase`] = normalized.serviciosBase

  // Variables individuales de servicios base por nombre
  normalized.serviciosBase.forEach(servicio => {
    const servicioSuffix = servicio.nombre.toLowerCase()
    variables[`${prefix}ServicioBase${servicio.nombre}Nombre`] = servicio.nombre
    variables[`${prefix}ServicioBase${servicio.nombre}Precio`] = servicio.precio
    variables[`${prefix}ServicioBase${servicio.nombre}MesesGratis`] = servicio.mesesGratis
    variables[`${prefix}ServicioBase${servicio.nombre}MesesPago`] = servicio.mesesPago
  })

  // Array de servicios opcionales
  variables[`${prefix}ServiciosOpcionales`] = normalized.serviciosOpcionales

  // Variables individuales de servicios opcionales
  normalized.serviciosOpcionales.forEach((servicio, index) => {
    const servicioName = servicio.nombre.replace(/\s+/g, '')
    variables[`${prefix}ServicioOpcional${servicioName}Nombre`] = servicio.nombre
    variables[`${prefix}ServicioOpcional${servicioName}Precio`] = servicio.precio
    variables[`${prefix}ServicioOpcional${servicioName}MesesGratis`] = servicio.mesesGratis
    variables[`${prefix}ServicioOpcional${servicioName}MesesPago`] = servicio.mesesPago
  })

  // Variables de costos
  variables[`${prefix}CostoInicial`] = normalized.costoInicial
  variables[`${prefix}CostoAño1`] = normalized.costoAño1
  variables[`${prefix}CostoAño2`] = normalized.costoAño2

  return variables
}

/**
 * Obtiene una variable específica por clave
 */
export function getVariable(
  nominatedVariables: Record<string, any>,
  key: string
): any {
  return nominatedVariables[key]
}

/**
 * Obtiene todas las variables de un paquete
 */
export function getAllVariables(
  paqueteName: string,
  snapshot: PackageSnapshot
): Record<string, any> {
  const normalized = normalizeSnapshot(snapshot)
  return createNominatedVariables(paqueteName, normalized)
}
