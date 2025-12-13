'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { fluentHoverButton, fluentTapShrink } from '@/lib/animations/variants'
import { spring } from '@/lib/animations/config'

type FluentButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent'
type FluentButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface FluentButtonProps {
  readonly children: ReactNode
  readonly className?: string
  readonly variant?: FluentButtonVariant
  readonly size?: FluentButtonSize
  readonly disabled?: boolean
  readonly type?: 'button' | 'submit' | 'reset'
  readonly onClick?: () => void
  readonly href?: string
  /** Efecto glow en hover */
  readonly glow?: boolean
  /** Icono a la izquierda */
  readonly leftIcon?: ReactNode
  /** Icono a la derecha */
  readonly rightIcon?: ReactNode
  /** Ocupa el ancho completo */
  readonly fullWidth?: boolean
}

const variantClasses: Record<FluentButtonVariant, string> = {
  primary: `
    bg-light-accent text-white
    hover:bg-light-accent/90
    active:bg-light-accent/80
    border-transparent
  `,
  secondary: `
    bg-light-bg-secondary text-light-text
    hover:bg-light-bg-tertiary
    active:bg-light-border
    border-light-border
  `,
  outline: `
    bg-transparent text-light-accent
    hover:bg-light-accent/10
    active:bg-light-accent/20
    border-light-accent
  `,
  ghost: `
    bg-transparent text-light-text
    hover:bg-light-bg-secondary
    active:bg-light-bg-tertiary
    border-transparent
  `,
  accent: `
    bg-gradient-to-r from-light-accent to-blue-600 text-white
    hover:from-blue-600 hover:to-light-accent
    active:from-blue-700 active:to-blue-700
    border-transparent
  `,
}

const sizeClasses: Record<FluentButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-2.5 text-base rounded-xl',
  xl: 'px-8 py-3 text-lg rounded-xl',
}

export default function FluentButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  href,
  glow = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
}: FluentButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium
    border
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${glow && variant === 'primary' ? 'shadow-[0_0_20px_rgba(0,120,212,0.3)]' : ''}
  `.trim().replaceAll(/\s+/g, ' ')

  const content = (
    <>
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </>
  )

  const motionProps = {
    whileHover: disabled ? undefined : fluentHoverButton,
    whileTap: disabled ? undefined : fluentTapShrink,
    transition: spring.fluent,
  }

  if (href) {
    return (
      <motion.a
        href={href}
        className={`${baseClasses} ${className}`}
        {...motionProps}
      >
        {content}
      </motion.a>
    )
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      {...motionProps}
    >
      {content}
    </motion.button>
  )
}
