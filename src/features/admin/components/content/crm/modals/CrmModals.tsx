'use client'

import React, { useState, useMemo } from 'react'
import { useCrmModalStore, useCrmStore } from '@/stores'
import DialogoGenericoDinamico, { DialogFormField } from '../../../DialogoGenericoDinamico'
import { useToast } from '@/components/providers/ToastProvider'

export default function CrmModals() {
  const { isOpen, type, mode, data, closeModal } = useCrmModalStore()
  const { 
    accounts, 
    contacts,
    templates,
    fetchAccounts, 
    fetchContacts, 
    fetchProducts, 
    fetchOpportunities, 
    fetchInteractions, 
    fetchSubscriptions, 
    fetchComplianceRecords,
    fetchRules,
    fetchTemplates,
    fetchQuotes
  } = useCrmStore()
  
  const toast = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const title = useMemo(() => {
    if (!type) return ''
    const entityName = {
      account: 'Cuenta',
      contact: 'Contacto',
      product: 'Producto',
      opportunity: 'Oportunidad',
      interaction: 'Interacción',
      subscription: 'Suscripción',
      compliance: 'Registro de Cumplimiento',
      rule: 'Regla de Negocio',
      template: 'Plantilla',
      quote: 'Cotización'
    }[type]
    return `${mode === 'create' ? 'Nueva' : 'Editar'} ${entityName}`
  }, [type, mode])

  const fields = useMemo((): DialogFormField[] => {
    if (!type) return []

    switch (type) {
      case 'quote':
        return [
          { id: 'numero', type: 'text', label: 'Número de Cotización', required: true, value: data?.numero },
          { id: 'empresa', type: 'text', label: 'Cliente / Empresa', required: true, value: data?.empresa },
          { id: 'presupuesto', type: 'text', label: 'Total Presupuesto', required: true, value: data?.presupuesto },
          { 
            id: 'moneda', 
            type: 'select', 
            label: 'Moneda', 
            required: true, 
            value: data?.moneda || '€',
            options: [
              { label: 'Euro (€)', value: '€' },
              { label: 'Dólar ($)', value: '$' },
              { label: 'Peso (MXN)', value: 'MXN' }
            ]
          },
          { 
            id: 'estado', 
            type: 'select', 
            label: 'Estado', 
            required: true, 
            value: data?.estado || 'CARGADA',
            options: [
              { label: 'Cargada', value: 'CARGADA' },
              { label: 'Activa', value: 'ACTIVA' },
              { label: 'Aceptada', value: 'ACEPTADA' },
              { label: 'Rechazada', value: 'RECHAZADA' },
              { label: 'Expirada', value: 'EXPIRADA' }
            ]
          },
          { id: 'fechaVencimiento', type: 'text', label: 'Fecha Vencimiento (YYYY-MM-DD)', required: true, value: data?.fechaVencimiento },
          { id: 'emailCliente', type: 'email', label: 'Email Cliente', value: data?.emailCliente },
          { id: 'profesional', type: 'text', label: 'Vendedor / Profesional', value: data?.profesional },
          { 
            id: 'templateId', 
            type: 'select', 
            label: 'Plantilla PDF', 
            value: data?.templateId,
            options: [
              { label: 'Predeterminada', value: '' },
              ...templates.filter(t => t.type === 'PDF').map(t => ({ label: t.name, value: t.id }))
            ]
          }
        ]

      case 'account':
        return [
          { id: 'legalName', type: 'text', label: 'Nombre Legal', required: true, value: data?.legalName },
          { id: 'commercialName', type: 'text', label: 'Nombre Comercial', value: data?.commercialName },
          { id: 'taxId', type: 'text', label: 'CIF/NIF', value: data?.taxId },
          { 
            id: 'type', 
            type: 'select', 
            label: 'Tipo', 
            required: true, 
            value: data?.type || 'EMPRESA',
            options: [
              { label: 'Empresa', value: 'EMPRESA' },
              { label: 'Individual', value: 'INDIVIDUAL' },
              { label: 'Prospecto', value: 'PROSPECT' }
            ]
          },
          { 
            id: 'status', 
            type: 'select', 
            label: 'Estado', 
            required: true, 
            value: data?.status || 'PROSPECT',
            options: [
              { label: 'Prospecto', value: 'PROSPECT' },
              { label: 'Lead', value: 'LEAD' },
              { label: 'Activo', value: 'ACTIVE' },
              { label: 'Inactivo', value: 'INACTIVE' },
              { label: 'Archivado', value: 'ARCHIVED' }
            ]
          },
          { id: 'email', type: 'email', label: 'Email', value: data?.email },
          { id: 'phone', type: 'text', label: 'Teléfono', value: data?.phone },
          { id: 'website', type: 'text', label: 'Sitio Web', value: data?.website },
          { id: 'sector', type: 'text', label: 'Sector', value: data?.sector },
          { id: 'address', type: 'textarea', label: 'Dirección', value: data?.address }
        ]

      case 'contact':
        return [
          { 
            id: 'accountId', 
            type: 'select', 
            label: 'Cuenta', 
            required: true, 
            value: data?.accountId,
            options: accounts.map(a => ({ label: a.legalName, value: a.id }))
          },
          { id: 'fullName', type: 'text', label: 'Nombre Completo', required: true, value: data?.fullName },
          { id: 'title', type: 'text', label: 'Cargo', value: data?.title },
          { 
            id: 'role', 
            type: 'select', 
            label: 'Rol', 
            required: true, 
            value: data?.role || 'USER',
            options: [
              { label: 'Decisor', value: 'DECISION_MAKER' },
              { label: 'Influenciador', value: 'INFLUENCER' },
              { label: 'Usuario', value: 'USER' },
              { label: 'Técnico', value: 'TECHNICAL' }
            ]
          },
          { id: 'email', type: 'email', label: 'Email', value: data?.email },
          { id: 'phone', type: 'text', label: 'Teléfono', value: data?.phone },
          { id: 'mobile', type: 'text', label: 'Móvil', value: data?.mobile },
          { 
            id: 'preferredContact', 
            type: 'select', 
            label: 'Contacto Preferido', 
            value: data?.preferredContact || 'EMAIL',
            options: [
              { label: 'Email', value: 'EMAIL' },
              { label: 'Teléfono', value: 'PHONE' },
              { label: 'WhatsApp', value: 'WHATSAPP' },
              { label: 'SMS', value: 'SMS' }
            ]
          }
        ]

      case 'product':
        return [
          { id: 'name', type: 'text', label: 'Nombre', required: true, value: data?.name },
          { id: 'sku', type: 'text', label: 'SKU', required: true, value: data?.sku },
          { 
            id: 'type', 
            type: 'select', 
            label: 'Tipo', 
            required: true, 
            value: data?.type || 'PRODUCT',
            options: [
              { label: 'Producto', value: 'PRODUCT' },
              { label: 'Servicio', value: 'SERVICE' },
              { label: 'Licencia', value: 'LICENSE' },
              { label: 'Suscripción', value: 'SUBSCRIPTION' }
            ]
          },
          { id: 'category', type: 'text', label: 'Categoría', required: true, value: data?.category },
          { id: 'listPrice', type: 'number', label: 'Precio de Lista', required: true, value: data?.listPrice },
          { id: 'description', type: 'textarea', label: 'Descripción', value: data?.description },
          { 
            id: 'billingFrequency', 
            type: 'select', 
            label: 'Frecuencia de Facturación', 
            value: data?.billingFrequency || 'ONE_TIME',
            options: [
              { label: 'Mensual', value: 'MONTHLY' },
              { label: 'Trimestral', value: 'QUARTERLY' },
              { label: 'Anual', value: 'ANNUAL' },
              { label: 'Pago Único', value: 'ONE_TIME' }
            ]
          }
        ]

      case 'opportunity':
        return [
          { 
            id: 'accountId', 
            type: 'select', 
            label: 'Cuenta', 
            required: true, 
            value: data?.accountId,
            options: accounts.map(a => ({ label: a.legalName, value: a.id }))
          },
          { id: 'name', type: 'text', label: 'Nombre de la Oportunidad', required: true, value: data?.name },
          { 
            id: 'stage', 
            type: 'select', 
            label: 'Etapa', 
            required: true, 
            value: data?.stage || 'PROSPECT',
            options: [
              { label: 'Prospecto', value: 'PROSPECT' },
              { label: 'Calificado', value: 'QUALIFIED' },
              { label: 'Propuesta', value: 'PROPOSAL' },
              { label: 'Negociación', value: 'NEGOTIATION' },
              { label: 'Cerrado Ganado', value: 'CLOSED_WON' },
              { label: 'Cerrado Perdido', value: 'CLOSED_LOST' }
            ]
          },
          { id: 'probability', type: 'number', label: 'Probabilidad (%)', value: data?.probability || 50 },
          { id: 'estimatedValue', type: 'number', label: 'Valor Estimado', value: data?.estimatedValue },
          { id: 'expectedCloseDate', type: 'text', label: 'Fecha de Cierre (YYYY-MM-DD)', value: data?.expectedCloseDate }
        ]

      case 'interaction':
        return [
          { 
            id: 'accountId', 
            type: 'select', 
            label: 'Cuenta', 
            required: true, 
            value: data?.accountId,
            options: accounts.map(a => ({ label: a.legalName, value: a.id }))
          },
          { 
            id: 'contactId', 
            type: 'select', 
            label: 'Contacto', 
            value: data?.contactId,
            options: [
              { label: 'Ninguno', value: '' },
              ...contacts.filter(c => !data?.accountId || c.accountId === data.accountId).map(c => ({ label: c.fullName, value: c.id }))
            ]
          },
          { 
            id: 'type', 
            type: 'select', 
            label: 'Tipo', 
            required: true, 
            value: data?.type || 'NOTE',
            options: [
              { label: 'Email', value: 'EMAIL' },
              { label: 'Llamada', value: 'CALL' },
              { label: 'Reunión', value: 'MEETING' },
              { label: 'Nota', value: 'NOTE' },
              { label: 'Documento', value: 'DOCUMENT' }
            ]
          },
          { id: 'subject', type: 'text', label: 'Asunto', value: data?.subject },
          { id: 'description', type: 'textarea', label: 'Descripción', required: true, value: data?.description }
        ]

      case 'subscription':
        return [
          { 
            id: 'accountId', 
            type: 'select', 
            label: 'Cuenta', 
            required: true, 
            value: data?.accountId,
            options: accounts.map(a => ({ label: a.legalName, value: a.id }))
          },
          { id: 'name', type: 'text', label: 'Nombre de Suscripción', required: true, value: data?.name },
          { 
            id: 'billingFrequency', 
            type: 'select', 
            label: 'Frecuencia', 
            required: true, 
            value: data?.billingFrequency || 'MONTHLY',
            options: [
              { label: 'Mensual', value: 'MONTHLY' },
              { label: 'Trimestral', value: 'QUARTERLY' },
              { label: 'Anual', value: 'ANNUAL' }
            ]
          },
          { id: 'amount', type: 'number', label: 'Monto', required: true, value: data?.amount },
          { id: 'startDate', type: 'text', label: 'Fecha Inicio (YYYY-MM-DD)', required: true, value: data?.startDate },
          { id: 'endDate', type: 'text', label: 'Fecha Fin (YYYY-MM-DD)', value: data?.endDate }
        ]

      case 'compliance':
        return [
          { 
            id: 'accountId', 
            type: 'select', 
            label: 'Cuenta', 
            required: true, 
            value: data?.accountId,
            options: accounts.map(a => ({ label: a.legalName, value: a.id }))
          },
          { id: 'type', type: 'text', label: 'Tipo de Documento', required: true, value: data?.type },
          { id: 'status', type: 'text', label: 'Estado', required: true, value: data?.status || 'PENDING' },
          { id: 'validUntil', type: 'text', label: 'Válido Hasta (YYYY-MM-DD)', value: data?.validUntil },
          { id: 'notes', type: 'textarea', label: 'Notas', value: data?.notes }
        ]

      case 'rule':
        return [
          { id: 'name', type: 'text', label: 'Nombre de la Regla', required: true, value: data?.name },
          { id: 'description', type: 'textarea', label: 'Descripción', value: data?.description },
          { 
            id: 'trigger', 
            type: 'select', 
            label: 'Disparador (Trigger)', 
            required: true, 
            value: data?.trigger || 'QUOTE_CREATED',
            options: [
              { label: 'Al crear cotización', value: 'QUOTE_CREATED' },
              { label: 'Al actualizar cotización', value: 'QUOTE_UPDATED' },
              { label: 'Al aceptar cotización', value: 'QUOTE_ACCEPTED' }
            ]
          },
          { id: 'conditions', type: 'textarea', label: 'Condiciones (JSON)', required: true, value: data?.conditions ? JSON.stringify(data.conditions, null, 2) : '{\n  "total": { "gt": 10000 }\n}' },
          { id: 'actions', type: 'textarea', label: 'Acciones (JSON)', required: true, value: data?.actions ? JSON.stringify(data.actions, null, 2) : '{\n  "requireApproval": true,\n  "approverRole": "MANAGER"\n}' },
          { id: 'active', type: 'checkbox', label: 'Activa', value: data?.active ?? true }
        ]

      case 'template':
        return [
          { id: 'name', type: 'text', label: 'Nombre de la Plantilla', required: true, value: data?.name },
          { 
            id: 'type', 
            type: 'select', 
            label: 'Tipo', 
            required: true, 
            value: data?.type || 'EMAIL',
            options: [
              { label: 'Email', value: 'EMAIL' },
              { label: 'PDF', value: 'PDF' },
              { label: 'Contrato', value: 'CONTRACT' }
            ]
          },
          { id: 'content', type: 'textarea', label: 'Contenido (HTML/Texto)', required: true, value: data?.content },
          { id: 'active', type: 'checkbox', label: 'Activa', value: data?.active ?? true }
        ]

      default:
        return []
    }
  }, [type, data, accounts, contacts])

  const handleSubmit = async (formData: Record<string, any>) => {
    setIsSaving(true)
    try {
      // Map type to plural for endpoint
      const pluralMap: Record<string, string> = {
        account: 'accounts',
        contact: 'contacts',
        product: 'products',
        opportunity: 'opportunities',
        interaction: 'interactions',
        subscription: 'subscriptions',
        compliance: 'compliance',
        rule: 'rules',
        template: 'templates',
        quote: 'quotations'
      }

      const endpoint = type === 'quote' ? '/api/quotations' : `/api/crm/${pluralMap[type!]}`
      const method = type === 'quote' ? 'POST' : (mode === 'create' ? 'POST' : 'PATCH')
      const url = (type === 'quote' || mode === 'create') ? endpoint : `${endpoint}/${data.id}`

      // Clean data (convert numbers, etc.)
      let payload: any = { ...formData }
      if (payload.listPrice) payload.listPrice = Number.parseFloat(payload.listPrice)
      if (payload.probability) payload.probability = Number.parseInt(payload.probability, 10)
      if (payload.estimatedValue) payload.estimatedValue = Number.parseFloat(payload.estimatedValue)
      if (payload.amount) payload.amount = Number.parseFloat(payload.amount)
      if (payload.fechaVencimiento) payload.fechaVencimiento = new Date(payload.fechaVencimiento)

      if (type === 'rule') {
        if (typeof payload.conditions === 'string') payload.conditions = JSON.parse(payload.conditions)
        if (typeof payload.actions === 'string') payload.actions = JSON.parse(payload.actions)
      }

      // Special handling for quotations API structure
      if (type === 'quote') {
        payload = {
          quotationConfig: {
            ...(mode === 'edit' ? { id: data.id } : {}),
            ...payload,
            presupuesto: Number.parseFloat(payload.presupuesto)
          }
        }
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Error al guardar')
      }

      toast.success(`${title} guardado correctamente`)
      
      // Refresh data
      const refreshMap: Record<string, () => Promise<any> | void> = {
        account: fetchAccounts,
        contact: fetchContacts,
        product: fetchProducts,
        opportunity: fetchOpportunities,
        interaction: fetchInteractions,
        subscription: fetchSubscriptions,
        compliance: fetchComplianceRecords,
        rule: fetchRules,
        template: fetchTemplates,
        quote: fetchQuotes
      }
      
      if (type && refreshMap[type]) {
        refreshMap[type]()
      }

      closeModal()
    } catch (error) {
      console.error('Error saving CRM entity:', error)
      toast.error(error instanceof Error ? error.message : 'Error al guardar los datos')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DialogoGenericoDinamico
      isOpen={isOpen}
      onClose={closeModal}
      title={title}
      contentType="form"
      formConfig={{
        fields,
        onSubmit: handleSubmit
      }}
      size="lg"
      variant="premium"
      actions={[
        {
          id: 'cancel',
          label: 'Cancelar',
          variant: 'secondary',
          onClick: closeModal
        },
        {
          id: 'save',
          label: isSaving ? 'Guardando...' : 'Guardar',
          variant: 'primary',
          loading: isSaving
        }
      ]}
    />
  )
}
