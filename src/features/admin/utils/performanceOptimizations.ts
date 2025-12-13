/**
 * PHASE 14: Performance Optimization Utilities
 * Herramientas para optimizar el rendimiento del panel administrativo
 * @date 2025-11-24
 */

import type { PackageSnapshot, ServicioBase } from '@/lib/types'
import { calcularPreviewDescuentos } from '@/lib/utils/discountCalculator'

/**
 * Debounce helper (native implementation)
 */
function createDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 1000,
  options: { leading?: boolean; trailing?: boolean; maxWait?: number } = {}
) {
  let timeoutId: NodeJS.Timeout | null = null
  let lastCallTime: number = 0
  let lastInvokeTime: number = 0

  const { leading = false, trailing = true, maxWait } = options

  return function debounced(...args: Parameters<T>) {
    const time = Date.now()
    const isInvoking = trailing && (time - lastCallTime >= delay) || (maxWait && time - lastInvokeTime >= maxWait)

    lastCallTime = time

    if (isInvoking) {
      if (timeoutId) clearTimeout(timeoutId)
      callback(...args)
      lastInvokeTime = time
    } else if (!timeoutId) {
      timeoutId ??= setTimeout(() => {
        if (trailing) {
          callback(...args)
          lastInvokeTime = Date.now()
        }
        timeoutId = null
      }, delay - (time - lastCallTime))
    }
  }
}

/**
 * Memoize helper (native implementation)
 */
function createMemoize<T extends (...args: any[]) => any>(
  fn: T,
  resolver?: (...args: Parameters<T>) => string
) {
  const cache = new Map<string, ReturnType<T>>()

  return function memoized(...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)

    return result
  }
}

/**
 * Debounce para autoguardado (evita múltiples peticiones)
 */
export const createAutoSaveDebounce = (callback: () => Promise<void>, delay: number = 1000) => {
  return createDebounce(callback, delay, { 
    leading: false, 
    trailing: true,
    maxWait: 5000 
  })
}

/**
 * Memorizar cálculo de costos (evita recalcular si los datos no cambian)
 */
export const calculateCostoInicialMemoized = createMemoize(
  (snapshot: PackageSnapshot) => {
    const preview = calcularPreviewDescuentos(snapshot)
    const desarrolloConDescuento = preview.desarrolloConDescuento
    const serviciosBaseMes1 = snapshot.serviciosBase.reduce((sum, s) => {
      if (s.nombre.toLowerCase() !== 'gestión') {
        return sum + (s.precio || 0)
      }
      return sum
    }, 0)
    return desarrolloConDescuento + serviciosBaseMes1
  },
  (snapshot: PackageSnapshot) => {
    // Serializar solo los campos relevantes para la clave de memoización
    return JSON.stringify({
      desarrollo: snapshot.paquete.desarrollo,
      configDescuentos: JSON.stringify(snapshot.paquete.configDescuentos),
      serviciosBaseIds: snapshot.serviciosBase.map(s => `${s.id}:${s.precio}`).join(',')
    })
  }
)

/**
 * Memorizar cálculo de costo año 1
 */
export const calculateCostoAño1Memoized = createMemoize(
  (snapshot: PackageSnapshot) => {
    const preview = calcularPreviewDescuentos(snapshot)
    const desarrolloConDescuento = preview.desarrolloConDescuento
    const serviciosBaseCosto = snapshot.serviciosBase.reduce((sum, s) => {
      return sum + (s.precio * s.mesesPago)
    }, 0)
    const otrosServiciosTotal = snapshot.otrosServicios.reduce((sum, s) => {
      return sum + s.precio * s.mesesPago
    }, 0)
    return desarrolloConDescuento + serviciosBaseCosto + otrosServiciosTotal
  },
  (snapshot: PackageSnapshot) => {
    return JSON.stringify({
      desarrollo: snapshot.paquete.desarrollo,
      configDescuentos: JSON.stringify(snapshot.paquete.configDescuentos),
      serviciosBaseData: snapshot.serviciosBase.map(s => `${s.id}:${s.precio}:${s.mesesPago}`).join(','),
      otrosServiciosData: snapshot.otrosServicios.map(s => `${s.nombre}:${s.precio}:${s.mesesPago}`).join(',')
    })
  }
)

/**
 * Memorizar cálculo de costo año 2
 */
export const calculateCostoAño2Memoized = createMemoize(
  (snapshot: PackageSnapshot) => {
    const serviciosBaseCosto = snapshot.serviciosBase.reduce((sum, s) => {
      return sum + (s.precio * 12)
    }, 0)
    const otrosServiciosTotal = snapshot.otrosServicios.reduce((sum, s) => {
      return sum + s.precio * 12
    }, 0)
    return serviciosBaseCosto + otrosServiciosTotal
  },
  (snapshot: PackageSnapshot) => {
    return JSON.stringify({
      serviciosBaseData: snapshot.serviciosBase.map(s => `${s.id}:${s.precio}`).join(','),
      otrosServiciosData: snapshot.otrosServicios.map(s => `${s.nombre}:${s.precio}`).join(',')
    })
  }
)

