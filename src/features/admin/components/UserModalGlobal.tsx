'use client'

import React, { useCallback, useState, useEffect } from 'react'
import DialogoGenericoDinamico, { DialogFormConfig } from './DialogoGenericoDinamico'
import { useUserModal } from '@/contexts/UserModalContext'
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

interface QuotationOption {
  id: string
  nombre?: string
  empresa?: string
  numero: string | number
}

// ==================== COMPONENTE ====================

export default function UserModalGlobal() {
  const userModal = useUserModal()
  const toast = useToast()

  // Estado local para el modal
  const [saving, setSaving] = useState(false)
  const [quotations, setQuotations] = useState<QuotationOption[]>([])
  const [organizations, setOrganizations] = useState<Array<{ id: string; nombre: string }>>([])
  const [loadingData, setLoadingData] = useState(false)

  // Cargar datos cuando el modal se abre
  useEffect(() => {
    if (userModal.isOpen && (quotations.length === 0 || organizations.length === 0)) {
      const loadData = async () => {
        setLoadingData(true)
        try {
          // Cargar cotizaciones
          const quotRes = await fetch('/api/quotations')
          if (quotRes.ok) {
            const quoteData = await quotRes.json()
            // El API puede retornar un array o un objeto { quotations: [...] }
            const quoteArray = Array.isArray(quoteData) ? quoteData : (quoteData?.quotations || [])
            setQuotations(quoteArray)
          }

          // Cargar organizaciones
          const orgRes = await fetch('/api/organizations')
          if (orgRes.ok) {
            const orgData = await orgRes.json()
            // El API puede retornar un array o un objeto
            const orgArray = Array.isArray(orgData) ? orgData : (orgData?.organizations || orgData || [])
            setOrganizations(orgArray)
          }
        } catch (err) {
          console.error('[UserModalGlobal] Error loading data:', err)
        } finally {
          setLoadingData(false)
        }
      }
      loadData()
    }
  }, [userModal.isOpen, quotations.length, organizations.length])

  // Agrupar cotizaciones por número base
  const groupedQuotations = React.useMemo(() => {
    const groups: Record<string, any> = {}
    quotations.forEach((q: any) => {
      const baseNum = typeof q.numero === 'string' ? q.numero.split('-')[0] : q.numero
      if (!groups[baseNum]) {
        groups[baseNum] = {
          baseNumber: baseNum,
          displayName: q.empresa || q.nombre || 'Sin nombre',
          versions: [],
          latestVersion: null,
        }
      }
      groups[baseNum].versions.push(q)
      groups[baseNum].latestVersion = q
    })
    return Object.values(groups)
  }, [quotations])

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
          ...groupedQuotations.map(group => ({
            label: `${group.displayName} (${group.baseNumber})${group.versions.length > 1 ? ` - ${group.versions.length} versiones` : ''}`,
            value: group.latestVersion.id,
          })),
        ],
      }
    )

    return baseFields
  }, [userModal.editingUser, userModal.organizationId, organizations, groupedQuotations])

  const formConfig: DialogFormConfig = {
    fields: getFormFields(),
    onSubmit: handleSaveUser,
  }

  // Mostrar modal de confirmación de eliminación si es necesario
  if (userModal.mode === 'delete' && userModal.userToDelete) {
    return (
      <DialogoGenericoDinamico
        isOpen={userModal.isOpen}
        onClose={userModal.closeModal}
        title="Eliminar Usuario"
        description={`¿Eliminar a ${userModal.userToDelete.nombre}?`}
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
        size="lg"
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
            label: saving ? 'Guardando...' : (userModal.editingUser ? 'Guardar Cambios' : 'Crear Usuario'),
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
