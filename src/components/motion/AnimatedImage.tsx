'use client'

/**
 * AnimatedImage - Imagen con animación de entrada
 * 
 * @example
 * <AnimatedImage 
 *   src="/hero.jpg" 
 *   alt="Hero" 
 *   effect="reveal"
 * />
 * 
 * <AnimatedImage 
 *   src="/product.jpg" 
 *   alt="Product"
 *   effect="zoom"
 *   hoverEffect="scale"
 * />
 */

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { ImageProps } from 'next/image'
import { duration as durationConfig, easing } from '@/lib/animations/config'
import { useReducedMotion } from '@/lib/animations/hooks'

type ImageEffect = 'fade' | 'zoom' | 'reveal' | 'blur' | 'slideUp'
type HoverEffect = 'scale' | 'brightness' | 'none'

interface AnimatedImageProps extends Omit<ImageProps, 'onLoad'> {
  /** Imagen source (requerido) */
  src: ImageProps['src']
  /** Texto alternativo (requerido) */
  alt: string
  /** Efecto de entrada */
  effect?: ImageEffect
  /** Efecto hover */
  hoverEffect?: HoverEffect
  /** Delay de la animación */
  delay?: number
  /** Duración de la animación */
  duration?: number
  /** Clases del contenedor */
  containerClassName?: string
  /** Ejecutar solo una vez */
  once?: boolean
}

export default function AnimatedImage({
  effect = 'fade',
  hoverEffect = 'none',
  delay = 0,
  duration,
  containerClassName = '',
  once = true,
  ...imageProps
}: AnimatedImageProps) {
  const reducedMotion = useReducedMotion()
  const animDuration = duration ?? durationConfig.slow

  const getInitialStyles = () => {
    if (reducedMotion) return { opacity: 0 }
    
    switch (effect) {
      case 'zoom':
        return { opacity: 0, scale: 1.1 }
      case 'reveal':
        return { opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' }
      case 'blur':
        return { opacity: 0, filter: 'blur(20px)' }
      case 'slideUp':
        return { opacity: 0, y: 30 }
      case 'fade':
      default:
        return { opacity: 0 }
    }
  }

  const getAnimateStyles = () => {
    if (reducedMotion) return { opacity: 1 }
    
    switch (effect) {
      case 'zoom':
        return { opacity: 1, scale: 1 }
      case 'reveal':
        return { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }
      case 'blur':
        return { opacity: 1, filter: 'blur(0px)' }
      case 'slideUp':
        return { opacity: 1, y: 0 }
      case 'fade':
      default:
        return { opacity: 1 }
    }
  }

  const getHoverStyles = () => {
    if (reducedMotion || hoverEffect === 'none') return {}
    
    switch (hoverEffect) {
      case 'scale':
        return { scale: 1.05 }
      case 'brightness':
        return { filter: 'brightness(1.1)' }
      default:
        return {}
    }
  }

  return (
    <motion.div
      className={`overflow-hidden ${containerClassName}`}
      initial={getInitialStyles()}
      whileInView={getAnimateStyles()}
      whileHover={getHoverStyles()}
      viewport={{ once }}
      transition={{ 
        duration: animDuration, 
        delay, 
        ease: easing.easeOut 
      }}
    >
      <Image {...imageProps} />
    </motion.div>
  )
}
