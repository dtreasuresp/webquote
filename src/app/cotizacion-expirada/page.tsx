'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, AlertTriangle, Home, Mail } from 'lucide-react'
import { FaHome, FaSignOutAlt, FaEnvelope, FaClock, FaPencilRuler, FaCheckCircle, FaStopCircle } from 'react-icons/fa'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export default function CotizacionExpiradaPage() {
  const { data: session } = useSession()

  const handleLogout = async () => {
    // Registrar logout en audit log antes de cerrar sesión
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error logging logout:', error);
    }
    
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
        className="relative z-10 w-full max-w-lg md:max-w-2xl lg:max-w-1xl"
      >
        {/* Card */}
        <div className="bg-gradient-to-br from-gh-bg-primary via-gh-bg-secondary to-gh-bg-primary border border-gh-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#d29922]/20 to-[#f0883e]/20 border-b border-[#30363d] p-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#d29922] to-[#f0883e] p-0.5 mb-4"
            >
              {/* Ícono de estado */}
              <div className="w-full h-full rounded-full bg-[#0d1117] flex items-center justify-center">
                <Clock className="text-[#d29922] text-3xl" />
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-[#f0f6fc]">
              ¡Cotización Expirada!
            </h1>
          </div>
          
          {/* Contenido */}
          <div className="p-8 space-y-6">
            {/* saludo y mensaje */}
            <div className="space-y-4 text-center">
              {session?.user && (
                <p className="text-[#8b949e]">
                  Hola, <span className="text-[#c9d1d9] font-medium">{session.user.nombre || session.user.username}.</span> La propuesta ha expirado.
                </p>
              )}
            </div>

            {/* Motivo */}
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-white text-sm">¿Qué significa esto?</p>
                <p className="text-sm text-gh-text-secondary mt-1">
                  Si está leyendo este mensaje, signfica que el tiempo definido por el proveedor para que estudie y acepte la propuesta ha expirado.
                </p>
              </div>
            </div>

            {/* Próximos pasos */}
            <div className="border-t border-gh-border pt-4 space-y-4">
              <p className="font-semibold text-white text-sm mb-3">¿Qué puedes hacer ahora con esta cotización?</p>

              <div className="flex items-start gap-2">
                {/* Aceptar la propuesta */}
                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                  <div className="flex items-center gap-3 text-[#8b949e]">
                    <FaCheckCircle className="text-[#58a6ff]" />
                    <div>
                      <p className="text-[#c9d1d9] text-sm">Aceptar la propuesta</p>
                    </div>
                    <a
                  href="mailto:dgtecnova@gmail.com"
                  className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors duration-200">Aceptar</a>
                  </div>
                </div>

                {/* Rechazar la propuesta */}
                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                  <div className="flex items-center gap-3 text-[#8b949e]">
                    <FaStopCircle className="text-[#58a6ff]" />
                    <div>
                      <p className="text-[#c9d1d9] text-sm">Rechazar la propuesta</p>
                    </div>
                    <a
                  href="mailto:dgtecnova@gmail.com"
                  className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors duration-200">Rechazar</a>
                  </div>
                </div>
              </div>
              {/* Solicitar tiempo extra */}
              <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                <div className="flex items-center gap-3 text-[#8b949e]">
                  <FaClock className="text-[#58a6ff]" />
                  <div>
                    <p className="text-[#c9d1d9] text-sm">Solicita 24 horas extra</p>
                  </div>
                  <a
                href="mailto:dgtecnova@gmail.com"
                className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors duration-200">Solicitar</a>
                </div>
              </div>              

              {/* Solicitar cambios */}
              <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                <div className="flex items-center gap-3 text-[#8b949e]">
                  <FaPencilRuler className="text-[#58a6ff]" />
                  <div>
                    <p className="text-[#c9d1d9] text-sm">Enviar una propuesta de modificación de la propuesta de cotización</p>
                  </div>
                  <a
                href="mailto:dgtecnova@gmail.com"
                className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors duration-200">Enviar</a>
                </div>
              </div>  
            </div>
            
            {/* Próximos pasos */}
            <div className="border-t border-gh-border pt-4 space-y-3">
              <p className="font-semibold text-white text-sm mb-3">También puedes realizar las siguientes acciones</p>

              <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 md:items-stretch">
                {/* Botón de cerrar sesión */}
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-full py-3 bg-[#21262d] border border-[#30363d] rounded-lg text-[#c9d1d9] font-medium hover:bg-[#30363d] transition-colors flex items-center justify-center gap-2"
                >
                  <FaSignOutAlt />
                  Cerrar Sesión
                </motion.button>

                {/* Botón de volver */}
                <motion.button
                  onClick={() => { globalThis.location.href = '/'; }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-full py-3 bg-[#21262d] border border-[#30363d] rounded-lg text-[#c9d1d9] font-medium hover:bg-[#30363d] transition-colors flex items-center justify-center gap-2"
                >
                  <FaHome />
                  Volver al Inicio
                </motion.button>
              </div>
            </div>

            {/* Footer interno */}
            <div className="text-center text-xs text-gh-text-secondary border-t border-gh-border pt-4">
              <p>Si crees que esto es un error, por favor contáctanos directamente.</p>
            </div>
          </div>
        </div>

        {/* Marca de agua — FUERA de la card */}
        <div className="text-center mt-6 text-xs text-[#484f58]">
          <p>  
            Sistema de Cotizaciones Online WebQuote
            <br />
            Empresa de Soluciones de Negocios 
            <br />
            DG TECNOVA © {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>
    </div>
  )
}