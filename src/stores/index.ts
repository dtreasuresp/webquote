/**
 * Barrel export para todos los stores de Zustand
 * Centraliza la importación de stores
 */

// Audit Store
export * from './auditConfigStore'
export * from './types/audit.types'

// Quotation Store
export * from './quotationStore'
export * from './types/quotation.types'

// Quotation Sync Store (NEW - Global synchronization)
export * from './quotationSyncStore'
export * from './types/quotationSync.types'

// Services Store
export * from './servicesStore'
export * from './types/services.types'

// Discounts Store
export * from './discountsStore'
export * from './types/discounts.types'

// Payment Store
export * from './paymentStore'
export * from './types/payment.types'

// Snapshot Store
export * from './snapshotStore'
export * from './types/snapshot.types'

// Validation Store
export * from './validationStore'
export * from './types/validation.types'

// Template Store
export * from './templateStore'
export * from './types/template.types'

// Modal Store (Centralizes all modals)
export * from './modalStore'
export * from './types/modal.types'

// User Preferences Store (P1)
export * from './userPreferencesStore'
export * from './types/userPreferences.types'

// UI Store (Phase 5 - Global UI state)
export * from './uiStore'

// Data Store (Phase 5 - Global app data)
export * from './dataStore'

// Permissions Cache Store (Phase 12 - Permissions caching)
export * from './permissionsCacheStore'

// Modal Data Store (Phase 5 - Modal-specific state)
export * from './modalDataStore'