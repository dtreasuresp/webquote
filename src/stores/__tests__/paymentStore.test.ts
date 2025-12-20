/**
 * Tests para paymentStore
 */

import { renderHook, act } from '@testing-library/react'
import { usePaymentStore } from '../paymentStore'

jest.mock('../utils/paymentApi', () => ({
  paymentApi: {
    getPaymentOptions: jest.fn(),
    getPreferredMethods: jest.fn(),
    savePaymentPreferences: jest.fn(),
    processPayment: jest.fn(),
  },
}))

import { paymentApi } from '../utils/paymentApi'

describe('paymentStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => usePaymentStore())
    act(() => {
      result.current.resetPayment()
    })
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => usePaymentStore())

      expect(result.current.currentPackage).toBeNull()
      expect(result.current.paymentOptions).toEqual([])
      expect(result.current.preferredMethod).toBeNull()
      expect(result.current.notes).toBe('')
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('setCurrentPackage', () => {
    it('should set current package', () => {
      const pkg = { id: 'pkg-1', name: 'Package 1' }
      const { result } = renderHook(() => usePaymentStore())

      act(() => {
        result.current.setCurrentPackage(pkg)
      })

      expect(result.current.currentPackage).toEqual(pkg)
    })
  })

  describe('setPaymentOptions', () => {
    it('should set payment options', () => {
      const options = [
        { id: 'opt-1', nombre: 'Option 1' },
        { id: 'opt-2', nombre: 'Option 2' },
      ]
      const { result } = renderHook(() => usePaymentStore())

      act(() => {
        result.current.setPaymentOptions(options)
      })

      expect(result.current.paymentOptions).toEqual(options)
    })
  })

  describe('setPreferredMethod', () => {
    it('should set preferred method', () => {
      const { result } = renderHook(() => usePaymentStore())

      act(() => {
        result.current.setPreferredMethod('method-1')
      })

      expect(result.current.preferredMethod).toBe('method-1')
    })
  })

  describe('updateNotes', () => {
    it('should update notes', () => {
      const { result } = renderHook(() => usePaymentStore())
      const notes = 'Test payment notes'

      act(() => {
        result.current.updateNotes(notes)
      })

      expect(result.current.notes).toBe(notes)
    })
  })

  describe('loadPaymentMethods', () => {
    it('should load payment methods and options', async () => {
      const mockOptions = [
        { id: 'opt-1', nombre: 'Option 1' },
      ]
      const mockMethods = [
        { id: 'meth-1', nombre: 'Method 1' },
      ]

      ;(paymentApi.getPaymentOptions as jest.Mock).mockResolvedValueOnce(mockOptions)
      ;(paymentApi.getPreferredMethods as jest.Mock).mockResolvedValueOnce(mockMethods)

      const { result } = renderHook(() => usePaymentStore())

      await act(async () => {
        await result.current.loadPaymentMethods()
      })

      expect(result.current.paymentOptions).toEqual(mockOptions)
      expect(result.current.preferredMethods).toEqual(mockMethods)
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle load error', async () => {
      const error = new Error('Load failed')
      ;(paymentApi.getPaymentOptions as jest.Mock).mockRejectedValueOnce(error)

      const { result } = renderHook(() => usePaymentStore())

      await act(async () => {
        await result.current.loadPaymentMethods()
      })

      expect(result.current.errors._global).toBe('Load failed')
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('savePaymentPreferences', () => {
    it('should save payment preferences', async () => {
      ;(paymentApi.savePaymentPreferences as jest.Mock).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => usePaymentStore())

      act(() => {
        result.current.setPreferredMethod('method-1')
        result.current.updateNotes('Notes')
      })

      await act(async () => {
        await result.current.savePaymentPreferences()
      })

      expect(paymentApi.savePaymentPreferences).toHaveBeenCalledWith({
        preferredMethod: 'method-1',
        notes: 'Notes',
      })
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle save error', async () => {
      const error = new Error('Save failed')
      ;(paymentApi.savePaymentPreferences as jest.Mock).mockRejectedValueOnce(error)

      const { result } = renderHook(() => usePaymentStore())

      await act(async () => {
        await result.current.savePaymentPreferences()
      })

      expect(result.current.errors._global).toBe('Save failed')
    })
  })

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      const { result } = renderHook(() => usePaymentStore())

      act(() => {
        usePaymentStore.setState({ errors: { test: 'error' } })
        result.current.clearErrors()
      })

      expect(result.current.errors).toEqual({})
    })
  })

  describe('resetPayment', () => {
    it('should reset store to default state', () => {
      const { result } = renderHook(() => usePaymentStore())

      act(() => {
        result.current.setCurrentPackage({ id: 'pkg-1' })
        result.current.setPreferredMethod('method-1')
        result.current.updateNotes('Notes')
        result.current.resetPayment()
      })

      expect(result.current.currentPackage).toBeNull()
      expect(result.current.preferredMethod).toBeNull()
      expect(result.current.notes).toBe('')
    })
  })
})
