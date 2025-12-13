'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { spring, fluentShadow } from '@/lib/animations/config'

type HoverEffect = 'lift' | 'glow' | 'scale' | 'tilt' | 'press' | 'none'
type GlowColor = 'accent' | 'success' | 'warning' | 'danger' | 'neutral'

interface FluentHoverProps extends HTMLMotionProps<'div'> {
  /** Hover effect type */
  effect?: HoverEffect
  /** Glow color (when effect is 'glow') */
  glowColor?: GlowColor
  /** Include tap/press animation */
  withTap?: boolean
  /** Scale amount for scale effect */
  scaleAmount?: number
  /** Lift amount in pixels */
  liftAmount?: number
  children?: React.ReactNode
}

const glowColors: Record<GlowColor, string> = {
  accent: fluentShadow.glow,
  success: fluentShadow.glowSuccess,
  warning: fluentShadow.glowWarning,
  danger: fluentShadow.glowDanger,
  neutral: '0 0 16px rgba(0, 0, 0, 0.1)',
}

const getHoverAnimation = (
  effect: HoverEffect,
  glowColor: GlowColor,
  scaleAmount: number,
  liftAmount: number
) => {
  switch (effect) {
    case 'lift':
      return { 
        y: -liftAmount, 
        boxShadow: fluentShadow.cardHover,
      }
    case 'glow':
      return { 
        boxShadow: glowColors[glowColor],
      }
    case 'scale':
      return { 
        scale: scaleAmount,
      }
    case 'tilt':
      return { 
        rotateX: -2, 
        rotateY: 2,
        scale: 1.01,
      }
    case 'press':
      return { 
        scale: 0.98,
      }
    case 'none':
      return {}
  }
}

const getTapAnimation = (effect: HoverEffect) => {
  switch (effect) {
    case 'lift':
      return { y: 0, scale: 0.98 }
    case 'scale':
    case 'tilt':
      return { scale: 0.96 }
    default:
      return { scale: 0.98 }
  }
}

/**
 * FluentHover - Wrapper con efectos hover Fluent
 * 
 * @example
 * <FluentHover effect="lift" withTap>
 *   <button>Botón interactivo</button>
 * </FluentHover>
 */
export const FluentHover = forwardRef<HTMLDivElement, FluentHoverProps>(
  function FluentHover(
    {
      effect = 'lift',
      glowColor = 'accent',
      withTap = false,
      scaleAmount = 1.02,
      liftAmount = 4,
      className,
      children,
      ...props
    },
    ref
  ) {
    const hoverAnimation = getHoverAnimation(effect, glowColor, scaleAmount, liftAmount)
    const tapAnimation = getTapAnimation(effect)

    return (
      <motion.div
        ref={ref}
        whileHover={effect === 'none' ? undefined : hoverAnimation}
        whileTap={withTap ? tapAnimation : undefined}
        transition={spring.fluent}
        className={cn(
          'transition-colors duration-200',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

/**
 * FluentTap - Componente solo para efecto de tap/press
 */
interface FluentTapProps extends HTMLMotionProps<'div'> {
  /** Scale on press */
  pressScale?: number
  children?: React.ReactNode
}

export const FluentTap = forwardRef<HTMLDivElement, FluentTapProps>(
  function FluentTap(
    { pressScale = 0.97, className, children, ...props },
    ref
  ) {
    return (
      <motion.div
        ref={ref}
        whileTap={{ scale: pressScale }}
        transition={{ duration: 0.1 }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
