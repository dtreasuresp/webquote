// Admin Hooks - Custom Hooks for Admin Panel
export { useAdminState } from './useAdminState'
export { useCotizacionValidation } from './useCotizacionValidation'
export { useSnapshotCRUD } from './useSnapshotCRUD'
export { useModalEdition } from './useModalEdition'
export { usePdfExport } from './usePdfGeneration'
export { useCotizacionCRUD } from './useCotizacionCRUD'
export { useAdvancedValidation } from './useAdvancedValidation'
export { useEventTracking } from './useEventTracking'
export { useAnalyticsMetrics } from './useAnalyticsMetrics'

// Hooks movidos desde lib/hooks
export { useToast } from './useToast'
export { default as useSnapshots, useSnapshotsRefresh } from './useSnapshots'
export { useQuotationConfig } from './useQuotationConfig'