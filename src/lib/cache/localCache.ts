/**
 * Local Cache Service
 * Gestiona el almacenamiento local para modo offline
 */

// Claves del localStorage
const CACHE_KEYS = {
  SNAPSHOTS: 'webquote_cache_snapshots',
  QUOTATIONS: 'webquote_cache_quotations',
  PREFERENCES: 'webquote_cache_preferences',
  CONFIG: 'webquote_cache_config',
  METADATA: 'webquote_cache_metadata',
} as const;

// Tiempo de expiración por defecto (24 horas)
const DEFAULT_TTL = 24 * 60 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

interface CacheMetadata {
  lastSync: number | null;
  lastSyncSuccess: boolean;
  syncCount: number;
}

const CACHE_VERSION = '1.0.0';

/**
 * Verifica si estamos en el cliente (browser)
 */
function isClient(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Guarda datos en el cache local
 */
export function setCache<T>(key: string, data: T): boolean {
  if (!isClient()) return false;
  
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(key, JSON.stringify(entry));
    return true;
  } catch (error) {
    console.error(`[LocalCache] Error saving to ${key}:`, error);
    // Intentar limpiar espacio si es error de cuota
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldestCache();
    }
    return false;
  }
}

/**
 * Obtiene datos del cache local
 */
export function getCache<T>(key: string, maxAge: number = DEFAULT_TTL): T | null {
  if (!isClient()) return null;
  
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    
    const entry: CacheEntry<T> = JSON.parse(raw);
    
    // Verificar versión
    if (entry.version !== CACHE_VERSION) {
      console.warn(`[LocalCache] Version mismatch for ${key}, clearing`);
      localStorage.removeItem(key);
      return null;
    }
    
    // Verificar expiración
    const age = Date.now() - entry.timestamp;
    if (age > maxAge) {
      console.warn(`[LocalCache] Cache expired for ${key} (age: ${Math.round(age / 1000)}s)`);
      return null;
    }
    
    return entry.data;
  } catch (error) {
    console.error(`[LocalCache] Error reading ${key}:`, error);
    return null;
  }
}

/**
 * Elimina una entrada del cache
 */
export function removeCache(key: string): boolean {
  if (!isClient()) return false;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[LocalCache] Error removing ${key}:`, error);
    return false;
  }
}

/**
 * Limpia todo el cache de la aplicación
 */
export function clearAllCache(): boolean {
  if (!isClient()) return false;
  
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('[LocalCache] All cache cleared');
    return true;
  } catch (error) {
    console.error('[LocalCache] Error clearing cache:', error);
    return false;
  }
}

/**
 * Limpia el cache más antiguo cuando se excede la cuota
 */
function clearOldestCache(): void {
  if (!isClient()) return;
  
  const entries: { key: string; timestamp: number }[] = [];
  
  Object.values(CACHE_KEYS).forEach(key => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const entry = JSON.parse(raw);
        entries.push({ key, timestamp: entry.timestamp || 0 });
      }
    } catch {
      // Ignorar errores de parsing
    }
  });
  
  // Ordenar por timestamp (más antiguos primero) y eliminar el más viejo
  entries.sort((a, b) => a.timestamp - b.timestamp);
  if (entries.length > 0) {
    localStorage.removeItem(entries[0].key);
    console.log(`[LocalCache] Removed oldest cache: ${entries[0].key}`);
  }
}

// ============ Funciones específicas por tipo de dato ============

/**
 * Guarda snapshots en cache local
 */
export function cacheSnapshots(snapshots: unknown[]): boolean {
  return setCache(CACHE_KEYS.SNAPSHOTS, snapshots);
}

/**
 * Obtiene snapshots del cache local
 */
export function getCachedSnapshots<T = unknown[]>(): T | null {
  return getCache<T>(CACHE_KEYS.SNAPSHOTS);
}

/**
 * Guarda quotations en cache local
 */
export function cacheQuotations(quotations: unknown[]): boolean {
  return setCache(CACHE_KEYS.QUOTATIONS, quotations);
}

/**
 * Obtiene quotations del cache local
 */
export function getCachedQuotations<T = unknown[]>(): T | null {
  return getCache<T>(CACHE_KEYS.QUOTATIONS);
}

/**
 * Guarda preferences en cache local
 */
export function cachePreferences(preferences: unknown): boolean {
  return setCache(CACHE_KEYS.PREFERENCES, preferences);
}

/**
 * Obtiene preferences del cache local
 */
export function getCachedPreferences<T = unknown>(): T | null {
  return getCache<T>(CACHE_KEYS.PREFERENCES);
}

/**
 * Guarda config en cache local
 */
export function cacheConfig(config: unknown): boolean {
  return setCache(CACHE_KEYS.CONFIG, config);
}

/**
 * Obtiene config del cache local
 */
export function getCachedConfig<T = unknown>(): T | null {
  return getCache<T>(CACHE_KEYS.CONFIG);
}

// ============ Metadata de sincronización ============

/**
 * Obtiene los metadatos del cache
 */
export function getCacheMetadata(): CacheMetadata {
  if (!isClient()) {
    return { lastSync: null, lastSyncSuccess: false, syncCount: 0 };
  }
  
  try {
    const raw = localStorage.getItem(CACHE_KEYS.METADATA);
    if (!raw) return { lastSync: null, lastSyncSuccess: false, syncCount: 0 };
    return JSON.parse(raw);
  } catch {
    return { lastSync: null, lastSyncSuccess: false, syncCount: 0 };
  }
}

/**
 * Actualiza los metadatos del cache
 */
export function updateCacheMetadata(success: boolean): void {
  if (!isClient()) return;
  
  const current = getCacheMetadata();
  const updated: CacheMetadata = {
    lastSync: Date.now(),
    lastSyncSuccess: success,
    syncCount: current.syncCount + 1,
  };
  
  try {
    localStorage.setItem(CACHE_KEYS.METADATA, JSON.stringify(updated));
  } catch (error) {
    console.error('[LocalCache] Error updating metadata:', error);
  }
}

/**
 * Verifica si hay datos en cache disponibles
 */
export function hasCachedData(): boolean {
  return !!(
    getCachedSnapshots() ||
    getCachedQuotations() ||
    getCachedPreferences() ||
    getCachedConfig()
  );
}

/**
 * Obtiene la antigüedad del cache en milisegundos
 */
export function getCacheAge(key: string): number | null {
  if (!isClient()) return null;
  
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    
    const entry = JSON.parse(raw);
    return Date.now() - (entry.timestamp || 0);
  } catch {
    return null;
  }
}

/**
 * Formatea la antigüedad del cache para mostrar al usuario
 */
export function formatCacheAge(key: string): string {
  const age = getCacheAge(key);
  if (age === null) return 'Sin datos';
  
  const seconds = Math.floor(age / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'Hace unos segundos';
}

// Exportar claves para uso externo
export { CACHE_KEYS };
