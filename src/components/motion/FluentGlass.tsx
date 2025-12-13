'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { getGlassClasses, getGlassFallback, type GlassPreset } from '@/lib/materials/glass'
import { spring } from '@/lib/animations/config'

// Alias de variantes para compatibilidad con otros componentes
type VariantAlias = 'normal' | 'subtle' | 'strong' | 'transparent' | 'elevated'

// Mapeo de alias a presets reales
const variantToPreset: Record<VariantAlias, GlassPreset> = {
  normal: 'light',
  subtle: 'minimal',
  strong: 'frosted',
  transparent: 'dark',
  elevated: 'frosted'  // elevated usa frosted con más blur
}

interface FluentGlassProps extends HTMLMotionProps<'div'> {
  /** Glass preset style */
  preset?: GlassPreset
  /** Alias for preset - for compatibility */
  variant?: GlassPreset | VariantAlias
  /** Border radius */
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  /** Add glow on hover */
  glowOnHover?: boolean
  /** Glow color */
  glowColor?: 'accent' | 'success' | 'warning'
  /** Elevation on hover */
  elevateOnHover?: boolean
  /** As child element */
  children?: React.ReactNode
}

const roundedMap = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
}

const glowColorMap = {
  accent: 'hover:shadow-[0_0_20px_rgba(0,120,212,0.2)]',
  success: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
  warning: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
}

/**
 * FluentGlass - Componente con efecto glassmorphism optimizado
 * 
 * @example
 * <FluentGlass preset="frosted" glowOnHover rounded="2xl">
 *   <p>Contenido con efecto glass</p>
 * </FluentGlass>
 * 
 * @example
 * // También acepta variant como alias
 * <FluentGlass variant="normal" className="p-4">
 *   <p>Contenido con glass light</p>
 * </FluentGlass>
 */
export const FluentGlass = forwardRef<HTMLDivElement, FluentGlassProps>(
  function FluentGlass(
    {
      preset,
      variant,
      rounded = '2xl',
      glowOnHover = false,
      glowColor = 'accent',
      elevateOnHover = false,
      className,
      children,
      ...props
    },
    ref
  ) {
    // Resolver el preset: usar preset si existe, sino resolver variant
    const resolvePreset = (): GlassPreset => {
      if (preset) return preset
      if (variant) {
        // Si variant es un alias, mapearlo
        if (variant in variantToPreset) {
          return variantToPreset[variant as VariantAlias]
        }
        // Si variant es un preset válido, usarlo directamente
        return variant as GlassPreset
      }
      return 'light' // default
    }
    
    const effectivePreset = resolvePreset()
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          // Glass effect classes
          getGlassClasses(effectivePreset),
          // Fallback for unsupported browsers
          `supports-[not(backdrop-filter)]:${getGlassFallback(effectivePreset)}`,
          // Border radius
          roundedMap[rounded],
          // Glow on hover
          glowOnHover && glowColorMap[glowColor],
          // Elevation on hover
          elevateOnHover && 'hover:-translate-y-1 hover:shadow-xl',
          // Base transition
          'transition-all duration-200',
          className
        )}
        whileHover={elevateOnHover ? { y: -4 } : undefined}
        transition={spring.fluent}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
