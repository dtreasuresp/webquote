'use client'

/**
 * ParallaxSection - Sección con efecto parallax
 * 
 * @example
 * <ParallaxSection speed={0.5}>
 *   <Image src="/bg.jpg" fill alt="" />
 * </ParallaxSection>
 * 
 * <ParallaxSection speed={0.3} direction="down">
 *   <div className="h-96 bg-gradient-to-b from-blue-500 to-purple-600" />
 * </ParallaxSection>
 */

import { motion, useScroll, useTransform } from 'framer-motion'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import { useReducedMotion } from '@/lib/animations/hooks'

interface ParallaxSectionProps {
  children: ReactNode
  /** Velocidad del efecto (0-1) */
  speed?: number
  /** Dirección del movimiento */
  direction?: 'up' | 'down'
  /** Clases CSS */
  className?: string
  /** Clases del contenedor interno */
  innerClassName?: string
}

export default function ParallaxSection({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
  innerClassName = '',
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const multiplier = direction === 'up' ? -1 : 1
  const yRange = 100 * speed
  
  const y = useTransform(
    scrollYProgress, 
    [0, 1], 
    [yRange * multiplier, -yRange * multiplier]
  )

  if (reducedMotion) {
    return (
      <div ref={ref} className={className}>
        <div className={innerClassName}>{children}</div>
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className={innerClassName}>
        {children}
      </motion.div>
    </div>
  )
}

/**
 * ParallaxLayer - Capa individual con parallax (para composición)
 */
interface ParallaxLayerProps {
  children: ReactNode
  speed?: number
  className?: string
}

export function ParallaxLayer({
  children,
  speed = 0.5,
  className = '',
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [-50 * speed, 50 * speed])

  if (reducedMotion) {
    return <div ref={ref} className={className}>{children}</div>
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}
