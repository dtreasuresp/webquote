'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { spring, fluentShadow } from '@/lib/animations/config'

type ElevationLevel = 'flat' | 'raised' | 'floating' | 'overlay'

interface FluentSurfaceProps extends HTMLMotionProps<'div'> {
  /** Elevation level */
  elevation?: ElevationLevel
  /** Elevation on hover (auto-upgrades one level) */
  elevateOnHover?: boolean
  /** Interactive (adds hover/tap states) */
  interactive?: boolean
  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  /** Add subtle border */
  bordered?: boolean
  /** Background style */
  bg?: 'white' | 'gray' | 'gradient' | 'transparent'
  children?: React.ReactNode
}

const elevationStyles: Record<ElevationLevel, string> = {
  flat: 'shadow-none',
  raised: 'shadow-sm',
  floating: 'shadow-md',
  overlay: 'shadow-lg',
}

const roundedMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
}

const bgMap = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  gradient: 'bg-gradient-to-br from-white to-gray-50',
  transparent: 'bg-transparent',
}

const hoverElevation: Record<ElevationLevel, { boxShadow: string; y: number }> = {
  flat: { boxShadow: fluentShadow.hover, y: -2 },
  raised: { boxShadow: fluentShadow.elevated, y: -4 },
  floating: { boxShadow: fluentShadow.elevatedHigh, y: -6 },
  overlay: { boxShadow: fluentShadow.elevatedHigh, y: -8 },
}

/**
 * FluentSurface - Superficie con sistema de elevación Fluent
 * 
 * @example
 * <FluentSurface elevation="raised" elevateOnHover rounded="2xl">
 *   <p>Card elevada</p>
 * </FluentSurface>
 */
export const FluentSurface = forwardRef<HTMLDivElement, FluentSurfaceProps>(
  function FluentSurface(
    {
      elevation = 'raised',
      elevateOnHover = false,
      interactive = false,
      rounded = '2xl',
      bordered = true,
      bg = 'white',
      className,
      children,
      ...props
    },
    ref
  ) {
    const isInteractive = interactive || elevateOnHover

    return (
      <motion.div
        ref={ref}
        className={cn(
          // Base styles
          bgMap[bg],
          roundedMap[rounded],
          elevationStyles[elevation],
          // Border
          bordered && 'border border-gray-200/60',
          // Interactive styles
          isInteractive && 'cursor-pointer',
          // Transition
          'transition-all duration-200',
          className
        )}
        whileHover={
          isInteractive
            ? {
                ...hoverElevation[elevation],
                transition: spring.fluent,
              }
            : undefined
        }
        whileTap={
          interactive
            ? {
                scale: 0.98,
                y: 0,
                transition: { duration: 0.1 },
              }
            : undefined
        }
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
