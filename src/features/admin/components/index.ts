// Layout Components
export { default as AdminHeader } from './AdminHeader'
export type { AdminHeaderProps } from './AdminHeader'

export { default as DialogoGenerico } from './DialogoGenerico'
export type { DialogoGenericoProps } from './DialogoGenerico'

// Shared Components
export { Button, Badge, IconButton } from './SharedComponents'
export type { BaseButtonProps, BadgeProps, IconButtonProps } from './SharedComponents'

// Validation Components (Phase 11)
export {
  ValidationFeedback,
  TabValidationBadge,
  ValidationCard,
  ValidationIndicator,
} from './ValidationFeedback'

export {
  TabValidator,
  useTabValidation,
  FieldValidationFeedback,
  ValidatedInput,
  ValidationStatusBar,
} from './TabValidator'
export type { TabType } from './TabValidator'

// TABs
export * from './tabs'
