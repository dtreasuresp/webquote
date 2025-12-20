/**
 * Type definitions for snapshotStore
 */

import { ServicioBase, Servicio } from './services.types'

export interface Snapshot {
  id: string
  nombre: string
  serviciosBase: ServicioBase[]
  paquete: any
  otrosServicios: Servicio[] | any[]
  costos: any
  quotationConfigId?: string
  createdAt: string
  updatedAt?: string
  fechaCreacion?: string
  versión?: number
  descripcion?: string
  contenido?: any
  etiquetas?: string[]
  activo: boolean
  [key: string]: any
}

// Alias for compatibility with AdminPage expectations
export type PackageSnapshot = Snapshot

export interface SnapshotComparison {
  snapshotA: Snapshot
  snapshotB: Snapshot
  diferencias: {
    campo: string
    valorAnterior: any
    valorNuevo: any
  }[]
}

export interface SnapshotHistory {
  snapshots: Snapshot[]
  selectedSnapshotId?: string
  comparisonMode: boolean
  compareWith?: string
}

export interface SnapshotState {
  snapshots: Snapshot[]
  snapshotsHistoria: SnapshotHistory
  snapshotActual?: Snapshot
  snapshotSeleccionado?: Snapshot
  editandoSnapshotId?: string
  nuevoSnapshot: Partial<Snapshot>
  comparando: boolean
  snapshotAComparar?: Snapshot
  resultadoComparacion?: SnapshotComparison
  isLoading: boolean
  errors: Record<string, string>
}

export interface SnapshotStore extends SnapshotState {
  // Snapshot CRUD
  loadSnapshots: () => Promise<void>
  createSnapshot: (snapshot: Partial<Snapshot>) => Promise<void>
  updateSnapshot: (id: string, snapshot: Partial<Snapshot>) => Promise<void>
  deleteSnapshot: (id: string) => Promise<void>
  
  // Selection & History
  selectSnapshot: (id: string) => void
  setSnapshotActual: (snapshot: Snapshot) => void
  
  // Editing
  startEditing: (snapshotId: string) => void
  cancelEditing: () => void
  setNewSnapshot: (snapshot: Partial<Snapshot>) => void
  
  // useState migration compatibility
  setSnapshots: (snapshots: Snapshot[] | ((prev: Snapshot[]) => Snapshot[])) => void
  setSnapshotEditando: (snapshot: Snapshot | null) => void
  
  // Comparison
  startComparison: (snapshotId: string) => void
  compareSnapshots: (snapshotAId: string, snapshotBId: string) => Promise<void>
  endComparison: () => void
  
  // Error & Reset
  clearErrors: () => void
  resetSnapshots: () => void
}

export const DEFAULT_SNAPSHOT_STATE: SnapshotState = {
  snapshots: [],
  snapshotsHistoria: {
    snapshots: [],
    comparisonMode: false,
  },
  editandoSnapshotId: undefined,
  nuevoSnapshot: {},
  comparando: false,
  isLoading: false,
  errors: {},
}
