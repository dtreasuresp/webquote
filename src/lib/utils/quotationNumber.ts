/**
 * Utilidad para gestión de números de cotización
 * Formato: CZ0001.YYHHMMV1
 * - CZ: Prefijo "Cotización"
 * - 0001: Número secuencial (4 dígitos)
 * - YY: Año (2 dígitos)
 * - HHMM: Hora y minuto de creación
 * - V1: Versión
 */

export interface ParsedQuotationNumber {
  prefix: string          // "CZ"
  sequential: number      // 1, 2, 3...
  year: string           // "25"
  time: string           // "1703"
  version: number        // 1, 2, 3...
  isValid: boolean
}

/**
 * Parsea un número de cotización en sus componentes
 * @example parseQuotationNumber("CZ0001.251703V2") => { sequential: 1, year: "25", time: "1703", version: 2, isValid: true }
 */
export function parseQuotationNumber(numero: string): ParsedQuotationNumber {
  const match = numero.match(/^(CZ)(\d{4})\.(\d{2})(\d{4})V(\d+)$/)
  
  if (!match) {
    return {
      prefix: '',
      sequential: 0,
      year: '',
      time: '',
      version: 1,
      isValid: false
    }
  }
  
  return {
    prefix: match[1],
    sequential: parseInt(match[2], 10),
    year: match[3],
    time: match[4],
    version: parseInt(match[5], 10),
    isValid: true
  }
}

/**
 * Construye un número de cotización a partir de sus componentes
 * @example buildQuotationNumber({ sequential: 1, year: "25", time: "1703", version: 2 }) => "CZ0001.251703V2"
 */
export function buildQuotationNumber(params: {
  sequential: number
  year?: string
  time?: string
  version?: number
}): string {
  const now = new Date()
  const year = params.year || now.getFullYear().toString().slice(-2)
  const time = params.time || (
    now.getHours().toString().padStart(2, '0') + 
    now.getMinutes().toString().padStart(2, '0')
  )
  const version = params.version || 1
  const seqStr = params.sequential.toString().padStart(4, '0')
  
  return `CZ${seqStr}.${year}${time}V${version}`
}

/**
 * Genera el siguiente número de cotización basado en el último existente
 * @param ultimoNumero - El último número de cotización (puede ser null si es la primera)
 * @returns Nuevo número de cotización con secuencial incrementado y V1
 */
export function generateNextQuotationNumber(ultimoNumero: string | null): string {
  let siguienteSecuencial = 1
  
  if (ultimoNumero) {
    const parsed = parseQuotationNumber(ultimoNumero)
    if (parsed.isValid) {
      siguienteSecuencial = parsed.sequential + 1
    }
  }
  
  return buildQuotationNumber({
    sequential: siguienteSecuencial,
    version: 1
  })
}

/**
 * Actualiza la versión de un número de cotización existente
 * Mantiene el secuencial, año y hora originales
 * @param numeroActual - Número de cotización actual
 * @param nuevaVersion - Nueva versión a establecer
 * @returns Número actualizado con la nueva versión
 */
export function updateQuotationVersion(numeroActual: string, nuevaVersion: number): string {
  const parsed = parseQuotationNumber(numeroActual)
  
  if (!parsed.isValid) {
    // Si el formato es inválido, retornar el mismo número
    return numeroActual
  }
  
  return buildQuotationNumber({
    sequential: parsed.sequential,
    year: parsed.year,
    time: parsed.time,
    version: nuevaVersion
  })
}

/**
 * Incrementa la versión de un número de cotización en 1
 * @param numeroActual - Número de cotización actual
 * @returns Número con versión incrementada
 */
export function incrementQuotationVersion(numeroActual: string): string {
  const parsed = parseQuotationNumber(numeroActual)
  
  if (!parsed.isValid) {
    return numeroActual
  }
  
  return updateQuotationVersion(numeroActual, parsed.version + 1)
}

/**
 * Extrae solo el número secuencial de una cotización
 * @example getSequentialNumber("CZ0042.251703V3") => 42
 */
export function getSequentialNumber(numero: string): number {
  const parsed = parseQuotationNumber(numero)
  return parsed.sequential
}

/**
 * Extrae solo la versión de una cotización
 * @example getVersionNumber("CZ0042.251703V3") => 3
 */
export function getVersionNumber(numero: string): number {
  const parsed = parseQuotationNumber(numero)
  return parsed.version
}

/**
 * Formatea un número de cotización para display (con espacios)
 * @example formatForDisplay("CZ0001.251703V2") => "CZ-0001 | 25-17:03 | V2"
 */
export function formatForDisplay(numero: string): string {
  const parsed = parseQuotationNumber(numero)
  
  if (!parsed.isValid) {
    return numero
  }
  
  const seq = parsed.sequential.toString().padStart(4, '0')
  const hour = parsed.time.slice(0, 2)
  const min = parsed.time.slice(2, 4)
  
  return `CZ-${seq} | ${parsed.year}-${hour}:${min} | V${parsed.version}`
}
