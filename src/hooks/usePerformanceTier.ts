'use client'

import { useState, useEffect } from 'react'
import { 
  detectPerformanceTier, 
  getDeviceCapabilities,
  type PerformanceTier,
  type DeviceCapabilities 
} from '@/lib/materials/detection'

/**
 * Hook para detectar el nivel de rendimiento del dispositivo
 * y aplicar efectos apropiados
 */
export function usePerformanceTier() {
  const [tier, setTier] = useState<PerformanceTier>('medium')
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null)

  useEffect(() => {
    // Detectar en cliente
    setTier(detectPerformanceTier())
    setCapabilities(getDeviceCapabilities())
    
    // Escuchar cambios en preferencias de movimiento
    const mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => {
      setTier(detectPerformanceTier())
      setCapabilities(getDeviceCapabilities())
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return {
    tier,
    capabilities,
    isHighPerformance: tier === 'high',
    isMediumPerformance: tier === 'medium',
    isLowPerformance: tier === 'low',
    canUseBlur: tier !== 'low' && (capabilities?.supportsBackdropFilter ?? false),
    prefersReducedMotion: capabilities?.prefersReducedMotion ?? false
  }
}

/**
 * Hook simplificado que solo devuelve si se pueden usar efectos pesados
 */
export function useCanUseHeavyEffects(): boolean {
  const { canUseBlur, prefersReducedMotion } = usePerformanceTier()
  return canUseBlur && !prefersReducedMotion
}
