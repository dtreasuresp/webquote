/**
 * Quotation Store
 * Centralized state management for active quotation
 * Replaces 8 useState hooks from AdminPage
 *
 * Mapped useState:
 * - quotationId → quotationId
 * - cotizacionConfig → config
 * - cargandoCotizacion → isLoading
 * - erroresValidacionCotizacion → errors
 * - cotizacionActual → current
 * - readOnly → readOnly
 * - alertaMostradaEnSesion → hasShownAlert
 * - hasPendingLocalChanges → isDirty
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { QuotationStore, DEFAULT_QUOTATION_STATE, QuotationConfig, QuotationValidationErrors } from './types/quotation.types'
import { quotationApi } from './utils/quotationApi'

export const useQuotationStore = create<QuotationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...DEFAULT_QUOTATION_STATE,

      // Load quotation
      loadQuotation: async (id: string) => {
        set({ isLoading: true, errors: {} })
        try {
          const data = await quotationApi.getQuotation(id)
          set({
            quotationId: id,
            config: data,
            current: data,
            isLoading: false,
            isDirty: false,
            errors: {},
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error loading quotation'
          set({
            isLoading: false,
            errors: { _global: errorMessage },
          })
        }
      },

      // Update quotation in memory (optimistic update)
      updateQuotation: async (partial: any) => {
        const current = get().current

        // Optimistic update
        set({
          current: { ...current, ...partial },
          isDirty: true,
          errors: {},
        })

        try {
          // Validate before saving
          const validationResult = await quotationApi.validateQuotation({
            ...current,
            ...partial,
          })

          if (!validationResult.valid && validationResult.errors) {
            // Rollback on validation error
            set({
              current,
              errors: validationResult.errors as QuotationValidationErrors,
            })
            return
          }

          // Sync to server (but keep optimistic update)
          if (get().quotationId) {
            await quotationApi.updateQuotation(get().quotationId!, {
              ...current,
              ...partial,
            })
          }
        } catch (error) {
          // Rollback on error
          const errorMessage = error instanceof Error ? error.message : 'Error updating quotation'
          set({
            current,
            errors: { _global: errorMessage },
          })
        }
      },

      // Save quotation to database
      saveQuotation: async () => {
        const current = get().current
        set({ isLoading: true, errors: {} })

        try {
          // Validate before saving
          const validationResult = await quotationApi.validateQuotation(current)

          if (!validationResult.valid && validationResult.errors) {
            set({
              isLoading: false,
              errors: validationResult.errors as QuotationValidationErrors,
            })
            return
          }

          // Save
          const saved = await quotationApi.saveQuotation(current)

          set({
            quotationId: saved.id,
            config: saved,
            current: saved,
            isDirty: false,
            isLoading: false,
            errors: {},
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error saving quotation'
          set({
            isLoading: false,
            errors: { _global: errorMessage },
          })
        }
      },

      // Set config (for loading from callbacks)
      setConfig: (config: QuotationConfig | null) => {
        set({
          config,
          current: config || {},
          isDirty: false,
          errors: {},
        })
      },

      // Set read-only mode
      setReadOnly: (value: boolean) => {
        set({ readOnly: value })
      },

      // Mark alert as shown
      setHasShownAlert: (value: boolean) => {
        set({ hasShownAlert: value })
      },

      // Set validation errors
      setValidationErrors: (errors: QuotationValidationErrors) => {
        set({ errors })
      },

      // Clear all errors
      clearErrors: () => {
        set({ errors: {} })
      },

      // Reset store to initial state
      resetQuotation: () => {
        set(DEFAULT_QUOTATION_STATE)
      },
    }),
    {
      name: 'quotation-store',
      partialize: (state) => ({
        // Only persist config and quotationId, not loading/error states
        config: state.config,
        quotationId: state.quotationId,
        current: state.current,
      }),
    }
  )
)

// Optimized selectors to prevent unnecessary re-renders
export const useQuotationConfig = () => useQuotationStore((state) => state.config)
export const useQuotationCurrent = () => useQuotationStore((state) => state.current)
export const useQuotationIsLoading = () => useQuotationStore((state) => state.isLoading)
export const useQuotationErrors = () => useQuotationStore((state) => state.errors)
export const useQuotationIsDirty = () => useQuotationStore((state) => state.isDirty)
export const useQuotationId = () => useQuotationStore((state) => state.quotationId)
