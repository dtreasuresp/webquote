/**
 * Performance Detection System
 * Detecta capacidades del dispositivo para aplicar efectos apropiados
 */

export type PerformanceTier = 'high' | 'medium' | 'low'

export interface DeviceCapabilities {
  tier: PerformanceTier
  supportsBackdropFilter: boolean
  prefersReducedMotion: boolean
  isLowPowerMode: boolean
  hasDiscreteGPU: boolean
}

// Helper para verificar si estamos en el cliente
const isClient = (): boolean => {
  try {
    return globalThis.window !== undefined
  } catch {
    return false
  }
}

/**
 * Detecta si el usuario prefiere movimiento reducido
 */
export function prefersReducedMotion(): boolean {
  if (!isClient()) return false
  return globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Detecta si el navegador soporta backdrop-filter
 */
export function supportsBackdropFilter(): boolean {
  if (!isClient()) return false
  return CSS.supports('backdrop-filter', 'blur(1px)') || 
         CSS.supports('-webkit-backdrop-filter', 'blur(1px)')
}

/**
 * Detecta si es un dispositivo móvil
 */
export function isMobileDevice(): boolean {
  if (!isClient()) return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Detecta si tiene GPU integrada (generalmente menos potente)
 */
export function hasIntegratedGPU(): boolean {
  if (!isClient()) return true
  
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        // Intel/AMD integrated GPUs
        return renderer.toLowerCase().includes('intel') || 
               renderer.toLowerCase().includes('llvmpipe') ||
               renderer.toLowerCase().includes('swiftshader')
      }
    }
  } catch {
    // Si falla, asumimos GPU integrada por seguridad
  }
  
  return true
}

/**
 * Detecta el nivel de rendimiento del dispositivo
 */
export function detectPerformanceTier(): PerformanceTier {
  if (!isClient()) return 'medium'
  
  // Si prefiere movimiento reducido, usar tier bajo
  if (prefersReducedMotion()) return 'low'
  
  // Móviles = tier medio por defecto
  if (isMobileDevice()) return 'medium'
  
  // GPU integrada = tier medio
  if (hasIntegratedGPU()) return 'medium'
  
  // Si tiene GPU dedicada y no hay restricciones = tier alto
  return 'high'
}

/**
 * Obtiene las capacidades completas del dispositivo
 */
export function getDeviceCapabilities(): DeviceCapabilities {
  const tier = detectPerformanceTier()
  
  return {
    tier,
    supportsBackdropFilter: supportsBackdropFilter(),
    prefersReducedMotion: prefersReducedMotion(),
    isLowPowerMode: tier === 'low',
    hasDiscreteGPU: !hasIntegratedGPU()
  }
}

/**
 * Hook-friendly: devuelve clases CSS según el tier
 */
export function getPerformanceClasses(): string {
  const tier = detectPerformanceTier()
  
  switch (tier) {
    case 'high':
      return 'perf-high'
    case 'medium':
      return 'perf-medium'
    case 'low':
      return 'perf-low'
  }
}
