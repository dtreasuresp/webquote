// ============= VALIDADORES =============

/**
 * Valida un email con formato RFC5322 simplificado
 */
export function validarEmail(email: string): boolean {
  if (!email || email.trim() === '') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida un teléfono (dígitos, espacios, guiones, +, paréntesis)
 */
export function validarTelefono(telefono: string): boolean {
  if (!telefono || telefono.trim() === '') return false
  const telefonoRegex = /^[\d\s\-\+\(\)]+$/
  return telefonoRegex.test(telefono)
}

/**
 * Valida que un precio sea mayor a 0
 */
export function validarPrecio(precio: any): boolean {
  const num = parseFloat(precio)
  return !isNaN(num) && num > 0
}

/**
 * Valida que un campo no esté vacío
 */
export function validarCampoRequerido(valor: any): boolean {
  if (typeof valor === 'string') {
    return valor.trim() !== ''
  }
  return !!valor
}

/**
 * Validación completa de cotización
 */
export function validarQuotation(data: any): {
  valido: boolean
  errores: string[]
} {
  const errores: string[] = []

  // Campos requeridos
  const camposRequeridos = [
    { campo: 'numero', label: 'Número de cotización' },
    { campo: 'empresa', label: 'Empresa cliente' },
    { campo: 'sector', label: 'Sector' },
    { campo: 'ubicacion', label: 'Ubicación cliente' },
    { campo: 'profesional', label: 'Profesional responsable' },
    { campo: 'empresaProveedor', label: 'Empresa proveedor' },
    { campo: 'emailProveedor', label: 'Email proveedor' },
    { campo: 'whatsappProveedor', label: 'WhatsApp proveedor' },
  ]

  camposRequeridos.forEach(({ campo, label }) => {
    if (!validarCampoRequerido(data[campo])) {
      errores.push(`❌ ${label} es obligatorio`)
    }
  })

  // Validar emails
  if (data.emailCliente && !validarEmail(data.emailCliente)) {
    errores.push(`❌ Email del cliente no es válido`)
  }
  if (data.emailProveedor && !validarEmail(data.emailProveedor)) {
    errores.push(`❌ Email del proveedor no es válido`)
  }

  // Validar teléfonos
  if (data.whatsappCliente && !validarTelefono(data.whatsappCliente)) {
    errores.push(`❌ WhatsApp del cliente debe contener solo números, espacios y guiones`)
  }
  if (data.whatsappProveedor && !validarTelefono(data.whatsappProveedor)) {
    errores.push(`❌ WhatsApp del proveedor debe contener solo números, espacios y guiones`)
  }

  return {
    valido: errores.length === 0,
    errores,
  }
}

/**
 * Compara dos cotizaciones campo a campo
 * Ignora: id, createdAt, updatedAt
 */
export function compararQuotations(
  cotizacion1: any,
  cotizacion2: any
): boolean {
  const camposAIgnorar = ['id', 'createdAt', 'updatedAt', 'snapshots']

  // Obtener todas las claves
  const allKeys = new Set([
    ...Object.keys(cotizacion1 || {}),
    ...Object.keys(cotizacion2 || {}),
  ])

  for (const key of allKeys) {
    if (camposAIgnorar.includes(key)) continue

    const val1 = cotizacion1?.[key]
    const val2 = cotizacion2?.[key]

    // Comparar valores
    if (val1 !== val2) {
      return false
    }
  }

  return true
}

/**
 * Validación completa de snapshot (paquete)
 */
export function validarSnapshot(data: any): {
  valido: boolean
  errores: string[]
} {
  const errores: string[] = []

  // Campos requeridos
  const camposRequeridos = [
    { campo: 'nombre', label: 'Nombre del paquete' },
    { campo: 'tipo', label: 'Tipo de paquete' },
  ]

  camposRequeridos.forEach(({ campo, label }) => {
    if (!validarCampoRequerido(data[campo])) {
      errores.push(`❌ ${label} es obligatorio`)
    }
  })

  // Validar precios
  if (data.gestionPrecio !== undefined && !validarPrecio(data.gestionPrecio)) {
    errores.push(`❌ Precio de gestión debe ser mayor a 0`)
  }
  if (data.desarrollo !== undefined && !validarPrecio(data.desarrollo)) {
    errores.push(`❌ Precio de desarrollo debe ser mayor a 0`)
  }
  if (data.costoInicial !== undefined && !validarPrecio(data.costoInicial)) {
    errores.push(`❌ Costo inicial debe ser mayor a 0`)
  }

  return {
    valido: errores.length === 0,
    errores,
  }
}
