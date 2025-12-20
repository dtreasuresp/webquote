/**
 * Type definitions for templateStore
 */

export interface DescriptionTemplate {
  id: string
  nombre: string
  descripcion: string
  plantilla: string
  activo: boolean
  fechaCreacion: string
}

export interface FinancialTemplate {
  id: string
  nombre: string
  tipo: 'descuento' | 'impuesto' | 'cargo'
  formula: string
  activo: boolean
  fechaCreacion: string
}

export interface TemplateState {
  descriptionTemplates: DescriptionTemplate[]
  financialTemplates: FinancialTemplate[]
  selectedDescriptionTemplate?: string
  selectedFinancialTemplate?: string
  isLoading: boolean
  errors: Record<string, string>
}

export interface TemplateStore extends TemplateState {
  // Description templates
  loadDescriptionTemplates: () => Promise<void>
  createDescriptionTemplate: (template: Partial<DescriptionTemplate>) => Promise<void>
  updateDescriptionTemplate: (id: string, template: Partial<DescriptionTemplate>) => Promise<void>
  deleteDescriptionTemplate: (id: string) => Promise<void>
  selectDescriptionTemplate: (id: string) => void
  setDescriptionTemplates: (templates: DescriptionTemplate[]) => void

  // Financial templates
  loadFinancialTemplates: () => Promise<void>
  createFinancialTemplate: (template: Partial<FinancialTemplate>) => Promise<void>
  updateFinancialTemplate: (id: string, template: Partial<FinancialTemplate>) => Promise<void>
  deleteFinancialTemplate: (id: string) => Promise<void>
  selectFinancialTemplate: (id: string) => void
  setFinancialTemplates: (templates: FinancialTemplate[]) => void

  // General
  clearErrors: () => void
  resetTemplates: () => void
}

export const DEFAULT_TEMPLATE_STATE: TemplateState = {
  descriptionTemplates: [],
  financialTemplates: [],
  isLoading: false,
  errors: {},
}