/**
 * Filtrar snapshots activos (memorizado)
 */
export const filterActiveSnapshotsMemoized = createMemoize(
  (snapshots: PackageSnapshot[]) => snapshots.filter(s => s.activo),
  (snapshots: PackageSnapshot[]) => {
    return snapshots.map(s => `${s.id}:${s.activo}`).join(',')
  }
)

/**
 * Agrupar servicios por categoría (memorizado)
 */
export const groupServicesByCategoryMemoized = createMemoize(
  (servicios: ServicioBase[]) => {
    const grouped: { [key: string]: ServicioBase[] } = {}
    servicios.forEach(s => {
      const category = s.nombre.toLowerCase().includes('gestión') ? 'gestion' : 'basicos'
      if (!grouped[category]) grouped[category] = []
      grouped[category].push(s)
    })
    return grouped
  },
  (servicios: ServicioBase[]) => {
    return servicios.map(s => `${s.id}:${s.nombre}`).join(',')
  }
)

/**
 * Validar snapshot (memorizado)
 */
export const validateSnapshotMemoized = createMemoize(
  (snapshot: PackageSnapshot) => {
    const errors: string[] = []
    
    if (!snapshot.nombre) errors.push('Nombre requerido')
    if (snapshot.paquete.desarrollo <= 0) errors.push('Desarrollo debe ser > 0')
    if (snapshot.serviciosBase.length === 0) errors.push('Servicios base requeridos')
    if (snapshot.costos.inicial < 0) errors.push('Costo inicial inválido')
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },
  (snapshot: PackageSnapshot) => {
    return JSON.stringify({
      id: snapshot.id,
      nombre: snapshot.nombre,
      desarrollo: snapshot.paquete.desarrollo,
      serviciosBaseCount: snapshot.serviciosBase.length,
      costosInicial: snapshot.costos.inicial
    })
  }
)

/**
 * Calcular resumen de snapshots (memorizado)
 */
export const calculateSnapshotSummaryMemoized = createMemoize(
  (snapshots: PackageSnapshot[]) => {
    return {
      total: snapshots.length,
      activos: snapshots.filter(s => s.activo).length,
      inactivos: snapshots.filter(s => !s.activo).length,
      costoTotalInicial: snapshots.reduce((sum, s) => sum + (s.costos?.inicial || 0), 0),
      costoTotalAño1: snapshots.reduce((sum, s) => sum + (s.costos?.año1 || 0), 0),
      costoTotalAño2: snapshots.reduce((sum, s) => sum + (s.costos?.año2 || 0), 0),
    }
  },
  (snapshots: PackageSnapshot[]) => {
    return snapshots.map(s => `${s.id}:${s.activo}:${s.costos?.inicial}`).join(',')
  }
)

/**
 * Detectar cambios en objeto (para optimizar renders)
 */
export function hasObjectChanged<T extends Record<string, any>>(
  obj1: T | null,
  obj2: T | null,
  fields?: (keyof T)[]
): boolean {
  if (!obj1 && !obj2) return false
  if (!obj1 || !obj2) return true
  
  const keysToCheck = fields || Object.keys(obj1) as (keyof T)[]
  
  for (const key of keysToCheck) {
    if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
      return true
    }
  }
  
  return false
}

/**
 * Batch updates para evitar múltiples renders
 */
export function batchUpdates<T>(updates: Array<(prev: T) => T>, initialValue: T): T {
  return updates.reduce((acc, update) => update(acc), initialValue)
}

/**
 * Virtualize list rendering para listas grandes
 */
export function getVisibleItems<T>(
  items: T[],
  scrollPosition: number,
  itemHeight: number,
  containerHeight: number
): { visibleItems: T[]; startIndex: number; endIndex: number } {
  const startIndex = Math.floor(scrollPosition / itemHeight)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length)
  
  return {
    visibleItems: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
  }
}

/**
 * Request animation frame wrapper
 */
export function scheduleAnimationFrame(callback: () => void): () => void {
  const id = requestAnimationFrame(callback)
  return () => cancelAnimationFrame(id)
}

/**
 * Intersection Observer helper para lazy loading
 */
export function createIntersectionObserver(
  element: Element,
  onVisible: () => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onVisible()
          observer.unobserve(element)
        }
      })
    },
    {
      threshold: 0.1,
      ...options
    }
  )
  
  observer.observe(element)
  return observer
}

export default {
  createAutoSaveDebounce,
  calculateCostoInicialMemoized,
  calculateCostoAño1Memoized,
  calculateCostoAño2Memoized,
  filterActiveSnapshotsMemoized,
  groupServicesByCategoryMemoized,
  validateSnapshotMemoized,
  calculateSnapshotSummaryMemoized,
  hasObjectChanged,
  batchUpdates,
  getVisibleItems,
  scheduleAnimationFrame,
  createIntersectionObserver,
}
