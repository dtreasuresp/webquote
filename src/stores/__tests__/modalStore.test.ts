/**
 * Tests for modalStore
 */

import { renderHook, act } from '@testing-library/react'
import { useModalStore } from '../modalStore'

jest.mock('../utils/modalApi', () => ({
  modalApi: {
    confirmDelete: jest.fn(),
    saveChanges: jest.fn(),
    getSnapshotList: jest.fn(),
    getTemplateList: jest.fn(),
  },
}))

describe('modalStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useModalStore())
    act(() => {
      result.current.resetModals()
    })
  })

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useModalStore())

      expect(result.current.modals).toEqual({})
      expect(result.current.activeModalId).toBeUndefined()
    })
  })

  describe('openModal & closeModal', () => {
    it('should open a modal', () => {
      const { result } = renderHook(() => useModalStore())

      act(() => {
        result.current.openModal('test-modal', {
          title: 'Test',
          message: 'Test message',
          type: 'error',
        })
      })

      expect(result.current.modals['test-modal']).toBeDefined()
      expect(result.current.activeModalId).toBe('test-modal')
    })

    it('should close a modal', () => {
      const { result } = renderHook(() => useModalStore())

      act(() => {
        result.current.openModal('test-modal', {
          title: 'Test',
          message: 'Test message',
          type: 'error',
        })
        result.current.closeModal('test-modal')
      })

      expect(result.current.modals['test-modal']).toBeUndefined()
    })
  })

  describe('closeAllModals', () => {
    it('should close all open modals', () => {
      const { result } = renderHook(() => useModalStore())

      act(() => {
        result.current.openModal('modal-1', {
          title: 'Test 1',
          message: 'Message 1',
          type: 'error',
        })
        result.current.openModal('modal-2', {
          title: 'Test 2',
          message: 'Message 2',
          type: 'success',
        })
        result.current.closeAllModals()
      })

      expect(result.current.modals).toEqual({})
      expect(result.current.activeModalId).toBeUndefined()
    })
  })

  describe('updateModalConfig', () => {
    it('should update modal configuration', () => {
      const { result } = renderHook(() => useModalStore())

      act(() => {
        result.current.openModal('test-modal', {
          title: 'Test',
          message: 'Test message',
          type: 'error',
        })
        result.current.updateModalConfig('test-modal', {
          title: 'Updated',
        })
      })

      expect(result.current.modals['test-modal'].title).toBe('Updated')
    })
  })

  describe('setModalLoading', () => {
    it('should set modal loading state', () => {
      const { result } = renderHook(() => useModalStore())

      act(() => {
        result.current.openModal('test-modal', {
          title: 'Test',
          message: 'Test message',
          type: 'error',
        })
        result.current.setModalLoading('test-modal', true)
      })

      expect(result.current.modals['test-modal'].loading).toBe(true)
    })
  })

  describe('setModalError', () => {
    it('should set modal error', () => {
      const { result } = renderHook(() => useModalStore())

      act(() => {
        result.current.openModal('test-modal', {
          title: 'Test',
          message: 'Test message',
          type: 'error',
        })
        result.current.setModalError('test-modal', 'Test error')
      })

      expect(result.current.modals['test-modal'].error).toBe('Test error')
    })
  })

  describe('Confirmation Modals', () => {
    it('should open confirm delete modal', () => {
      const mockConfirm = jest.fn()
      const { result } = renderHook(() => useModalStore())

      act(() => {
        result.current.openConfirmDelete(mockConfirm, 'test item')
      })

      const modalId = result.current.activeModalId!
      expect(result.current.modals[modalId].title).toBe('Confirmar eliminación')
      expect(result.current.modals[modalId].type).toBe('confirmDelete')
    })

    it('should open confirm save modal', () => {
      const mockConfirm = jest.fn()
      const { result } = renderHook(() => useModalStore())

      act(() => {
        result.current.openConfirmSave(mockConfirm)
      })

      const modalId = result.current.activeModalId!
      expect(result.current.modals[modalId].title).toBe('Guardar cambios')
      expect(result.current.modals[modalId].type).toBe('confirmSave')
    })

    it('should open confirm discard modal', () => {
      const mockConfirm = jest.fn()
      const { result } = renderHook(() => useModalStore())

      act(() => {
        result.current.openConfirmDiscard(mockConfirm)
      })

      const modalId = result.current.activeModalId!
      expect(result.current.modals[modalId].title).toBe('Descartar cambios')
      expect(result.current.modals[modalId].type).toBe('confirmDiscard')
    })
  })

  describe('Specific Modals', () => {
    it('should open select snapshot modal', () => {
      const mockSelect = jest.fn()
      const { result } = renderHook(() => useModalStore())

      act(() => {
        result.current.openSelectSnapshot(mockSelect)
      })

      const modalId = result.current.activeModalId!
      expect(result.current.modals[modalId].type).toBe('selectSnapshot')
      expect(result.current.modals[modalId].data).toBeDefined()
    })

    it('should open error modal', () => {
      const { result } = renderHook(() => useModalStore())

      act(() => {
        result.current.openErrorModal('Test error message')
      })

      const modalId = result.current.activeModalId!
      expect(result.current.modals[modalId].title).toBe('Error')
      expect(result.current.modals[modalId].message).toBe('Test error message')
    })

    it('should open success modal', () => {
      const { result } = renderHook(() => useModalStore())

      act(() => {
        result.current.openSuccessModal('Success message')
      })

      const modalId = result.current.activeModalId!
      expect(result.current.modals[modalId].title).toBe('Éxito')
      expect(result.current.modals[modalId].message).toBe('Success message')
    })
  })

  describe('executeModalAction', () => {
    it('should execute modal action', async () => {
      const mockAction = jest.fn()
      const { result } = renderHook(() => useModalStore())

      act(() => {
        result.current.openModal('test-modal', {
          title: 'Test',
          message: 'Test message',
          type: 'error',
          actions: [
            {
              label: 'Action',
              action: mockAction,
            },
          ],
        })
      })

      await act(async () => {
        await result.current.executeModalAction('test-modal', 0)
      })

      expect(mockAction).toHaveBeenCalled()
    })
  })

  describe('resetModals', () => {
    it('should reset store to default state', () => {
      const { result } = renderHook(() => useModalStore())

      act(() => {
        result.current.openModal('test-modal', {
          title: 'Test',
          message: 'Test message',
          type: 'error',
        })
        result.current.resetModals()
      })

      expect(result.current.modals).toEqual({})
      expect(result.current.activeModalId).toBeUndefined()
    })
  })
})
