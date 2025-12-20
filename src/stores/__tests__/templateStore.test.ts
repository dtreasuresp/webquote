/**
 * Tests for templateStore
 */

import { renderHook, act } from '@testing-library/react'
import { useTemplateStore } from '../templateStore'

jest.mock('../utils/templateApi', () => ({
  templateApi: {
    getDescriptionTemplates: jest.fn(),
    createDescriptionTemplate: jest.fn(),
    updateDescriptionTemplate: jest.fn(),
    deleteDescriptionTemplate: jest.fn(),
    getFinancialTemplates: jest.fn(),
    createFinancialTemplate: jest.fn(),
    updateFinancialTemplate: jest.fn(),
    deleteFinancialTemplate: jest.fn(),
  },
}))

import { templateApi } from '../utils/templateApi'

const mockDescTemplate = {
  id: 'desc-1',
  nombre: 'Template 1',
  descripcion: 'Test template',
  plantilla: 'Test {{field}}',
  activo: true,
  fechaCreacion: '2024-12-16',
}

const mockFinTemplate = {
  id: 'fin-1',
  nombre: 'Financial 1',
  tipo: 'descuento' as const,
  formula: 'price * 0.1',
  activo: true,
  fechaCreacion: '2024-12-16',
}

describe('templateStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useTemplateStore())
    act(() => {
      result.current.resetTemplates()
    })
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useTemplateStore())

      expect(result.current.descriptionTemplates).toEqual([])
      expect(result.current.financialTemplates).toEqual([])
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Description Templates', () => {
    it('should load description templates', async () => {
      ;(templateApi.getDescriptionTemplates as jest.Mock).mockResolvedValueOnce([
        mockDescTemplate,
      ])

      const { result } = renderHook(() => useTemplateStore())

      await act(async () => {
        await result.current.loadDescriptionTemplates()
      })

      expect(result.current.descriptionTemplates).toEqual([mockDescTemplate])
    })

    it('should create description template', async () => {
      ;(templateApi.createDescriptionTemplate as jest.Mock).mockResolvedValueOnce(
        mockDescTemplate,
      )

      const { result } = renderHook(() => useTemplateStore())

      await act(async () => {
        await result.current.createDescriptionTemplate({ nombre: 'New' })
      })

      expect(result.current.descriptionTemplates).toContainEqual(mockDescTemplate)
    })

    it('should update description template', async () => {
      useTemplateStore.setState({ descriptionTemplates: [mockDescTemplate] })
      ;(templateApi.updateDescriptionTemplate as jest.Mock).mockResolvedValueOnce({
        ...mockDescTemplate,
        nombre: 'Updated',
      })

      const { result } = renderHook(() => useTemplateStore())

      await act(async () => {
        await result.current.updateDescriptionTemplate('desc-1', { nombre: 'Updated' })
      })

      expect(result.current.descriptionTemplates[0].nombre).toBe('Updated')
    })

    it('should delete description template', async () => {
      useTemplateStore.setState({ descriptionTemplates: [mockDescTemplate] })
      ;(templateApi.deleteDescriptionTemplate as jest.Mock).mockResolvedValueOnce(
        undefined,
      )

      const { result } = renderHook(() => useTemplateStore())

      await act(async () => {
        await result.current.deleteDescriptionTemplate('desc-1')
      })

      expect(result.current.descriptionTemplates).toEqual([])
    })

    it('should select description template', () => {
      const { result } = renderHook(() => useTemplateStore())

      act(() => {
        result.current.selectDescriptionTemplate('desc-1')
      })

      expect(result.current.selectedDescriptionTemplate).toBe('desc-1')
    })
  })

  describe('Financial Templates', () => {
    it('should load financial templates', async () => {
      ;(templateApi.getFinancialTemplates as jest.Mock).mockResolvedValueOnce([
        mockFinTemplate,
      ])

      const { result } = renderHook(() => useTemplateStore())

      await act(async () => {
        await result.current.loadFinancialTemplates()
      })

      expect(result.current.financialTemplates).toEqual([mockFinTemplate])
    })

    it('should create financial template', async () => {
      ;(templateApi.createFinancialTemplate as jest.Mock).mockResolvedValueOnce(
        mockFinTemplate,
      )

      const { result } = renderHook(() => useTemplateStore())

      await act(async () => {
        await result.current.createFinancialTemplate({ nombre: 'New' })
      })

      expect(result.current.financialTemplates).toContainEqual(mockFinTemplate)
    })

    it('should update financial template', async () => {
      useTemplateStore.setState({ financialTemplates: [mockFinTemplate] })
      ;(templateApi.updateFinancialTemplate as jest.Mock).mockResolvedValueOnce({
        ...mockFinTemplate,
        nombre: 'Updated',
      })

      const { result } = renderHook(() => useTemplateStore())

      await act(async () => {
        await result.current.updateFinancialTemplate('fin-1', { nombre: 'Updated' })
      })

      expect(result.current.financialTemplates[0].nombre).toBe('Updated')
    })

    it('should delete financial template', async () => {
      useTemplateStore.setState({ financialTemplates: [mockFinTemplate] })
      ;(templateApi.deleteFinancialTemplate as jest.Mock).mockResolvedValueOnce(
        undefined,
      )

      const { result } = renderHook(() => useTemplateStore())

      await act(async () => {
        await result.current.deleteFinancialTemplate('fin-1')
      })

      expect(result.current.financialTemplates).toEqual([])
    })

    it('should select financial template', () => {
      const { result } = renderHook(() => useTemplateStore())

      act(() => {
        result.current.selectFinancialTemplate('fin-1')
      })

      expect(result.current.selectedFinancialTemplate).toBe('fin-1')
    })
  })

  describe('resetTemplates', () => {
    it('should reset store to default state', () => {
      useTemplateStore.setState({
        descriptionTemplates: [mockDescTemplate],
        financialTemplates: [mockFinTemplate],
      })

      const { result } = renderHook(() => useTemplateStore())

      act(() => {
        result.current.resetTemplates()
      })

      expect(result.current.descriptionTemplates).toEqual([])
      expect(result.current.financialTemplates).toEqual([])
    })
  })
})
