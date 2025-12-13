/**
 * Configuración global de animaciones
 * Una sola fuente de verdad para todas las animaciones del sitio
 */

// Duraciones estándar (en segundos)
export const duration = {
  fastest: 0.15,
  fast: 0.25,
  normal: 0.4,
  slow: 0.6,
  slower: 0.8,
  slowest: 1.0,
} as const

// Curvas de animación (cubic-bezier)
export const easing = {
  // Suave y natural
  smooth: [0.25, 0.1, 0.25, 1.0],
  // Con rebote sutil
  bouncy: [0.68, -0.15, 0.265, 1.25],
  // Rebote más pronunciado
  elastic: [0.68, -0.55, 0.265, 1.55],
  // Rápido y preciso
  snappy: [0.4, 0, 0.2, 1],
  // Entrada suave
  easeOut: [0, 0, 0.2, 1],
  // Salida suave
  easeIn: [0.4, 0, 1, 1],
  // Entrada y salida suave
  easeInOut: [0.4, 0, 0.2, 1],
  // Microsoft Fluent Design easings
  fluent: [0.16, 1, 0.3, 1], // Principal Fluent motion curve
  fluentAccelerate: [0.9, 0.1, 1, 0.2], // Entrada rápida
  fluentDecelerate: [0.1, 0.9, 0.2, 1], // Salida suave
  fluentStandard: [0.8, 0, 0.2, 1], // Movimiento estándar
} as const

// Configuración del viewport para whileInView
export const viewport = {
  default: { once: true, margin: '-50px' },
  eager: { once: true, margin: '0px' },
  lazy: { once: true, margin: '-100px' },
  repeat: { once: false, margin: '-50px' },
} as const

// Valores de desplazamiento
export const offset = {
  small: 10,
  medium: 20,
  large: 40,
  xlarge: 60,
} as const

// Valores de escala
export const scale = {
  subtle: 0.98,
  small: 0.95,
  medium: 0.9,
  large: 0.8,
} as const

// Stagger delays para listas
export const stagger = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.15,
  slower: 0.2,
  // Microsoft Fluent stagger
  fluent: 0.08,
  fluentFast: 0.04,
  fluentSlow: 0.12,
} as const

// Microsoft Fluent shadows (for hover effects) - Optimized
export const fluentShadow = {
  // Rest states
  rest: '0 1px 2px rgba(0, 0, 0, 0.04)',
  restSubtle: '0 1px 3px rgba(0, 0, 0, 0.03)',
  
  // Hover states
  hover: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
  hoverSubtle: '0 2px 8px rgba(0, 0, 0, 0.06)',
  
  // Active/pressed states
  active: '0 1px 4px rgba(0, 0, 0, 0.06)',
  
  // Elevated surfaces
  elevated: '0 8px 24px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)',
  elevatedHigh: '0 16px 48px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.06)',
  
  // Glow effects
  glow: '0 0 16px rgba(0, 120, 212, 0.2)',
  glowStrong: '0 0 24px rgba(0, 120, 212, 0.3)',
  glowSuccess: '0 0 16px rgba(16, 185, 129, 0.2)',
  glowWarning: '0 0 16px rgba(245, 158, 11, 0.2)',
  glowDanger: '0 0 16px rgba(239, 68, 68, 0.2)',
  
  // Card shadows
  card: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03)',
  cardHover: '0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
} as const

// Microsoft Fluent blur values - Optimized (max 12px for performance)
export const fluentBlur = {
  none: 0,
  subtle: 4,
  normal: 8,
  strong: 12, // Reduced from 16 for performance
  acrylic: 8, // Reduced from 20 for performance
} as const

// Fluent 2 color accents
export const fluentAccent = {
  blue: 'rgb(0, 120, 212)',
  blueLight: 'rgba(0, 120, 212, 0.1)',
  blueMedium: 'rgba(0, 120, 212, 0.2)',
  green: 'rgb(16, 185, 129)',
  greenLight: 'rgba(16, 185, 129, 0.1)',
  orange: 'rgb(245, 158, 11)',
  orangeLight: 'rgba(245, 158, 11, 0.1)',
  red: 'rgb(239, 68, 68)',
  redLight: 'rgba(239, 68, 68, 0.1)',
} as const

// Spring configurations
export const spring = {
  gentle: { type: 'spring', stiffness: 120, damping: 14 },
  wobbly: { type: 'spring', stiffness: 180, damping: 12 },
  stiff: { type: 'spring', stiffness: 300, damping: 20 },
  slow: { type: 'spring', stiffness: 80, damping: 20 },
  // Microsoft Fluent springs
  fluent: { type: 'spring', stiffness: 300, damping: 30 },
  fluentSnappy: { type: 'spring', stiffness: 400, damping: 35 },
  fluentGentle: { type: 'spring', stiffness: 200, damping: 25 },
  fluentBouncy: { type: 'spring', stiffness: 350, damping: 20 },
} as const

// Configuración por defecto
export const defaultConfig = {
  duration: duration.normal,
  easing: easing.smooth,
  viewport: viewport.default,
} as const

export type DurationKey = keyof typeof duration
export type EasingKey = keyof typeof easing
export type ViewportKey = keyof typeof viewport
export type SpringKey = keyof typeof spring
export type StaggerKey = keyof typeof stagger
