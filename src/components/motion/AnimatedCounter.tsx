'use client'

/**
 * AnimatedCounter - Número animado que cuenta hacia arriba
 * 
 * @example
 * // Contador simple
 * <AnimatedCounter end={100} />
 * 
 * // Con prefijo y sufijo
 * <AnimatedCounter end={1500} prefix="$" suffix=" USD" />
 * 
 * // Con decimales
 * <AnimatedCounter end={99.9} decimals={1} suffix="%" />
 * 
 * // Personalizado
 * <AnimatedCounter 
 *   end={50000} 
 *   duration={3} 
 *   className="text-4xl font-bold text-primary"
 * />
 */

import { motion } from 'framer-motion'
import { useCountUp, useReducedMotion } from '@/lib/animations/hooks'

interface AnimatedCounterProps {
  /** Valor final */
  end: number
  /** Valor inicial (default: 0) */
  start?: number
  /** Duración de la animación en segundos */
  duration?: number
  /** Número de decimales */
  decimals?: number
  /** Prefijo (ej: "$") */
  prefix?: string
  /** Sufijo (ej: " USD", "%") */
  suffix?: string
  /** Separador de miles (ej: ",") */
  separator?: string
  /** Clases CSS */
  className?: string
  /** Iniciar al estar visible (default: true) */
  startOnView?: boolean
}

export default function AnimatedCounter({
  end,
  start = 0,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  className = '',
  startOnView = true,
}: AnimatedCounterProps) {
  const reducedMotion = useReducedMotion()
  
  const { count, ref } = useCountUp({
    start,
    end,
    duration: reducedMotion ? 0.1 : duration,
    decimals,
    startOnView,
  })

  // Formatear número con separador de miles
  const formattedCount = separator
    ? count.toLocaleString('en-US', { 
        minimumFractionDigits: decimals, 
        maximumFractionDigits: decimals 
      }).replace(/,/g, separator)
    : count.toFixed(decimals)

  return (
    <motion.span 
      ref={ref} 
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {prefix}{formattedCount}{suffix}
    </motion.span>
  )
}

/**
 * AnimatedCounterGroup - Grupo de contadores con animación coordinada
 */
interface CounterItem {
  value: number
  label: string
  prefix?: string
  suffix?: string
  decimals?: number
}

interface AnimatedCounterGroupProps {
  items: CounterItem[]
  duration?: number
  className?: string
  itemClassName?: string
  valueClassName?: string
  labelClassName?: string
}

export function AnimatedCounterGroup({
  items,
  duration = 2,
  className = '',
  itemClassName = '',
  valueClassName = '',
  labelClassName = '',
}: AnimatedCounterGroupProps) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={`counter-${item.label}-${index}`} className={itemClassName}>
          <AnimatedCounter
            end={item.value}
            prefix={item.prefix}
            suffix={item.suffix}
            decimals={item.decimals}
            duration={duration}
            className={valueClassName}
          />
          <span className={labelClassName}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
