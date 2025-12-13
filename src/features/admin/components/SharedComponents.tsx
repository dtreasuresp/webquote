'use client'

import React from 'react'
import { type LucideIcon } from 'lucide-react'

type ButtonSize = 'sm' | 'md' | 'lg'
type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger'

export interface BaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gh-accent-blue hover:bg-gh-accent-blue/90 text-white shadow-lg hover:shadow-xl',
  secondary:
    'bg-gh-accent-green hover:bg-gh-accent-green/90 text-white shadow-lg hover:shadow-xl',
  tertiary:
    'bg-gh-bg-tertiary hover:bg-gh-bg-tertiary/80 text-gh-text-primary border border-gh-border-color',
  ghost:
    'bg-transparent hover:bg-gh-bg-tertiary text-gh-text-primary border border-transparent hover:border-gh-border-color',
  danger:
    'bg-gh-accent-red hover:bg-gh-accent-red/90 text-white shadow-lg hover:shadow-xl',
}

const IconLoadingSpinner = () => (
  <div className="animate-spin">
    <svg
      className="w-4 h-4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>
  </div>
)

export const Button = React.forwardRef<HTMLButtonElement, BaseButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon: Icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${fullWidth ? 'w-full' : ''}
          ${className || ''}
        `}
        {...props}
      >
        {isLoading ? (
          <IconLoadingSpinner />
        ) : Icon && iconPosition === 'left' ? (
          <Icon className="w-4 h-4" />
        ) : null}

        {children}

        {!isLoading && Icon && iconPosition === 'right' ? (
          <Icon className="w-4 h-4" />
        ) : null}
      </button>
    )
  },
)

Button.displayName = 'Button'

// Badge Component
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

const badgeVariants: Record<string, string> = {
  primary: 'bg-gh-accent-blue/10 text-gh-accent-blue border border-gh-accent-blue/30',
  secondary:
    'bg-gh-accent-green/10 text-gh-accent-green border border-gh-accent-green/30',
  success:
    'bg-gh-accent-green/10 text-gh-accent-green border border-gh-accent-green/30',
  warning:
    'bg-gh-accent-orange/10 text-gh-accent-orange border border-gh-accent-orange/30',
  error: 'bg-gh-accent-red/10 text-gh-accent-red border border-gh-accent-red/30',
  info: 'bg-gh-accent-cyan/10 text-gh-accent-cyan border border-gh-accent-cyan/30',
}

const badgeSizes: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    { variant = 'primary', size = 'md', className, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`
          inline-flex items-center rounded-full font-medium
          ${badgeVariants[variant]}
          ${badgeSizes[size]}
          ${className || ''}
        `}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Badge.displayName = 'Badge'

// Icon Button Component
export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  tooltip?: string
}

const iconButtonClasses: Record<string, string> = {
  primary: 'bg-gh-accent-blue hover:bg-gh-accent-blue/90 text-white',
  secondary: 'bg-gh-accent-green hover:bg-gh-accent-green/90 text-white',
  tertiary:
    'bg-gh-bg-tertiary hover:bg-gh-bg-tertiary/80 text-gh-text-primary',
  ghost: 'bg-transparent hover:bg-gh-bg-tertiary text-gh-text-primary',
}

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

const iconSizes: Record<ButtonSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon: Icon,
      variant = 'tertiary',
      size = 'md',
      tooltip,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={`
          flex items-center justify-center rounded-lg
          transition-all duration-200 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          ${iconButtonClasses[variant]}
          ${iconSizeClasses[size]}
          ${className || ''}
        `}
        title={tooltip}
        {...props}
      >
        <Icon className={iconSizes[size]} />
      </button>
    )
  },
)

IconButton.displayName = 'IconButton'


