// Layout Components
export { default as AdminHeader } from './AdminHeader'
export type { AdminHeaderProps } from './AdminHeader'

export { default as DialogoGenerico } from './DialogoGenerico'
export type { DialogoGenericoProps, DialogTab } from './DialogoGenerico'

export { default as DialogoGenericoDinamico } from './DialogoGenericoDinamico'
export type {
  DialogoGenericoDinamicoProps,
  DialogStepConfig,
  DialogFormField,
  DialogFormConfig,
  DialogProgressConfig,
} from './DialogoGenericoDinamico'

export { default as ModalProgresoGuardado } from './ModalProgresoGuardado'
export type { ModalProgresoGuardadoProps } from './ModalProgresoGuardado'

export { default as ModalLoginAdmin } from './ModalLoginAdmin'
export type { ModalLoginAdminProps } from './ModalLoginAdmin'

// Shared Components
export { Button, Badge, IconButton } from './SharedComponents'
export type { BaseButtonProps, BadgeProps, IconButtonProps } from './SharedComponents'

// Toggle Components (PreferenciasTab Pattern)
export { default as ToggleItem, ToggleGroup } from './ToggleItem'
export { default as ToggleSwitch } from './ToggleSwitch'

// Collapsible Section Components (PreferenciasTab Pattern)
export { CollapsibleSection, CollapsibleSectionSimple } from './ui/CollapsibleSection'

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

// Cotizacion Timeline Component
export { default as CotizacionTimeline } from './CotizacionTimeline'

// Analytics Components (Phase 13)
export { AnalyticsDashboard } from './AnalyticsDashboard'
export { OfertaAnalyticsSection } from './OfertaAnalyticsSection'
export { HistorialAnalyticsSection } from './HistorialAnalyticsSection'

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
// Estado y Respuestas del Cliente (Phase 3)
export { BotonesEstado } from './BotonesEstado'
export { DialogoVerRespuestaCliente } from './dialogs/DialogoVerRespuestaCliente'
export { DialogoCambiarEstado } from './dialogs/DialogoCambiarEstado'
export { DialogoSolicitarExtension } from './dialogs/DialogoSolicitarExtension'