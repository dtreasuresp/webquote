'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { 
  fluentFade, 
  fluentRevealUp, 
  fluentSlideUp,
  fluentStaggerContainer,
  fluentStaggerFast,
  fluentStaggerSlow 
} from '@/lib/animations/variants'
import { viewport } from '@/lib/animations/config'

type FluentAnimationType = 
  | 'fade' 
  | 'revealUp' 
  | 'slideUp' 
  | 'stagger' 
  | 'staggerFast' 
  | 'staggerSlow'

interface FluentSectionProps {
  readonly children: ReactNode
  readonly className?: string
  /** Tipo de animación */
  readonly animation?: FluentAnimationType
  /** Delay de entrada */
  readonly delay?: number
  /** Si la animación se repite */
  readonly once?: boolean
  /** ID de la sección para navegación */
  readonly id?: string
  /** Tag HTML a usar */
  readonly as?: 'section' | 'div' | 'article' | 'aside'
  /** Si tiene efecto acrylic de fondo */
  readonly acrylic?: boolean
  /** Padding vertical */
  readonly paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const animationVariants = {
  fade: fluentFade,
  revealUp: fluentRevealUp,
  slideUp: fluentSlideUp,
  stagger: fluentStaggerContainer,
  staggerFast: fluentStaggerFast,
  staggerSlow: fluentStaggerSlow,
}

const paddingYClasses = {
  none: '',
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16',
  lg: 'py-16 md:py-20',
  xl: 'py-20 md:py-28',
}

export default function FluentSection({
  children,
  className = '',
  animation = 'fade',
  delay = 0,
  once = true,
  id,
  as = 'section',
  acrylic = false,
  paddingY = 'md',
}: FluentSectionProps) {
  const Component = motion[as]
  const selectedVariants = animationVariants[animation]

  const variants = delay > 0 ? {
    hidden: selectedVariants.hidden,
    visible: {
      ...selectedVariants.visible,
      transition: {
        ...(selectedVariants.visible as { transition?: object }).transition,
        delay,
      },
    },
  } : selectedVariants

  const baseClasses = `
    ${paddingYClasses[paddingY]}
    ${acrylic ? 'bg-white/60 backdrop-blur-xl' : ''}
    px-4
  `.trim().replaceAll(/\s+/g, ' ')

  return (
    <Component
      id={id}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={once ? viewport.default : viewport.repeat}
      className={`${baseClasses} ${className}`}
    >
      {children}
    </Component>
  )
}

// Componente hijo para usar con stagger
interface FluentSectionItemProps {
  readonly children: ReactNode
  readonly className?: string
}

export function FluentSectionItem({ children, className = '' }: FluentSectionItemProps) {
  return (
    <motion.div
      variants={fluentSlideUp}
      className={className}
    >
      {children}
    </motion.div>
  )
}
