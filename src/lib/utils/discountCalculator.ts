import type { PackageSnapshot, ConfigDescuentos } from '@/lib/types'

export interface CostoPreview {
  desarrollo: number
  desarrolloConDescuento: number
  serviciosBase: {
    total: number
    conDescuento: number
    desglose: Array<{ id: string; nombre: string; original: number; conDescuento: number; descuentoAplicado: number }>
  }
  otrosServicios: {
    total: number
    conDescuento: number
    desglose: Array<{ id: string; nombre: string; original: number; conDescuento: number; descuentoAplicado: number }>
  }
  // Subtotales antes del descuento directo
  subtotalOriginal: number
  subtotalConDescuentos: number
  // Descuentos individuales aplicados
  descuentoDirectoAplicado: number
  descuentoPagoUnico: number
  descuentoGeneral?: { porcentaje: number; aplicarA: { desarrollo: boolean; serviciosBase: boolean; otrosServicios: boolean } }
  // Totales finales
  totalOriginal: number
  totalConDescuentos: number
  totalAhorro: number
  porcentajeAhorro: number
  // Info del tipo de descuento aplicado
  tipoDescuentoAplicado: 'ninguno' | 'granular' | 'general'
}

/**
 * Valores por defecto para ConfigDescuentos
 */
export function getDefaultConfigDescuentos(): ConfigDescuentos {
  return {
    tipoDescuento: 'ninguno',
    descuentoGeneral: {
      porcentaje: 0,
      aplicarA: {
        desarrollo: false,
        serviciosBase: false,
        otrosServicios: false,
      },
    },
    descuentosGranulares: {
      desarrollo: 0,
      serviciosBase: {},
      otrosServicios: {},
    },
    descuentoPagoUnico: 0,
    descuentoDirecto: 0,
  }
}

/**
 * Migra la configuración legacy al nuevo formato
 * Sobrecarga: acepta snapshot completo o parámetros directos
 */
export function migrarConfigDescuentosLegacy(
  snapshotOrGeneral?: PackageSnapshot | any,
  legacyGranularOrUndefined?: any,
  descuentoPagoUnico?: number
): ConfigDescuentos {
  const config = getDefaultConfigDescuentos()
  
  // Detectar si es un snapshot completo o parámetros directos
  let legacyGeneral: any
  let legacyGranular: any
  let pagoUnico = 0
  let descuentoDirecto = 0
  
  if (snapshotOrGeneral?.paquete) {
    // Es un PackageSnapshot
    const snapshot = snapshotOrGeneral as PackageSnapshot
    
    // Si ya tiene el nuevo formato, usarlo
    if (snapshot.paquete.configDescuentos) {
      return {
        ...config,
        ...snapshot.paquete.configDescuentos,
      }
    }
    
    legacyGeneral = snapshot.paquete.descuentosGenerales
    legacyGranular = snapshot.paquete.descuentosPorServicio
    pagoUnico = snapshot.paquete.descuentoPagoUnico || 0
    descuentoDirecto = snapshot.paquete.descuento || 0
  } else {
    // Son parámetros directos (descuentosGenerales, descuentosPorServicio, descuentoPagoUnico)
    legacyGeneral = snapshotOrGeneral
    legacyGranular = legacyGranularOrUndefined
    pagoUnico = descuentoPagoUnico || 0
  }
  
  // Determinar tipo basado en qué estaba activo
  const tieneGranular = legacyGranular?.aplicarAServiciosBase || legacyGranular?.aplicarAOtrosServicios
  const tieneGeneral = legacyGeneral?.aplicarAlDesarrollo || legacyGeneral?.aplicarAServiciosBase || legacyGeneral?.aplicarAOtrosServicios
  
  if (tieneGranular) {
    config.tipoDescuento = 'granular'
    // Migrar serviciosBase de array a mapa
    const serviciosBaseMap: { [id: string]: number } = {}
    if (legacyGranular?.serviciosBase) {
      for (const s of legacyGranular.serviciosBase) {
        if (s.aplicarDescuento) {
          serviciosBaseMap[s.servicioId] = s.porcentajeDescuento
        }
      }
    }
    const otrosServiciosMap: { [id: string]: number } = {}
    if (legacyGranular?.otrosServicios) {
      for (const s of legacyGranular.otrosServicios) {
        if (s.aplicarDescuento) {
          otrosServiciosMap[s.servicioId] = s.porcentajeDescuento
        }
      }
    }
    config.descuentosGranulares = {
      desarrollo: 0,
      serviciosBase: serviciosBaseMap,
      otrosServicios: otrosServiciosMap,
    }
  } else if (tieneGeneral) {
    config.tipoDescuento = 'general'
    config.descuentoGeneral = {
      porcentaje: legacyGeneral?.porcentaje || 0,
      aplicarA: {
        desarrollo: legacyGeneral?.aplicarAlDesarrollo || false,
        serviciosBase: legacyGeneral?.aplicarAServiciosBase || false,
        otrosServicios: legacyGeneral?.aplicarAOtrosServicios || false,
      },
    }
  }
  
  // Migrar descuentos finales
  config.descuentoPagoUnico = pagoUnico
  config.descuentoDirecto = descuentoDirecto
  
  return config
}

