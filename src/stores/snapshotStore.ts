/**
 * Zustand store for snapshot management
 * Handles snapshot CRUD, history, comparison, and state
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { snapshotApi } from './utils/snapshotApi'
import {
  SnapshotStore,
  DEFAULT_SNAPSHOT_STATE,
  Snapshot,
} from './types/snapshot.types'

export const useSnapshotStore = create<SnapshotStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SNAPSHOT_STATE,

      // Load all snapshots
      loadSnapshots: async () => {
        set({ isLoading: true, errors: {} })
        try {
          const snapshots = await snapshotApi.getSnapshots()
          set({
            snapshots,
            snapshotsHistoria: {
              snapshots,
              comparisonMode: false,
            },
            isLoading: false,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error loading snapshots'
          set({ isLoading: false, errors: { _global: message } })
        }
      },

      // Create new snapshot
      createSnapshot: async (snapshot) => {
        set({ isLoading: true, errors: {} })
        try {
          const newSnapshot = await snapshotApi.createSnapshot(snapshot)
          const { snapshots } = get()
          set({
            snapshots: [...snapshots, newSnapshot],
            snapshotsHistoria: {
              snapshots: [...snapshots, newSnapshot],
              comparisonMode: false,
            },
            nuevoSnapshot: {},
            isLoading: false,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error creating snapshot'
          set({ isLoading: false, errors: { _global: message } })
        }
      },

      // Update snapshot
      updateSnapshot: async (id, snapshot) => {
        set({ isLoading: true, errors: {} })
        try {
          const updated = await snapshotApi.updateSnapshot(id, snapshot)
          const { snapshots } = get()
          set({
            snapshots: snapshots.map((s) => (s.id === id ? updated : s)),
            snapshotActual:
              get().snapshotActual?.id === id ? updated : get().snapshotActual,
            editandoSnapshotId: undefined,
            nuevoSnapshot: {},
            isLoading: false,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error updating snapshot'
          set({ isLoading: false, errors: { _global: message } })
        }
      },

      // Set snapshots directly (for useState migration compatibility)
      setSnapshots: (snapshots) => {
        if (typeof snapshots === 'function') {
          const { snapshots: currentSnapshots } = get()
          set({ snapshots: (snapshots as any)(currentSnapshots) })
        } else {
          set({ snapshots })
        }
      },

      // Set snapshot being edited (for useState migration compatibility)
      setSnapshotEditando: (snapshot: Snapshot | null) => {
        set({ snapshotSeleccionado: snapshot || undefined })
      },

      // Delete snapshot
      deleteSnapshot: async (id) => {
        set({ isLoading: true, errors: {} })
        try {
          await snapshotApi.deleteSnapshot(id)
          const { snapshots } = get()
          set({
            snapshots: snapshots.filter((s) => s.id !== id),
            snapshotActual:
              get().snapshotActual?.id === id ? undefined : get().snapshotActual,
            snapshotSeleccionado:
              get().snapshotSeleccionado?.id === id
                ? undefined
                : get().snapshotSeleccionado,
            isLoading: false,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error deleting snapshot'
          set({ isLoading: false, errors: { _global: message } })
        }
      },

      // Select snapshot
      selectSnapshot: (id) => {
        const { snapshots } = get()
        const selected = snapshots.find((s) => s.id === id)
        if (selected) {
          set({ snapshotSeleccionado: selected })
        }
      },

      // Set current snapshot
      setSnapshotActual: (snapshot) => {
        set({ snapshotActual: snapshot })
      },

      // Start editing
      startEditing: (snapshotId) => {
        const { snapshots } = get()
        const snapshot = snapshots.find((s) => s.id === snapshotId)
        if (snapshot) {
          set({
            editandoSnapshotId: snapshotId,
            nuevoSnapshot: { ...snapshot },
          })
        }
      },

      // Cancel editing
      cancelEditing: () => {
        set({ editandoSnapshotId: undefined, nuevoSnapshot: {} })
      },

      // Set new snapshot data
      setNewSnapshot: (snapshot) => {
        set({ nuevoSnapshot: snapshot })
      },

      // Start comparison
      startComparison: (snapshotId) => {
        const { snapshots } = get()
        const snapshot = snapshots.find((s) => s.id === snapshotId)
        if (snapshot) {
          set({
            comparando: true,
            snapshotAComparar: snapshot,
          })
        }
      },

      // Compare two snapshots
      compareSnapshots: async (snapshotAId, snapshotBId) => {
        set({ isLoading: true, errors: {} })
        try {
          const comparison = await snapshotApi.compareSnapshots(
            snapshotAId,
            snapshotBId,
          )
          set({
            resultadoComparacion: comparison,
            isLoading: false,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error comparing snapshots'
          set({ isLoading: false, errors: { _global: message } })
        }
      },

      // End comparison
      endComparison: () => {
        set({
          comparando: false,
          snapshotAComparar: undefined,
          resultadoComparacion: undefined,
        })
      },

      // Clear errors
      clearErrors: () => {
        set({ errors: {} })
      },

      // Reset store
      resetSnapshots: () => {
        set(DEFAULT_SNAPSHOT_STATE)
      },
    }),
    {
      name: 'snapshot-store',
      partialize: (state) => ({
        snapshots: state.snapshots,
        snapshotActual: state.snapshotActual,
        snapshotSeleccionado: state.snapshotSeleccionado,
      }),
    },
  ),
)

// Optimized selectors
export const useSnapshotsLoading = () =>
  useSnapshotStore((state) => state.isLoading)
export const useSnapshotsError = () =>
  useSnapshotStore((state) => state.errors)
export const useSnapshotsList = () =>
  useSnapshotStore((state) => state.snapshots)
export const useSnapshotActual = () =>
  useSnapshotStore((state) => state.snapshotActual)
export const useSnapshotComparison = () =>
  useSnapshotStore((state) => ({
    comparando: state.comparando,
    resultado: state.resultadoComparacion,
  }))
export const useSnapshotEditing = () =>
  useSnapshotStore((state) => ({
    editandoId: state.editandoSnapshotId,
    nuevoSnapshot: state.nuevoSnapshot,
  }))
