'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Check, AlertTriangle, type LucideIcon } from 'lucide-react'
import { DropdownSelect } from '@/components/ui/DropdownSelect'
import ToggleSwitch from './ToggleSwitch'

// ==================== TIPOS ====================

export interface DialogStepConfig {
  id: string | number
  label: string
  status: 'pending' | 'active' | 'completed' | 'error' | 'cancelled'
  icon?: LucideIcon
}

export interface DialogFormField {
  id: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'checkbox' | 'select'
  label: string
  placeholder?: string
  value?: string | boolean
  required?: boolean
  options?: Array<{ label: string; value: string }>
  validation?: (value: any) => boolean | string
  error?: string
}

export interface DialogFormConfig {
  fields: DialogFormField[]
  onSubmit: (formData: Record<string, any>) => void | Promise<void>
}

export interface DialogProgressConfig {
  steps: DialogStepConfig[]
  overallStatus?: 'progress' | 'success' | 'error' | 'cancelled'
  totalProgress?: number // 0-100
}

export interface DialogTab {
  id: string
  label: string
  icon?: LucideIcon
  content: React.ReactNode
}

export interface DialogoGenericoDinamicoProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  
  // Contenido
  contentType?: 'text' | 'form' | 'progress' | 'custom'
  content?: string | React.ReactNode
  
  // Configuración específica por tipo
  formConfig?: DialogFormConfig
  progressConfig?: DialogProgressConfig
  
  // Tabs (NUEVO)
  tabs?: DialogTab[]
  activeTabId?: string
  onTabChange?: (tabId: string) => void
  
  // Estilo
  variant?: 'default' | 'premium'
  type?: 'info' | 'warning' | 'error' | 'success' | 'progress'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'
  
  // Acciones
  actions?: Array<{
    id: string
    label: string
    variant: 'primary' | 'secondary' | 'danger' | 'success'
    onClick?: () => void | Promise<void>
    loading?: boolean
  }>
  
  // Comportamiento
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  maxHeight?: string
  zIndex?: number
}

// ==================== ESTILOS ====================

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  'full': 'max-w-6xl',
}

const typeColors = {
  info: 'border-[#58a6ff] shadow-[#58a6ff]/20',
  warning: 'border-[#d29922] shadow-[#d29922]/20',
  error: 'border-[#da3633] shadow-[#da3633]/20',
  success: 'border-[#238636] shadow-[#238636]/20',
  progress: 'border-[#58a6ff] shadow-[#58a6ff]/20',
}

const typeIconBgGradient = {
  info: 'from-[#58a6ff] to-[#388bfd]',
  warning: 'from-[#d29922] to-[#e3b341]',
  error: 'from-[#da3633] to-[#f85149]',
  success: 'from-[#238636] to-[#2ea043]',
  progress: 'from-[#58a6ff] to-[#388bfd]',
}

const typeIconColor = {
  info: '#58a6ff',
  warning: '#d29922',
  error: '#da3633',
  success: '#238636',
  progress: '#58a6ff',
}

// ==================== COMPONENTE ====================

