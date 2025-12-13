'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUser, FaLock, FaSpinner, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mostrar mensaje de error si viene de callback
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'CredentialsSignin') {
      setError('Usuario o contraseña incorrectos')
    } else if (errorParam === 'SessionRequired') {
      setError('Debes iniciar sesión para acceder a esta página')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const callbackUrl = searchParams.get('callbackUrl') || '/'
      
      // ✅ redirect=false para capturar errores
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Manejar errores específicos
        if (result.error === 'CredentialsSignin') {
          setError('Usuario o contraseña incorrectos')
        } else {
          setError(result.error)
        }
        setLoading(false)
        return
      }

      if (result?.ok) {
        // ✅ Usar router de Next.js con refresh
        router.push(callbackUrl)
        router.refresh()
        // Mantener loading=true hasta que la navegación complete
      }
    } catch (err) {
      console.error('[LOGIN] Error:', err)
      setError('Error al iniciar sesión. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] flex items-center justify-center p-4">
      {/* Fondo con patrón */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] to-[#161b22]" />
      
      {/* Efectos de luz */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#58a6ff]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card de Login */}
        <div className="bg-[#161b22]/90 backdrop-blur-xl border border-[#30363d] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header con logo */}
          <div className="bg-gradient-to-r from-[#238636]/20 to-[#58a6ff]/20 border-b border-[#30363d] p-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#238636] to-[#58a6ff] p-0.5 mb-4"
            >
              <div className="w-full h-full rounded-full bg-[#0d1117] flex items-center justify-center">
                <FaUser className="text-[#58a6ff] text-2xl" />
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-[#f0f6fc]">
              Bienvenido a WebQuote
            </h1>
            <p className="text-[#8b949e] mt-2">
              Inicia sesión para ver tu cotización
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Mensaje de error */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#f8514926] border border-[#da3633] rounded-lg p-4 flex items-start gap-3"
                >
                  <FaExclamationTriangle className="text-[#f85149] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[#f85149]">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Campo Usuario */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-[#c9d1d9]">
                Usuario
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b949e]" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:border-[#58a6ff] focus:ring-2 focus:ring-[#58a6ff]/20 outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[#c9d1d9]">
                Contraseña
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b949e]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-12 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:border-[#58a6ff] focus:ring-2 focus:ring-[#58a6ff]/20 outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#c9d1d9] transition-colors disabled:opacity-50"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Botón Submit */}
            <motion.button
              type="submit"
              disabled={loading || !username || !password}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-[#21262d] cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#3fb950] shadow-lg shadow-[#238636]/25'
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="border-t border-[#30363d] px-8 py-4 text-center">
            <p className="text-xs text-[#8b949e]">
              ¿Problemas para acceder? Contacta al administrador.
            </p>
          </div>
        </div>

        {/* Marca de agua */}
        <div className="text-center mt-6 text-xs text-[#484f58]">
          <p>  
          Sistema de Cotizaciones Online
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

function LoginFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] flex items-center justify-center">
      <FaSpinner className="animate-spin text-[#58a6ff] text-4xl" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  )
}
