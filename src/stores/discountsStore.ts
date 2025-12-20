/**
 * Discounts Store
 * Centralized state management for discounts configuration
 * Replaces 2 useState hooks from AdminPage
 *
 * Mapped useState:
 * - configDescuentosActual → config
 * - expandidosDescuentos → expandedGroups
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DiscountsStore, DEFAULT_DISCOUNTS_STATE, ConfigDescuentos } from './types/discounts.types'
import { discountsApi } from './utils/discountsApi'

export const useDiscountsStore = create<DiscountsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...DEFAULT_DISCOUNTS_STATE,

      // Load configuration
      loadConfig: async () => {
        set({ isLoading: true, errors: {} })
        try {
          const data = await discountsApi.getConfig()
          set({
            config: data,
            isLoading: false,
            errors: {},
          })
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Error loading discounts config'
          set({
            isLoading: false,
            errors: { _global: msg },
          })
        }
      },

      // Update configuration (optimistic)
      updateConfig: async (partial: Partial<ConfigDescuentos>) => {
        const current = get().config

        // Optimistic update
        set({
          config: current ? { ...current, ...partial } : partial,
          errors: {},
        })

        try {
          await discountsApi.updateConfig(partial)
        } catch (error) {
          // Rollback on error
          const msg = error instanceof Error ? error.message : 'Error updating discounts config'
          set({
            config: current,
            errors: { _global: msg },
          })
        }
      },

      // Save configuration
      saveConfig: async () => {
        const current = get().config
        if (!current) {
          set({ errors: { _global: 'No configuration to save' } })
          return
        }

        set({ isLoading: true, errors: {} })
        try {
          const saved = await discountsApi.saveConfig(current)
          set({
            config: saved,
            isLoading: false,
            errors: {},
          })
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Error saving discounts config'
          set({
            isLoading: false,
            errors: { _global: msg },
          })
        }
      },

      // Set configuration directly
      setConfig: (config: ConfigDescuentos | null) => {
        set({ config })
      },

      // Toggle expanded group
      toggleExpanded: (groupId: string) => {
        set((state) => ({
          expandedGroups: {
            ...state.expandedGroups,
            [groupId]: !state.expandedGroups[groupId],
          },
        }))
      },

      // Clear errors
      clearErrors: () => {
        set({ errors: {} })
      },

      // Reset store
      resetDiscounts: () => {
        set(DEFAULT_DISCOUNTS_STATE)
      },
    }),
    {
      name: 'discounts-store',
      partialize: (state) => ({
        config: state.config,
        expandedGroups: state.expandedGroups,
      }),
    }
  )
)

// Optimized selectors
export const useDiscountsConfig = () => useDiscountsStore((state) => state.config)
export const useDiscountsLoading = () => useDiscountsStore((state) => state.isLoading)
export const useDiscountsErrors = () => useDiscountsStore((state) => state.errors)
export const useExpandedGroups = () => useDiscountsStore((state) => state.expandedGroups)
