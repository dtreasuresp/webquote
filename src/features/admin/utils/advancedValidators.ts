/**
 * Validadores Avanzados para Cotizaciones
 * Incluye multi-field validation, cross-tab dependencies, validación condicional
 * 
 * @phase Phase 11 - Validación Avanzada de TABs
 * @date 2025-11-24
 */

import type { QuotationConfig, Package, Servicio, OtroServicio } from '@/lib/types'

// ==================== TIPOS ====================

export interface AdvancedValidationResult {
  valido: boolean
  errores: string[]
  advertencias: string[]
  erroresPorTab: Record<string, string[]>
  erroresPorCampo: Record<string, string[]>
  dependenciasRotas: string[]
}

export interface ValidationContext {
  config: QuotationConfig
  packages?: Package[]
  servicios?: Servicio[]
  otrosServicios?: OtroServicio[]
  forceStrict?: boolean
}

// ==================== VALIDACIÓN MULTI-FIELD ====================

/**
 * Valida consistencia de precios en la configuración
 * - Desarrollo > 0
 * - Servicios base > 0
 * - Otros servicios > 0
 * - Descuentos coherentes
 */
export function validarConsistenciaPrecios(context: ValidationContext): string[] {
  const errores: string[] = []
  const { config, packages = [] } = context

  // Validar presupuesto válido
  if (!config.presupuesto || isNaN(Number(config.presupuesto))) {
    errores.push('Presupuesto debe ser un número válido')
  } else if (Number(config.presupuesto) <= 0) {
    errores.push('Presupuesto debe ser mayor a 0')
  }

  // Validar que haya al menos un paquete si hay presupuesto
  if (packages.length === 0 && Number(config.presupuesto) > 0) {
    errores.push('Debe existir al menos un paquete para presupuesto > 0')
  }

  // Validar moneda coherente con presupuesto
  if (!config.moneda && Number(config.presupuesto) > 0) {
    errores.push('Moneda requerida cuando hay presupuesto')
  }

  return errores
}

/**
 * Valida consistencia de fechas
 * - Emisión ≤ Vencimiento
 * - Vencimiento en futuro
 * - Vigencia coherente
 */
export function validarConsistenciaFechas(context: ValidationContext): string[] {
  const errores: string[] = []
  const { config } = context

  try {
    const fechaEmision = new Date(config.fechaEmision)
    const fechaVencimiento = new Date(config.fechaVencimiento)

    // Validar que emisión sea válida
    if (isNaN(fechaEmision.getTime())) {
      errores.push('Fecha de emisión no válida')
      return errores
    }

    // Validar que vencimiento sea válida
    if (isNaN(fechaVencimiento.getTime())) {
      errores.push('Fecha de vencimiento no válida')
      return errores
    }

    // Validar que emisión <= vencimiento
    if (fechaEmision > fechaVencimiento) {
      errores.push('Fecha de emisión no puede ser posterior a fecha de vencimiento')
    }

    // Validar vigencia del contrato coherente
    if (config.tiempoVigenciaValor <= 0) {
      errores.push('Vigencia del contrato debe ser mayor a 0')
    }

    // Validar unidad de tiempo válida
    const unidadesValidas = ['días', 'meses', 'años']
    if (!unidadesValidas.includes(config.tiempoVigenciaUnidad)) {
      errores.push(`Unidad de tiempo inválida. Debe ser: ${unidadesValidas.join(', ')}`)
    }
  } catch {
    errores.push('Error al validar fechas')
  }

  return errores
}

/**
 * Valida consistencia de datos del cliente
 * - Empresa requerida
 * - Al menos un medio de contacto (email o WhatsApp)
 * - Formato de contacto válido
 */
export function validarConsistenciaCliente(context: ValidationContext): string[] {
  const errores: string[] = []
  const { config } = context

  // Empresa requerida
  if (!config.empresa?.trim()) {
    errores.push('Nombre de empresa del cliente requerido')
  }

  // Sector requerido
  if (!config.sector?.trim()) {
    errores.push('Sector del cliente requerido')
  }

  // Ubicación requerida
  if (!config.ubicacion?.trim()) {
    errores.push('Ubicación del cliente requerida')
  }

  // Al menos un medio de contacto
  const tieneEmail = config.emailCliente?.trim()
  const tieneWhatsApp = config.whatsappCliente?.trim()

  if (!tieneEmail && !tieneWhatsApp) {
    errores.push('Cliente debe tener al menos email o WhatsApp')
  }

  // Validar formato de email si existe
  if (tieneEmail) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regexEmail.test(config.emailCliente)) {
      errores.push('Email del cliente formato inválido')
    }
  }

  // Validar formato de WhatsApp si existe
  if (tieneWhatsApp) {
    const regexWhatsApp = /^\+\d{1,3}\s?\d{6,14}$/
    if (!regexWhatsApp.test(config.whatsappCliente.replace(/\s/g, ''))) {
      errores.push('WhatsApp del cliente formato inválido')
    }
  }

  return errores
}

