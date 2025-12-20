/**
 * Tests para servicesStore
 */

import { renderHook, act } from '@testing-library/react'
import { useServicesStore } from '../servicesStore'

jest.mock('../utils/servicesApi', () => ({
  servicesApi: {
    getBaseServices: jest.fn(),
    createBaseService: jest.fn(),
    updateBaseService: jest.fn(),
    deleteBaseService: jest.fn(),
    getOptionalServices: jest.fn(),
    createOptionalService: jest.fn(),
    updateOptionalService: jest.fn(),
    deleteOptionalService: jest.fn(),
  },
}))

import { servicesApi } from '../utils/servicesApi'

describe('servicesStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useServicesStore())
    act(() => {
      result.current.resetServices()
    })
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useServicesStore())

      expect(result.current.baseServices).toEqual([])
      expect(result.current.optionalServices).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.errors).toEqual({})
    })
  })

  describe('Base Services', () => {
    it('should load base services', async () => {
      const mockServices = [
        { id: 'base-1', nombre: 'Service 1' },
        { id: 'base-2', nombre: 'Service 2' },
      ]
      ;(servicesApi.getBaseServices as jest.Mock).mockResolvedValueOnce(mockServices)

      const { result } = renderHook(() => useServicesStore())

      await act(async () => {
        await result.current.loadBaseServices()
      })

      expect(result.current.baseServices).toEqual(mockServices)
      expect(result.current.isLoading).toBe(false)
    })

    it('should add base service', async () => {
      const newService = { id: 'base-1', nombre: 'New Service' }
      ;(servicesApi.createBaseService as jest.Mock).mockResolvedValueOnce(newService)

      const { result } = renderHook(() => useServicesStore())

      await act(async () => {
        await result.current.addBaseService({ nombre: 'New Service' })
      })

      expect(result.current.baseServices).toContainEqual(newService)
    })

    it('should update base service', async () => {
      const originalService = { id: 'base-1', nombre: 'Original' }
      const updatedService = { id: 'base-1', nombre: 'Updated' }

      act(() => {
        useServicesStore.setState({ baseServices: [originalService] })
      })

      ;(servicesApi.updateBaseService as jest.Mock).mockResolvedValueOnce(updatedService)

      const { result } = renderHook(() => useServicesStore())

      await act(async () => {
        await result.current.updateBaseService('base-1', { nombre: 'Updated' })
      })

      expect(result.current.baseServices[0]).toEqual(updatedService)
    })

    it('should delete base service', async () => {
      const service = { id: 'base-1', nombre: 'Service' }
      act(() => {
        useServicesStore.setState({ baseServices: [service] })
      })

      ;(servicesApi.deleteBaseService as jest.Mock).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useServicesStore())

      await act(async () => {
        await result.current.deleteBaseService('base-1')
      })

      expect(result.current.baseServices).toEqual([])
    })

    it('should start editing base service', () => {
      const service = { id: 'base-1', nombre: 'Service' }
      const { result } = renderHook(() => useServicesStore())

      act(() => {
        result.current.startEditingBase(service)
      })

      expect(result.current.editingBase).toEqual(service)
      expect(result.current.editingBaseId).toBe('base-1')
    })

    it('should cancel editing base service', () => {
      const { result } = renderHook(() => useServicesStore())

      act(() => {
        result.current.startEditingBase({ id: 'base-1', nombre: 'Service' })
        result.current.cancelEditingBase()
      })

      expect(result.current.editingBase).toBeNull()
      expect(result.current.editingBaseId).toBeNull()
    })
  })

  describe('Optional Services', () => {
    it('should load optional services', async () => {
      const mockServices = [
        { id: 'opt-1', nombre: 'Option 1' },
        { id: 'opt-2', nombre: 'Option 2' },
      ]
      ;(servicesApi.getOptionalServices as jest.Mock).mockResolvedValueOnce(mockServices)

      const { result } = renderHook(() => useServicesStore())

      await act(async () => {
        await result.current.loadOptionalServices()
      })

      expect(result.current.optionalServices).toEqual(mockServices)
    })

    it('should add optional service', async () => {
      const newService = { id: 'opt-1', nombre: 'New Option' }
      ;(servicesApi.createOptionalService as jest.Mock).mockResolvedValueOnce(newService)

      const { result } = renderHook(() => useServicesStore())

      await act(async () => {
        await result.current.addOptionalService({ nombre: 'New Option' })
      })

      expect(result.current.optionalServices).toContainEqual(newService)
    })

    it('should start editing optional service', () => {
      const service = { id: 'opt-1', nombre: 'Option' }
      const { result } = renderHook(() => useServicesStore())

      act(() => {
        result.current.startEditing(service)
      })

      expect(result.current.editing).toEqual(service)
      expect(result.current.editingId).toBe('opt-1')
    })
  })

  describe('Error Handling', () => {
    it('should handle load error', async () => {
      const error = new Error('Load failed')
      ;(servicesApi.getBaseServices as jest.Mock).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useServicesStore())

      await act(async () => {
        await result.current.loadBaseServices()
      })

      expect(result.current.errors._global).toBe('Load failed')
      expect(result.current.isLoading).toBe(false)
    })

    it('should clear errors', () => {
      const { result } = renderHook(() => useServicesStore())

      act(() => {
        useServicesStore.setState({ errors: { test: 'error' } })
        result.current.clearErrors()
      })

      expect(result.current.errors).toEqual({})
    })
  })

  describe('Reset', () => {
    it('should reset store to default state', () => {
      const { result } = renderHook(() => useServicesStore())

      act(() => {
        useServicesStore.setState({
          baseServices: [{ id: '1', nombre: 'Service' }],
          optionalServices: [{ id: '2', nombre: 'Option' }],
        })
        result.current.resetServices()
      })

      expect(result.current.baseServices).toEqual([])
      expect(result.current.optionalServices).toEqual([])
    })
  })
})
