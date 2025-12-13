/**
 * Glassmorphism - Fluent Design 2
 * Efecto de cristal esmerilado optimizado
 */

export interface GlassConfig {
  /** Blur amount (keep low for performance) */
  blur: number
  /** Background opacity */
  opacity: number
  /** Border opacity */
  borderOpacity: number
  /** Inner shadow for depth */
  innerShadow: boolean
  /** Tint color */
  tint: 'white' | 'dark' | 'accent'
}

// Presets optimizados para rendimiento
export const glassPresets = {
  // Glass claro sutil
  light: {
    blur: 6,
    opacity: 0.7,
    borderOpacity: 0.2,
    innerShadow: true,
    tint: 'white' as const
  },
  
  // Glass más pronunciado
  frosted: {
    blur: 8,
    opacity: 0.6,
    borderOpacity: 0.25,
    innerShadow: true,
    tint: 'white' as const
  },
  
  // Glass oscuro
  dark: {
    blur: 6,
    opacity: 0.5,
    borderOpacity: 0.15,
    innerShadow: true,
    tint: 'dark' as const
  },
  
  // Glass con tinte de marca
  accent: {
    blur: 8,
    opacity: 0.15,
    borderOpacity: 0.3,
    innerShadow: false,
    tint: 'accent' as const
  },
  
  // Glass minimal (más rendimiento)
  minimal: {
    blur: 4,
    opacity: 0.8,
    borderOpacity: 0.15,
    innerShadow: false,
    tint: 'white' as const
  }
} as const

export type GlassPreset = keyof typeof glassPresets

/**
 * Genera clases Tailwind para glass effect
 */
export function getGlassClasses(preset: GlassPreset): string {
  const base = 'border transition-all duration-200'
  
  switch (preset) {
    case 'light':
      return `${base} backdrop-blur-sm bg-white/70 border-white/20 shadow-lg shadow-black/5`
    case 'frosted':
      return `${base} backdrop-blur-md bg-white/60 border-white/25 shadow-xl shadow-black/5`
    case 'dark':
      return `${base} backdrop-blur-sm bg-gray-900/50 border-white/10 shadow-lg shadow-black/20`
    case 'accent':
      return `${base} backdrop-blur-md bg-light-accent/15 border-light-accent/30 shadow-lg shadow-light-accent/10`
    case 'minimal':
      return `${base} backdrop-blur-[4px] bg-white/80 border-white/15 shadow-md`
  }
}

/**
 * Genera clases para el borde con glow
 */
export function getGlassBorderGlow(color: string = 'light-accent'): string {
  return `
    ring-1 ring-${color}/20 
    hover:ring-${color}/40 
    hover:shadow-[0_0_20px_rgba(0,120,212,0.15)]
  `
}

/**
 * Fallback para dispositivos sin soporte de backdrop-filter
 */
export function getGlassFallback(preset: GlassPreset): string {
  switch (preset) {
    case 'light':
    case 'frosted':
    case 'minimal':
      return 'bg-white/95 border-gray-200/50'
    case 'dark':
      return 'bg-gray-900/95 border-gray-700/50'
    case 'accent':
      return 'bg-light-accent/10 border-light-accent/30'
  }
}