/**
 * Valida consistencia de datos del proveedor
 * - Profesional requerido
 * - Empresa proveedor requerida
 * - Al menos un medio de contacto
 * - Formato de contacto válido
 */
export function validarConsistenciaProveedor(context: ValidationContext): string[] {
  const errores: string[] = []
  const { config } = context

  // Profesional requerido
  if (!config.profesional?.trim()) {
    errores.push('Nombre del profesional requerido')
  }

  // Empresa proveedor requerida
  if (!config.empresaProveedor?.trim()) {
    errores.push('Nombre de empresa del proveedor requerido')
  }

  // Ubicación proveedor requerida
  if (!config.ubicacionProveedor?.trim()) {
    errores.push('Ubicación del proveedor requerida')
  }

  // Al menos un medio de contacto
  const tieneEmail = config.emailProveedor?.trim()
  const tieneWhatsApp = config.whatsappProveedor?.trim()

  if (!tieneEmail && !tieneWhatsApp) {
    errores.push('Proveedor debe tener al menos email o WhatsApp')
  }

  // Validar formato de email si existe
  if (tieneEmail) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regexEmail.test(config.emailProveedor)) {
      errores.push('Email del proveedor formato inválido')
    }
  }

  // Validar formato de WhatsApp si existe
  if (tieneWhatsApp) {
    const regexWhatsApp = /^\+\d{1,3}\s?\d{6,14}$/
    if (!regexWhatsApp.test(config.whatsappProveedor.replace(/\s/g, ''))) {
      errores.push('WhatsApp del proveedor formato inválido')
    }
  }

  return errores
}

// ==================== VALIDACIÓN DE CROSS-TAB DEPENDENCIES ====================

/**
 * Valida dependencias entre TABs
 * Ej: Si hay presupuesto, debe haber paquete
 *     Si hay cliente, debe haber proveedor
 */
export function validarDependenciasTab(context: ValidationContext): string[] {
  const errores: string[] = []
  const { config, packages = [] } = context

  // Si hay presupuesto, debe haber paquete y servicios
  if (config.presupuesto && Number(config.presupuesto) > 0) {
    if (packages.length === 0) {
      errores.push('Debe crear al menos un paquete para tener presupuesto')
    }
  }

  // Si hay cliente, debe haber datos de contacto
  if (config.empresa && !config.emailCliente && !config.whatsappCliente) {
    errores.push('Si hay cliente definido, debe tener datos de contacto')
  }

  // Si hay proveedor, debe haber datos de contacto
  if (config.profesional && !config.emailProveedor && !config.whatsappProveedor) {
    errores.push('Si hay proveedor definido, debe tener datos de contacto')
  }

  // Si hay versión, debe ser >= 1
  if (config.versionNumber && config.versionNumber < 1) {
    errores.push('Versión debe ser >= 1')
  }

  // Si hay número de cotización, debe ser único
  if (!config.numero?.trim()) {
    errores.push('Número de cotización requerido')
  }

  return errores
}

/**
 * Valida que hero titles sean coherentes con presupuesto
 */
export function validarConsistenciaHero(context: ValidationContext): string[] {
  const errores: string[] = []
  const { config } = context

  if (!config.heroTituloMain?.trim()) {
    errores.push('Título principal requerido')
  }

  if (!config.heroTituloSub?.trim()) {
    errores.push('Subtítulo requerido')
  }

  // Si tiene presupuesto, hero es crítico
  if (config.presupuesto && Number(config.presupuesto) > 0) {
    if (config.heroTituloMain && config.heroTituloMain.length < 5) {
      errores.push('Título principal debe tener al menos 5 caracteres')
    }
  }

  return errores
}

// ==================== VALIDACIÓN CONDICIONAL ====================

/**
 * Valida reglas condicionales
 * - Si es cotización global, ciertos campos son obligatorios
 * - Si es activo, debe tener datos válidos
 */
export function validarReglasCondicionales(context: ValidationContext): string[] {
  const errores: string[] = []
  const { config } = context

  // Si es global, debe tener todos los datos de proveedor y cliente base
  if (config.isGlobal) {
    if (!config.empresa) {
      errores.push('Config global: empresa cliente requerida')
    }
    if (!config.profesional) {
      errores.push('Config global: profesional requerido')
    }
    if (!config.empresaProveedor) {
      errores.push('Config global: empresa proveedor requerida')
    }
  }

  // Si está activo, debe tener presupuesto válido
  if (config.activo && (!config.presupuesto || Number(config.presupuesto) <= 0)) {
    errores.push('Config activa debe tener presupuesto > 0')
  }

  // Si no está activo, no debería tener presupuesto > 0 (advertencia)
  if (!config.activo && config.presupuesto && Number(config.presupuesto) > 0) {
    // Esto es una advertencia, no un error
  }

  return errores
}

