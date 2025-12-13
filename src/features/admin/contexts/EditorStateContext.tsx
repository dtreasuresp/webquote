'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react'

interface EditorState {
  collapsedSections: Record<string, boolean>
  paqueteActual?: unknown
}

interface EditorStateContextType {
  editorState: EditorState
  setSectionState: (sectionId: string, isOpen: boolean) => void
  getSectionState: (sectionId: string, defaultOpen: boolean) => boolean
  updateEditorState: (updates: Partial<EditorState>) => void
  isLoading: boolean
}

const EditorStateContext = createContext<EditorStateContextType | null>(null)

export function EditorStateProvider({ children }: { children: ReactNode }) {
  const [editorState, setEditorState] = useState<EditorState>({
    collapsedSections: {},
  })
  const [isLoading, setIsLoading] = useState(true)
  const [quotationConfigId, setQuotationConfigId] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cargar estado desde la BD al montar
  useEffect(() => {
    const loadEditorState = async () => {
      try {
        const response = await fetch('/api/quotation-config')
        if (response.ok) {
          const config = await response.json()
          if (config) {
            setQuotationConfigId(config.id)
            if (config.editorState) {
              setEditorState({
                collapsedSections: config.editorState.collapsedSections || {},
                paqueteActual: config.editorState.paqueteActual,
              })
            }
          }
        }
      } catch (error) {
        console.error('Error cargando editor state:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEditorState()
  }, [])

  // Guardar estado en la BD con debounce
  const saveEditorStateToDB = useCallback(async (newState: EditorState) => {
    if (!quotationConfigId) return

    // Cancelar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Guardar con debounce de 500ms
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/quotation-config/${quotationConfigId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            editorState: newState,
          }),
        })
      } catch (error) {
        console.error('Error guardando editor state:', error)
      }
    }, 500)
  }, [quotationConfigId])

  const setSectionState = useCallback((sectionId: string, isOpen: boolean) => {
    setEditorState(prev => {
      const newState = {
        ...prev,
        collapsedSections: {
          ...prev.collapsedSections,
          [sectionId]: isOpen,
        },
      }
      saveEditorStateToDB(newState)
      return newState
    })
  }, [saveEditorStateToDB])

  const getSectionState = useCallback((sectionId: string, defaultOpen: boolean) => {
    if (sectionId in editorState.collapsedSections) {
      return editorState.collapsedSections[sectionId]
    }
    return defaultOpen
  }, [editorState.collapsedSections])

  const updateEditorState = useCallback((updates: Partial<EditorState>) => {
    setEditorState(prev => {
      const newState = { ...prev, ...updates }
      saveEditorStateToDB(newState)
      return newState
    })
  }, [saveEditorStateToDB])

  return (
    <EditorStateContext.Provider
      value={{
        editorState,
        setSectionState,
        getSectionState,
        updateEditorState,
        isLoading,
      }}
    >
      {children}
    </EditorStateContext.Provider>
  )
}

export function useEditorState() {
  const context = useContext(EditorStateContext)
  if (!context) {
    throw new Error('useEditorState must be used within EditorStateProvider')
  }
  return context
}

// Hook simplificado para secciones colapsables cuando no hay contexto disponible
export function useSectionState(sectionId: string, defaultOpen: boolean = true) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Intentar usar contexto si está disponible
  const context = useContext(EditorStateContext)
  
  useEffect(() => {
    if (context) {
      setIsOpen(context.getSectionState(sectionId, defaultOpen))
      setIsLoaded(true)
    } else {
      // Fallback: no usar localStorage, solo estado local
      setIsLoaded(true)
    }
  }, [context, sectionId, defaultOpen])

  const toggleSection = useCallback(() => {
    const newState = !isOpen
    setIsOpen(newState)
    if (context) {
      context.setSectionState(sectionId, newState)
    }
  }, [isOpen, context, sectionId])

  return { isOpen, toggleSection, isLoaded }
}
