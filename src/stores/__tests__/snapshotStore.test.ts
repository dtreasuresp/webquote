/**
 * Tests for snapshotStore
 */

import { renderHook, act } from '@testing-library/react'
import { useSnapshotStore } from '../snapshotStore'

jest.mock('../utils/snapshotApi', () => ({
  snapshotApi: {
    getSnapshots: jest.fn(),
    createSnapshot: jest.fn(),
    updateSnapshot: jest.fn(),
    deleteSnapshot: jest.fn(),
    getSnapshot: jest.fn(),
    compareSnapshots: jest.fn(),
    getSnapshotHistory: jest.fn(),
    restoreSnapshot: jest.fn(),
  },
}))

import { snapshotApi } from '../utils/snapshotApi'

const mockSnapshot = {
  id: 'snap-1',
  nombre: 'Snapshot 1',
  descripcion: 'Test snapshot',
  fechaCreacion: '2024-12-16',
  versión: 1,
  contenido: { test: 'data' },
}

const mockSnapshot2 = {
  id: 'snap-2',
  nombre: 'Snapshot 2',
  descripcion: 'Test snapshot 2',
  fechaCreacion: '2024-12-16',
  versión: 1,
  contenido: { test: 'data2' },
}

describe('snapshotStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useSnapshotStore())
    act(() => {
      result.current.resetSnapshots()
    })
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSnapshotStore())

      expect(result.current.snapshots).toEqual([])
      expect(result.current.comparando).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('loadSnapshots', () => {
    it('should load snapshots from API', async () => {
      const mockSnapshots = [mockSnapshot, mockSnapshot2]
      ;(snapshotApi.getSnapshots as jest.Mock).mockResolvedValueOnce(
        mockSnapshots,
      )

      const { result } = renderHook(() => useSnapshotStore())

      await act(async () => {
        await result.current.loadSnapshots()
      })

      expect(result.current.snapshots).toEqual(mockSnapshots)
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle load error', async () => {
      const error = new Error('Load failed')
      ;(snapshotApi.getSnapshots as jest.Mock).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useSnapshotStore())

      await act(async () => {
        await result.current.loadSnapshots()
      })

      expect(result.current.errors._global).toBe('Load failed')
    })
  })

  describe('createSnapshot', () => {
    it('should create new snapshot', async () => {
      ;(snapshotApi.createSnapshot as jest.Mock).mockResolvedValueOnce(
        mockSnapshot,
      )

      const { result } = renderHook(() => useSnapshotStore())

      await act(async () => {
        await result.current.createSnapshot({ nombre: 'New' })
      })

      expect(result.current.snapshots).toContainEqual(mockSnapshot)
      expect(result.current.nuevoSnapshot).toEqual({})
    })

    it('should handle create error', async () => {
      const error = new Error('Create failed')
      ;(snapshotApi.createSnapshot as jest.Mock).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useSnapshotStore())

      await act(async () => {
        await result.current.createSnapshot({ nombre: 'New' })
      })

      expect(result.current.errors._global).toBe('Create failed')
    })
  })

  describe('updateSnapshot', () => {
    it('should update snapshot', async () => {
      useSnapshotStore.setState({ snapshots: [mockSnapshot] })
      ;(snapshotApi.updateSnapshot as jest.Mock).mockResolvedValueOnce({
        ...mockSnapshot,
        nombre: 'Updated',
      })

      const { result } = renderHook(() => useSnapshotStore())

      await act(async () => {
        await result.current.updateSnapshot('snap-1', { nombre: 'Updated' })
      })

      expect(result.current.snapshots[0].nombre).toBe('Updated')
    })
  })

  describe('deleteSnapshot', () => {
    it('should delete snapshot', async () => {
      useSnapshotStore.setState({ snapshots: [mockSnapshot, mockSnapshot2] })
      ;(snapshotApi.deleteSnapshot as jest.Mock).mockResolvedValueOnce(
        undefined,
      )

      const { result } = renderHook(() => useSnapshotStore())

      await act(async () => {
        await result.current.deleteSnapshot('snap-1')
      })

      expect(result.current.snapshots).toEqual([mockSnapshot2])
    })
  })

  describe('selectSnapshot', () => {
    it('should select snapshot', () => {
      useSnapshotStore.setState({ snapshots: [mockSnapshot] })

      const { result } = renderHook(() => useSnapshotStore())

      act(() => {
        result.current.selectSnapshot('snap-1')
      })

      expect(result.current.snapshotSeleccionado).toEqual(mockSnapshot)
    })
  })

  describe('Editing', () => {
    it('should start editing', () => {
      useSnapshotStore.setState({ snapshots: [mockSnapshot] })

      const { result } = renderHook(() => useSnapshotStore())

      act(() => {
        result.current.startEditing('snap-1')
      })

      expect(result.current.editandoSnapshotId).toBe('snap-1')
      expect(result.current.nuevoSnapshot).toEqual(mockSnapshot)
    })

    it('should cancel editing', () => {
      useSnapshotStore.setState({
        editandoSnapshotId: 'snap-1',
        nuevoSnapshot: mockSnapshot,
      })

      const { result } = renderHook(() => useSnapshotStore())

      act(() => {
        result.current.cancelEditing()
      })

      expect(result.current.editandoSnapshotId).toBeUndefined()
      expect(result.current.nuevoSnapshot).toEqual({})
    })
  })

  describe('Comparison', () => {
    it('should start comparison', () => {
      useSnapshotStore.setState({ snapshots: [mockSnapshot] })

      const { result } = renderHook(() => useSnapshotStore())

      act(() => {
        result.current.startComparison('snap-1')
      })

      expect(result.current.comparando).toBe(true)
      expect(result.current.snapshotAComparar).toEqual(mockSnapshot)
    })

    it('should compare snapshots', async () => {
      const comparison = {
        snapshotA: mockSnapshot,
        snapshotB: mockSnapshot2,
        diferencias: [
          { campo: 'nombre', valorAnterior: 'Snapshot 1', valorNuevo: 'Snapshot 2' },
        ],
      }

      ;(snapshotApi.compareSnapshots as jest.Mock).mockResolvedValueOnce(
        comparison,
      )

      const { result } = renderHook(() => useSnapshotStore())

      await act(async () => {
        await result.current.compareSnapshots('snap-1', 'snap-2')
      })

      expect(result.current.resultadoComparacion).toEqual(comparison)
    })

    it('should end comparison', () => {
      useSnapshotStore.setState({
        comparando: true,
        snapshotAComparar: mockSnapshot,
      })

      const { result } = renderHook(() => useSnapshotStore())

      act(() => {
        result.current.endComparison()
      })

      expect(result.current.comparando).toBe(false)
      expect(result.current.snapshotAComparar).toBeUndefined()
    })
  })

  describe('resetSnapshots', () => {
    it('should reset store to default state', () => {
      const { result } = renderHook(() => useSnapshotStore())

      act(() => {
        useSnapshotStore.setState({ snapshots: [mockSnapshot] })
        result.current.resetSnapshots()
      })

      expect(result.current.snapshots).toEqual([])
      expect(result.current.comparando).toBe(false)
    })
  })
})
