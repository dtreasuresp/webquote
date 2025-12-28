/**
 * User Data Store
 * Zustand store for managing user-related data (quotations, organizations)
 * Centraliza la carga y caching de datos para modales de usuario
 */

import { create } from 'zustand'

export interface QuotationOption {
  id: string
  nombre?: string
  empresa?: string
  numero: string | number
}

export interface Organization {
  id: string
  nombre: string
}

export interface GroupedQuotation {
  baseNumber: string | number
  displayName: string
  versions: QuotationOption[]
  latestVersion: QuotationOption
}

export interface UserDataState {
  quotations: QuotationOption[]
  organizations: Organization[]
  groupedQuotations: GroupedQuotation[]
  isLoading: boolean
  error: string | null
  lastLoadedAt: number | null
}

export interface UserDataStore extends UserDataState {
  loadQuotations: () => Promise<void>
  loadOrganizations: () => Promise<void>
  loadAllData: () => Promise<void>
  setQuotations: (quotations: QuotationOption[]) => void
  setOrganizations: (organizations: Organization[]) => void
  reset: () => void
}

const DEFAULT_STATE: UserDataState = {
  quotations: [],
  organizations: [],
  groupedQuotations: [],
  isLoading: false,
  error: null,
  lastLoadedAt: null,
}

// Helper para agrupar cotizaciones y garantizar última versión
const groupQuotations = (quotations: QuotationOption[]): GroupedQuotation[] => {
  const versionRegex = /^(.+?)V(\d+)$/
  const groups: Record<string, any> = {}
  
  quotations.forEach((q) => {
    // Formato: "XXXXXX.XXXXXV##" -> extraer base y versión
    const numeroStr = q.numero?.toString() || ''
    const versionMatch = versionRegex.exec(numeroStr)
    const baseNum = versionMatch ? versionMatch[1] : numeroStr
    const versionNum = versionMatch ? Number.parseInt(versionMatch[2], 10) : 0
    
    if (!groups[baseNum]) {
      groups[baseNum] = {
        baseNumber: baseNum,
        displayName: q.empresa || q.nombre || 'Sin nombre',
        versions: [],
        latestVersion: q,
      }
    }
    groups[baseNum].versions.push(q)
    
    // Comparar versiones para encontrar la más nueva
    const currentLatest = groups[baseNum].latestVersion
    const currentLatestMatch = versionRegex.exec(currentLatest.numero?.toString() || '')
    const latestVersionNum = currentLatestMatch ? Number.parseInt(currentLatestMatch[2], 10) : 0
    
    if (versionNum > latestVersionNum) {
      groups[baseNum].latestVersion = q
    }
  })
  
  // Ordenar versiones dentro de cada grupo (descendente - más nueva primero)
  Object.values(groups).forEach((group: any) => {
    group.versions.sort((a: QuotationOption, b: QuotationOption) => {
      const aMatch = versionRegex.exec(a.numero?.toString() || '')
      const bMatch = versionRegex.exec(b.numero?.toString() || '')
      const aVersion = aMatch ? Number.parseInt(aMatch[2], 10) : 0
      const bVersion = bMatch ? Number.parseInt(bMatch[2], 10) : 0
      return bVersion - aVersion // Descendente
    })
  })
  
  return Object.values(groups)
}

export const useUserDataStore = create<UserDataStore>((set, get) => ({
  ...DEFAULT_STATE,

  loadQuotations: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/quotations')
      if (!response.ok) {
        throw new Error('Failed to load quotations')
      }

      const data = await response.json()
      let quotationArray = Array.isArray(data) ? data : (data?.quotations || [])
      
      // Filtrar solo cotizaciones con estado ACTIVA
      quotationArray = quotationArray.filter((q: any) => q.estado === 'ACTIVA')

      const grouped = groupQuotations(quotationArray)

      set({
        quotations: quotationArray,
        groupedQuotations: grouped,
        isLoading: false,
        lastLoadedAt: Date.now(),
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading quotations'
      set({
        error: errorMessage,
        isLoading: false,
      })
      console.error('[useUserDataStore] Error loading quotations:', err)
    }
  },

  loadOrganizations: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/organizations')
      if (!response.ok) {
        throw new Error('Failed to load organizations')
      }

      const data = await response.json()
      const organizationArray = Array.isArray(data) ? data : (data?.organizations || data || [])

      set({
        organizations: organizationArray,
        isLoading: false,
        lastLoadedAt: Date.now(),
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading organizations'
      set({
        error: errorMessage,
        isLoading: false,
      })
      console.error('[useUserDataStore] Error loading organizations:', err)
    }
  },

  loadAllData: async () => {
    set({ isLoading: true, error: null })
    try {
      const [quotRes, orgRes] = await Promise.all([
        fetch('/api/quotations'),
        fetch('/api/organizations'),
      ])

      console.log('[useUserDataStore] Quotations response status:', quotRes.status)
      console.log('[useUserDataStore] Organizations response status:', orgRes.status)

      if (!quotRes.ok) {
        console.error('[useUserDataStore] Failed to load quotations:', quotRes.statusText)
        throw new Error(`Failed to load quotations: ${quotRes.status}`)
      }
      if (!orgRes.ok) {
        console.error('[useUserDataStore] Failed to load organizations:', orgRes.statusText)
        throw new Error(`Failed to load organizations: ${orgRes.status}`)
      }

      const quotData = await quotRes.json()
      const orgData = await orgRes.json()

      console.log('[useUserDataStore] Quotations data:', quotData)
      console.log('[useUserDataStore] Organizations data:', orgData)

      const quotationArray = Array.isArray(quotData)
        ? quotData
        : (quotData?.quotations || quotData?.data || [])
      const organizationArray = Array.isArray(orgData)
        ? orgData
        : (orgData?.organizations || orgData?.data || orgData || [])

      const grouped = groupQuotations(quotationArray)

      console.log('[useUserDataStore] Setting state - quotations:', quotationArray.length, 'organizations:', organizationArray.length)

      set({
        quotations: quotationArray,
        organizations: organizationArray,
        groupedQuotations: grouped,
        isLoading: false,
        error: null,
        lastLoadedAt: Date.now(),
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading data'
      console.error('[useUserDataStore] Error loading data:', errorMessage)
      set({
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  setQuotations: (quotations: QuotationOption[]) => {
    const grouped = groupQuotations(quotations)
    set({
      quotations,
      groupedQuotations: grouped,
    })
  },

  setOrganizations: (organizations: Organization[]) => {
    set({ organizations })
  },

  reset: () => {
    set(DEFAULT_STATE)
  },
}))
