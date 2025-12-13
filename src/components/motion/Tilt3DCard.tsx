'use client'

/**
 * Tilt3DCard - Card con efecto de inclinación 3D al mover el mouse
 * 
 * @example
 * <Tilt3DCard intensity={15}>
 *   <div className="p-8 bg-white rounded-xl">
 *     <h3>Hover me!</h3>
 *   </div>
 * </Tilt3DCard>
 */

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useTilt3D, useReducedMotion } from '@/lib/animations/hooks'

interface Tilt3DCardProps {
  children: ReactNode
  /** Intensidad del efecto (1-30) */
  intensity?: number
  /** Clases CSS */
  className?: string
  /** Perspectiva CSS */
  perspective?: number
  /** Mostrar brillo/reflejo */
  glare?: boolean
}

export default function Tilt3DCard({
  children,
  intensity = 15,
  className = '',
  perspective = 1000,
  glare = false,
}: Tilt3DCardProps) {
  const reducedMotion = useReducedMotion()
  const { ref, style, handlers } = useTilt3D(intensity)

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div 
      style={{ perspective: `${perspective}px` }}
      className="relative"
    >
      <motion.div
        ref={ref}
        className={className}
        style={style}
        {...handlers}
      >
        {children}
        
        {glare && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-inherit"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)',
              opacity: 0.5,
            }}
          />
        )}
      </motion.div>
    </div>
  )
}
