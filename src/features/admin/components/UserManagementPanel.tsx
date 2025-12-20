'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { UserPlus, Edit2, Trash2, Loader2, Key, Copy, Check, ShieldCheck, User, Users } from 'lucide-react'
import DialogoGenericoDinamico, { DialogFormConfig, DialogFormField } from './DialogoGenericoDinamico'
import { useSession } from 'next-auth/react'
import { useQuotationListener } from '@/hooks/useQuotationSync'

// ==================== TIPOS ====================

interface QuotationOption {
  id: string
  nombre?: string
  empresa?: string
  numero: string | number
}

// Cotización agrupada por número base
interface GroupedQuotation {
  baseNumber: string
  displayName: string
  versions: QuotationOption[]
  latestVersion: QuotationOption
}

interface User {
  id: string
  username: string
  nombre: string
  email: string | null
  telefono: string | null
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT'
  quotationAssignedId: string | null
  quotationAssigned?: {
    id: string
    empresa: string
    numero: string
  } | null
  activo: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string | null
}

interface UserManagementPanelProps {
  quotations: QuotationOption[]
}

// ==================== HELPERS ====================

/**
 * Extrae el número base de una cotización (sin el sufijo de versión)
 * Ejemplo: "COT-2025-001-V2" -> "COT-2025-001"
 */
function getBaseNumber(numero: string | number): string {
  const numStr = String(numero)
  // Remover sufijo de versión (V1, V2, -V1, -V2, .V1, .V2, etc.)
  return numStr.replace(/[-.]?V\d+$/i, '')
}

// ==================== HELPERS ====================

/**
 * Determina el estado de conexión del usuario
 * @returns 'online' | 'offline' | 'never' con su color correspondiente
 */
function getUserStatus(lastLogin?: string | null): {
  status: 'online' | 'offline' | 'never'
  color: string
  label: string
} {
  if (!lastLogin) {
    return { status: 'never', color: 'bg-amber-500', label: 'Nunca ha iniciado sesión' }
  }

  const lastLoginDate = new Date(lastLogin)
  const now = new Date()
  const diffMinutes = (now.getTime() - lastLoginDate.getTime()) / (1000 * 60)

  // Online: menos de 5 minutos desde último login
  if (diffMinutes < 5) {
    return { status: 'online', color: 'bg-green-500', label: 'En línea' }
  }

  // Offline: más de 5 minutos
  return { status: 'offline', color: 'bg-red-500', label: 'Desconectado' }
}

/**
 * Agrupa las cotizaciones por número base
 */
function groupQuotationsByBase(quotations: QuotationOption[]): GroupedQuotation[] {
  const groups = new Map<string, QuotationOption[]>()
  
  for (const q of quotations) {
    const base = getBaseNumber(q.numero)
    if (!groups.has(base)) {
      groups.set(base, [])
    }
    groups.get(base)!.push(q)
  }
  
  // Convertir a array y ordenar versiones dentro de cada grupo
  const result: GroupedQuotation[] = []
  
  for (const [baseNumber, versions] of groups) {
    // Ordenar versiones (la más reciente primero)
    versions.sort((a, b) => {
      const numA = String(a.numero)
      const numB = String(b.numero)
      // Extraer número de versión
      const versionA = numA.match(/V(\d+)$/i)?.[1] || '0'
      const versionB = numB.match(/V(\d+)$/i)?.[1] || '0'
      return parseInt(versionB) - parseInt(versionA)
    })
    
    const latestVersion = versions[0]
    const displayName = latestVersion.empresa || latestVersion.nombre || 'Sin nombre'
    
    result.push({
      baseNumber,
      displayName,
      versions,
      latestVersion,
    })
  }
  
  // Ordenar grupos por número base
  result.sort((a, b) => a.baseNumber.localeCompare(b.baseNumber))
  
  return result
}

// ==================== COMPONENTE ====================

