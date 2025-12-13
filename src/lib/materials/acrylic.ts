/**
 * Acrylic Material - Fluent Design 2
 * Efecto acrílico optimizado con fallbacks automáticos
 */

export interface AcrylicConfig {
  /** Blur radius in pixels (max 12 for performance) */
  blur: number
  /** Tint color (hex or rgba) */
  tintColor: string
  /** Tint opacity (0-1) */
  tintOpacity: number
  /** Saturation multiplier (1 = normal) */
  saturation: number
  /** Fallback solid color for low-performance devices */
  fallbackColor: string
}

// Configuraciones predefinidas optimizadas
export const acrylicPresets = {
  // Acrylic sutil - para cards y elementos pequeños
  subtle: {
    blur: 6,
    tintColor: '#ffffff',
    tintOpacity: 0.7,
    saturation: 1.1,
    fallbackColor: 'rgba(255, 255, 255, 0.92)'
  },
  
  // Acrylic normal - para modales y overlays
  normal: {
    blur: 8,
    tintColor: '#ffffff',
    tintOpacity: 0.65,
    saturation: 1.2,
    fallbackColor: 'rgba(255, 255, 255, 0.88)'
  },
  
  // Acrylic para navegación
  navigation: {
    blur: 10,
    tintColor: '#ffffff',
    tintOpacity: 0.8,
    saturation: 1.15,
    fallbackColor: 'rgba(255, 255, 255, 0.95)'
  },
  
  // Acrylic oscuro (dark mode)
  dark: {
    blur: 8,
    tintColor: '#1a1a1a',
    tintOpacity: 0.75,
    saturation: 1.1,
    fallbackColor: 'rgba(26, 26, 26, 0.92)'
  },
  
  // Acrylic con tinte de marca
  branded: {
    blur: 8,
    tintColor: '#0078d4', // Fluent blue
    tintOpacity: 0.15,
    saturation: 1.2,
    fallbackColor: 'rgba(0, 120, 212, 0.08)'
  }
} as const

export type AcrylicPreset = keyof typeof acrylicPresets

/**
 * Genera las clases CSS para acrylic
 */
export function getAcrylicStyles(preset: AcrylicPreset | AcrylicConfig): string {
  const config = typeof preset === 'string' ? acrylicPresets[preset] : preset
  
  return `
    backdrop-filter: blur(${config.blur}px) saturate(${config.saturation * 100}%);
    -webkit-backdrop-filter: blur(${config.blur}px) saturate(${config.saturation * 100}%);
    background-color: ${hexToRgba(config.tintColor, config.tintOpacity)};
  `
}

/**
 * Genera clases Tailwind para acrylic
 */
export function getAcrylicClasses(preset: AcrylicPreset): string {
  switch (preset) {
    case 'subtle':
      return 'backdrop-blur-sm bg-white/70 supports-[backdrop-filter]:bg-white/70'
    case 'normal':
      return 'backdrop-blur-md bg-white/65 supports-[backdrop-filter]:bg-white/65'
    case 'navigation':
      return 'backdrop-blur bg-white/80 supports-[backdrop-filter]:bg-white/80'
    case 'dark':
      return 'backdrop-blur-md bg-gray-900/75 supports-[backdrop-filter]:bg-gray-900/75'
    case 'branded':
      return 'backdrop-blur-md bg-blue-500/10 supports-[backdrop-filter]:bg-blue-500/10'
  }
}

/**
 * Helper para convertir hex a rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
    return hex
  }
  
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
