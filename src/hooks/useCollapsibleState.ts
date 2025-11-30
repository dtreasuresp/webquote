'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface CollapsibleState {
  [sectionId: string]: boolean
}

interface UseCollapsibleStateOptions {
  quotationId?: string | null
  defaultState?: CollapsibleState
  debounceMs?: number
}

interface UseCollapsibleStateReturn {
  collapsedSections: CollapsibleState
  isCollapsed: (sectionId: string) => boolean
  toggleSection: (sectionId: string) => void
  setCollapsed: (sectionId: string, collapsed: boolean) => void
  expandAll: () => void
  collapseAll: () => void
  isLoading: boolean
  isSaving: boolean
}

/**
 * Hook para manejar el estado de secciones colapsables con persistencia en BD
 */
export function useCollapsibleState({
  quotationId,
  defaultState = {},
  debounceMs = 500,
}: UseCollapsibleStateOptions = {}): UseCollapsibleStateReturn {
  const [collapsedSections, setCollapsedSections] = useState<CollapsibleState>(defaultState)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingStateRef = useRef<CollapsibleState | null>(null)

  // Cargar estado inicial desde la BD
  useEffect(() => {
    if (!quotationId) return

    const loadState = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/quotation-config/editor-state?id=${quotationId}`)
        if (response.ok) {
          const data = await response.json()
          if (data?.collapsedSections) {
            setCollapsedSections(prev => ({
              ...defaultState,
              ...data.collapsedSections,
            }))
          }
        }
      } catch (error) {
        console.error('Error al cargar estado del editor:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadState()
  }, [quotationId, defaultState])

  // Función para guardar en BD con debounce
  const saveToDatabase = useCallback(async (state: CollapsibleState) => {
    if (!quotationId) return

    setIsSaving(true)
    try {
      await fetch(`/api/quotation-config/editor-state?id=${quotationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collapsedSections: state }),
      })
    } catch (error) {
      console.error('Error al guardar estado del editor:', error)
    } finally {
      setIsSaving(false)
    }
  }, [quotationId])

  // Debounce para guardar cambios
  const debouncedSave = useCallback((state: CollapsibleState) => {
    pendingStateRef.current = state

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (pendingStateRef.current) {
        saveToDatabase(pendingStateRef.current)
        pendingStateRef.current = null
      }
    }, debounceMs)
  }, [saveToDatabase, debounceMs])

  // Cleanup del timeout
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        // Guardar estado pendiente antes de desmontar
        if (pendingStateRef.current && quotationId) {
          saveToDatabase(pendingStateRef.current)
        }
      }
    }
  }, [quotationId, saveToDatabase])

  // Verificar si una sección está colapsada
  const isCollapsed = useCallback((sectionId: string): boolean => {
    return collapsedSections[sectionId] ?? false
  }, [collapsedSections])

  // Toggle de una sección
  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const newState = {
        ...prev,
        [sectionId]: !prev[sectionId],
      }
      debouncedSave(newState)
      return newState
    })
  }, [debouncedSave])

  // Establecer estado específico
  const setCollapsed = useCallback((sectionId: string, collapsed: boolean) => {
    setCollapsedSections(prev => {
      const newState = {
        ...prev,
        [sectionId]: collapsed,
      }
      debouncedSave(newState)
      return newState
    })
  }, [debouncedSave])

  // Expandir todas las secciones
  const expandAll = useCallback(() => {
    setCollapsedSections(prev => {
      const newState = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false
        return acc
      }, {} as CollapsibleState)
      debouncedSave(newState)
      return newState
    })
  }, [debouncedSave])

  // Colapsar todas las secciones
  const collapseAll = useCallback(() => {
    setCollapsedSections(prev => {
      const newState = Object.keys(prev).reduce((acc, key) => {
        acc[key] = true
        return acc
      }, {} as CollapsibleState)
      debouncedSave(newState)
      return newState
    })
  }, [debouncedSave])

  return {
    collapsedSections,
    isCollapsed,
    toggleSection,
    setCollapsed,
    expandAll,
    collapseAll,
    isLoading,
    isSaving,
  }
}

export default useCollapsibleState
