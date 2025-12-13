/**
 * Mica Material - Fluent Design 2
 * Fondo sutil que simula el efecto Mica de Windows 11
 * Optimizado para web con CSS puro (sin carga GPU pesada)
 */

export interface MicaConfig {
  /** Base color */
  baseColor: string
  /** Tint strength (0-1) */
  tintStrength: number
  /** Noise texture opacity (0-1) */
  noiseOpacity: number
  /** Gradient overlay */
  gradient: string
}

// Configuraciones predefinidas
export const micaPresets = {
  // Mica light - fondo principal claro
  light: {
    baseColor: '#f5f5f5',
    tintStrength: 0.05,
    noiseOpacity: 0.02,
    gradient: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(245,245,245,0.9) 100%)'
  },
  
  // Mica Alt - con más tinte (para title bars)
  lightAlt: {
    baseColor: '#ebebeb',
    tintStrength: 0.08,
    noiseOpacity: 0.03,
    gradient: 'linear-gradient(180deg, rgba(235,235,235,0.95) 0%, rgba(245,245,245,0.9) 100%)'
  },
  
  // Mica dark
  dark: {
    baseColor: '#202020',
    tintStrength: 0.08,
    noiseOpacity: 0.04,
    gradient: 'linear-gradient(135deg, rgba(32,32,32,0.95) 0%, rgba(28,28,28,0.98) 100%)'
  },
  
  // Mica dark alt
  darkAlt: {
    baseColor: '#1a1a1a',
    tintStrength: 0.1,
    noiseOpacity: 0.05,
    gradient: 'linear-gradient(180deg, rgba(26,26,26,0.98) 0%, rgba(20,20,20,0.95) 100%)'
  }
} as const

export type MicaPreset = keyof typeof micaPresets

/**
 * Genera clases Tailwind para simular Mica
 * Usa gradientes sutiles en lugar de blur pesado
 */
export function getMicaClasses(preset: MicaPreset): string {
  switch (preset) {
    case 'light':
      return 'bg-gradient-to-br from-white/90 via-gray-50/95 to-gray-100/90'
    case 'lightAlt':
      return 'bg-gradient-to-b from-gray-100/95 via-gray-50/90 to-white/85'
    case 'dark':
      return 'bg-gradient-to-br from-gray-900/95 via-gray-800/98 to-gray-900/95'
    case 'darkAlt':
      return 'bg-gradient-to-b from-gray-950/98 via-gray-900/95 to-gray-800/90'
  }
}

/**
 * Genera CSS inline para Mica con noise texture
 */
export function getMicaStyle(preset: MicaPreset): React.CSSProperties {
  const config = micaPresets[preset]
  
  return {
    backgroundColor: config.baseColor,
    backgroundImage: `
      ${config.gradient},
      url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")
    `,
    backgroundBlendMode: 'overlay',
  }
}
