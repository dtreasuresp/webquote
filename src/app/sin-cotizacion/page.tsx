'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaExclamationCircle, FaSignOutAlt, FaEnvelope } from 'react-icons/fa'
import { signOut, useSession } from 'next-auth/react'

export default function NoCotizacionPage() {
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] flex items-center justify-center p-4">
      {/* Fondo con patrón */}
      <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-5" />
      
      {/* Efectos de luz */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#d29922]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Card */}
        <div className="bg-[#161b22]/90 backdrop-blur-xl border border-[#30363d] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#d29922]/20 to-[#f0883e]/20 border-b border-[#30363d] p-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#d29922] to-[#f0883e] p-0.5 mb-4"
            >
              <div className="w-full h-full rounded-full bg-[#0d1117] flex items-center justify-center">
                <FaExclamationCircle className="text-[#d29922] text-3xl" />
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-[#f0f6fc]">
              Sin Cotización Asignada
            </h1>
          </div>

          {/* Contenido */}
          <div className="p-8 space-y-6">
            <div className="text-center space-y-4">
              {session?.user && (
                <p className="text-[#8b949e]">
                  Hola, <span className="text-[#c9d1d9] font-medium">{session.user.nombre || session.user.username}</span>
                </p>
              )}
              <p className="text-[#c9d1d9]">
                Actualmente no tienes ninguna cotización asignada a tu cuenta.
              </p>
              <p className="text-[#8b949e] text-sm">
                Por favor, contacta al administrador para que te asigne una cotización.
              </p>
            </div>

            {/* Información de contacto */}
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
              <div className="flex items-center gap-3 text-[#8b949e]">
                <FaEnvelope className="text-[#58a6ff]" />
                <div>
                  <p className="text-xs text-[#6e7681] uppercase">Contacto</p>
                  <p className="text-[#c9d1d9] text-sm">Comunícate con el administrador del sistema</p>
                </div>
              </div>
            </div>

            {/* Botón de cerrar sesión */}
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-[#21262d] border border-[#30363d] rounded-lg text-[#c9d1d9] font-medium hover:bg-[#30363d] transition-colors flex items-center justify-center gap-2"
            >
              <FaSignOutAlt />
              Cerrar Sesión
            </motion.button>
          </div>
        </div>

        {/* Marca de agua */}
        <p className="text-center mt-6 text-xs text-[#484f58]">
          Sistema de Cotizaciones • {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  )
}
