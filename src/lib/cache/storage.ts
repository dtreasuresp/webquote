/**
 * Wrapper de LocalStorage con soporte para TTL y serialización segura
 */

// Verificar si estamos en el navegador
const isBrowser = typeof window !== 'undefined'

// Estructura interna de un item en storage
interface StorageItem<T> {
  value: T
  timestamp: number
  expiresAt?: number  // TTL opcional
}

/**
 * Guarda un valor en LocalStorage
 * @param key - Clave única
 * @param value - Valor a guardar (será serializado)
 * @param ttlMs - Tiempo de vida en milisegundos (opcional)
 */
export function setItem<T>(key: string, value: T, ttlMs?: number): boolean {
  if (!isBrowser) return false
  
  try {
    const item: StorageItem<T> = {
      value,
      timestamp: Date.now(),
      ...(ttlMs && { expiresAt: Date.now() + ttlMs })
    }
    
    localStorage.setItem(key, JSON.stringify(item))
    return true
  } catch (error) {
    console.error(`[Storage] Error guardando ${key}:`, error)
    
    // Si es error de quota, intentar limpiar items expirados
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      cleanExpiredItems()
      // Reintentar una vez
      try {
        const item: StorageItem<T> = {
          value,
          timestamp: Date.now(),
          ...(ttlMs && { expiresAt: Date.now() + ttlMs })
        }
        localStorage.setItem(key, JSON.stringify(item))
        return true
      } catch {
        return false
      }
    }
    
    return false
  }
}

/**
 * Obtiene un valor de LocalStorage
 * @param key - Clave a buscar
 * @returns El valor o null si no existe o expiró
 */
export function getItem<T>(key: string): T | null {
  if (!isBrowser) return null
  
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    
    const item: StorageItem<T> = JSON.parse(raw)
    
    // Verificar si expiró
    if (item.expiresAt && Date.now() > item.expiresAt) {
      localStorage.removeItem(key)
      return null
    }
    
    return item.value
  } catch (error) {
    console.error(`[Storage] Error leyendo ${key}:`, error)
    return null
  }
}

/**
 * Obtiene un valor con su metadata
 */
export function getItemWithMeta<T>(key: string): { value: T; timestamp: number } | null {
  if (!isBrowser) return null
  
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    
    const item: StorageItem<T> = JSON.parse(raw)
    
    if (item.expiresAt && Date.now() > item.expiresAt) {
      localStorage.removeItem(key)
      return null
    }
    
    return { value: item.value, timestamp: item.timestamp }
  } catch {
    return null
  }
}

/**
 * Elimina un item de LocalStorage
 */
export function removeItem(key: string): boolean {
  if (!isBrowser) return false
  
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/**
 * Verifica si existe una clave
 */
export function hasItem(key: string): boolean {
  if (!isBrowser) return false
  return getItem(key) !== null
}

/**
 * Obtiene todas las claves que coinciden con un prefijo
 */
export function getKeysByPrefix(prefix: string): string[] {
  if (!isBrowser) return []
  
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(prefix)) {
      keys.push(key)
    }
  }
  return keys
}

/**
 * Elimina todas las claves que coinciden con un prefijo
 */
export function removeByPrefix(prefix: string): number {
  if (!isBrowser) return 0
  
  const keys = getKeysByPrefix(prefix)
  keys.forEach(key => localStorage.removeItem(key))
  return keys.length
}

/**
 * Limpia items expirados
 */
export function cleanExpiredItems(): number {
  if (!isBrowser) return 0
  
  let cleaned = 0
  const now = Date.now()
  
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (!key?.startsWith('wq_')) continue
    
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      
      const item = JSON.parse(raw)
      if (item.expiresAt && now > item.expiresAt) {
        localStorage.removeItem(key)
        cleaned++
      }
    } catch {
      // Ignorar items mal formateados
    }
  }
  
  return cleaned
}

/**
 * Obtiene el tamaño aproximado usado por el prefijo wq_
 */
export function getStorageSize(): { used: number; total: number; percentage: number } {
  if (!isBrowser) return { used: 0, total: 0, percentage: 0 }
  
  let used = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('wq_')) {
      const value = localStorage.getItem(key)
      if (value) {
        used += key.length + value.length
      }
    }
  }
  
  // LocalStorage típicamente tiene 5-10MB de límite
  const total = 5 * 1024 * 1024 // 5MB estimado
  
  return {
    used,
    total,
    percentage: Math.round((used / total) * 100)
  }
}

/**
 * Limpia todo el caché de la aplicación
 */
export function clearAllCache(): void {
  if (!isBrowser) return
  removeByPrefix('wq_')
}
