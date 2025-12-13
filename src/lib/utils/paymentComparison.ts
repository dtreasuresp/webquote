/**
 * Utilidades para comparar métodos de pago, esquemas y descuentos entre paquetes
 * @version 1.0 - Consolidación de datos de pago para página pública
 */

import type { PackageSnapshot, MetodoPreferido, OpcionPago, ConfigDescuentos } from '@/lib/types'

/**
 * Compara si todos los paquetes tienen los mismos métodos de pago preferidos
 * Compara solo el tipo de método, sin importar el orden ni las notas
 */
export function sonMetodosPreferidosIguales(snapshots: PackageSnapshot[]): boolean {
  if (snapshots.length <= 1) return true
  
  const primero = snapshots[0].paquete.metodosPreferidos || []
  const primeroMetodos = primero.map(m => m.metodo).sort((a, b) => a.localeCompare(b))
  
  return snapshots.every(snapshot => {
    const metodos = snapshot.paquete.metodosPreferidos || []
    
    // Verificar misma cantidad
    if (metodos.length !== primero.length) return false
    
    // Verificar mismos métodos (sin importar orden ni notas)
    const metodosOrdenados = metodos.map(m => m.metodo).sort((a, b) => a.localeCompare(b))
    return metodosOrdenados.every((m, i) => m === primeroMetodos[i])
  })
}

/**
 * Compara si todos los paquetes tienen el mismo esquema de pagos (opcionesPago)
 */
export function sonOpcionesPagoIguales(snapshots: PackageSnapshot[]): boolean {
  if (snapshots.length <= 1) return true
  
  const primero = snapshots[0].paquete.opcionesPago || []
  
  return snapshots.every(snapshot => {
    const opciones = snapshot.paquete.opcionesPago || []
    
    // Verificar misma cantidad
    if (opciones.length !== primero.length) return false
    
    // Verificar mismo contenido
    return opciones.every((op, i) => 
      op.nombre === primero[i]?.nombre && 
      op.porcentaje === primero[i]?.porcentaje &&
      op.descripcion === primero[i]?.descripcion
    )
  })
}

/**
 * Compara si todos los paquetes tienen la misma configuración de descuentos
 */
export function sonDescuentosIguales(snapshots: PackageSnapshot[]): boolean {
  if (snapshots.length <= 1) return true
  
  const primero = snapshots[0].paquete.configDescuentos
  
  return snapshots.every(snapshot => {
    const config = snapshot.paquete.configDescuentos
    
    // Si ambos son undefined/null, son iguales
    if (!primero && !config) return true
    if (!primero || !config) return false
    
    // Comparar tipo de descuento
    if (primero.tipoDescuento !== config.tipoDescuento) return false
    
    // Comparar descuento por pago único
    if (primero.descuentoPagoUnico !== config.descuentoPagoUnico) return false
    
    // Comparar según tipo
    if (primero.tipoDescuento === 'general') {
      return JSON.stringify(primero.descuentoGeneral) === JSON.stringify(config.descuentoGeneral)
    }
    
    if (primero.tipoDescuento === 'granular') {
      return JSON.stringify(primero.descuentosGranulares) === JSON.stringify(config.descuentosGranulares)
    }
    
    return true
  })
}

/**
 * Obtiene los métodos de pago unificados (si son iguales) o null si difieren
 */
export function getMetodosPreferidosUnificados(snapshots: PackageSnapshot[]): MetodoPreferido[] | null {
  if (snapshots.length === 0) return null
  if (!sonMetodosPreferidosIguales(snapshots)) return null
  return snapshots[0].paquete.metodosPreferidos || []
}

/**
 * Obtiene el esquema de pagos unificado (si es igual) o null si difieren
 */
export function getOpcionesPagoUnificadas(snapshots: PackageSnapshot[]): OpcionPago[] | null {
  if (snapshots.length === 0) return null
  if (!sonOpcionesPagoIguales(snapshots)) return null
  return snapshots[0].paquete.opcionesPago || []
}

/**
 * Obtiene los descuentos unificados (si son iguales) o null si difieren
 */
export function getDescuentosUnificados(snapshots: PackageSnapshot[]): ConfigDescuentos | null {
  if (snapshots.length === 0) return null
  if (!sonDescuentosIguales(snapshots)) return null
  return snapshots[0].paquete.configDescuentos || null
}

/**
 * Formatea el nombre del método de pago para mostrar
 */
export function formatMetodoPago(metodo: string): string {
  const mapa: Record<string, string> = {
    'transferencia': 'Transferencia Bancaria',
    'tarjeta': 'Tarjeta de Crédito/Débito',
    'cheque': 'Cheque',
    'paypal': 'PayPal',
    'efectivo': 'Efectivo',
    'cripto': 'Criptomonedas',
    'financiamiento': 'Financiamiento',
  }
  return mapa[metodo] || metodo
}

/**
 * Genera un resumen de descuentos para mostrar
 */
