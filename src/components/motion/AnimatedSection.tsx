'use client'

/**
 * AnimatedSection - Wrapper para secciones con animaciones
 * 
 * @example
 * <AnimatedSection animation="fadeSlideUp">
 *   <MySection />
 * </AnimatedSection>
 * 
 * <AnimatedSection animation="clipRevealUp" delay={0.2} duration={0.6}>
 *   <Hero />
 * </AnimatedSection>
 */

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { Variants } from 'framer-motion'
import { 
  getVariants, 
  withDelay, 
  type AnimationVariant 
} from '@/lib/animations/variants'
import { viewport as viewportConfig } from '@/lib/animations/config'
import { useReducedMotion } from '@/lib/animations/hooks'

interface AnimatedSectionProps {
  children: ReactNode
  animation?: AnimationVariant
  /** Delay antes de iniciar la animación (en segundos) */
  delay?: number
  /** Duración de la animación (en segundos) */
  duration?: number
  /** Ejecutar solo una vez */
  once?: boolean
  /** Margen del viewport para activar */
  margin?: string
  /** Clases CSS adicionales */
  className?: string
  /** ID del elemento */
  id?: string
  /** Variantes personalizadas (sobrescribe animation) */
  customVariants?: Variants
  /** Tag HTML a usar (por defecto div) */
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer'
}

export default function AnimatedSection({
  children,
  animation = 'fadeSlideUp',
  delay = 0,
  duration,
  once = true,
  margin = '-50px',
  className = '',
  id,
  customVariants,
  as = 'div',
}: AnimatedSectionProps) {
  const reducedMotion = useReducedMotion()
  
  // Si el usuario prefiere movimiento reducido, usar fade simple
  const baseVariants = customVariants || getVariants(
    reducedMotion ? 'fade' : animation
  )
  
  // Aplicar delay si se especifica
  const variants = delay > 0 ? withDelay(baseVariants, delay) : baseVariants

  // Modificar duración si se especifica
  const finalVariants = duration 
    ? {
        ...variants,
        visible: {
          ...variants.visible,
          transition: {
            ...(variants.visible as { transition?: object }).transition,
            duration
          }
        }
      }
    : variants

  const MotionComponent = motion[as]

  return (
    <MotionComponent
      id={id}
      className={className}
      variants={finalVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
    >
      {children}
    </MotionComponent>
  )
}
