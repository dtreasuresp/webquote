'use client'

/**
 * AnimatedList - Lista con animación stagger
 * 
 * @example
 * <AnimatedList animation="fadeSlideUp" staggerDelay={0.1}>
 *   {items.map(item => <Card key={item.id} {...item} />)}
 * </AnimatedList>
 * 
 * // Con grid
 * <AnimatedList 
 *   animation="scaleIn" 
 *   className="grid grid-cols-3 gap-4"
 *   staggerDelay={0.05}
 * >
 *   {items.map(item => <Card key={item.id} {...item} />)}
 * </AnimatedList>
 */

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Children, isValidElement, cloneElement } from 'react'
import { 
  getVariants,
  staggerContainer,
  type AnimationVariant 
} from '@/lib/animations/variants'
import { stagger as staggerConfig } from '@/lib/animations/config'
import { useReducedMotion } from '@/lib/animations/hooks'

interface AnimatedListProps {
  children: ReactNode
  /** Animación para cada item */
  animation?: AnimationVariant
  /** Delay entre cada item (en segundos) */
  staggerDelay?: number
  /** Delay inicial antes de empezar */
  initialDelay?: number
  /** Clases CSS del contenedor */
  className?: string
  /** Ejecutar solo una vez */
  once?: boolean
  /** Tag del contenedor */
  as?: 'div' | 'ul' | 'ol' | 'section'
}

export default function AnimatedList({
  children,
  animation = 'fadeSlideUp',
  staggerDelay = staggerConfig.normal,
  initialDelay = 0,
  className = '',
  once = true,
  as = 'div',
}: AnimatedListProps) {
  const reducedMotion = useReducedMotion()
  
  const itemVariants = getVariants(reducedMotion ? 'fade' : animation)
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : staggerDelay,
        delayChildren: initialDelay,
      }
    }
  }

  const MotionContainer = motion[as]

  // Envolver cada hijo en un motion.div con las variants del item
  const animatedChildren = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child

    return (
      <motion.div key={child.key ?? index} variants={itemVariants}>
        {child}
      </motion.div>
    )
  })

  return (
    <MotionContainer
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
    >
      {animatedChildren}
    </MotionContainer>
  )
}

/**
 * AnimatedListItem - Item individual para usar dentro de AnimatedList
 * Útil cuando necesitas más control sobre cada item
 */
interface AnimatedListItemProps {
  children: ReactNode
  className?: string
  /** Índice para calcular delay (opcional, se calcula automáticamente en AnimatedList) */
  index?: number
}

export function AnimatedListItem({
  children,
  className = '',
}: AnimatedListItemProps) {
  return (
    <motion.div className={className}>
      {children}
    </motion.div>
  )
}
