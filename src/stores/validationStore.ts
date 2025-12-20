/**
 * Zustand store for validation management
 * Handles tab validation state and results
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { validationApi } from './utils/validationApi'
import {
  ValidationStore,
  DEFAULT_VALIDATION_STATE,
  ValidationType,
  ValidationResult,
} from './types/validation.types'

export const useValidationStore = create<ValidationStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_VALIDATION_STATE,

      // Validate a specific tab
      validateTab: async (tab, type) => {
        set({ isValidating: true, errors: {} })
        try {
          const result = await validationApi.validateTab(tab, type)
          const { tabValidation } = get()
          set({
            tabValidation: {
              ...tabValidation,
              [tab]: result,
            },
            isValidating: false,
          })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Validation error'
          set({ isValidating: false, errors: { _global: message } })
        }
      },

      // Set tab as valid/invalid
      setTabValid: (tab, isValid) => {
        const { tabValidation } = get()
        const existing = tabValidation[tab] || {
          isValid: false,
          errors: [],
          warnings: [],
          timestamp: new Date().toISOString(),
        }
        set({
          tabValidation: {
            ...tabValidation,
            [tab]: { ...existing, isValid },
          },
        })
      },

      // Clear validation for a tab
      clearTabValidation: (tab) => {
        const { tabValidation } = get()
        const updated = { ...tabValidation }
        delete updated[tab]
        set({ tabValidation: updated })
      },

      // Clear all validations
      clearAllValidations: () => {
        set({ tabValidation: {} })
      },

      // Get tab validation result
      getTabValidation: (tab) => {
        return get().tabValidation[tab]
      },

      // Set current tab
      setCurrentTab: (tab) => {
        set({ currentTab: tab })
      },

      // Set quotation field validation errors
      setQuotationFieldErrors: (errors) => {
        set({ quotationFieldErrors: errors })
      },

      // Clear quotation field validation errors
      clearQuotationFieldErrors: () => {
        set({ quotationFieldErrors: {} })
      },

      // Reset store
      resetValidation: () => {
        set(DEFAULT_VALIDATION_STATE)
      },
    }),
    {
      name: 'validation-store',
      partialize: (state) => ({
        tabValidation: state.tabValidation,
        currentTab: state.currentTab,
      }),
    },
  ),
)

// Optimized selectors
export const useTabValidation = (tab: string) =>
  useValidationStore((state) => state.tabValidation[tab])
export const useIsValidating = () =>
  useValidationStore((state) => state.isValidating)
export const useValidationErrors = () =>
  useValidationStore((state) => state.errors)
export const useAllValidations = () =>
  useValidationStore((state) => state.tabValidation)
export const useCurrentTab = () =>
  useValidationStore((state) => state.currentTab)
export const useQuotationFieldErrors = () =>
  useValidationStore((state) => state.quotationFieldErrors)