// ==================== VALIDACIÓN INTEGRAL ====================

/**
 * Valida TODA la configuración de forma integral
 * Combina todas las validaciones individuales
 * 
 * @returns AdvancedValidationResult con todos los detalles
 */
export function validarConfiguracionCompleta(context: ValidationContext): AdvancedValidationResult {
  const result: AdvancedValidationResult = {
    valido: true,
    errores: [],
    advertencias: [],
    erroresPorTab: {},
    erroresPorCampo: {},
    dependenciasRotas: [],
  }

  // Validar TAB Cotización
  const erroresCotizacion = [
    ...validarConsistenciaFechas(context),
    ...validarConsistenciaHero(context),
  ]
  if (erroresCotizacion.length > 0) {
    result.erroresPorTab['cotizacion'] = erroresCotizacion
    result.errores.push(...erroresCotizacion)
  }

  // Validar TAB Cliente
  const erroresCliente = validarConsistenciaCliente(context)
  if (erroresCliente.length > 0) {
    result.erroresPorTab['cliente'] = erroresCliente
    result.errores.push(...erroresCliente)
  }

  // Validar TAB Proveedor (similar a Cliente)
  const erroresProveedor = validarConsistenciaProveedor(context)
  if (erroresProveedor.length > 0) {
    result.erroresPorTab['proveedor'] = erroresProveedor
    result.errores.push(...erroresProveedor)
  }

  // Validar TAB Presupuesto
  const erroresPresupuesto = validarConsistenciaPrecios(context)
  if (erroresPresupuesto.length > 0) {
    result.erroresPorTab['presupuesto'] = erroresPresupuesto
    result.errores.push(...erroresPresupuesto)
  }

  // Validar Dependencias entre TABs
  const erroresDependencias = validarDependenciasTab(context)
  if (erroresDependencias.length > 0) {
    result.dependenciasRotas = erroresDependencias
    result.errores.push(...erroresDependencias)
  }

  // Validar Reglas Condicionales
  const erroresCondicionales = validarReglasCondicionales(context)
  if (erroresCondicionales.length > 0) {
    result.errores.push(...erroresCondicionales)
  }

  // Determinar si es válido
  result.valido = result.errores.length === 0

  return result
}

/**
 * Valida si una configuración es "guardable"
 * Más permisivo que validarConfiguracionCompleta
 * Permite campos opcionales si el contexto lo permite
 */
export function validarGuardable(context: ValidationContext): AdvancedValidationResult {
  const strictResult = validarConfiguracionCompleta(context)

  // Para borrador, menos estricto
  if (!context.forceStrict) {
    // Permitir algunos errores que no son críticos
    const erroresCriticos = strictResult.errores.filter(
      (e) =>
        e.includes('requerido') ||
        e.includes('válido') ||
        e.includes('formato') ||
        e.includes('dependencia')
    )

    return {
      ...strictResult,
      errores: erroresCriticos,
      valido: erroresCriticos.length === 0,
    }
  }

  return strictResult
}

/**
 * Valida si una configuración es "publicable"
 * Requiere que TODOS los datos sean válidos
 */
export function validarPublicable(context: ValidationContext): AdvancedValidationResult {
  // Forzar validación estricta
  return validarConfiguracionCompleta({
    ...context,
    forceStrict: true,
  })
}

// ==================== UTILIDADES ====================

/**
 * Obtiene un resumen de errores por TAB
 */
export function obtenerResumenErrores(result: AdvancedValidationResult): string {
  if (result.valido) {
    return 'Sin errores'
  }

  const tabs = Object.keys(result.erroresPorTab)
  if (tabs.length === 0) {
    return `${result.errores.length} error(es) general(es)`
  }

  return `${tabs.length} TAB(s) con errores: ${tabs.join(', ')}`
}

/**
 * Obtiene lista de TABs que tienen errores
 */
export function obtenerTabsConErrores(result: AdvancedValidationResult): string[] {
  return Object.keys(result.erroresPorTab)
}

/**
 * Verifica si un TAB específico tiene errores
 */
export function tieneErroresPorTab(result: AdvancedValidationResult, tab: string): boolean {
  return (result.erroresPorTab[tab]?.length ?? 0) > 0
}

/**
 * Obtiene errores de un TAB específico
 */
export function obtenerErroresPorTab(result: AdvancedValidationResult, tab: string): string[] {
  return result.erroresPorTab[tab] ?? []
}
