'use client'

import { useEffect, useState } from 'react'
import DialogoGenericoDinamico from '../DialogoGenericoDinamico'

interface ClientResponse {
  id: string
  clientName: string
  clientEmail: string
  responseType: 'ACEPTADA' | 'RECHAZADA' | 'NUEVA_PROPUESTA'
  mensaje?: string
  respondidoEn: string
  diasRestantes?: number
}

interface DialogoVerRespuestaClienteProps {
  isOpen: boolean
  clientResponse: ClientResponse | null
  onClose: () => void
  quotationNumber: string
}

export function DialogoVerRespuestaCliente({
  isOpen,
  clientResponse,
  onClose,
  quotationNumber,
}: DialogoVerRespuestaClienteProps) {
  const [content, setContent] = useState<React.ReactNode>(null)

  useEffect(() => {
    if (!clientResponse) return

    const tipoMap = {
      RECHAZADA: { label: 'RECHAZADA', color: 'from-red-600 to-red-700', icon: '❌' },
      ACEPTADA: { label: 'ACEPTADA', color: 'from-green-600 to-green-700', icon: '✅' },
      NUEVA_PROPUESTA: { label: 'NUEVA PROPUESTA', color: 'from-blue-600 to-blue-700', icon: '💡' },
    }

    const tipo = tipoMap[clientResponse.responseType]

    setContent(
      <div className="space-y-4">
        {/* Header con tipo de respuesta */}
        <div className={`bg-gradient-to-r ${tipo.color} p-4 rounded-lg text-white`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{tipo.icon}</span>
            <div>
              <h3 className="font-bold text-lg">Respuesta del Cliente: {tipo.label}</h3>
              <p className="text-sm opacity-90">Cotización: {quotationNumber}</p>
            </div>
          </div>
        </div>

        {/* Información del cliente */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gh-bg-secondary rounded-lg">
          <div>
            <p className="text-xs text-gh-text-secondary uppercase tracking-wider mb-1">Cliente</p>
            <p className="font-semibold text-white">{clientResponse.clientName}</p>
          </div>
          <div>
            <p className="text-xs text-gh-text-secondary uppercase tracking-wider mb-1">Email</p>
            <p className="font-mono text-sm text-blue-400">{clientResponse.clientEmail}</p>
          </div>
          <div>
            <p className="text-xs text-gh-text-secondary uppercase tracking-wider mb-1">Respondido En</p>
            <p className="text-sm text-white">
              {new Date(clientResponse.respondidoEn).toLocaleString('es-CO')}
            </p>
          </div>
          {clientResponse.diasRestantes !== undefined && (
            <div>
              <p className="text-xs text-gh-text-secondary uppercase tracking-wider mb-1">Días Restantes</p>
              <p className={`text-sm font-semibold ${clientResponse.diasRestantes <= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {clientResponse.diasRestantes} días
              </p>
            </div>
          )}
        </div>

        {/* Mensaje del cliente */}
        {clientResponse.mensaje && (
          <div className="p-4 bg-gh-bg-secondary rounded-lg border border-gh-border">
            <p className="text-xs text-gh-text-secondary uppercase tracking-wider mb-2">Mensaje del Cliente</p>
            <p className="text-white whitespace-pre-wrap text-sm leading-relaxed">
              {clientResponse.mensaje}
            </p>
          </div>
        )}

        {/* Acciones según tipo */}
        <div className="flex gap-2 pt-4">
          {clientResponse.responseType === 'RECHAZADA' && (
            <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium">
              📧 Enviar Nueva Propuesta
            </button>
          )}
          {clientResponse.responseType === 'NUEVA_PROPUESTA' && (
            <>
              <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium">
                ✅ Aceptar Cambios
              </button>
              <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium">
                ❌ Rechazar Sugerencias
              </button>
            </>
          )}
          {clientResponse.responseType === 'ACEPTADA' && (
            <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium">
              📥 Descargar Confirmación
            </button>
          )}
        </div>
      </div>
    )
  }, [clientResponse, quotationNumber])

  return (
    <DialogoGenericoDinamico
      isOpen={isOpen}
      title={`Respuesta del Cliente`}
      description={`Detalle de la respuesta de ${clientResponse?.clientName || 'cliente'}`}
      content={content}
      actions={[
        {
          id: 'close',
          label: 'Cerrar',
          variant: 'secondary',
          onClick: onClose,
        },
      ]}
      onClose={onClose}
      maxHeight="85vh"
    />
  )
}
