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
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimales))
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

// ==================== DATOS PARA TESTING ====================

/**
 * Genera cotización de ejemplo para testing
 */
export function generarCotizacionEjemplo() {
  return {
    id: generarUUID(),
    numero: generarNumeroSecuencial(),
    version: 'v1.0',
    empresa: 'Empresa Ejemplo S.A.S',
    profesional: 'Juan Pérez',
    sector: 'Construcción',
    ubicacion: 'Bogotá, Colombia',
    emailProveedor: 'contacto@webquote.com',
    whatsappProveedor: '+57 300 123 4567',
    emailCliente: 'cliente@ejemplo.com',
    whatsappCliente: '+57 310 987 6543',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    paquete: {
      nombre: 'Paquete Estándar',
      tipo: 'web',
      descripcion: 'Sitio web empresarial con todas las características',
      desarrollo: 1500,
      descuento: 10,
    },
    serviciosBase: [
      {
        id: '1',
        nombre: 'Hosting',
        precio: 28,
        mesesGratis: 3,
        mesesPago: 9,
      },
      {
        id: '2',
        nombre: 'Dominio',
        precio: 18,
        mesesGratis: 3,
        mesesPago: 9,
      },
    ],
    serviciosOpcionales: [
      {
        id: '3',
        nombre: 'SSL Certificado',
        precio: 50,
        mesesGratis: 0,
        mesesPago: 12,
        cantidad: 1,
      },
    ],
  }
}

/**
 * Genera múltiples cotizaciones de ejemplo
 */
export function generarCotizacionesEjemplo(cantidad: number) {
  return Array.from({ length: cantidad }, (_, index) => ({
    ...generarCotizacionEjemplo(),
    id: generarUUID(),
    numero: generarNumeroSecuencial('CZ', index + 1),
    empresa: `Empresa ${index + 1}`,
  }))
}

// ==================== COLORES Y ESTILOS ====================

/**
 * Genera color hexadecimal aleatorio
 */
export function generarColorAleatorio(): string {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`
}

/**
 * Selecciona color de acuerdo a un estado
 */
export function generarColorPorEstado(
  estado: 'vigente' | 'proxima_vencer' | 'vencida'
): string {
  const colores = {
    vigente: '#10b981', // verde
    proxima_vencer: '#f59e0b', // naranja
    vencida: '#ef4444', // rojo
  }
  return colores[estado]
}

/**
 * Genera clase CSS de acuerdo a estado
 */
export function generarClasePorEstado(
  estado: 'vigente' | 'proxima_vencer' | 'vencida'
): string {
  const clases = {
    vigente: 'bg-gh-accent-green/10 text-gh-accent-green',
    proxima_vencer: 'bg-gh-accent-orange/10 text-gh-accent-orange',
    vencida: 'bg-gh-accent-red/10 text-gh-accent-red',
  }
  return clases[estado]
}

// ==================== DATOS INICIALES ====================

/**
 * Genera opciones de sector
 */
export function generarOpcionesSector(): Array<{ label: string; value: string }> {
  return [
    { label: 'Construcción', value: 'construccion' },
    { label: 'E-commerce', value: 'ecommerce' },
    { label: 'Servicios', value: 'servicios' },
    { label: 'Educación', value: 'educacion' },
    { label: 'Salud', value: 'salud' },
    { label: 'Inmobiliario', value: 'inmobiliario' },
    { label: 'Otro', value: 'otro' },
  ]
}

/**
 * Genera opciones de tipo de paquete
 */
export function generarOpcionesTipoPaquete(): Array<{
  label: string
  value: string
}> {
  return [
    { label: 'Sitio Web', value: 'web' },
    { label: 'Tienda Online', value: 'ecommerce' },
    { label: 'Aplicación Web', value: 'app' },
    { label: 'Portal Empresarial', value: 'portal' },
    { label: 'Blog', value: 'blog' },
    { label: 'Otro', value: 'otro' },
  ]
}

/**
 * Genera opciones de nivel profesional
 */
export function generarOpcionesNivelProfesional(): Array<{
  label: string
  value: string
}> {
  return [
    { label: 'Básico', value: 'basico' },
    { label: 'Profesional', value: 'profesional' },
    { label: 'Premium', value: 'premium' },
    { label: 'Personalizado', value: 'personalizado' },
  ]
}

/**
 * Genera opciones de duración de validez
 */
export function generarOpcionesDuracionValidez(): Array<{
  label: string
  value: number
}> {
  return [
    { label: '7 días', value: 7 },
    { label: '15 días', value: 15 },
    { label: '30 días (1 mes)', value: 30 },
    { label: '60 días (2 meses)', value: 60 },
    { label: '90 días (3 meses)', value: 90 },
    { label: '6 meses', value: 180 },
    { label: '1 año', value: 365 },
  ]
}

// ==================== SNAPSHOTS ====================

/**
 * Genera snapshot inicial
 */
export function generarSnapshotInicial(paqueteId?: string) {
  return {
    id: generarUUID(),
    paqueteId: paqueteId || generarUUID(),
    nombre: 'Snapshot Base',
    descripcion: '',
    paquete: generarConfiguracionPaqueteInicial(),
    serviciosBase: [],
    serviciosOpcionales: [],
    cotizacion: {
      numero: generarNumeroSecuencial(),
      version: 'v1.0',
      empresa: '',
      profesional: '',
    },
    activo: true,
    eliminado: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Genera múltiples snapshots
 */
export function generarSnapshotsEjemplo(cantidad: number, paqueteId?: string) {
  return Array.from({ length: cantidad }, (_, index) => ({
    ...generarSnapshotInicial(paqueteId),
    id: generarUUID(),
    nombre: `Snapshot ${index + 1}`,
  }))
}
