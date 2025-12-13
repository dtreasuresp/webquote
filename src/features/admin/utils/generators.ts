/**
 * Generadores de datos para cotizaciones y configuración
 */

import { v4 as uuidv4 } from 'uuid'

// ==================== IDs y UUIDs ====================

/**
 * Genera UUID v4 único
 */
export function generarUUID(): string {
  return uuidv4()
}

/**
 * Genera ID corto único (8 caracteres)
 */
export function generarIDCorto(): string {
  return Math.random().toString(36).substring(2, 10)
}

/**
 * Genera ID numérico único basado en timestamp
 */
export function generarIDNumerico(): number {
  return Date.now()
}

// ==================== NÚMEROS ====================

/**
 * Genera número aleatorio entre min y max
 */
export function generarNumeroAleatorio(
  min: number,
  max: number
): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Genera número decimal aleatorio entre min y max
 */
export function generarNumeroDecimal(
  min: number,
  max: number,
  decimales: number = 2
): number {
  return Number.parseFloat((Math.random() * (max - min) + min).toFixed(decimales))
}

// ==================== CONFIGURACIÓN INICIAL ====================

/**
 * Genera configuración inicial de cotización
 */
export function generarConfiguracionCotizacionInicial() {
  return {
    empresa: '',
    profesional: '',
    sector: '',
    ubicacion: '',
    emailProveedor: '',
    whatsappProveedor: '',
    emailCliente: '',
    whatsappCliente: '',
    numero: generarNumeroSecuencial(),
    version: '1.0',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  }
}

/**
 * Genera configuración inicial de paquete
 */
export function generarConfiguracionPaqueteInicial() {
  return {
    nombre: '',
    tipo: 'web',
    descripcion: '',
    desarrollo: 0,
    descuento: 0,
    activo: true,
  }
}

/**
 * Genera servicio base inicial
 */
export function generarServicioBaseInicial() {
  return {
    id: generarUUID(),
    nombre: '',
    precio: 0,
    mesesGratis: 0,
    mesesPago: 12,
  }
}

/**
 * Genera servicio opcional inicial
 */
export function generarServicioOpcionalInicial() {
  return {
    id: generarUUID(),
    nombre: '',
    precio: 0,
    mesesGratis: 0,
    mesesPago: 0,
    cantidad: 1,
  }
}

// ==================== NÚMEROS SECUENCIALES ====================

/**
 * Genera número secuencial para cotización
 * Formato: CZ-2025-001
 */
export function generarNumeroSecuencial(
  prefijo: string = 'CZ',
  secuencia?: number
): string {
  const año = new Date().getFullYear()
  const sec = secuencia || generarNumeroAleatorio(1, 999)
  return `${prefijo}-${año}-${String(sec).padStart(3, '0')}`
}

/**
 * Genera versión de cotización (v1.0, v1.1, v2.0, etc.)
 */
export function generarVersionCotizacion(versionAnterior?: string): string {
  if (!versionAnterior) return 'v1.0'

  const [mayor, menor] = versionAnterior
    .replace('v', '')
    .split('.')
    .map(Number)

  // Incrementar versión menor, si llega a 10 incrementar mayor
  const nuevoMenor = (menor + 1) % 10
  const nuevoMayor = menor + 1 === 10 ? mayor + 1 : mayor

  return `v${nuevoMayor}.${nuevoMenor}`
}
