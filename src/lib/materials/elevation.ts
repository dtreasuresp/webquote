/**
 * Elevation System - Fluent Design 2
 * Sistema de profundidad con sombras optimizadas
 */

export interface ElevationConfig {
  shadow: string
  border: string
  transform: string
}

// Niveles de elevación Fluent
export const elevationLevels = {
  // Nivel 0 - Sin elevación (rest state)
  rest: {
    shadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    border: 'rgba(0, 0, 0, 0.05)',
    transform: 'translateY(0)'
  },
  
  // Nivel 1 - Elevación sutil (hover suave)
  raised: {
    shadow: '0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
    border: 'rgba(0, 0, 0, 0.08)',
    transform: 'translateY(-1px)'
  },
  
  // Nivel 2 - Elevación media (cards hover)
  floating: {
    shadow: '0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
    border: 'rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)'
  },
  
  // Nivel 3 - Elevación alta (modales, dropdowns)
  overlay: {
    shadow: '0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)',
    border: 'rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-4px)'
  },
  
  // Nivel 4 - Máxima elevación (dialogs importantes)
  dialog: {
    shadow: '0 16px 32px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)',
    border: 'rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-6px)'
  }
} as const

export type ElevationLevel = keyof typeof elevationLevels

// Sombras con color (glow effects)
export const glowShadows = {
  // Glow azul (accent)
  accent: '0 0 20px rgba(0, 120, 212, 0.2)',
  accentStrong: '0 0 30px rgba(0, 120, 212, 0.35)',
  
  // Glow verde (success)
  success: '0 0 20px rgba(16, 185, 129, 0.2)',
  successStrong: '0 0 30px rgba(16, 185, 129, 0.35)',
  
  // Glow naranja (warning)
  warning: '0 0 20px rgba(245, 158, 11, 0.2)',
  
  // Glow rojo (danger)
  danger: '0 0 20px rgba(239, 68, 68, 0.2)',
  
  // Glow neutral
  neutral: '0 0 20px rgba(0, 0, 0, 0.1)'
} as const

export type GlowType = keyof typeof glowShadows

/**
 * Genera clases Tailwind para elevación
 */
export function getElevationClasses(level: ElevationLevel): string {
  const classes: Record<ElevationLevel, string> = {
    rest: 'shadow-sm border border-black/5',
    raised: 'shadow-md border border-black/8 -translate-y-px',
    floating: 'shadow-lg border border-black/10 -translate-y-0.5',
    overlay: 'shadow-xl border border-black/12 -translate-y-1',
    dialog: 'shadow-2xl border border-black/15 -translate-y-1.5'
  }
  return classes[level]
}

/**
 * Genera transición de elevación para hover
 */
export function getElevationTransition(from: ElevationLevel, to: ElevationLevel): {
  initial: string
  hover: string
} {
  return {
    initial: getElevationClasses(from),
    hover: getElevationClasses(to)
  }
}

/**
 * Clases para hover con elevación fluida
 */
export function getHoverElevation(level: 'subtle' | 'normal' | 'high' = 'normal'): string {
  switch (level) {
    case 'subtle':
      return 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5'
    case 'normal':
      return 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1'
    case 'high':
      return 'transition-all duration-200 hover:shadow-xl hover:-translate-y-1.5'
  }
}

/**
 * Clases para glow en hover
 */
export function getGlowOnHover(type: GlowType = 'accent'): string {
  const glowClass = {
    accent: 'hover:shadow-[0_0_20px_rgba(0,120,212,0.2)]',
    accentStrong: 'hover:shadow-[0_0_30px_rgba(0,120,212,0.35)]',
    success: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    successStrong: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]',
    warning: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    danger: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    neutral: 'hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]'
  }
  
  return `transition-shadow duration-200 ${glowClass[type]}`
}
