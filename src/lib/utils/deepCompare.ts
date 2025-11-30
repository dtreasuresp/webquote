/**
 * Utilidades para comparación profunda de objetos
 * Usado para detectar cambios antes de guardar en BD
 */

/**
 * Compara dos valores profundamente
 * @returns true si son iguales, false si hay diferencias
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  // Mismo referencia o primitivos iguales
  if (a === b) return true

  // Si alguno es null/undefined y no son iguales
  if (a == null || b == null) return false

  // Tipos diferentes
  if (typeof a !== typeof b) return false

  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  }

  // Si uno es array y el otro no
  if (Array.isArray(a) !== Array.isArray(b)) return false

  // Objetos
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as object)
    const keysB = Object.keys(b as object)

    if (keysA.length !== keysB.length) return false

    return keysA.every(key => 
      keysB.includes(key) && 
      deepEqual(
        (a as Record<string, unknown>)[key], 
        (b as Record<string, unknown>)[key]
      )
    )
  }

  return false
}

/**
 * Detecta si hay cambios entre el estado actual y el original
 * @returns true si hay cambios, false si son iguales
 */
export function hasCambios<T>(actual: T, original: T): boolean {
  return !deepEqual(actual, original)
}

/**
 * Obtiene solo los campos que cambiaron entre dos objetos
 * @returns Objeto con solo los campos que tienen diferencias
 */
export function getChangedFields<T extends Record<string, unknown>>(
  actual: T,
  original: T
): Partial<T> {
  const changes: Partial<T> = {}
  
  const allKeys = new Set([
    ...Object.keys(actual),
    ...Object.keys(original)
  ])

  for (const key of allKeys) {
    if (!deepEqual(actual[key], original[key])) {
      changes[key as keyof T] = actual[key] as T[keyof T]
    }
  }

  return changes
}

/**
 * Calcula el tamaño aproximado en bytes de un objeto JSON
 */
export function getPayloadSize(obj: unknown): number {
  return new Blob([JSON.stringify(obj)]).size
}

/**
 * Formatea bytes a una cadena legible
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
