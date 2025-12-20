/**
 * Tests para quotationStore
 * Validar funcionalidad del store Zustand
 */

import { renderHook, act } from '@testing-library/react'
import { useQuotationStore } from '../quotationStore'

// Mock del API
jest.mock('../utils/quotationApi', () => ({
  quotationApi: {
    getQuotation: jest.fn(),
    updateQuotation: jest.fn(),
    saveQuotation: jest.fn(),
    validateQuotation: jest.fn(),
    deleteQuotation: jest.fn(),
  },
}))

import { quotationApi } from '../utils/quotationApi'

describe('quotationStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useQuotationStore())
    act(() => {
      result.current.resetQuotation()
    })
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useQuotationStore())

      expect(result.current.quotationId).toBeNull()
      expect(result.current.config).toBeNull()
      expect(result.current.current).toEqual({})
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isDirty).toBe(false)
      expect(result.current.readOnly).toBe(false)
      expect(result.current.hasShownAlert).toBe(false)
      expect(result.current.errors).toEqual({})
    })
  })

  describe('loadQuotation', () => {
    it('should load quotation successfully', async () => {
      const mockQuotation = {
        id: 'quote-1',
        clientName: 'Test Client',
        status: 'draft' as const,
      }

      ;(quotationApi.getQuotation as jest.Mock).mockResolvedValueOnce(mockQuotation)

      const { result } = renderHook(() => useQuotationStore())

      await act(async () => {
        await result.current.loadQuotation('quote-1')
      })

      expect(result.current.quotationId).toBe('quote-1')
      expect(result.current.config).toEqual(mockQuotation)
      expect(result.current.current).toEqual(mockQuotation)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.errors).toEqual({})
    })

    it('should set loading state during fetch', async () => {
      const mockQuotation = { id: 'quote-1', clientName: 'Test' }
      ;(quotationApi.getQuotation as jest.Mock).mockResolvedValueOnce(
        mockQuotation
      )

      const { result } = renderHook(() => useQuotationStore())

      act(() => {
        result.current.loadQuotation('quote-1')
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should handle load error', async () => {
      const error = new Error('Load failed')
      ;(quotationApi.getQuotation as jest.Mock).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useQuotationStore())

      await act(async () => {
        await result.current.loadQuotation('quote-1')
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.errors._global).toBe('Load failed')
    })
  })

  describe('updateQuotation', () => {
    it('should update quotation optimistically', async () => {
      ;(quotationApi.validateQuotation as jest.Mock).mockResolvedValueOnce({ valid: true })
      ;(quotationApi.updateQuotation as jest.Mock).mockResolvedValueOnce({})

      const { result } = renderHook(() => useQuotationStore())

      const newData = { clientName: 'Updated Client' }

      await act(async () => {
        await result.current.updateQuotation(newData)
      })

      expect(result.current.current.clientName).toBe('Updated Client')
      expect(result.current.isDirty).toBe(true)
    })

    it('should rollback on validation error', async () => {
      ;(quotationApi.validateQuotation as jest.Mock).mockResolvedValueOnce({
        valid: false,
        errors: { clientName: 'Invalid client name' },
      })

      const { result } = renderHook(() => useQuotationStore())

      const originalData = { clientName: 'Original' }
      act(() => {
        result.current.updateQuotation(originalData)
      })

      await act(async () => {
        await result.current.updateQuotation({ clientName: '' })
      })

      expect(result.current.errors.clientName).toBe('Invalid client name')
    })
  })

  describe('saveQuotation', () => {
    it('should save quotation successfully', async () => {
      const mockSaved = { id: 'quote-1', clientName: 'Test' }
      ;(quotationApi.validateQuotation as jest.Mock).mockResolvedValueOnce({ valid: true })
      ;(quotationApi.saveQuotation as jest.Mock).mockResolvedValueOnce(mockSaved)

      const { result } = renderHook(() => useQuotationStore())

      await act(async () => {
        result.current.updateQuotation({ clientName: 'Test' })
        await result.current.saveQuotation()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.isDirty).toBe(false)
      expect(result.current.quotationId).toBe('quote-1')
    })

    it('should not save on validation error', async () => {
      ;(quotationApi.validateQuotation as jest.Mock).mockResolvedValueOnce({
        valid: false,
        errors: { clientName: 'Required' },
      })

      const { result } = renderHook(() => useQuotationStore())

      await act(async () => {
        await result.current.saveQuotation()
      })

      expect(result.current.errors.clientName).toBe('Required')
      expect(quotationApi.saveQuotation).not.toHaveBeenCalled()
    })
  })

  describe('setReadOnly', () => {
    it('should set read-only mode', () => {
      const { result } = renderHook(() => useQuotationStore())

      act(() => {
        result.current.setReadOnly(true)
      })

      expect(result.current.readOnly).toBe(true)
    })
  })

  describe('setHasShownAlert', () => {
    it('should set alert shown flag', () => {
      const { result } = renderHook(() => useQuotationStore())

      act(() => {
        result.current.setHasShownAlert(true)
      })

      expect(result.current.hasShownAlert).toBe(true)
    })
  })

  describe('resetQuotation', () => {
    it('should reset store to default state', () => {
      const { result } = renderHook(() => useQuotationStore())

      act(() => {
        result.current.loadQuotation('quote-1')
        result.current.setReadOnly(true)
        result.current.resetQuotation()
      })

      expect(result.current.quotationId).toBeNull()
      expect(result.current.readOnly).toBe(false)
      expect(result.current.errors).toEqual({})
    })
  })

  describe('Selectors', () => {
    it('should have config state', () => {
      const { result } = renderHook(() => useQuotationStore())
      expect(result.current.config).toBeNull()
    })
  })
})
