import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Account, Contact, Product, Opportunity, Interaction, Subscription, ComplianceRecord } from '@/lib/types'

export type CrmSection = 
  | 'dashboard'
  | 'clients' 
  | 'contacts' 
  | 'products' 
  | 'opportunities' 
  | 'interactions' 
  | 'history'
  | 'pricing'
  | 'subscriptions' 
  | 'compliance'
  | 'rules'
  | 'templates'
  | 'invoices'
  | 'quotes'
  | 'reports'
  | 'settings'

interface CrmState {
  activeSection: CrmSection
  setActiveSection: (section: CrmSection) => void
  
  // UI State
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  
  // Data State
  isLoading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // CRM Data
  accounts: Account[]
  contacts: Contact[]
  products: Product[]
  opportunities: Opportunity[]
  interactions: Interaction[]
  subscriptions: Subscription[]
  complianceRecords: ComplianceRecord[]
  rules: any[]
  templates: any[]
  quotes: any[]

  // Selected Items
  selectedAccount: Account | null
  selectedContact: Contact | null
  setSelectedAccount: (account: Account | null) => void
  setSelectedContact: (contact: Contact | null) => void

  // Actions
  fetchAccounts: () => Promise<void>
  fetchContacts: () => Promise<void>
  fetchProducts: () => Promise<void>
  fetchOpportunities: () => Promise<void>
  fetchInteractions: () => Promise<void>
  fetchSubscriptions: () => Promise<void>
  fetchComplianceRecords: () => Promise<void>
  fetchRules: () => Promise<void>
  fetchTemplates: () => Promise<void>
  fetchQuotes: () => Promise<void>

  // Delete Actions
  deleteAccount: (id: string) => Promise<void>
  deleteContact: (id: string) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  deleteOpportunity: (id: string) => Promise<void>
  deleteInteraction: (id: string) => Promise<void>
  deleteSubscription: (id: string) => Promise<void>
  deleteComplianceRecord: (id: string) => Promise<void>
  deleteRule: (id: string) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  deleteQuote: (id: string) => Promise<void>
}

export const useCrmStore = create<CrmState>()(
  persist(
    (set, get) => ({
      activeSection: 'dashboard',
      setActiveSection: (section) => set({ activeSection: section }),
      
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      
      isLoading: false,
      error: null,
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      accounts: [],
      contacts: [],
      products: [],
      opportunities: [],
      interactions: [],
      subscriptions: [],
      complianceRecords: [],
      rules: [],
      templates: [],
      quotes: [],

      selectedAccount: null,
      selectedContact: null,
      setSelectedAccount: (account) => set({ selectedAccount: account }),
      setSelectedContact: (contact) => set({ selectedContact: contact }),

      fetchAccounts: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/crm/accounts')
          if (!res.ok) throw new Error('Error al cargar clientes')
          const data = await res.json()
          set({ accounts: data, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
        }
      },

      fetchContacts: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/crm/contacts')
          if (!res.ok) throw new Error('Error al cargar contactos')
          const data = await res.json()
          set({ contacts: data, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
        }
      },

      fetchProducts: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/crm/products')
          if (!res.ok) throw new Error('Error al cargar productos')
          const data = await res.json()
          set({ products: data, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
        }
      },

      fetchOpportunities: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/crm/opportunities')
          if (!res.ok) throw new Error('Error al cargar oportunidades')
          const data = await res.json()
          set({ opportunities: data, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
        }
      },

      fetchInteractions: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/crm/interactions')
          if (!res.ok) throw new Error('Error al cargar interacciones')
          const data = await res.json()
          set({ interactions: data, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
        }
      },

      fetchSubscriptions: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/crm/subscriptions')
          if (!res.ok) throw new Error('Error al cargar suscripciones')
          const data = await res.json()
          set({ subscriptions: data, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
        }
      },

      fetchComplianceRecords: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/crm/compliance')
          if (!res.ok) throw new Error('Error al cargar registros de cumplimiento')
          const data = await res.json()
          set({ complianceRecords: data, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
        }
      },

      fetchRules: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/crm/rules')
          if (!res.ok) throw new Error('Error al cargar reglas')
          const data = await res.json()
          set({ rules: data, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
        }
      },

      fetchTemplates: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/crm/templates')
          if (!res.ok) throw new Error('Error al cargar plantillas')
          const data = await res.json()
          set({ templates: data, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
        }
      },

      fetchQuotes: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/quotations')
          if (!res.ok) throw new Error('Error al cargar cotizaciones')
          const json = await res.json()
          // La API de cotizaciones devuelve { success: true, data: [...] }
          const data = Array.isArray(json) ? json : (json.data || [])
          set({ quotes: data, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
        }
      },

      deleteAccount: async (id) => {
        const res = await fetch(`/api/crm/accounts/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Error al eliminar cuenta')
        set((state) => ({ accounts: state.accounts.filter(a => a.id !== id) }))
      },

      deleteContact: async (id) => {
        const res = await fetch(`/api/crm/contacts/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Error al eliminar contacto')
        set((state) => ({ contacts: state.contacts.filter(c => c.id !== id) }))
      },

      deleteProduct: async (id) => {
        const res = await fetch(`/api/crm/products/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Error al eliminar producto')
        set((state) => ({ products: state.products.filter(p => p.id !== id) }))
      },

      deleteOpportunity: async (id) => {
        const res = await fetch(`/api/crm/opportunities/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Error al eliminar oportunidad')
        set((state) => ({ opportunities: state.opportunities.filter(o => o.id !== id) }))
      },

      deleteInteraction: async (id) => {
        const res = await fetch(`/api/crm/interactions/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Error al eliminar interacción')
        set((state) => ({ interactions: state.interactions.filter(i => i.id !== id) }))
      },

      deleteSubscription: async (id) => {
        const res = await fetch(`/api/crm/subscriptions/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Error al eliminar suscripción')
        set((state) => ({ subscriptions: state.subscriptions.filter(s => s.id !== id) }))
      },

      deleteComplianceRecord: async (id) => {
        const res = await fetch(`/api/crm/compliance/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Error al eliminar registro de cumplimiento')
        set((state) => ({ complianceRecords: state.complianceRecords.filter(r => r.id !== id) }))
      },

      deleteRule: async (id) => {
        const res = await fetch(`/api/crm/rules/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Error al eliminar regla')
        set((state) => ({ rules: state.rules.filter(r => r.id !== id) }))
      },

      deleteTemplate: async (id) => {
        const res = await fetch(`/api/crm/templates/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Error al eliminar plantilla')
        set((state) => ({ templates: state.templates.filter(t => t.id !== id) }))
      },

      deleteQuote: async (id) => {
        const res = await fetch(`/api/quotations/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Error al eliminar cotización')
        set((state) => ({ quotes: state.quotes.filter(q => q.id !== id) }))
      },
    }),
    {
      name: 'crm-storage',
      partialize: (state) => ({ 
        activeSection: state.activeSection, 
        isSidebarCollapsed: state.isSidebarCollapsed 
      }),
    }
  )
)

