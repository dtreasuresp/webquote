'use client'

/**
 * AnimatedCard - Card con animación de entrada y hover
 * 
 * @example
 * <AnimatedCard entrance="scaleIn" hover="lift">
 *   <div className="p-6">Content</div>
 * </AnimatedCard>
 * 
 * <AnimatedCard entrance="fadeSlideUp" hover="tilt" className="bg-white">
 *   <h3>Title</h3>
 *   <p>Description</p>
 * </AnimatedCard>
 */

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { 
  getVariants, 
  withDelay,
  hoverLift,
  hoverScale,
  hoverScaleLarge,
  hoverGlow,
  hoverTilt,
  tapShrink,
  tapPush,
  type AnimationVariant 
} from '@/lib/animations/variants'
import { useReducedMotion } from '@/lib/animations/hooks'

type HoverEffect = 'lift' | 'scale' | 'scaleLarge' | 'glow' | 'tilt' | 'none'
type TapEffect = 'shrink' | 'push' | 'none'

interface AnimatedCardProps {
  children: ReactNode
  /** Animación de entrada */
  entrance?: AnimationVariant
  /** Efecto hover */
  hover?: HoverEffect
  /** Efecto al hacer clic */
  tap?: TapEffect
  /** Delay antes de la animación */
  delay?: number
  /** Clases CSS */
  className?: string
  /** Ejecutar solo una vez */
  once?: boolean
  /** Callback onClick */
  onClick?: () => void
}

const hoverEffects = {
  lift: hoverLift,
  scale: hoverScale,
  scaleLarge: hoverScaleLarge,
  glow: hoverGlow,
  tilt: hoverTilt,
  none: {},
}

const tapEffects = {
  shrink: tapShrink,
  push: tapPush,
  none: {},
}

export default function AnimatedCard({
  children,
  entrance = 'fadeSlideUp',
  hover = 'lift',
  tap = 'shrink',
  delay = 0,
  className = '',
  once = true,
  onClick,
}: AnimatedCardProps) {
  const reducedMotion = useReducedMotion()
  
  const baseVariants = getVariants(reducedMotion ? 'fade' : entrance)
  const variants = delay > 0 ? withDelay(baseVariants, delay) : baseVariants
  
  // Si hay movimiento reducido, deshabilitar hover y tap
  const whileHover = reducedMotion ? {} : hoverEffects[hover]
  const whileTap = reducedMotion ? {} : tapEffects[tap]

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      whileHover={whileHover}
      whileTap={whileTap}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      {children}
    </motion.div>
  )
}
