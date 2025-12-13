'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { 
  fluentStaggerContainer, 
  fluentStaggerFast,
  fluentStaggerSlow,
  fluentStaggerItem 
} from '@/lib/animations/variants'
import { viewport } from '@/lib/animations/config'

type StaggerSpeed = 'fast' | 'normal' | 'slow'

interface FluentListProps {
  readonly children: ReactNode
  readonly className?: string
  /** Velocidad del stagger */
  readonly speed?: StaggerSpeed
  /** Si la animación se repite */
  readonly once?: boolean
  /** Delay inicial */
  readonly delay?: number
  /** Dirección del grid/lista */
  readonly direction?: 'vertical' | 'horizontal' | 'grid'
  /** Columnas del grid (si direction es grid) */
  readonly columns?: 1 | 2 | 3 | 4
  /** Gap entre items */
  readonly gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const staggerVariants = {
  fast: fluentStaggerFast,
  normal: fluentStaggerContainer,
  slow: fluentStaggerSlow,
}

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
}

export default function FluentList({
  children,
  className = '',
  speed = 'normal',
  once = true,
  delay = 0,
  direction = 'vertical',
  columns = 2,
  gap = 'md',
}: FluentListProps) {
  const selectedVariants = staggerVariants[speed]

  const variants = delay > 0 ? {
    hidden: selectedVariants.hidden,
    visible: {
      ...selectedVariants.visible,
      transition: {
        ...(selectedVariants.visible as { transition?: object }).transition,
        delayChildren: delay,
      },
    },
  } : selectedVariants

  const getLayoutClasses = (): string => {
    if (direction === 'grid') return `grid ${columnClasses[columns]}`
    if (direction === 'horizontal') return 'flex flex-wrap'
    return 'flex flex-col'
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={once ? viewport.default : viewport.repeat}
      className={`${getLayoutClasses()} ${gapClasses[gap]} ${className}`}
    >
      {children}
    </motion.div>
  )
}

// Item para usar dentro de FluentList
interface FluentListItemProps {
  readonly children: ReactNode
  readonly className?: string
}

export function FluentListItem({ children, className = '' }: FluentListItemProps) {
  return (
    <motion.div
      variants={fluentStaggerItem}
      className={className}
    >
      {children}
    </motion.div>
  )
}
