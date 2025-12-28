'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { Copy, Check, Key } from 'lucide-react'
import DialogoGenericoDinamico, { DialogFormConfig } from './DialogoGenericoDinamico'
import { useUserModalStore } from '@/stores/userModalStore'
import { useUserDataStore } from '@/stores/userDataStore'
import { useToast } from '@/components/providers/ToastProvider'

// ==================== TIPOS ====================

interface User {
  id: string
  username: string
  nombre: string
  email: string | null
  telefono: string | null
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT'
  organizationId: string | null
  quotationAssignedId: string | null
  quotationAssigned?: {
    id: string
    empresa: string
    numero: string
  } | null
  activo: boolean
  createdAt?: string
  updatedAt?: string
}

// ==================== COMPONENTE ====================

export default function UserModalGlobal() {
  // Zustand stores - selectores individuales para evitar infinite loops
  const userModal = useUserModalStore()
  const quotations = useUserDataStore(state => state.quotations)
  const organizations = useUserDataStore(state => state.organizations)
  const groupedQuotations = useUserDataStore(state => state.groupedQuotations)
  const loadAllData = useUserDataStore(state => state.loadAllData)
  const toast = useToast()

  // Estado local para el modal
  const [saving, setSaving] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState<string>('')
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [isPasswordReset, setIsPasswordReset] = useState(false)

  // Cargar datos cuando el modal se abre - solo triggered cuando modal abre
  useEffect(() => {
    if (!userModal.isOpen) return
    
    console.log('[UserModalGlobal] Modal abierto, loading data...')
    if (quotations.length === 0 && organizations.length === 0) {
      console.log('[UserModalGlobal] Cargando cotizaciones y organizaciones...')
      loadAllData()
    }
  }, [userModal.isOpen]) // Solo depender de isOpen para evitar loops

  const handleSaveUser = useCallback(async (formData: Record<string, any>) => {
    setSaving(true)
    try {
      const url = userModal.editingUser ? `/api/users/${userModal.editingUser.id}` : '/api/users'
      const method = userModal.editingUser ? 'PATCH' : 'POST'

      const payload: Record<string, any> = {
        nombre: formData.nombre,
        email: formData.email || null,
        telefono: formData.telefono || null,
        role: formData.role,
        quotationId: formData.quotationAssignedId || null,
        organizationId: formData.organizationId || null,
      }

      if (!userModal.editingUser) {
        payload.empresa = formData.empresa
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar usuario')
      }

      const result = await response.json()

      if (!userModal.editingUser && result.temporaryPassword) {
        toast.success(`Usuario creado. Contraseña: ${result.temporaryPassword}`)
      } else {
        toast.success(userModal.editingUser ? 'Usuario actualizado' : 'Usuario creado exitosamente')
      }

      userModal.closeModal()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar usuario'
      toast.error(errorMessage)
      console.error('[UserModalGlobal] Error:', err)
    } finally {
      setSaving(false)
    }
  }, [userModal, toast])

  const handleDeleteUser = useCallback(async () => {
    if (!userModal.userToDelete) return

    setSaving(true)
    try {
      const response = await fetch(`/api/users/${userModal.userToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar usuario')
      }

      toast.success('Usuario eliminado exitosamente')
      userModal.closeModal()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar usuario'
      toast.error(errorMessage)
      console.error('[UserModalGlobal] Error:', err)
    } finally {
      setSaving(false)
    }
  }, [userModal, toast])

  const handleResetPassword = useCallback(async () => {
    if (!userModal.userToDelete) return

    setSaving(true)
    try {
      const response = await fetch(`/api/users/${userModal.userToDelete.id}/reset-password`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al resetear contraseña')
      }

      const result = await response.json()
      setGeneratedPassword(result.temporaryPassword || '')
      setIsPasswordReset(true)
      setCopiedPassword(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al resetear contraseña'
      toast.error(errorMessage)
      console.error('[UserModalGlobal] Error:', err)
    } finally {
      setSaving(false)
    }
  }, [userModal, toast])

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword)
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  const closePasswordDialog = () => {
    setGeneratedPassword('')
    setIsPasswordReset(false)
    setCopiedPassword(false)
    userModal.closeModal()
  }

  // Obtener campos del formulario
  const getFormFields = useCallback(() => {
    const baseFields: any[] = []

    if (!userModal.editingUser) {
      baseFields.push({
        id: 'empresa',
        type: 'text',
        label: 'Empresa (para generar usuario)',
        placeholder: 'Nombre de la empresa',
        required: true,
      })
    }

    baseFields.push(
      {
        id: 'nombre',
        type: 'text',
        label: 'Nombre Completo',
        placeholder: 'Nombre del usuario',
        value: userModal.editingUser?.nombre || '',
        required: true,
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'usuario@dominio.com',
        value: userModal.editingUser?.email || '',
        required: true,
      },
      {
        id: 'telefono',
        type: 'text',
        label: 'Teléfono',
        placeholder: '+00 000 000 0000',
        value: userModal.editingUser?.telefono || '',
        required: true,
      },
      {
        id: 'role',
        type: 'select',
        label: 'Rol',
        value: userModal.editingUser?.role || 'CLIENT',
        required: true,
        options: [
          { label: 'Cliente', value: 'CLIENT' },
          { label: 'Administrador', value: 'ADMIN' },
          { label: 'Super Administrador', value: 'SUPER_ADMIN' },
        ],
      },
      {
        id: 'organizationId',
        type: 'select',
        label: 'Organización',
        value: userModal.organizationId || userModal.editingUser?.organizationId || '',
        required: false,
        options: [
          { label: '-- Sin organización --', value: '' },
          ...organizations.map(org => ({
            label: org.nombre,
            value: org.id
          }))
        ]
      },
      {
        id: 'quotationAssignedId',
        type: 'select',
        label: 'Cotización Asignada',
        value: userModal.editingUser?.quotationAssignedId || '',
        options: [
          { label: '-- Sin cotización asignada --', value: '' },
          ...groupedQuotations.map(group => {
            // Extraer número de versión del latestVersion
            const versionRegex = /^(.+?)V(\d+)$/
            const versionMatch = versionRegex.exec(group.latestVersion.numero?.toString() || '')
            const versionNum = versionMatch ? versionMatch[2] : 'actual'
            const versionText = group.versions.length > 1 
              ? ` (${group.versions.length} versiones - v${versionNum})` 
              : ''
            const label = `${group.displayName} - ${group.baseNumber}${versionText}`
            return {
              label,
              value: group.latestVersion.id, // Siempre asigna la última versión
            }
          }),
        ],
      }
    )

    return baseFields
  }, [userModal.editingUser, userModal.organizationId, organizations, groupedQuotations])

  const formConfig: DialogFormConfig = {
    fields: getFormFields(),
    onSubmit: handleSaveUser,
  }

  // Helpers para renderizar cada modal
  const renderPasswordModal = () => (
    <DialogoGenericoDinamico
      isOpen={true}
      onClose={closePasswordDialog}
      title={isPasswordReset ? 'Contraseña Reseteada Exitosamente' : 'Usuario Creado Exitosamente'}
      description="Contraseña generada automáticamente"
      contentType="custom"
      content={
        <div className="space-y-4">
          <p>Guarda estas credenciales temporales, porque se mostrará sólo una vez y no se puede recuperar después.</p>
          <div className="bg-gh-bg-tertiary border border-gh-border/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gh-text-muted uppercase mb-1">Contraseña Temporal</p>
                <p className="text-base font-mono text-gh-text">{generatedPassword}</p>
              </div>
              <button
                onClick={copyPassword}
                className={`p-2 rounded-md transition-colors ${
                  copiedPassword
                    ? 'bg-gh-success/20 text-gh-success'
                    : 'bg-gh-bg-secondary text-gh-text-muted hover:text-gh-accent'
                }`}
                title="Copiar contraseña"
              >
                {copiedPassword ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-start gap-2 text-amber-500 text-xs">
            <Key className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <p>El usuario deberá cambiar esta contraseña en su primer inicio de sesión.</p>
          </div>
        </div>
      }
      type="success"
      size="md"
      variant="premium"
      zIndex={9999}
      actions={[
        {
          id: 'close',
          label: 'Entendido',
          variant: 'primary',
          onClick: closePasswordDialog,
        },
      ]}
    />
  )

  const renderResetConfirmModal = () => (
    <DialogoGenericoDinamico
      isOpen={userModal.isOpen}
      onClose={userModal.closeModal}
      title="Resetear Contraseña"
      description={`¿Resetear la contraseña de "${userModal.userToDelete?.nombre}" (@${userModal.userToDelete?.username})?`}
      contentType="custom"
      content={
        <div className="space-y-3">
          <p className="text-sm text-gh-text">
            Se generará una nueva contraseña temporal que deberás entregar al usuario.
          </p>
          <div className="flex items-start gap-2 text-amber-500 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <Key className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Importante:</p>
              <p>La contraseña se mostrará solo una vez. Asegúrate de guardarla antes de cerrar el modal.</p>
            </div>
          </div>
        </div>
      }
      type="warning"
      size="md"
      variant="premium"
      zIndex={9999}
      actions={[
        {
          id: 'cancel',
          label: 'Cancelar',
          variant: 'secondary',
          onClick: userModal.closeModal,
        },
        {
          id: 'confirm',
          label: saving ? 'Reseteando...' : 'Resetear Contraseña',
          variant: 'danger',
          onClick: handleResetPassword,
          loading: saving,
        },
      ]}
    />
  )

  const renderDeleteModal = () => (
    <DialogoGenericoDinamico
      isOpen={userModal.isOpen}
      onClose={userModal.closeModal}
      title="Eliminar Usuario"
      description={`¿Eliminar a ${userModal.userToDelete?.nombre}?`}
      type="warning"
      contentType="text"
      content={`Este usuario será eliminado permanentemente. Esta acción no se puede deshacer.`}
      zIndex={9999}
      actions={[
        {
          id: 'cancel',
          label: 'Cancelar',
          variant: 'secondary',
          onClick: userModal.closeModal,
        },
        {
          id: 'delete',
          label: 'Eliminar',
          variant: 'danger',
          onClick: handleDeleteUser,
          loading: saving,
        },
      ]}
    />
  )

  // Mostrar modal de mostrar contraseña si hay una generada
  if (generatedPassword && generatedPassword.length > 0) {
    return renderPasswordModal()
  }

  // Mostrar modal de confirmación de reset de contraseña
  if (userModal.mode === 'resetPassword' && userModal.userToDelete) {
    return renderResetConfirmModal()
  }

  // Mostrar modal de confirmación de eliminación
  if (userModal.mode === 'delete' && userModal.userToDelete) {
    return renderDeleteModal()
  }

  // Mostrar modal de crear/editar usuario
  if (userModal.mode === 'create' || userModal.mode === 'edit') {
    return (
      <DialogoGenericoDinamico
        isOpen={userModal.isOpen}
        onClose={userModal.closeModal}
        title={userModal.editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        description={userModal.editingUser ? 'Modifica los datos del usuario' : 'Completa los datos para crear un nuevo usuario'}
        contentType="form"
        formConfig={formConfig}
        zIndex={9999}
        type="info"
        size="xl"
        variant="premium"
        actions={[
          {
            id: 'cancel',
            label: 'Cancelar',
            variant: 'secondary',
            onClick: userModal.closeModal,
          },
          {
            id: 'save',
            label: (() => {
              if (saving) return 'Guardando...'
              return userModal.editingUser ? 'Guardar Cambios' : 'Crear Usuario'
            })(),
            variant: 'primary',
            onClick: () => {
              const form = document.querySelector('form') as HTMLFormElement
              if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
              }
            },
            loading: saving,
          },
        ]}
      />
    )
  }

  return null
}
