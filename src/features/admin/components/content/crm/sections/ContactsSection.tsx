'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Users, Search, Filter, Download, Mail, Phone, Smartphone, Building2, MoreVertical, ExternalLink, Trash2, Edit2 } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import { useCrmStore, useCrmModalStore } from '@/stores'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { Contact } from '@/lib/types'

export default function ContactsSection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canCreate, canEdit, canDelete } = useAdminPermissions()
  const { contacts, isLoading, fetchContacts, deleteContact } = useCrmStore()
  const { openModal } = useCrmModalStore()
  
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const handleAddContact = useCallback(() => {
    if (!canCreate('CLIENTS')) {
      toast.error('No tienes permiso para crear contactos')
      return
    }
    logAction('CREATE', 'CLIENTS', 'new-contact', 'Abriendo formulario de nuevo contacto')
    openModal('contact', 'create')
  }, [canCreate, logAction, openModal, toast])

  const handleEdit = useCallback((contact: Contact) => {
    if (!canEdit('CLIENTS')) {
      toast.error('No tienes permiso para editar contactos')
      return
    }
    logAction('EDIT', 'CLIENTS', contact.id, 'Abriendo formulario de edición de contacto')
    openModal('contact', 'edit', contact)
  }, [canEdit, logAction, openModal, toast])

  const handleRefresh = useCallback(async () => {
    await fetchContacts()
    logAction('VIEW', 'CLIENTS', 'contacts-list', 'Lista de Contactos actualizada')
    toast.success('Datos actualizados')
  }, [fetchContacts, logAction, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!canDelete('CLIENTS')) {
      toast.error('No tienes permiso para eliminar contactos')
      return
    }

    if (confirm('¿Estás seguro de eliminar este contacto?')) {
      try {
        await deleteContact(id)
        logAction('DELETE', 'CLIENTS', id, 'Contacto eliminado')
        toast.success('Contacto eliminado correctamente')
      } catch (error) {
        toast.error('Error al eliminar el contacto')
      }
    }
  }, [canDelete, deleteContact, logAction, toast])

  const filteredContacts = contacts.filter(contact => 
    contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.account?.legalName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Gestión de Contactos"
        description="Administra las personas de contacto en cada empresa"
        icon={<Users className="w-5 h-5" />}
        onAdd={handleAddContact}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        itemCount={contacts.length}
        variant="success"
        badges={[
          { label: 'Total', value: contacts.length, color: 'bg-gh-success/10 text-gh-success border-gh-success/20' }
        ]}
      />

      <div className="px-6 py-4 border-b border-white/10 bg-transparent backdrop-blur-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gh-text-muted" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o empresa..."
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
                <th className="px-4 py-4">Nombre / Cargo</th>
                <th className="px-4 py-4">Empresa</th>
                <th className="px-4 py-4">Contacto</th>
                <th className="px-4 py-4">Rol</th>
                <th className="px-4 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gh-success/5 transition-all group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gh-text font-bold text-xs border border-white/10 group-hover:border-gh-success/30 transition-colors">
                          {contact.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gh-text group-hover:text-gh-success transition-colors">{contact.fullName}</div>
                          <div className="text-[11px] text-gh-text-muted">{contact.position || 'Sin cargo'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-gh-text">
                        <Building2 className="w-3.5 h-3.5 text-gh-text-muted" />
                        {contact.account?.commercialName || contact.account?.legalName}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        {contact.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-gh-text-muted hover:text-gh-text transition-colors cursor-pointer">
                            <Mail className="w-3 h-3" /> {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-gh-text-muted hover:text-gh-text transition-colors cursor-pointer">
                            <Phone className="w-3 h-3" /> {contact.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm bg-white/5 text-gh-text-muted border-white/10">
                        {contact.role || 'CONTACT'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={() => handleEdit(contact)}
                          className="p-2 text-gh-text-muted hover:text-gh-accent hover:bg-gh-accent/10 rounded-lg transition-all"
                          title="Ver detalle"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(contact)}
                          className="p-2 text-gh-text-muted hover:text-gh-text hover:bg-white/10 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(contact.id)}
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
                  <td colSpan={5} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gh-text-muted">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Users className="w-8 h-8 opacity-20" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-medium text-gh-text">No se encontraron contactos</p>
                        <p className="text-xs">Intenta ajustar los filtros o el término de búsqueda</p>
                      </div>
                    </div>
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
