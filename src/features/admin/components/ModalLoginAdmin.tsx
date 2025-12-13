'use client'

import React from 'react'
import DialogoGenericoDinamico from './DialogoGenericoDinamico'
import { AlertTriangle } from 'lucide-react'

export interface ModalLoginAdminProps {
  isOpen: boolean
  password: string
  onPasswordChange: (value: string) => void
  onSubmit: () => void | Promise<void>
  errorMessage?: string
  isLoading?: boolean
}

/**
 * Modal de login para administrador
 * Solo requiere contraseña para acceso restringido
 */
export default function ModalLoginAdmin({
  isOpen,
  password,
  onPasswordChange,
  onSubmit,
  errorMessage,
  isLoading = false,
}: ModalLoginAdminProps) {

  return (
    <DialogoGenericoDinamico
      isOpen={isOpen}
      onClose={() => {}} // No permitir cerrar sin autenticarse
      title="Acceso Restringido"
      contentType="custom"
      variant="premium"
      type="info"
      size="sm"
      zIndex={100}
      closeOnBackdropClick={false}
      closeOnEscape={false}
      showCloseButton={false}
      actions={[
        {
          id: 'access',
          label: isLoading ? 'Verificando...' : 'Acceder',
          variant: 'primary',
          loading: isLoading,
          onClick: onSubmit,
        },
      ]}
      content={
        <div className="space-y-4">
          <p className="text-sm text-[#8b949e]">
            Ingresa la contraseña para acceder al panel de administración
          </p>
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && password.trim()) {
                  onSubmit()
                }
              }}
              placeholder="Ingresa la contraseña"
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#6e7681] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/50 outline-none transition"
              autoFocus
            />
          </div>
          {errorMessage && (
            <div className="flex items-center gap-2 text-[#f85149] text-sm bg-[#da3633]/10 px-3 py-2 rounded-lg border border-[#da3633]/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              {errorMessage}
            </div>
          )}
        </div>
      }
    />
  )
}


