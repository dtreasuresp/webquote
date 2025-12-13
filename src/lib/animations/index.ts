/**
 * Sistema Global de Animaciones
 * 
 * @example
 * // Importar todo
 * import { AnimatedSection, fadeSlideUp, useCountUp } from '@/lib/animations'
 * 
 * // Importar específico
 * import { fadeSlideUp, scaleIn } from '@/lib/animations/variants'
 * import { useParallax } from '@/lib/animations/hooks'
 */

// Configuración
export * from './config'

// Variants de Framer Motion
export * from './variants'

// Presets combinados
export * from './presets'

// Custom Hooks
export * from './hooks'

// Re-export tipos útiles de Framer Motion
export type { Variants, Transition, MotionProps } from 'framer-motion'
