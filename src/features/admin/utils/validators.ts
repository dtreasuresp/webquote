/**
 * Validadores para cotizaciones y configuración del admin panel
 */

// ==================== EMAIL & TELÉFONO ====================

/**
 * Valida formato de email básico
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Valida teléfono WhatsApp (formato: +XXX XXXXXXXXX)
 */
export function validarWhatsApp(whatsapp: string): boolean {
  const regex = /^\+\d{1,3}\s?\d{6,14}$/
  return regex.test(whatsapp.replace(/\s/g, ''))
}

/**
 * Valida teléfono genérico (números, espacios, guiones, +)
 */
export function validarTelefono(telefono: string): boolean {
  const regex = /^[\d\s\-+()]{7,}$/
  return regex.test(telefono)
}

// ==================== FECHAS ====================

/**
 * Valida que fecha de vencimiento sea mayor a fecha de emisión
 */
export function validarFechas(emisión: string, vencimiento: string): boolean {
  try {
    const fechaEmision = new Date(emisión)
    const fechaVencimiento = new Date(vencimiento)
    return fechaVencimiento > fechaEmision
  } catch {
    return false
  }
}

/**
 * Valida que una fecha sea válida en formato ISO
 */
export function validarFechaISO(isoString: string): boolean {
  try {
    const fecha = new Date(isoString)
    return !isNaN(fecha.getTime())
  } catch {
    return false
  }
}

// ==================== CONFIGURACIÓN COTIZACIÓN ====================

interface CotizacionConfig {
  empresa?: string
  profesional?: string
  sector?: string
  ubicacion?: string
  emailProveedor?: string
  whatsappProveedor?: string
  emailCliente?: string
  whatsappCliente?: string
  fechaEmision?: string
  fechaVencimiento?: string
  numero?: string
  version?: string
}

/**
 * Respuesta de validación con errores detallados
 */
export interface ValidationResult {
  valido: boolean
  errores: string[]
}

/**
 * Valida TAB Cotización: Campos requeridos con datos correctos
 */
export function validarTabCotizacion(
  config: CotizacionConfig
): ValidationResult {
  const errores: string[] = []

  // Campos requeridos
  if (!config?.empresa?.trim()) {
    errores.push('Empresa requerida')
  }
  if (!config?.profesional?.trim()) {
    errores.push('Profesional requerido')
  }
  if (!config?.sector?.trim()) {
    errores.push('Sector requerido')
  }
  if (!config?.ubicacion?.trim()) {
    errores.push('Ubicación cliente requerida')
  }

  // Validaciones de email
  if (config?.emailProveedor && !validarEmail(config.emailProveedor)) {
    errores.push('Email proveedor inválido')
  }
  if (config?.emailCliente && !validarEmail(config.emailCliente)) {
    errores.push('Email cliente inválido')
  }

  // Validaciones de teléfono
  if (config?.whatsappProveedor && !validarWhatsApp(config.whatsappProveedor)) {
    errores.push('WhatsApp proveedor inválido')
  }
  if (config?.whatsappCliente && !validarWhatsApp(config.whatsappCliente)) {
    errores.push('WhatsApp cliente inválido')
  }

  // Validaciones de fechas
  if (
    config?.fechaEmision &&
    config?.fechaVencimiento &&
    !validarFechas(config.fechaEmision, config.fechaVencimiento)
  ) {
    errores.push('Fecha vencimiento debe ser mayor a emisión')
  }

  return {
    valido: errores.length === 0,
    errores,
  }
}

/**
 * Valida TAB Oferta: Servicios base + descripción paquete
 */
export function validarTabOferta(
  serviciosBase: any[] | undefined,
  paquete: any | undefined
): ValidationResult {
  const errores: string[] = []

  if (!serviciosBase || serviciosBase.length === 0) {
    errores.push('Debe haber al menos un servicio base')
  }

  if (!paquete?.nombre?.trim()) {
    errores.push('Descripción del paquete (nombre) es requerida')
  }

  if (!paquete?.descripcion?.trim()) {
    errores.push('Descripción detallada del paquete es requerida')
  }

  return {
    valido: errores.length === 0,
    errores,
  }
}

/**
 * Valida TAB Cliente: Información de contacto obligatoria
 */
export function validarTabCliente(
  config: CotizacionConfig
): ValidationResult {
  const errores: string[] = []

  if (!config?.emailCliente?.trim()) {
    errores.push('Email cliente requerido')
  } else if (!validarEmail(config.emailCliente)) {
    errores.push('Email cliente inválido')
  }

  if (config?.whatsappCliente && !validarWhatsApp(config.whatsappCliente)) {
    errores.push('WhatsApp cliente inválido')
  }

  return {
    valido: errores.length === 0,
    errores,
  }
}

/**
 * Valida TAB Presentación: Configuración visual
 */
export function validarTabPresentacion(
  config: any | undefined
): ValidationResult {
  const errores: string[] = []

  if (!config) {
    errores.push('Configuración de presentación requerida')
  }

  return {
    valido: errores.length === 0,
    errores,
  }
}

/**
 * Valida TAB Servicios: Al menos un servicio base activo
 */
export function validarTabServicios(
  servicios: any[] | undefined
): ValidationResult {
  const errores: string[] = []

  if (!servicios || servicios.length === 0) {
    errores.push('Debe haber al menos un servicio')
  }

  return {
    valido: errores.length === 0,
    errores,
  }
}

/**
 * Valida que un string no esté vacío o sea whitespace
 */
export function validarStringRequerido(
  valor: string | undefined | null,
  nombreCampo: string
): ValidationResult {
  const errores: string[] = []

  if (!valor?.trim()) {
    errores.push(`${nombreCampo} es requerido`)
  }

  return {
    valido: errores.length === 0,
    errores,
  }
}

/**
 * Valida que un número sea positivo
 */
export function validarNumeroPositivo(
  valor: number | undefined,
  nombreCampo: string
): ValidationResult {
  const errores: string[] = []

  if (valor === undefined || valor === null) {
    errores.push(`${nombreCampo} es requerido`)
  } else if (valor < 0) {
    errores.push(`${nombreCampo} debe ser positivo`)
  }

  return {
    valido: errores.length === 0,
    errores,
  }
}

/**
 * Valida que un array no esté vacío
 */
export function validarArrayNoVacio(
  array: any[] | undefined,
  nombreCampo: string
): ValidationResult {
  const errores: string[] = []

  if (!array || array.length === 0) {
    errores.push(`${nombreCampo} no puede estar vacío`)
  }

  return {
    valido: errores.length === 0,
    errores,
  }
}
