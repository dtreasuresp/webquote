/**
 * Zustand store for template management
 * Handles description and financial templates
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { templateApi } from './utils/templateApi'
import {
  TemplateStore,
  DEFAULT_TEMPLATE_STATE,
  DescriptionTemplate,
  FinancialTemplate,
} from './types/template.types'

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_TEMPLATE_STATE,

      // Description templates
      loadDescriptionTemplates: async () => {
        set({ isLoading: true, errors: {} })
        try {
          const templates = await templateApi.getDescriptionTemplates()
          set({ descriptionTemplates: templates, isLoading: false })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Error loading templates'
          set({ isLoading: false, errors: { _global: message } })
        }
      },

      createDescriptionTemplate: async (template) => {
        set({ isLoading: true, errors: {} })
        try {
          const newTemplate = await templateApi.createDescriptionTemplate(template)
          const { descriptionTemplates } = get()
          set({
            descriptionTemplates: [...descriptionTemplates, newTemplate],
            isLoading: false,
          })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Error creating template'
          set({ isLoading: false, errors: { _global: message } })
        }
      },

      updateDescriptionTemplate: async (id, template) => {
        set({ isLoading: true, errors: {} })
        try {
          const updated = await templateApi.updateDescriptionTemplate(id, template)
          const { descriptionTemplates } = get()
          set({
            descriptionTemplates: descriptionTemplates.map((t) =>
              t.id === id ? updated : t,
            ),
            isLoading: false,
          })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Error updating template'
          set({ isLoading: false, errors: { _global: message } })
        }
      },

      deleteDescriptionTemplate: async (id) => {
        set({ isLoading: true, errors: {} })
        try {
          await templateApi.deleteDescriptionTemplate(id)
          const { descriptionTemplates } = get()
          set({
            descriptionTemplates: descriptionTemplates.filter((t) => t.id !== id),
            selectedDescriptionTemplate:
              get().selectedDescriptionTemplate === id
                ? undefined
                : get().selectedDescriptionTemplate,
            isLoading: false,
          })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Error deleting template'
          set({ isLoading: false, errors: { _global: message } })
        }
      },

      selectDescriptionTemplate: (id) => {
        set({ selectedDescriptionTemplate: id })
      },

      // Financial templates
      loadFinancialTemplates: async () => {
        set({ isLoading: true, errors: {} })
        try {
          const templates = await templateApi.getFinancialTemplates()
          set({ financialTemplates: templates, isLoading: false })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Error loading templates'
          set({ isLoading: false, errors: { _global: message } })
        }
      },

      createFinancialTemplate: async (template) => {
        set({ isLoading: true, errors: {} })
        try {
          const newTemplate = await templateApi.createFinancialTemplate(template)
          const { financialTemplates } = get()
          set({
            financialTemplates: [...financialTemplates, newTemplate],
            isLoading: false,
          })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Error creating template'
          set({ isLoading: false, errors: { _global: message } })
        }
      },

      updateFinancialTemplate: async (id, template) => {
        set({ isLoading: true, errors: {} })
        try {
          const updated = await templateApi.updateFinancialTemplate(id, template)
          const { financialTemplates } = get()
          set({
            financialTemplates: financialTemplates.map((t) =>
              t.id === id ? updated : t,
            ),
            isLoading: false,
          })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Error updating template'
          set({ isLoading: false, errors: { _global: message } })
        }
      },

      deleteFinancialTemplate: async (id) => {
        set({ isLoading: true, errors: {} })
        try {
          await templateApi.deleteFinancialTemplate(id)
          const { financialTemplates } = get()
          set({
            financialTemplates: financialTemplates.filter((t) => t.id !== id),
            selectedFinancialTemplate:
              get().selectedFinancialTemplate === id
                ? undefined
                : get().selectedFinancialTemplate,
            isLoading: false,
          })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Error deleting template'
          set({ isLoading: false, errors: { _global: message } })
        }
      },

      selectFinancialTemplate: (id) => {
        set({ selectedFinancialTemplate: id })
      },

      // Set description templates directly (for loading from callbacks)
      setDescriptionTemplates: (templates) => {
        set({ descriptionTemplates: templates })
      },

      // Set financial templates directly (for loading from callbacks)
      setFinancialTemplates: (templates) => {
        set({ financialTemplates: templates })
      },

      // General
      clearErrors: () => {
        set({ errors: {} })
      },

      resetTemplates: () => {
        set(DEFAULT_TEMPLATE_STATE)
      },
    }),
    {
      name: 'template-store',
      partialize: (state) => ({
        descriptionTemplates: state.descriptionTemplates,
        financialTemplates: state.financialTemplates,
        selectedDescriptionTemplate: state.selectedDescriptionTemplate,
        selectedFinancialTemplate: state.selectedFinancialTemplate,
      }),
    },
  ),
)

// Optimized selectors
export const useDescriptionTemplates = () =>
  useTemplateStore((state) => state.descriptionTemplates)
export const useFinancialTemplates = () =>
  useTemplateStore((state) => state.financialTemplates)
export const useSelectedDescriptionTemplate = () =>
  useTemplateStore((state) => {
    const id = state.selectedDescriptionTemplate
    return id ? state.descriptionTemplates.find((t) => t.id === id) : undefined
  })
export const useSelectedFinancialTemplate = () =>
  useTemplateStore((state) => {
    const id = state.selectedFinancialTemplate
    return id ? state.financialTemplates.find((t) => t.id === id) : undefined
  })
export const useTemplateLoading = () =>
  useTemplateStore((state) => state.isLoading)
export const useTemplateErrors = () =>
  useTemplateStore((state) => state.errors)
