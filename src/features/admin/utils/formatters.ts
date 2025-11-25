/**
 * Funciones de formateo para presentación de datos en el admin panel
 */

// ==================== FECHAS ====================

/**
 * Formatea fecha ISO a "largo" (ej: "20 de noviembre de 2025")
 */
export function formatearFechaLarga(isoString: string): string {
  try {
    const fecha = new Date(isoString)
    const meses = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ]
    return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`
  } catch {
    return isoString
  }
}

/**
 * Formatea fecha a formato corto (ej: "20/11/2025")
 */
export function formatearFechaCorta(isoString: string): string {
  try {
    const fecha = new Date(isoString)
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const año = fecha.getFullYear()
    return `${dia}/${mes}/${año}`
  } catch {
    return isoString
  }
}

/**
 * Formatea fecha a formato ISO para input date
 */
export function formatearFechaISO(date: Date): string {
  const año = date.getFullYear()
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const dia = String(date.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}

/**
 * Obtiene diferencia de días entre dos fechas
 */
export function obtenerDiasEntre(fecha1: Date, fecha2: Date): number {
  const diferencia = Math.abs(fecha2.getTime() - fecha1.getTime())
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
}

// ==================== MONEDA ====================

/**
 * Formatea número como moneda USD
 */
export function formatearMonedaUSD(monto: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto)
}

/**
 * Formatea número como moneda COP
 */
export function formatearMonedaCOP(monto: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto)
}

/**
 * Extrae solo el valor numérico de una moneda formateada
 */
export function extraerNumeroDeMoneda(monedaFormateada: string): number {
  const numeros = monedaFormateada.replace(/[^\d.-]/g, '')
  return parseFloat(numeros) || 0
}

/**
 * Formatea rango de precios
 * Si min === max, retorna un solo valor
 * Si son diferentes, retorna el rango
 */
export function formatearRangoPrecios(
  min: number,
  max: number,
  suffix: string = ''
): string {
  if (min === max) {
    return `$${min.toFixed(2)}${suffix ? ` ${suffix}` : ''}`
  }
  return `$${min.toFixed(2)} - $${max.toFixed(2)}${suffix ? ` ${suffix}` : ''}`
}

// ==================== NÚMEROS ====================

/**
 * Formatea número con separadores de miles
 */
export function formatearNumero(valor: number, decimales: number = 0): string {
  return valor.toLocaleString('es-CO', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

/**
 * Redondea número a X decimales
 */
export function redondear(valor: number, decimales: number = 2): number {
  return Math.round(valor * Math.pow(10, decimales)) / Math.pow(10, decimales)
}

/**
 * Convierte número a porcentaje
 */
export function formatearPorcentaje(valor: number, decimales: number = 2): string {
  return `${redondear(valor * 100, decimales)}%`
}

// ==================== STRINGS ====================

/**
 * Capitaliza primera letra de un string
 */
export function capitalizarPrimera(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
}

/**
 * Convierte string a uppercase
 */
export function mayuscula(texto: string): string {
  return texto.toUpperCase()
}

/**
 * Convierte string a lowercase
 */
export function minuscula(texto: string): string {
  return texto.toLowerCase()
}

/**
 * Trunca string a X caracteres
 */
export function truncar(texto: string, longitud: number): string {
  if (texto.length <= longitud) return texto
  return texto.substring(0, longitud) + '...'
}

/**
 * Reemplaza espacios por guiones y convierte a minúsculas (slug)
 */
export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/\-+/g, '-')
}

/**
 * Formatea nombre de servicio (ej: "SERVICIO_BASE" -> "Servicio Base")
 */
export function formatearNombreServicio(nombre: string): string {
  return nombre
    .split('_')
    .map((palabra) => capitalizarPrimera(palabra))
    .join(' ')
}

/**
 * Elimina caracteres especiales de un string
 */
export function limpiarEspeciales(texto: string): string {
  return texto.replace(/[^\w\s\-]/g, '')
}

/**
 * Valida longitud de string
 */
export function validarLongitud(
  texto: string,
  minimo: number,
  maximo: number
): boolean {
  return texto.length >= minimo && texto.length <= maximo
}

// ==================== ARRAYS ====================

/**
 * Agrupa array por propiedad
 */
export function agruparPor<T>(
  array: T[],
  propiedad: keyof T
): Record<string, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = String(item[propiedad])
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(item)
      return acc
    },
    {} as Record<string, T[]>
  )
}

/**
 * Ordena array de objetos por propiedad
 */
export function ordenarPor<T>(
  array: T[],
  propiedad: keyof T,
  ascendente: boolean = true
): T[] {
  return [...array].sort((a, b) => {
    const valorA = a[propiedad]
    const valorB = b[propiedad]

    if (valorA < valorB) return ascendente ? -1 : 1
    if (valorA > valorB) return ascendente ? 1 : -1
    return 0
  })
}

/**
 * Filtra array duplicados por propiedad
 */
export function eliminarDuplicados<T>(
  array: T[],
  propiedad?: keyof T
): T[] {
  if (!propiedad) {
    return [...new Set(array)]
  }

  const vistos = new Set()
  return array.filter((item) => {
    const valor = item[propiedad]
    if (vistos.has(valor)) return false
    vistos.add(valor)
    return true
  })
}
