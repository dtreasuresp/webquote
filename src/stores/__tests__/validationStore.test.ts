/**
 * Tests for validationStore
 */

import { renderHook, act } from '@testing-library/react'
import { useValidationStore } from '../validationStore'

jest.mock('../utils/validationApi', () => ({
  validationApi: {
    validateTab: jest.fn(),
    validateQuotation: jest.fn(),
    validateServices: jest.fn(),
    validateAll: jest.fn(),
  },
}))

import { validationApi } from '../utils/validationApi'

const mockValidationResult = {
  isValid: true,
  errors: [],
  warnings: [],
  timestamp: '2024-12-16T00:00:00Z',
}

describe('validationStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useValidationStore())
    act(() => {
      result.current.resetValidation()
    })
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useValidationStore())

      expect(result.current.tabValidation).toEqual({})
      expect(result.current.isValidating).toBe(false)
      expect(result.current.currentTab).toBeUndefined()
    })
  })

  describe('validateTab', () => {
    it('should validate a tab', async () => {
      ;(validationApi.validateTab as jest.Mock).mockResolvedValueOnce(
        mockValidationResult,
      )

      const { result } = renderHook(() => useValidationStore())

      await act(async () => {
        await result.current.validateTab('quotation', 'quotation')
      })

      expect(result.current.tabValidation.quotation).toEqual(mockValidationResult)
      expect(result.current.isValidating).toBe(false)
    })

    it('should handle validation error', async () => {
      const error = new Error('Validation failed')
      ;(validationApi.validateTab as jest.Mock).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useValidationStore())

      await act(async () => {
        await result.current.validateTab('quotation', 'quotation')
      })

      expect(result.current.errors._global).toBe('Validation failed')
    })
  })

  describe('setTabValid', () => {
    it('should set tab validation status', () => {
      const { result } = renderHook(() => useValidationStore())

      act(() => {
        result.current.setTabValid('quotation', true)
      })

      expect(result.current.tabValidation.quotation?.isValid).toBe(true)
    })
  })

  describe('clearTabValidation', () => {
    it('should clear validation for a specific tab', () => {
      useValidationStore.setState({
        tabValidation: { quotation: mockValidationResult },
      })

      const { result } = renderHook(() => useValidationStore())

      act(() => {
        result.current.clearTabValidation('quotation')
      })

      expect(result.current.tabValidation.quotation).toBeUndefined()
    })
  })

  describe('clearAllValidations', () => {
    it('should clear all validations', () => {
      useValidationStore.setState({
        tabValidation: {
          quotation: mockValidationResult,
          services: mockValidationResult,
        },
      })

      const { result } = renderHook(() => useValidationStore())

      act(() => {
        result.current.clearAllValidations()
      })

      expect(result.current.tabValidation).toEqual({})
    })
  })

  describe('getTabValidation', () => {
    it('should return validation for a tab', () => {
      useValidationStore.setState({
        tabValidation: { quotation: mockValidationResult },
      })

      const { result } = renderHook(() => useValidationStore())

      const validation = result.current.getTabValidation('quotation')
      expect(validation).toEqual(mockValidationResult)
    })

    it('should return undefined for non-existent tab', () => {
      const { result } = renderHook(() => useValidationStore())

      const validation = result.current.getTabValidation('nonexistent')
      expect(validation).toBeUndefined()
    })
  })

  describe('setCurrentTab', () => {
    it('should set current tab', () => {
      const { result } = renderHook(() => useValidationStore())

      act(() => {
        result.current.setCurrentTab('quotation')
      })

      expect(result.current.currentTab).toBe('quotation')
    })
  })

  describe('resetValidation', () => {
    it('should reset store to default state', () => {
      useValidationStore.setState({
        tabValidation: { quotation: mockValidationResult },
        currentTab: 'quotation',
      })

      const { result } = renderHook(() => useValidationStore())

      act(() => {
        result.current.resetValidation()
      })

      expect(result.current.tabValidation).toEqual({})
      expect(result.current.currentTab).toBeUndefined()
    })
  })
})