export default function DialogoGenericoDinamico({
  isOpen,
  onClose,
  title,
  description,
  contentType = 'text',
  content,
  formConfig,
  progressConfig,
  tabs,
  activeTabId,
  onTabChange,
  variant = 'premium',
  type = 'info',
  size = 'md',
  actions = [],
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  maxHeight = 'max-h-[80vh]',
  zIndex = 50,
}: DialogoGenericoDinamicoProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [localActiveTab, setLocalActiveTab] = useState<string>(tabs?.[0]?.id || activeTabId || '')

  // Inicializar formData con valores default SOLO cuando el modal se abre
  useEffect(() => {
    if (isOpen && contentType === 'form' && formConfig && !isInitialized) {
      const initialData: Record<string, any> = {}
      formConfig.fields.forEach(field => {
        initialData[field.id] = field.value ?? ''
      })
      setFormData(initialData)
      setFormErrors({})
      setIsInitialized(true)
    } else if (!isOpen) {
      // Resetear flag cuando se cierra el modal
      setIsInitialized(false)
    }
  }, [isOpen, contentType, formConfig, isInitialized])

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, closeOnEscape])

  // Handler para cambios en formulario
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    // Limpiar error del campo
    if (formErrors[fieldId]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  // Handler para validar y enviar formulario
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formConfig) return

    // Validar campos
    const errors: Record<string, string> = {}
    formConfig.fields.forEach(field => {
      const value = formData[field.id]
      const isEmpty = value === undefined || value === null || value === ''

      if (field.required) {
        if (field.type === 'checkbox') {
          if (!value) {
            errors[field.id] = `${field.label} es requerido`
          }
        } else if (isEmpty) {
          errors[field.id] = `${field.label} es requerido`
        }
      }

      if (!errors[field.id] && field.validation) {
        const result = field.validation(value)
        if (result !== true) {
          errors[field.id] = typeof result === 'string' ? result : 'Campo inválido'
        }
      }
    })

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Enviar
    try {
      setIsSubmitting(true)
      await formConfig.onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error al enviar formulario:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Renderizar contenido según tipo
  const renderContent = () => {
    switch (contentType) {
      case 'form':
        return formConfig ? (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {formConfig.fields.map(field => (
              <div key={field.id}>
                {field.type !== 'checkbox' && (
                  <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                    {field.label}
                    {field.required && <span className="text-[#da3633]">*</span>}
                  </label>
                )}

                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.id] ?? ''}
                    onChange={e => handleFieldChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#6e7681] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/50 outline-none transition"
                    rows={4}
                  />
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-[#c9d1d9]">{field.label}</span>
                    <ToggleSwitch
                      enabled={formData[field.id] || false}
                      onChange={(val) => handleFieldChange(field.id, val)}
                      size="md"
                    />
                  </div>
                ) : field.type === 'select' ? (
                  <DropdownSelect
                    value={formData[field.id] ?? ''}
                    onChange={val => handleFieldChange(field.id, val)}
                    options={field.options || []}
                    placeholder="Seleccionar..."
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.id] ?? ''}
                    onChange={e => {
                      if (field.type === 'number') {
                        const raw = e.target.value
                        if (raw === '') {
                          handleFieldChange(field.id, '')
                          return
                        }

                        const parsed = Number.parseInt(raw, 10)
                        handleFieldChange(field.id, Number.isNaN(parsed) ? '' : parsed)
                        return
                      }

                      handleFieldChange(field.id, e.target.value)
                    }}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#6e7681] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/50 outline-none transition"
                  />
                )}

                {formErrors[field.id] && (
                  <p className="text-xs text-[#da3633] mt-1">{formErrors[field.id]}</p>
                )}
              </div>
            ))}
          </form>
        ) : null

      case 'progress':
        return progressConfig ? (
          <div className="space-y-4">
            {/* Barra de progreso general */}
            {progressConfig.totalProgress !== undefined && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-[#8b949e]">
                  <span>Progreso</span>
                  <span>{progressConfig.totalProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#30363d] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#58a6ff] to-[#388bfd]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressConfig.totalProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Pasos */}
            <div className="space-y-2">
              {progressConfig.steps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  {/* Icono */}
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {step.status === 'completed' ? (
                      <Check className="text-[#238636] w-3.5 h-3.5" />
                    ) : step.status === 'active' ? (
                      <Loader2 className="text-[#58a6ff] animate-spin w-3.5 h-3.5" />
                    ) : step.status === 'error' ? (
                      <X className="text-[#da3633] w-3.5 h-3.5" />
                    ) : step.status === 'cancelled' ? (
                      <X className="text-[#d29922] w-3.5 h-3.5" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-[#30363d]" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-sm ${
                      step.status === 'completed'
                        ? 'text-[#238636]'
                        : step.status === 'active'
                        ? 'text-[#58a6ff] font-semibold'
                        : step.status === 'error'
                        ? 'text-[#da3633]'
                        : step.status === 'cancelled'
                        ? 'text-[#d29922]'
                        : 'text-[#8b949e]'
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        ) : null

      default:
        return (
          <div className="text-sm text-[#c9d1d9]">
            {typeof content === 'string' ? (
              <p className="whitespace-pre-line">{content}</p>
            ) : (
              content
            )}
          </div>
        )
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdropClick ? onClose : undefined}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            style={{ zIndex: zIndex - 10 }}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex }}
          >
            <div
              className={`
                pointer-events-auto w-full mx-4
                ${sizeClasses[size]}
                bg-gradient-to-b from-[#161b22] to-[#0d1117]
                border border-[#30363d]
                shadow-2xl shadow-black/60 ring-1 ring-white/5
                rounded-xl overflow-hidden
              `}
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d] bg-gradient-to-r from-[#161b22] via-[#1c2128] to-[#161b22]">
                <div className="flex items-center gap-3 flex-1">
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg bg-gradient-to-br ${typeIconBgGradient[type]}`}
                    style={{ boxShadow: `0 0 20px ${typeIconColor[type]}20` }}
                  >
                    {type === 'success' ? (
                      <Check className="text-white text-sm" />
                    ) : type === 'error' ? (
                      <X className="text-white text-sm" />
                    ) : type === 'warning' ? (
                      <AlertTriangle className="text-white text-sm" />
                    ) : type === 'progress' ? (
                      <Loader2 className="text-white text-sm animate-spin" />
                    ) : (
                      <AlertTriangle className="text-white text-sm" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-white truncate">
                      {title}
                    </h2>
                    {description && (
                      <p className="text-xs text-[#8b949e] mt-0.5 truncate">
                        {description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Close button */}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-2 p-1 hover:bg-[#30363d] rounded transition-colors text-[#8b949e] hover:text-[#c9d1d9]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Tabs (si existen) */}
              {tabs && tabs.length > 0 && (
                <div className="border-b border-[#30363d] bg-[#0d1117]">
                  <div className="flex gap-0 px-4">
                    {tabs.map((tab) => {
                      const isActive = localActiveTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setLocalActiveTab(tab.id)
                            onTabChange?.(tab.id)
                          }}
                          className={`
                            px-3 py-3 text-sm font-medium border-b-2 transition-all
                            flex items-center gap-2 whitespace-nowrap
                            ${isActive
                              ? 'border-b-[#58a6ff] text-[#58a6ff]'
                              : 'border-b-transparent text-[#8b949e] hover:text-[#c9d1d9]'
                            }
                          `}
                        >
                          {tab.icon && <tab.icon className="w-4 h-4" />}
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Body */}
              <div className={`px-4 py-4 ${maxHeight} overflow-y-auto`}>
                {tabs && tabs.length > 0 && localActiveTab
                  ? tabs.find(t => t.id === localActiveTab)?.content
                  : renderContent()}
              </div>

              {/* Footer - Actions */}
              {(contentType === 'form' ? true : actions.length > 0) && (
                <div className="flex gap-3 px-4 py-3 border-t border-[#30363d] bg-[#161b22]/80 justify-end flex-wrap">
                  {contentType === 'form' ? (
                    <>
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded-md transition-colors text-sm font-medium border border-[#30363d] disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleFormSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-gradient-to-r from-[#238636] to-[#2ea043] hover:opacity-90 text-white rounded-md transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[#238636]/20"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin w-3.5 h-3.5" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Enviar
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    actions.map(action => (
                      <button
                        key={action.id}
                        onClick={action.onClick}
                        disabled={action.loading}
                        className={`px-4 py-2 rounded-md transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 ${
                          action.variant === 'primary'
                            ? 'bg-gradient-to-r from-[#238636] to-[#2ea043] hover:opacity-90 text-white shadow-lg shadow-[#238636]/20'
                            : action.variant === 'danger'
                            ? 'bg-[#da3633] hover:bg-[#f85149] text-white'
                            : action.variant === 'success'
                            ? 'bg-gradient-to-r from-[#238636] to-[#2ea043] text-white'
                            : 'bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d]'
                        }`}
                      >
                        {action.loading ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : null}
                        {action.label}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


