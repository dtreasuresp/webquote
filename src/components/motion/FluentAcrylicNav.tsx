'use client'

import { motion, useScroll, useTransform, type HTMLMotionProps } from 'framer-motion'
import { forwardRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getAcrylicClasses, type AcrylicPreset } from '@/lib/materials/acrylic'
import { detectPerformanceTier } from '@/lib/materials/detection'

interface FluentAcrylicNavProps extends HTMLMotionProps<'nav'> {
  /** Acrylic preset */
  preset?: AcrylicPreset
  /** Show acrylic only after scrolling */
  showOnScroll?: boolean
  /** Scroll threshold in pixels */
  scrollThreshold?: number
  /** Fixed positioning */
  fixed?: boolean
  /** Z-index */
  zIndex?: number
  children?: React.ReactNode
}

/**
 * FluentAcrylicNav - Navegación con efecto acrylic optimizado
 * 
 * Se adapta automáticamente al rendimiento del dispositivo.
 * En dispositivos de bajo rendimiento, usa un fondo sólido.
 * 
 * @example
 * <FluentAcrylicNav preset="navigation" showOnScroll fixed>
 *   <Logo />
 *   <NavLinks />
 * </FluentAcrylicNav>
 */
export const FluentAcrylicNav = forwardRef<HTMLElement, FluentAcrylicNavProps>(
  function FluentAcrylicNav(
    {
      preset = 'navigation',
      showOnScroll = true,
      scrollThreshold = 50,
      fixed = true,
      zIndex = 50,
      className,
      children,
      ...props
    },
    ref
  ) {
    const [isScrolled, setIsScrolled] = useState(false)
    const [canUseAcrylic, setCanUseAcrylic] = useState(true)
    
    const { scrollY } = useScroll()
    const opacity = useTransform(
      scrollY, 
      [0, scrollThreshold], 
      showOnScroll ? [0, 1] : [1, 1]
    )

    useEffect(() => {
      // Detectar capacidades del dispositivo
      const tier = detectPerformanceTier()
      setCanUseAcrylic(tier !== 'low')
      
      // Listener de scroll para estado
      const handleScroll = () => {
        setIsScrolled(window.scrollY > scrollThreshold)
      }
      
      window.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()
      
      return () => window.removeEventListener('scroll', handleScroll)
    }, [scrollThreshold])

    // Clases base para la navegación
    const baseClasses = cn(
      fixed && 'fixed top-0 left-0 right-0',
      'w-full transition-all duration-300'
    )

    // Clases de fondo según capacidades
    const backgroundClasses = canUseAcrylic
      ? getAcrylicClasses(preset)
      : 'bg-white/95' // Fallback sólido

    // Clases de borde/sombra cuando está scrolleado
    const scrolledClasses = isScrolled
      ? 'border-b border-gray-200/50 shadow-sm'
      : 'border-b border-transparent'

    return (
      <motion.nav
        ref={ref}
        style={{ 
          zIndex,
          ...(showOnScroll && !isScrolled ? { opacity } : {})
        }}
        className={cn(
          baseClasses,
          backgroundClasses,
          scrolledClasses,
          className
        )}
        initial={showOnScroll ? { opacity: 0 } : undefined}
        {...props}
      >
        {children}
      </motion.nav>
    )
  }
)

/**
 * FluentAcrylicHeader - Header con efecto acrylic para secciones
 */
interface FluentAcrylicHeaderProps extends HTMLMotionProps<'header'> {
  /** Acrylic preset */
  preset?: AcrylicPreset
  /** Rounded corners */
  rounded?: boolean
  children?: React.ReactNode
}

export const FluentAcrylicHeader = forwardRef<HTMLElement, FluentAcrylicHeaderProps>(
  function FluentAcrylicHeader(
    { preset = 'subtle', rounded = true, className, children, ...props },
    ref
  ) {
    const [canUseAcrylic, setCanUseAcrylic] = useState(true)

    useEffect(() => {
      const tier = detectPerformanceTier()
      setCanUseAcrylic(tier !== 'low')
    }, [])

    const backgroundClasses = canUseAcrylic
      ? getAcrylicClasses(preset)
      : 'bg-gradient-to-r from-white/90 to-gray-50/90'

    return (
      <motion.header
        ref={ref}
        className={cn(
          backgroundClasses,
          rounded && 'rounded-2xl',
          'border border-gray-200/50',
          className
        )}
        {...props}
      >
        {children}
      </motion.header>
    )
  }
)