/**
 * Aplica un porcentaje de descuento a un precio
 */
function aplicarPorcentaje(precio: number, porcentaje: number): number {
  return Math.max(0, precio - (precio * porcentaje) / 100)
}

/**
 * Calcula la vista previa completa de montos con el nuevo sistema de descuentos
 * 
 * ORDEN DE APLICACIÓN:
 * 1. Calcular subtotales (desarrollo, servicios base, otros servicios)
 * 2. Si tipo === 'granular' → aplicar descuentos por servicio individual (usando mapas)
 * 3. Si tipo === 'general' → aplicar % general a categorías marcadas
 * 4. Aplicar descuentoPagoUnico al desarrollo (si aplica)
 * 5. Sumar subtotales con descuentos → Total Intermedio
 * 6. Aplicar descuentoDirecto al Total Final
 */
export function calcularPreviewDescuentos(snapshot: PackageSnapshot): CostoPreview {
  const config = snapshot.paquete.configDescuentos || migrarConfigDescuentosLegacy(snapshot)
  const desarrollo = snapshot.paquete.desarrollo || 0
  
  // === DESARROLLO ===
  let desarrolloConDescuento = desarrollo
  
  // Aplicar descuento granular al desarrollo (si corresponde)
  if (config.tipoDescuento === 'granular' && config.descuentosGranulares.desarrollo > 0) {
    desarrolloConDescuento = aplicarPorcentaje(desarrollo, config.descuentosGranulares.desarrollo)
  }
  // Aplicar descuento general al desarrollo (si corresponde)
  else if (config.tipoDescuento === 'general' && config.descuentoGeneral.aplicarA.desarrollo) {
    desarrolloConDescuento = aplicarPorcentaje(desarrollo, config.descuentoGeneral.porcentaje)
  }
  
  // Aplicar descuento por pago único al desarrollo
  if (config.descuentoPagoUnico > 0) {
    desarrolloConDescuento = aplicarPorcentaje(desarrolloConDescuento, config.descuentoPagoUnico)
  }
  
  // === SERVICIOS BASE ===
  const serviciosBaseDesglose = snapshot.serviciosBase.map(servicio => {
    let precioConDescuento = servicio.precio
    let descuentoAplicado = 0
    
    if (config.tipoDescuento === 'granular') {
      // Buscar descuento granular para este servicio en el mapa
      const porcentajeGranular = config.descuentosGranulares.serviciosBase[servicio.id] || 0
      if (porcentajeGranular > 0) {
        descuentoAplicado = porcentajeGranular
        precioConDescuento = aplicarPorcentaje(servicio.precio, descuentoAplicado)
      }
    } else if (config.tipoDescuento === 'general' && config.descuentoGeneral.aplicarA.serviciosBase) {
      // Aplicar descuento general
      descuentoAplicado = config.descuentoGeneral.porcentaje
      precioConDescuento = aplicarPorcentaje(servicio.precio, descuentoAplicado)
    }
    
    return {
      id: servicio.id,
      nombre: servicio.nombre,
      original: servicio.precio,
      conDescuento: precioConDescuento,
      descuentoAplicado,
    }
  })
  
  const serviciosBaseTotal = snapshot.serviciosBase.reduce((sum, s) => sum + s.precio, 0)
  const serviciosBaseConDescuento = serviciosBaseDesglose.reduce((sum, s) => sum + s.conDescuento, 0)
  
  // === OTROS SERVICIOS ===
  const otrosServiciosDesglose = snapshot.otrosServicios.map((servicio, idx) => {
    let precioConDescuento = servicio.precio
    let descuentoAplicado = 0
    const servicioKey = servicio.id || `otro-${idx}`
    
    if (config.tipoDescuento === 'granular') {
      // Buscar descuento granular para este servicio en el mapa
      const porcentajeGranular = config.descuentosGranulares.otrosServicios[servicioKey] || 0
      if (porcentajeGranular > 0) {
        descuentoAplicado = porcentajeGranular
        precioConDescuento = aplicarPorcentaje(servicio.precio, descuentoAplicado)
      }
    } else if (config.tipoDescuento === 'general' && config.descuentoGeneral.aplicarA.otrosServicios) {
      // Aplicar descuento general
      descuentoAplicado = config.descuentoGeneral.porcentaje
      precioConDescuento = aplicarPorcentaje(servicio.precio, descuentoAplicado)
    }
    
    return {
      id: servicioKey,
      nombre: servicio.nombre,
      original: servicio.precio,
      conDescuento: precioConDescuento,
      descuentoAplicado,
    }
  })
  
  const otrosServiciosTotal = snapshot.otrosServicios.reduce((sum, s) => sum + s.precio, 0)
  const otrosServiciosConDescuento = otrosServiciosDesglose.reduce((sum, s) => sum + s.conDescuento, 0)
  
  // === SUBTOTALES (antes del descuento directo) ===
  const subtotalOriginal = desarrollo + serviciosBaseTotal + otrosServiciosTotal
  const subtotalConDescuentos = desarrolloConDescuento + serviciosBaseConDescuento + otrosServiciosConDescuento
  
  // === DESCUENTO DIRECTO (aplicado al total final) ===
  const descuentoDirectoAplicado = config.descuentoDirecto
  const totalConDescuentos = aplicarPorcentaje(subtotalConDescuentos, descuentoDirectoAplicado)
  
  // === TOTALES FINALES ===
  const totalOriginal = subtotalOriginal
  const totalAhorro = totalOriginal - totalConDescuentos
  const porcentajeAhorro = totalOriginal > 0 ? (totalAhorro / totalOriginal) * 100 : 0
  
  return {
    desarrollo,
    desarrolloConDescuento,
    serviciosBase: {
      total: serviciosBaseTotal,
      conDescuento: serviciosBaseConDescuento,
      desglose: serviciosBaseDesglose,
    },
    otrosServicios: {
      total: otrosServiciosTotal,
      conDescuento: otrosServiciosConDescuento,
      desglose: otrosServiciosDesglose,
    },
    subtotalOriginal,
    subtotalConDescuentos,
    descuentoDirectoAplicado,
    descuentoPagoUnico: config.descuentoPagoUnico,
    descuentoGeneral: config.descuentoGeneral,
    totalOriginal,
    totalConDescuentos,
    totalAhorro,
    porcentajeAhorro,
    tipoDescuentoAplicado: config.tipoDescuento,
  }
}
