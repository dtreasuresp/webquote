/**
 * Tests para discountsStore
 */

import { renderHook, act } from '@testing-library/react'
import { useDiscountsStore } from '../discountsStore'

jest.mock('../utils/discountsApi', () => ({
  discountsApi: {
    getConfig: jest.fn(),
    updateConfig: jest.fn(),
    saveConfig: jest.fn(),
  },
}))

import { discountsApi } from '../utils/discountsApi'

describe('discountsStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useDiscountsStore())
    act(() => {
      result.current.resetDiscounts()
    })
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useDiscountsStore())

      expect(result.current.config).toBeNull()
      expect(result.current.expandedGroups).toEqual({})
      expect(result.current.isLoading).toBe(false)
      expect(result.current.errors).toEqual({})
    })
  })

  describe('loadConfig', () => {
    it('should load config successfully', async () => {
      const mockConfig = { id: 'disc-1', porcentajeDescuento: 10 }
      ;(discountsApi.getConfig as jest.Mock).mockResolvedValueOnce(mockConfig)

      const { result } = renderHook(() => useDiscountsStore())

      await act(async () => {
        await result.current.loadConfig()
      })

      expect(result.current.config).toEqual(mockConfig)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.errors).toEqual({})
    })

    it('should handle load error', async () => {
      const error = new Error('Load failed')
      ;(discountsApi.getConfig as jest.Mock).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useDiscountsStore())

      await act(async () => {
        await result.current.loadConfig()
      })

      expect(result.current.errors._global).toBe('Load failed')
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('updateConfig', () => {
    it('should update config optimistically', async () => {
      const originalConfig = { id: 'disc-1', porcentajeDescuento: 10 }
      act(() => {
        useDiscountsStore.setState({ config: originalConfig })
      })

      ;(discountsApi.updateConfig as jest.Mock).mockResolvedValueOnce({})

      const { result } = renderHook(() => useDiscountsStore())

      await act(async () => {
        await result.current.updateConfig({ porcentajeDescuento: 15 })
      })

      expect(result.current.config?.porcentajeDescuento).toBe(15)
      expect(result.current.errors).toEqual({})
    })

    it('should rollback on error', async () => {
      const originalConfig = { id: 'disc-1', porcentajeDescuento: 10 }
      act(() => {
        useDiscountsStore.setState({ config: originalConfig })
      })

      ;(discountsApi.updateConfig as jest.Mock).mockRejectedValueOnce(new Error('Update failed'))

      const { result } = renderHook(() => useDiscountsStore())

      await act(async () => {
        await result.current.updateConfig({ porcentajeDescuento: 15 })
      })

      expect(result.current.config).toEqual(originalConfig)
      expect(result.current.errors._global).toBe('Update failed')
    })
  })

  describe('saveConfig', () => {
    it('should save config successfully', async () => {
      const config = { id: 'disc-1', porcentajeDescuento: 10 }
      act(() => {
        useDiscountsStore.setState({ config })
      })

      ;(discountsApi.saveConfig as jest.Mock).mockResolvedValueOnce(config)

      const { result } = renderHook(() => useDiscountsStore())

      await act(async () => {
        await result.current.saveConfig()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.errors).toEqual({})
      expect(discountsApi.saveConfig).toHaveBeenCalledWith(config)
    })

    it('should error if no config to save', async () => {
      const { result } = renderHook(() => useDiscountsStore())

      await act(async () => {
        await result.current.saveConfig()
      })

      expect(result.current.errors._global).toBe('No configuration to save')
    })
  })

  describe('toggleExpanded', () => {
    it('should toggle expanded group', () => {
      const { result } = renderHook(() => useDiscountsStore())

      act(() => {
        result.current.toggleExpanded('group-1')
      })

      expect(result.current.expandedGroups['group-1']).toBe(true)

      act(() => {
        result.current.toggleExpanded('group-1')
      })

      expect(result.current.expandedGroups['group-1']).toBe(false)
    })
  })

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      const { result } = renderHook(() => useDiscountsStore())

      act(() => {
        useDiscountsStore.setState({ errors: { test: 'error' } })
        result.current.clearErrors()
      })

      expect(result.current.errors).toEqual({})
    })
  })

  describe('resetDiscounts', () => {
    it('should reset store to default state', () => {
      const { result } = renderHook(() => useDiscountsStore())

      act(() => {
        useDiscountsStore.setState({
          config: { id: 'disc-1', porcentajeDescuento: 10 },
          expandedGroups: { group: true },
        })
        result.current.resetDiscounts()
      })

      expect(result.current.config).toBeNull()
      expect(result.current.expandedGroups).toEqual({})
    })
  })
})
