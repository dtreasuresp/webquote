'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Search, Filter, Download, ExternalLink, Mail, Phone, MapPin, Trash2, Edit2 } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import { useCrmStore, useCrmModalStore } from '@/stores'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { Account } from '@/lib/types'

export default function ClientsSection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canCreate, canEdit, canDelete } = useAdminPermissions()
  const { accounts, isLoading, fetchAccounts, deleteAccount } = useCrmStore()
  const { openModal } = useCrmModalStore()
  
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleAddClient = useCallback(() => {
    if (!canCreate('CLIENTS')) {
      toast.error('No tienes permiso para crear clientes')
      return
    }
    logAction('CREATE', 'CLIENTS', 'new-client', 'Abriendo formulario de nuevo cliente')
    openModal('account', 'create')
  }, [canCreate, logAction, openModal, toast])

  const handleEdit = useCallback((account: Account) => {
    if (!canEdit('CLIENTS')) {
      toast.error('No tienes permiso para editar clientes')
      return
    }
    logAction('EDIT', 'CLIENTS', account.id, 'Abriendo formulario de edición de cliente')
    openModal('account', 'edit', account)
  }, [canEdit, logAction, openModal, toast])

  const handleRefresh = useCallback(async () => {
    await fetchAccounts()
    logAction('VIEW', 'CLIENTS', 'clients-list', 'Lista de Clientes actualizada')
    toast.success('Datos actualizados')
  }, [fetchAccounts, logAction, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!canDelete('CLIENTS')) {
      toast.error('No tienes permiso para eliminar clientes')
      return
    }

    if (confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      try {
        await deleteAccount(id)
        logAction('DELETE', 'CLIENTS', id, 'Cliente eliminado')
        toast.success('Cliente eliminado correctamente')
      } catch (error) {
        toast.error('Error al eliminar el cliente')
      }
    }
  }, [canDelete, deleteAccount, logAction, toast])

  const filteredAccounts = accounts.filter(acc => 
    acc.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.commercialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.taxId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-gh-success/10 text-gh-success border-gh-success/20'
      case 'PROSPECT': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'LEAD': return 'bg-gh-warning/10 text-gh-warning border-gh-warning/20'
      case 'INACTIVE': return 'bg-gh-danger/10 text-gh-danger border-gh-danger/20'
      default: return 'bg-gh-bg-tertiary text-gh-text-muted border-gh-border/30'
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Gestión de Clientes"
        description="Administra las cuentas y empresas de tu cartera"
        icon={<Building2 className="w-5 h-5" />}
        onAdd={handleAddClient}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        itemCount={accounts.length}
        variant="success"
        badges={[
          { label: 'Activos', value: accounts.filter(a => a.status === 'ACTIVE').length, color: 'bg-gh-success/10 text-gh-success border-gh-success/20' },
          { label: 'Prospects', value: accounts.filter(a => a.status === 'PROSPECT').length, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        ]}
      />

      <div className="px-6 py-4 border-b border-white/10 bg-transparent backdrop-blur-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gh-text-muted" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, NIF o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gh-text focus:outline-none focus:ring-2 focus:ring-gh-success/30 focus:border-gh-success/50 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gh-text-muted hover:text-gh-text transition-colors">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gh-text-muted hover:text-gh-text transition-colors">
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="border border-white/10 rounded-xl bg-white/5 backdrop-blur-md overflow-hidden shadow-xl shadow-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[11px] font-bold text-gh-text-muted uppercase tracking-wider border-b border-white/10">
                <th className="px-4 py-4">Cliente / Empresa</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4">NIF / Tax ID</th>
                <th className="px-4 py-4">Contacto</th>
                <th className="px-4 py-4">Actividad</th>
                <th className="px-4 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gh-success/5 transition-all group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gh-text font-bold text-xs border border-white/10 group-hover:border-gh-success/30 transition-colors">
                          {account.legalName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gh-text group-hover:text-gh-success transition-colors">
                            {account.commercialName || account.legalName}
                          </div>
                          <div className="text-[11px] text-gh-text-muted flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {account.city || 'Sin ubicación'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm ${getStatusColor(account.status)}`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gh-text-muted font-mono">
                      {account.taxId || '---'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        {account.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-gh-text-muted hover:text-gh-text transition-colors cursor-pointer">
                            <Mail className="w-3 h-3" /> {account.email}
                          </div>
                        )}
                        {account.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-gh-text-muted hover:text-gh-text transition-colors cursor-pointer">
                            <Phone className="w-3 h-3" /> {account.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[11px] text-gh-text-muted bg-white/5 px-2 py-1 rounded border border-white/10 inline-block">
                        Actualizado: {new Date(account.updatedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={() => handleEdit(account)}
                          className="p-2 text-gh-text-muted hover:text-gh-accent hover:bg-gh-accent/10 rounded-lg transition-all"
                          title="Ver detalle"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(account)}
                          className="p-2 text-gh-text-muted hover:text-gh-text hover:bg-white/10 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(account.id)}
                          className="p-2 text-gh-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-4 text-gh-text-muted"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Building2 className="w-8 h-8 opacity-20" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-medium text-gh-text">No se encontraron clientes</p>
                        <p className="text-xs">Intenta ajustar los filtros o el término de búsqueda</p>
                      </div>
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="px-4 py-2 text-xs bg-white/5 hover:bg-white/10 text-gh-text rounded-lg border border-white/10 transition-all"
                        >
                          Limpiar búsqueda
                        </button>
                      )}
                    </motion.div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
