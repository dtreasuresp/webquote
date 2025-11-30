/**
 * Sistema de Colores Dinámicos
 * 
 * Gestiona los colores corporativos con jerarquía:
 * - Primer color = Primario
 * - Segundo color = Secundario
 * - Tercer color = Terciario
 * - Resto = Colores Alternos
 */

export interface ColorItem {
  nombre: string
  hex: string
}

export interface ColorRole {
  role: 'primary' | 'secondary' | 'tertiary' | 'alternate'
  label: string
  color: ColorItem
  index: number
}

export interface CSSColorVariables {
  '--color-primary': string
  '--color-primary-rgb': string
  '--color-primary-light': string
  '--color-primary-dark': string
  '--color-secondary': string
  '--color-secondary-rgb': string
  '--color-secondary-light': string
  '--color-tertiary': string
  '--color-tertiary-rgb': string
  '--color-tertiary-light': string
  [key: string]: string
}

// Colores por defecto (fallback)
export const DEFAULT_COLORS: ColorItem[] = [
  { nombre: 'Azul Primario', hex: '#2563eb' },
  { nombre: 'Gris Oscuro', hex: '#1f2937' },
  { nombre: 'Azul Claro', hex: '#3b82f6' },
]

/**
 * Convierte un color hex a RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Convierte RGB a string "r, g, b"
 */
export function rgbToString(rgb: { r: number; g: number; b: number }): string {
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`
}

/**
 * Aclara un color hex por un porcentaje (0-1)
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const r = Math.round(rgb.r + (255 - rgb.r) * percent)
  const g = Math.round(rgb.g + (255 - rgb.g) * percent)
  const b = Math.round(rgb.b + (255 - rgb.b) * percent)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Oscurece un color hex por un porcentaje (0-1)
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const r = Math.round(rgb.r * (1 - percent))
  const g = Math.round(rgb.g * (1 - percent))
  const b = Math.round(rgb.b * (1 - percent))

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Obtiene el rol de un color según su posición en el array
 */
export function getColorRole(index: number): 'primary' | 'secondary' | 'tertiary' | 'alternate' {
  switch (index) {
    case 0:
      return 'primary'
    case 1:
      return 'secondary'
    case 2:
      return 'tertiary'
    default:
      return 'alternate'
  }
}

/**
 * Obtiene la etiqueta para mostrar según el rol del color
 */
export function getColorLabel(index: number): string {
  switch (index) {
    case 0:
      return 'Primario'
    case 1:
      return 'Secundario'
    case 2:
      return 'Terciario'
    default:
      return `Alterno ${index - 2}`
  }
}

/**
 * Asigna roles a los colores corporativos
 */
export function assignColorRoles(colors: ColorItem[]): ColorRole[] {
  return colors.map((color, index) => ({
    role: getColorRole(index),
    label: getColorLabel(index),
    color,
    index,
  }))
}

/**
 * Genera las variables CSS a partir de los colores corporativos
 */
export function generateCSSVariables(colors: ColorItem[]): CSSColorVariables {
  const primary = colors[0]?.hex || DEFAULT_COLORS[0].hex
  const secondary = colors[1]?.hex || DEFAULT_COLORS[1].hex
  const tertiary = colors[2]?.hex || colors[0]?.hex || DEFAULT_COLORS[2].hex

  const primaryRgb = hexToRgb(primary)
  const secondaryRgb = hexToRgb(secondary)
  const tertiaryRgb = hexToRgb(tertiary)

  const variables: CSSColorVariables = {
    // Color Primario
    '--color-primary': primary,
    '--color-primary-rgb': primaryRgb ? rgbToString(primaryRgb) : '37, 99, 235',
    '--color-primary-light': lightenColor(primary, 0.9),
    '--color-primary-dark': darkenColor(primary, 0.2),
    
    // Color Secundario
    '--color-secondary': secondary,
    '--color-secondary-rgb': secondaryRgb ? rgbToString(secondaryRgb) : '31, 41, 55',
    '--color-secondary-light': lightenColor(secondary, 0.9),
    
    // Color Terciario
    '--color-tertiary': tertiary,
    '--color-tertiary-rgb': tertiaryRgb ? rgbToString(tertiaryRgb) : '59, 130, 246',
    '--color-tertiary-light': lightenColor(tertiary, 0.9),
  }

  // Añadir colores alternos si existen
  colors.slice(3).forEach((color, idx) => {
    const altIndex = idx + 1
    const rgb = hexToRgb(color.hex)
    variables[`--color-alternate-${altIndex}`] = color.hex
    variables[`--color-alternate-${altIndex}-rgb`] = rgb ? rgbToString(rgb) : '128, 128, 128'
    variables[`--color-alternate-${altIndex}-light`] = lightenColor(color.hex, 0.9)
  })

  return variables
}

/**
 * Aplica las variables CSS al documento
 */
export function applyCSSVariables(variables: CSSColorVariables): void {
  if (typeof document === 'undefined') return
  
  Object.entries(variables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value)
  })
}

/**
 * Remueve las variables CSS del documento
 */
export function removeCSSVariables(variables: CSSColorVariables): void {
  if (typeof document === 'undefined') return
  
  Object.keys(variables).forEach((key) => {
    document.documentElement.style.removeProperty(key)
  })
}

/**
 * Ordena colores por frecuencia de aparición (para detección de colores)
 * El color más frecuente será el primario, el segundo más frecuente el secundario, etc.
 */
export function sortColorsByFrequency(
  colors: Array<{ hex: string; count: number; nombre?: string }>
): ColorItem[] {
  return colors
    .sort((a, b) => b.count - a.count)
    .map((c, index) => ({
      nombre: c.nombre || getColorLabel(index),
      hex: c.hex,
    }))
}

/**
 * Calcula el contraste entre dos colores (para accesibilidad)
 * Retorna un valor entre 1 y 21 (21 es máximo contraste)
 */
export function calculateContrast(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  
  if (!rgb1 || !rgb2) return 1
  
  const luminance = (rgb: { r: number; g: number; b: number }): number => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  const l1 = luminance(rgb1)
  const l2 = luminance(rgb2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Determina si un color es oscuro o claro
 */
export function isColorDark(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  
  // Fórmula de luminosidad relativa
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return brightness < 128
}

/**
 * Obtiene un color de texto apropiado (blanco o negro) según el fondo
 */
export function getContrastTextColor(backgroundColor: string): string {
  return isColorDark(backgroundColor) ? '#ffffff' : '#000000'
}
