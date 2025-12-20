/**
 * API utilities for snapshot operations
 */

import { Snapshot, SnapshotComparison } from '../types/snapshot.types'

export const snapshotApi = {
  async getSnapshots(): Promise<Snapshot[]> {
    try {
      const response = await fetch('/api/snapshots')
      if (!response.ok) throw new Error('Failed to load snapshots')
      return response.json()
    } catch (error) {
      console.error('snapshotApi.getSnapshots:', error)
      throw error
    }
  },

  async createSnapshot(snapshot: Partial<Snapshot>): Promise<Snapshot> {
    try {
      const response = await fetch('/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot),
      })
      if (!response.ok) throw new Error('Failed to create snapshot')
      return response.json()
    } catch (error) {
      console.error('snapshotApi.createSnapshot:', error)
      throw error
    }
  },

  async updateSnapshot(id: string, snapshot: Partial<Snapshot>): Promise<Snapshot> {
    try {
      const response = await fetch(`/api/snapshots/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot),
      })
      if (!response.ok) throw new Error('Failed to update snapshot')
      return response.json()
    } catch (error) {
      console.error('snapshotApi.updateSnapshot:', error)
      throw error
    }
  },

  async deleteSnapshot(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/snapshots/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete snapshot')
    } catch (error) {
      console.error('snapshotApi.deleteSnapshot:', error)
      throw error
    }
  },

  async getSnapshot(id: string): Promise<Snapshot> {
    try {
      const response = await fetch(`/api/snapshots/${id}`)
      if (!response.ok) throw new Error('Failed to load snapshot')
      return response.json()
    } catch (error) {
      console.error('snapshotApi.getSnapshot:', error)
      throw error
    }
  },

  async compareSnapshots(
    idA: string,
    idB: string,
  ): Promise<SnapshotComparison> {
    try {
      const response = await fetch(
        `/api/snapshots/compare?idA=${idA}&idB=${idB}`,
      )
      if (!response.ok) throw new Error('Failed to compare snapshots')
      return response.json()
    } catch (error) {
      console.error('snapshotApi.compareSnapshots:', error)
      throw error
    }
  },

  async getSnapshotHistory(snapshotId: string): Promise<Snapshot[]> {
    try {
      const response = await fetch(`/api/snapshots/${snapshotId}/history`)
      if (!response.ok) throw new Error('Failed to load snapshot history')
      return response.json()
    } catch (error) {
      console.error('snapshotApi.getSnapshotHistory:', error)
      throw error
    }
  },

  async restoreSnapshot(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/snapshots/${id}/restore`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to restore snapshot')
    } catch (error) {
      console.error('snapshotApi.restoreSnapshot:', error)
      throw error
    }
  },
}
