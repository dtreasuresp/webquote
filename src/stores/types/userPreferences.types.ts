import type { UserPreferences } from '@/lib/types'

export interface UserPreferencesState extends UserPreferences {
  // Runtime state
  isLoading: boolean
  error: string | null
  isDirty: boolean

  // Actions
  loadPreferences: () => Promise<void>
  updatePreferences: (patch: Partial<UserPreferences>) => Promise<void>
  updatePreferencesSync: (patch: Partial<UserPreferences>) => void
  persistPreferences: () => Promise<void>
  resetPreferences: () => void
  clearError: () => void
  setDirty: (dirty: boolean) => void
}