export function getDescuentoResumen(config: ConfigDescuentos | undefined): string[] {
  if (!config) return []
  
  const resumen: string[] = []
  
  // Descuento por pago único
  if (config.descuentoPagoUnico && config.descuentoPagoUnico > 0) {
    resumen.push(`${config.descuentoPagoUnico}% de descuento por pago único`)
  }
  
  // Según tipo de descuento
  if (config.tipoDescuento === 'general' && config.descuentoGeneral) {
    const dg = config.descuentoGeneral
    if (dg.aplicarA?.desarrollo && dg.porcentaje > 0) {
      resumen.push(`${dg.porcentaje}% de descuento en desarrollo`)
    }
    if (dg.aplicarA?.serviciosBase && dg.porcentaje > 0) {
      resumen.push(`${dg.porcentaje}% de descuento en servicios base`)
    }
    if (dg.aplicarA?.otrosServicios && dg.porcentaje > 0) {
      resumen.push(`${dg.porcentaje}% de descuento en otros servicios`)
    }
  }
  
  if (config.tipoDescuento === 'granular' && config.descuentosGranulares) {
    const granulares = config.descuentosGranulares
    
    // Desarrollo
    if (granulares.desarrollo && granulares.desarrollo > 0) {
      resumen.push(`${granulares.desarrollo}% de descuento en desarrollo`)
    }
    
    // Servicios base con descuento
    const serviciosConDescuento = Object.entries(granulares.serviciosBase || {})
      .filter(([, porcentaje]) => porcentaje > 0)
    if (serviciosConDescuento.length > 0) {
      resumen.push('Descuentos en servicios base')
    }
    
    // Otros servicios con descuento
    const otrosConDescuento = Object.entries(granulares.otrosServicios || {})
      .filter(([, porcentaje]) => porcentaje > 0)
    if (otrosConDescuento.length > 0) {
      resumen.push('Descuentos en servicios adicionales')
    }
  }
  
  return resumen
}

// ============================================
// FUNCIONES DE AGRUPACIÓN (para unificar paquetes iguales)
// ============================================

/**
 * Genera una clave única para las opciones de pago de un snapshot
 */
function generarClaveOpciones(opciones: OpcionPago[]): string {
  if (!opciones || opciones.length === 0) return 'empty'
  return opciones
    .map(op => `${op.nombre}|${op.porcentaje ?? 0}|${op.descripcion ?? ''}`)
    .join('::')
}

/**
 * Genera una clave única para la configuración de descuentos
 */
function generarClaveDescuentos(config: ConfigDescuentos | undefined): string {
  if (!config) return 'empty'
  return JSON.stringify(config)
}

/**
 * Agrupa snapshots que tienen el mismo esquema de opciones de pago
 * Compara en pares, no todos a la vez
 */
export function agruparPorOpciones(snapshots: PackageSnapshot[]): Array<{ nombres: string[]; opciones: OpcionPago[] }> {
  if (snapshots.length === 0) return []
  
  const grupos: Map<string, { nombres: string[]; opciones: OpcionPago[] }> = new Map()
  
  for (const snapshot of snapshots) {
    const opciones = snapshot.paquete.opcionesPago || []
    const clave = generarClaveOpciones(opciones)
    
    if (grupos.has(clave)) {
      grupos.get(clave)!.nombres.push(snapshot.nombre)
    } else {
      grupos.set(clave, {
        nombres: [snapshot.nombre],
        opciones: opciones
      })
    }
  }
  
  return Array.from(grupos.values())
}

/**
 * Agrupa snapshots que tienen la misma configuración de descuentos
 */
export function agruparPorDescuentos(snapshots: PackageSnapshot[]): Array<{ nombres: string[]; config: ConfigDescuentos | undefined }> {
  if (snapshots.length === 0) return []
  
  const grupos: Map<string, { nombres: string[]; config: ConfigDescuentos | undefined }> = new Map()
  
  for (const snapshot of snapshots) {
    const config = snapshot.paquete.configDescuentos
    const clave = generarClaveDescuentos(config)
    
    if (grupos.has(clave)) {
      grupos.get(clave)!.nombres.push(snapshot.nombre)
    } else {
      grupos.set(clave, {
        nombres: [snapshot.nombre],
        config: config
      })
    }
  }
  
  // Filtrar grupos que no tienen descuentos reales
  return Array.from(grupos.values()).filter(grupo => tieneDescuentosReales(grupo.config))
}

/**
 * Verifica si una configuración de descuentos tiene descuentos reales aplicados
 */
export function tieneDescuentosReales(config: ConfigDescuentos | undefined): boolean {
  if (!config) return false
  
  // Verificar descuento por pago único
  if (config.descuentoPagoUnico && config.descuentoPagoUnico > 0) return true
  
  // Si el tipo es 'ninguno', no hay descuentos
  if (config.tipoDescuento === 'ninguno') return false
  
  // Verificar descuento general
  if (config.tipoDescuento === 'general' && config.descuentoGeneral) {
    const dg = config.descuentoGeneral
    if (dg.porcentaje > 0) return true
  }
  
  // Verificar descuentos granulares
  if (config.tipoDescuento === 'granular' && config.descuentosGranulares) {
    const g = config.descuentosGranulares
    
    // Desarrollo
    if (g.desarrollo && g.desarrollo > 0) return true
    
    // Servicios base
    if (g.serviciosBase) {
      const tieneServiciosBase = Object.values(g.serviciosBase).some(v => v > 0)
      if (tieneServiciosBase) return true
    }
    
    // Otros servicios
    if (g.otrosServicios) {
      const tieneOtros = Object.values(g.otrosServicios).some(v => v > 0)
      if (tieneOtros) return true
    }
  }
  
  return false
}

