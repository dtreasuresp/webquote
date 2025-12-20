/**
 * API utilities for modal operations
 * Most modals don't require API calls, but we include utilities for confirmation dialogs
 */

export const modalApi = {
  async confirmDelete(itemId: string, itemType: string): Promise<boolean> {
    try {
      const response = await fetch('/api/modals/confirm-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, itemType }),
      })
      if (!response.ok) throw new Error('Confirmation failed')
      return response.json()
    } catch (error) {
      console.error('modalApi.confirmDelete:', error)
      throw error
    }
  },

  async saveChanges(data: any): Promise<void> {
    try {
      const response = await fetch('/api/modals/save-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Save failed')
    } catch (error) {
      console.error('modalApi.saveChanges:', error)
      throw error
    }
  },

  async getSnapshotList(): Promise<any[]> {
    try {
      const response = await fetch('/api/snapshots')
      if (!response.ok) throw new Error('Failed to load snapshots')
      return response.json()
    } catch (error) {
      console.error('modalApi.getSnapshotList:', error)
      throw error
    }
  },

  async getTemplateList(): Promise<any[]> {
    try {
      const response = await fetch('/api/templates')
      if (!response.ok) throw new Error('Failed to load templates')
      return response.json()
    } catch (error) {
      console.error('modalApi.getTemplateList:', error)
      throw error
    }
  },
}