export default function UserManagementPanel({ quotations }: UserManagementPanelProps) {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [generatedPassword, setGeneratedPassword] = useState<string>('')
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [isPasswordReset, setIsPasswordReset] = useState(false) // true = reset, false = nuevo usuario
  const [userToReset, setUserToReset] = useState<User | null>(null)
  const [showResetConfirmDialog, setShowResetConfirmDialog] = useState(false)
  const [saving, setSaving] = useState(false)

  // Agrupar cotizaciones por número base
  const groupedQuotations = useMemo(() => groupQuotationsByBase(quotations), [quotations])

  // ✅ NUEVA: Escuchar eventos de sincronización de cotizaciones
  // Cuando se crea o actualiza una cotización, este componente
  // recibe notificación automáticamente y groupedQuotations se recalcula
  useQuotationListener(
    ['quotation:updated', 'quotation:created'],
    useCallback((event) => {
      console.log(`🔄 UserManagementPanel: Evento recibido:`, event.type, event.quotationId)
      // El cambio en el prop 'quotations' dispara useMemo nuevamente
      // groupedQuotations se recalcula automáticamente con las nuevas versiones
    }, [])
  )

  // Obtener roles disponibles según el rol del usuario actual
  const availableRoles = useMemo(() => {
    const currentRole = session?.user?.role
    if (currentRole === 'SUPER_ADMIN') {
      return [
        { label: 'Cliente', value: 'CLIENT' },
        { label: 'Administrador', value: 'ADMIN' },
        { label: 'Super Administrador', value: 'SUPER_ADMIN' },
      ]
    } else if (currentRole === 'ADMIN') {
      return [
        { label: 'Cliente', value: 'CLIENT' },
      ]
    }
    return []
  }, [session?.user?.role])

  // ==================== FETCH USERS ====================

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Error al cargar usuarios')
      const data = await response.json()
      setUsers(data.users || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar usuarios solo al montar el componente (no cuando fetchUsers cambie)
  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ==================== HANDLERS ====================

  const handleOpenCreateDialog = () => {
    setEditingUser(null)
    setShowUserDialog(true)
  }

  const handleOpenEditDialog = (user: User) => {
    setEditingUser(user)
    setShowUserDialog(true)
  }

  const handleOpenDeleteDialog = (user: User) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }

  const handleCloseUserDialog = () => {
    setShowUserDialog(false)
    setEditingUser(null)
  }

  const handleClosePasswordDialog = () => {
    setShowPasswordDialog(false)
    setGeneratedPassword('')
    setCopiedPassword(false)
  }

  const handleOpenResetDialog = (user: User) => {
    setUserToReset(user)
    setShowResetConfirmDialog(true)
  }

  const handleCloseResetDialog = () => {
    setShowResetConfirmDialog(false)
    setUserToReset(null)
  }

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false)
    setUserToDelete(null)
  }

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword)
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  // ==================== SAVE USER ====================

  const handleSaveUser = useCallback(async (formData: Record<string, any>) => {
    setSaving(true)
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
      const method = editingUser ? 'PATCH' : 'POST'

      const payload: Record<string, any> = {
        nombre: formData.nombre,
        email: formData.email || null,
        telefono: formData.telefono || null,
        role: formData.role,
        quotationId: formData.quotationAssignedId || null, // Backend espera 'quotationId'
      }

      // Solo para creación, incluir empresa para generar username
      if (!editingUser) {
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

      // Si es nuevo usuario, mostrar contraseña generada
      if (!editingUser && result.temporaryPassword) {
        setGeneratedPassword(result.temporaryPassword)
        setIsPasswordReset(false) // Es un nuevo usuario
        setShowPasswordDialog(true)
      }

      await fetchUsers()
      handleCloseUserDialog()
    } catch (err) {
      console.error('Error:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }, [editingUser, fetchUsers])

  // ==================== RESET PASSWORD ====================

  const handleResetPassword = async () => {
    if (!userToReset) return

    setSaving(true)
    try {
      const response = await fetch(`/api/users/${userToReset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetPassword: true }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al resetear contraseña')
      }

      const result = await response.json()

      // Mostrar la nueva contraseña generada
      if (result.newPassword) {
        setGeneratedPassword(result.newPassword)
        setIsPasswordReset(true) // Es un reset de contraseña
        setShowPasswordDialog(true)
      }

      await fetchUsers()
      handleCloseResetDialog()
    } catch (err) {
      console.error('Error:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  // ==================== DELETE USER ====================

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    setSaving(true)
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar usuario')
      }

      await fetchUsers()
      handleCloseDeleteDialog()
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setSaving(false)
    }
  }

  // ==================== FORM CONFIG ====================

  const getFormFields = (): DialogFormField[] => {
    const baseFields: DialogFormField[] = []

    // Campo empresa solo para nuevos usuarios (genera username)
    if (!editingUser) {
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
        value: editingUser?.nombre || '',
        required: true,
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'usuario@dominio.com',
        value: editingUser?.email || '',
        required: true,
      },
      {
        id: 'telefono',
        type: 'text',
        label: 'Teléfono',
        placeholder: '+00 000 000 0000',
        value: editingUser?.telefono || '',
        required: true,
      },
      {
        id: 'role',
        type: 'select',
        label: 'Rol',
        value: editingUser?.role || 'CLIENT',
        required: true,
        options: availableRoles,
      },
      {
        id: 'quotationAssignedId',
        type: 'select',
        label: 'Cotización Asignada',
        value: editingUser?.quotationAssignedId || '',
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
  }

  // Memorizar formConfig para evitar recreaciones innecesarias que resetean el formulario
  const formConfig: DialogFormConfig = useMemo(() => ({
    fields: getFormFields(),
    onSubmit: handleSaveUser,
  }), [editingUser, availableRoles, groupedQuotations, handleSaveUser]) // Solo recrear cuando cambien estas dependencias

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-gh-accent animate-spin" />
        <span className="ml-2 text-xs font-medium text-gh-text-muted">Cargando usuarios...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gh-danger/10 border border-gh-danger/30 rounded-lg p-4 text-center">
        <p className="text-gh-danger text-sm">{error}</p>
        <button
          onClick={fetchUsers}
          className="mt-3 px-3 py-1.5 bg-gh-bg-secondary text-gh-text rounded-md hover:bg-gh-bg-tertiary transition-colors text-xs"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gh-text flex items-center gap-2">
            <Users className="w-4 h-4 text-gh-accent" />
            Gestión de Usuarios
          </h3>
          <p className="text-xs text-gh-text-muted mt-0.5">
            Administra usuarios, roles y asignaciones de cotizaciones
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gh-text-muted bg-gh-bg-secondary px-2.5 py-1 rounded-md border border-gh-border/30">
            {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}
          </span>
          <button
            onClick={handleOpenCreateDialog}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-success/10 text-gh-success border border-gh-success/30 rounded-md hover:bg-gh-success/20 transition-colors text-xs font-medium"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gh-bg-tertiary/30 border-b border-gh-border/20">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gh-text-muted uppercase tracking-wide">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gh-text-muted uppercase tracking-wide">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gh-text-muted uppercase tracking-wide">
                  Rol
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gh-text-muted uppercase tracking-wide">
                  Cotización
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gh-text-muted uppercase tracking-wide">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gh-text-muted uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gh-border/10">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gh-text-muted text-sm">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-gh-bg-tertiary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${
                          user.role === 'SUPER_ADMIN' ? 'bg-amber-500/20' : 
                          user.role === 'ADMIN' ? 'bg-purple-500/20' : 'bg-gh-accent/20'
                        }`}>
                          {user.role === 'SUPER_ADMIN' ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          ) : user.role === 'ADMIN' ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-gh-accent" />
                          )}
                        </div>
                        <span className="text-gh-text font-mono text-xs">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Indicador de estado */}
                        <div 
                          className={`w-2 h-2 rounded-full ${getUserStatus(user.lastLogin).color} animate-pulse`}
                          title={getUserStatus(user.lastLogin).label}
                        />
                        <div>
                          <p className="text-gh-text text-xs">{user.nombre}</p>
                          {user.email && (
                            <p className="text-[10px] text-gh-text-muted">{user.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        user.role === 'SUPER_ADMIN'
                          ? 'bg-amber-500/20 text-amber-400'
                          : user.role === 'ADMIN' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-gh-info/20 text-gh-info'
                      }`}>
                        {user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.quotationAssigned ? (
                        <div>
                          <p className="text-gh-text text-xs">{user.quotationAssigned.empresa}</p>
                          <p className="text-[10px] text-gh-text-muted">{user.quotationAssigned.numero}</p>
                        </div>
                      ) : (
                        <span className="text-gh-text-muted text-xs">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        user.activo 
                          ? 'bg-gh-success/10 text-gh-success' 
                          : 'bg-gh-danger/10 text-gh-danger'
                      }`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditDialog(user)}
                          className="p-1.5 text-gh-text-muted hover:text-gh-accent hover:bg-gh-accent/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Editar usuario"
                          disabled={(() => {
                            const currentRole = session?.user?.role
                            // SUPER_ADMIN puede editar a todos
                            if (currentRole === 'SUPER_ADMIN') return false
                            // ADMIN no puede editar SUPER_ADMIN ni otros ADMIN (excepto a sí mismo)
                            if (currentRole === 'ADMIN') {
                              if (user.role === 'SUPER_ADMIN') return true
                              if (user.role === 'ADMIN' && user.id !== session?.user?.id) return true
                            }
                            return false
                          })()}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenResetDialog(user)}
                          className="p-1.5 text-gh-text-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Resetear contraseña"
                          disabled={(() => {
                            const currentRole = session?.user?.role
                            // SUPER_ADMIN puede resetear todas las contraseñas
                            if (currentRole === 'SUPER_ADMIN') return false
                            // ADMIN puede resetear contraseñas de CLIENTE, pero no de ADMIN ni SUPER_ADMIN
                            if (currentRole === 'ADMIN') {
                              return user.role !== 'CLIENT'
                            }
                            return true
                          })()}
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteDialog(user)}
                          className="p-1.5 text-gh-text-muted hover:text-gh-danger hover:bg-gh-danger/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eliminar usuario"
                          disabled={(() => {
                            const currentRole = session?.user?.role
                            const currentUserId = session?.user?.id
                            // No se puede eliminar el propio usuario
                            if (user.id === currentUserId) return true
                            // No se puede eliminar el único SUPER_ADMIN
                            if (user.role === 'SUPER_ADMIN' && users.filter(u => u.role === 'SUPER_ADMIN').length === 1) return true
                            // SUPER_ADMIN puede eliminar a todos (excepto a sí mismo y al último SUPER_ADMIN)
                            if (currentRole === 'SUPER_ADMIN') return false
                            // ADMIN solo puede eliminar CLIENT
                            if (currentRole === 'ADMIN') {
                              return user.role !== 'CLIENT'
                            }
                            return true
                          })()}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog para Crear/Editar Usuario */}
      <DialogoGenericoDinamico
        isOpen={showUserDialog}
        onClose={handleCloseUserDialog}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        description={editingUser ? 'Modifica los datos del usuario' : 'Completa los datos para crear un nuevo usuario'}
        contentType="form"
        formConfig={formConfig}
        type="info"
        size="lg"
        variant="premium"
        actions={[
          {
            id: 'cancel',
            label: 'Cancelar',
            variant: 'secondary',
            onClick: handleCloseUserDialog,
          },
          {
            id: 'save',
            label: saving ? 'Guardando...' : (editingUser ? 'Guardar Cambios' : 'Crear Usuario'),
            variant: 'primary',
            loading: saving,
          },
        ]}
      />

      {/* Dialog para mostrar contraseña generada */}
      <DialogoGenericoDinamico
        isOpen={showPasswordDialog}
        onClose={handleClosePasswordDialog}
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
        actions={[
          {
            id: 'close',
            label: 'Entendido',
            variant: 'primary',
            onClick: handleClosePasswordDialog,
          },
        ]}
      />

      {/* Dialog para confirmar reset de contraseña */}
      <DialogoGenericoDinamico
        isOpen={showResetConfirmDialog}
        onClose={handleCloseResetDialog}
        title="Resetear Contraseña"
        description={`¿Resetear la contraseña de "${userToReset?.nombre}" (@${userToReset?.username})?`}
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
        actions={[
          {
            id: 'cancel',
            label: 'Cancelar',
            variant: 'secondary',
            onClick: handleCloseResetDialog,
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

      {/* Dialog de confirmación para eliminar */}
      <DialogoGenericoDinamico
        isOpen={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        title="Eliminar Usuario"
        description={`¿Estás seguro de eliminar al usuario "${userToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        contentType="text"
        content="Se eliminará el usuario y todas sus sesiones activas."
        type="warning"
        size="md"
        variant="premium"
        actions={[
          {
            id: 'cancel',
            label: 'Cancelar',
            variant: 'secondary',
            onClick: handleCloseDeleteDialog,
          },
          {
            id: 'delete',
            label: saving ? 'Eliminando...' : 'Eliminar Usuario',
            variant: 'danger',
            onClick: handleDeleteUser,
            loading: saving,
          },
        ]}
      />
    </div>
  )
}


