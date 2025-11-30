// Layout Components
export { default as AdminHeader } from './AdminHeader'
export type { AdminHeaderProps } from './AdminHeader'

export { default as DialogoGenerico } from './DialogoGenerico'
export type { DialogoGenericoProps, DialogTab } from './DialogoGenerico'

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

// Snapshot Components (Phase 12)
export { default as SnapshotTimeline } from './SnapshotTimeline'
export { default as SnapshotComparison } from './SnapshotComparison'
export { default as SnapshotDiffViewer } from './SnapshotDiffViewer'

// Analytics Components (Phase 13)
export { AnalyticsDashboard } from './AnalyticsDashboard'

// Performance Optimized Components (Phase 14)
export { default as OptimizedSnapshotCard } from './OptimizedSnapshotCard'
export type { OptimizedSnapshotCardProps } from './OptimizedSnapshotCard'

export { 
  withOptimizations, 
  useOptimizedCallback, 
  useOptimizedMemo, 
  usePreviousProps 
} from './withOptimizations'

// TABs
export * from './tabs'
