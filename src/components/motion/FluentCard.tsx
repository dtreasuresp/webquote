'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { 
  fluentScaleIn, 
  fluentHoverCard, 
  fluentHoverGlow,
  fluentTapShrink 
} from '@/lib/animations/variants'
import { viewport } from '@/lib/animations/config'

interface FluentCardProps {
  readonly children: ReactNode
  readonly className?: string
  /** Variant de hover: 'lift' | 'glow' | 'scale' | 'none' */
  readonly hoverEffect?: 'lift' | 'glow' | 'scale' | 'none'
  /** Si tiene efecto acrylic (blur background) */
  readonly acrylic?: boolean
  /** Si tiene borde con gradiente */
  readonly gradientBorder?: boolean
  /** Delay de entrada */
  readonly delay?: number
  /** Si la animación se repite */
  readonly once?: boolean
  /** Padding interno */
  readonly padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  /** Border radius */
  readonly rounded?: 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  /** Si es clickeable */
  readonly interactive?: boolean
  /** onClick handler */
  readonly onClick?: () => void
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
}

const roundedClasses = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
}

const hoverEffects = {
  lift: fluentHoverCard,
  glow: fluentHoverGlow,
  scale: { scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  none: {},
}

export default function FluentCard({
  children,
  className = '',
  hoverEffect = 'lift',
  acrylic = false,
  gradientBorder = false,
  delay = 0,
  once = true,
  padding = 'md',
  rounded = 'xl',
  interactive = true,
  onClick,
}: FluentCardProps) {
  const baseClasses = `
    ${acrylic 
      ? 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl' 
      : 'bg-white dark:bg-gray-900'
    }
    ${gradientBorder 
      ? 'border border-transparent bg-clip-padding' 
      : 'border border-light-border/50 dark:border-gray-700/50'
    }
    ${paddingClasses[padding]}
    ${roundedClasses[rounded]}
    shadow-sm
    transition-colors
  `.trim().replaceAll(/\s+/g, ' ')

  const variants = {
    hidden: fluentScaleIn.hidden,
    visible: {
      ...fluentScaleIn.visible,
      transition: {
        ...(fluentScaleIn.visible as { transition?: object }).transition,
        delay,
      },
    },
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={once ? viewport.default : viewport.repeat}
      whileHover={interactive ? hoverEffects[hoverEffect] : undefined}
      whileTap={interactive ? fluentTapShrink : undefined}
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      style={gradientBorder ? {
        background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, rgba(0, 120, 212, 0.3), rgba(0, 120, 212, 0.1)) border-box',
      } : undefined}
    >
      {children}
    </motion.div>
  )
}
