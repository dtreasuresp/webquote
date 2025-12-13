'use client'

import { motion, type HTMLMotionProps, type Variant } from 'framer-motion'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { viewport, spring, duration, easing, fluentBlur } from '@/lib/animations/config'

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'

interface FluentRevealProps extends HTMLMotionProps<'div'> {
  /** Animation direction */
  direction?: RevealDirection
  /** Add blur effect on reveal */
  blur?: boolean
  /** Delay before animation starts */
  delay?: number
  /** Duration override */
  animationDuration?: number
  /** Use spring animation instead of easing */
  useSpring?: boolean
  /** Only animate once */
  once?: boolean
  /** Viewport margin for triggering */
  margin?: string
  children?: React.ReactNode
}

interface RevealVariants {
  hidden: Variant
  visible: Variant
}

const getVariants = (direction: RevealDirection, blur: boolean): RevealVariants => {
  const blurValue = blur ? `blur(${fluentBlur.subtle}px)` : 'blur(0px)'
  
  const directions: Record<RevealDirection, RevealVariants> = {
    up: {
      hidden: { opacity: 0, y: 40, filter: blurValue },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
    },
    down: {
      hidden: { opacity: 0, y: -40, filter: blurValue },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
    },
    left: {
      hidden: { opacity: 0, x: 40, filter: blurValue },
      visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
    },
    right: {
      hidden: { opacity: 0, x: -40, filter: blurValue },
      visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9, filter: blurValue },
      visible: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    },
    fade: {
      hidden: { opacity: 0, filter: blurValue },
      visible: { opacity: 1, filter: 'blur(0px)' },
    },
  }
  
  return directions[direction]
}

/**
 * FluentReveal - Animación de entrada con estilo Fluent
 * 
 * @example
 * <FluentReveal direction="up" blur delay={0.2}>
 *   <h2>Título animado</h2>
 * </FluentReveal>
 */
export const FluentReveal = forwardRef<HTMLDivElement, FluentRevealProps>(
  function FluentReveal(
    {
      direction = 'up',
      blur = true,
      delay = 0,
      animationDuration,
      useSpring = false,
      once = true,
      margin = '-50px',
      className,
      children,
      ...props
    },
    ref
  ) {
    const variants = getVariants(direction, blur)
    
    const transition = useSpring
      ? { ...spring.fluent, delay }
      : { 
          duration: animationDuration ?? duration.slow, 
          ease: easing.fluent, 
          delay 
        }

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin }}
        variants={{
          hidden: variants.hidden,
          visible: {
            ...variants.visible,
            transition,
          },
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

/**
 * FluentRevealGroup - Contenedor para animaciones staggered
 */
interface FluentRevealGroupProps extends HTMLMotionProps<'div'> {
  /** Stagger delay between children */
  stagger?: number
  /** Delay before starting */
  delay?: number
  children?: React.ReactNode
}

export const FluentRevealGroup = forwardRef<HTMLDivElement, FluentRevealGroupProps>(
  function FluentRevealGroup(
    { stagger = 0.08, delay = 0.1, className, children, ...props },
    ref
  ) {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={viewport.default}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: stagger,
              delayChildren: delay,
            },
          },
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

/**
 * FluentRevealItem - Item dentro de un FluentRevealGroup
 */
interface FluentRevealItemProps extends HTMLMotionProps<'div'> {
  direction?: 'up' | 'left' | 'right' | 'scale'
  children?: React.ReactNode
}

export const FluentRevealItem = forwardRef<HTMLDivElement, FluentRevealItemProps>(
  function FluentRevealItem(
    { direction = 'up', className, children, ...props },
    ref
  ) {
    const offsets = {
      up: { y: 20, x: 0 },
      left: { y: 0, x: 20 },
      right: { y: 0, x: -20 },
      scale: { y: 0, x: 0 },
    }
    
    return (
      <motion.div
        ref={ref}
        variants={{
          hidden: { 
            opacity: 0, 
            y: offsets[direction].y,
            x: offsets[direction].x,
            scale: direction === 'scale' ? 0.95 : 1,
            filter: `blur(${fluentBlur.subtle}px)`
          },
          visible: { 
            opacity: 1, 
            y: 0,
            x: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
              duration: duration.normal,
              ease: easing.fluent,
            }
          },
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
