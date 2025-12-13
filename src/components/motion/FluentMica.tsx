'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getMicaClasses, getMicaStyle, type MicaPreset } from '@/lib/materials/mica'
import { detectPerformanceTier } from '@/lib/materials/detection'

interface FluentMicaProps extends HTMLMotionProps<'div'> {
  /** Mica preset */
  preset?: MicaPreset
  /** Full viewport height */
  fullHeight?: boolean
  /** Add subtle noise texture */
  withNoise?: boolean
  /** Animate gradient on hover */
  animateOnHover?: boolean
  children?: React.ReactNode
}

/**
 * FluentMica - Fondo con efecto Mica (Windows 11 style)
 * 
 * Mica es un efecto de fondo que muestra el contenido del escritorio
 * de forma sutil. Esta es una simulación optimizada usando gradientes.
 * 
 * @example
 * <FluentMica preset="light" fullHeight>
 *   <main>Contenido principal</main>
 * </FluentMica>
 */
export const FluentMica = forwardRef<HTMLDivElement, FluentMicaProps>(
  function FluentMica(
    {
      preset = 'light',
      fullHeight = false,
      withNoise = false,
      animateOnHover = false,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const [canUseEffects, setCanUseEffects] = useState(true)

    useEffect(() => {
      const tier = detectPerformanceTier()
      setCanUseEffects(tier !== 'low')
    }, [])

    const micaClasses = getMicaClasses(preset)
    const micaStyle = canUseEffects ? getMicaStyle(preset) : {}

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          fullHeight && 'min-h-screen',
          className
        )}
        style={{ ...micaStyle, ...style }}
        whileHover={
          animateOnHover && canUseEffects
            ? { 
                backgroundPosition: '100% 100%',
                transition: { duration: 0.8 }
              }
            : undefined
        }
        {...props}
      >
        {/* Mica base layer */}
        <div 
          className={cn(
            'absolute inset-0 -z-10',
            micaClasses
          )}
          aria-hidden="true"
        />
        
        {/* Optional noise texture */}
        {withNoise && canUseEffects && (
          <div 
            className="absolute inset-0 -z-10 opacity-[0.015] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
            aria-hidden="true"
          />
        )}
        
        {/* Content */}
        {children}
      </motion.div>
    )
  }
)

/**
 * FluentMicaCard - Card con fondo Mica
 */
interface FluentMicaCardProps extends HTMLMotionProps<'div'> {
  preset?: MicaPreset
  rounded?: 'lg' | 'xl' | '2xl' | '3xl'
  bordered?: boolean
  children?: React.ReactNode
}

export const FluentMicaCard = forwardRef<HTMLDivElement, FluentMicaCardProps>(
  function FluentMicaCard(
    { 
      preset = 'lightAlt', 
      rounded = '2xl', 
      bordered = true,
      className, 
      children, 
      ...props 
    },
    ref
  ) {
    const roundedClasses = {
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          getMicaClasses(preset),
          roundedClasses[rounded],
          bordered && 'border border-gray-200/60',
          'overflow-hidden',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
