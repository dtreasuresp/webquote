/**
 * Exportaciones centralizadas de hooks
 */

// Cache hooks
export { useAutoSave } from './useAutoSave'
export type { UseAutoSaveOptions, UseAutoSaveReturn } from './useAutoSave'

export { useOfflineStatus } from './useOfflineStatus'
export type { OfflineStatus } from './useOfflineStatus'

export { useQuotationCache } from './useQuotationCache'
export type { UseQuotationCacheOptions, UseQuotationCacheReturn } from './useQuotationCache'

export { useTabSync } from './useTabSync'
export type { UseTabSyncOptions, UseTabSyncReturn } from './useTabSync'

// UI hooks
export { useCollapsibleState } from './useCollapsibleState'

// Permission hooks (básicos - compatibilidad)
export { 
  useRequirePermission,
  useRequireAnyPermission,
  useRequireAllPermissions,
  usePermissionCheck
} from './useRequirePermission'

// Permission hooks (mejorados con Access Levels)
export { 
  usePermission,
  useMultiplePermissions
} from './usePermission'
export type { 
  AccessLevel,
  PermissionInfo
} from './usePermission'

// Permissions cache hooks (Fase 12)
export {
  usePermissionsCache,
  usePermissionsCacheManager
} from './usePermissionsCache'
export type { UsePermissionsCacheResult } from './usePermissionsCache'

// Permissions cache invalidation hooks (Fase 12)
export {
  useInvalidatePermissionsCacheOnLogout,
  useInvalidatePermissionsCacheOnUserChange,
  useInvalidatePermissions
} from './useInvalidatePermissionsCache'

// Export por defecto (hook mejorado)
export { default } from './usePermission'
