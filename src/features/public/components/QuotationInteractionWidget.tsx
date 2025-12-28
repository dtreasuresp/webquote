'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Check, X, Lightbulb, MessageCircle } from 'lucide-react'

interface QuotationInteractionWidgetProps {
  diasRestantes: number
  expiradoEn: string
  quotationId: string
  quotationNumber: string
  onAceptar?: () => void
  onRechazar?: () => void
  onNuevaProuesta?: () => void
  disabled?: boolean
}

interface TimeState {
  dias: number
  horas: number
  minutos: number
  segundos: number
}

/**
 * Widget integrado de interacción con cotización
 * Combina contador regresivo + botones de respuesta
 * Diseño: GitHub Light theme con composición vertical integrada
 * Ubicación: Esquina inferior derecha, flotante
 */
export function QuotationInteractionWidget({
  diasRestantes,
  expiradoEn,
  quotationId,
  quotationNumber,
  onAceptar,
  onRechazar,
  onNuevaProuesta,
  disabled = false,
}: Readonly<QuotationInteractionWidgetProps>) {
  const [tiempo, setTiempo] = useState<TimeState>({ dias: 0, horas: 0, minutos: 0, segundos: 0 })
  const [expanded, setExpanded] = useState(false)

  // Calcular tiempo restante
  useEffect(() => {
    const calcularTiempo = () => {
      const vencimiento = new Date(expiradoEn)
      const ahora = new Date()
      const diff = vencimiento.getTime() - ahora.getTime()

      if (diff <= 0) {
        setTiempo({ dias: 0, horas: 0, minutos: 0, segundos: 0 })
        return
      }

      const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
      const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const segundos = Math.floor((diff % (1000 * 60)) / 1000)

      setTiempo({ dias, horas, minutos, segundos })
    }

    calcularTiempo()
    const intervalo = setInterval(calcularTiempo, 1000)
    return () => clearInterval(intervalo)
  }, [expiradoEn])

  // Determinar color basado en tiempo restante
  const porcentaje = (diasRestantes / 30) * 100
  let colorConfig: any = {
    bg: 'from-green-50 to-emerald-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
    progress: 'from-green-400 to-emerald-400',
    button: {
      aceptar: {
        bg: 'from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: 'text-green-600',
        hover: 'hover:border-green-300 hover:shadow-lg hover:shadow-green-100 hover:bg-gradient-to-br hover:from-green-100 hover:to-emerald-100',
      },
      rechazar: {
        bg: 'from-red-50 to-rose-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: 'text-red-600',
        hover: 'hover:border-red-300 hover:shadow-lg hover:shadow-red-100 hover:bg-gradient-to-br hover:from-red-100 hover:to-rose-100',
      },
      propuesta: {
        bg: 'from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: 'text-blue-600',
        hover: 'hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 hover:bg-gradient-to-br hover:from-blue-100 hover:to-cyan-100',
      },
    },
  }

  if (porcentaje < 30 && diasRestantes < 7) {
    colorConfig = {
      bg: 'from-red-50 to-rose-50',
      text: 'text-red-700',
      border: 'border-red-200',
      dot: 'bg-red-500',
      progress: 'from-red-400 to-rose-400',
      button: {
        aceptar: {
          bg: 'from-green-50 to-emerald-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: 'text-green-600',
          hover: 'hover:border-green-300 hover:shadow-lg hover:shadow-green-100 hover:bg-gradient-to-br hover:from-green-100 hover:to-emerald-100',
        },
        rechazar: {
          bg: 'from-red-50 to-rose-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'text-red-600',
          hover: 'hover:border-red-300 hover:shadow-lg hover:shadow-red-100 hover:bg-gradient-to-br hover:from-red-100 hover:to-rose-100',
        },
        propuesta: {
          bg: 'from-blue-50 to-cyan-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-600',
          hover: 'hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 hover:bg-gradient-to-br hover:from-blue-100 hover:to-cyan-100',
        },
      },
    }
  } else if (porcentaje < 60 && diasRestantes < 15) {
    colorConfig = {
      bg: 'from-amber-50 to-yellow-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      progress: 'from-amber-400 to-yellow-400',
      button: {
        aceptar: {
          bg: 'from-green-50 to-emerald-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: 'text-green-600',
          hover: 'hover:border-green-300 hover:shadow-lg hover:shadow-green-100 hover:bg-gradient-to-br hover:from-green-100 hover:to-emerald-100',
        },
        rechazar: {
          bg: 'from-red-50 to-rose-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'text-red-600',
          hover: 'hover:border-red-300 hover:shadow-lg hover:shadow-red-100 hover:bg-gradient-to-br hover:from-red-100 hover:to-rose-100',
        },
        propuesta: {
          bg: 'from-blue-50 to-cyan-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-600',
          hover: 'hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 hover:bg-gradient-to-br hover:from-blue-100 hover:to-cyan-100',
        },
      },
    }
  }

  const formatTiempo = () => {
    if (tiempo.dias > 0) {
      return `${tiempo.dias}d ${String(tiempo.horas).padStart(2, '0')}h ${String(tiempo.minutos).padStart(2, '0')}m ${String(tiempo.segundos).padStart(2, '0')}s`
    }
    return `${String(tiempo.horas).padStart(2, '0')}:${String(tiempo.minutos).padStart(2, '0')}`
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.12,
      },
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.02, staggerDirection: -1, duration: 0.12 },
    },
  } as const

  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        ease: [0.34, 1.56, 0.64, 1],
        duration: 0.35,
      },
    },
    exit: {
      opacity: 0,
      y: -6,
      scale: 0.98,
      transition: { ease: [0.16, 1, 0.3, 1], duration: 0.18 },
    },
  } as const

  return (
    <motion.div
      className="fixed bottom-8 right-8 z-50 w-80"
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        mass: 0.8,
      }}
    >
      {/* Contenedor principal integrado */}
      <div
        className={`
          bg-gradient-to-br ${colorConfig.bg}
          border border-gray-200
          rounded-xl
          shadow-lg shadow-gray-200/50
          overflow-hidden
          transition-all duration-300
        `}
      >
        {/* Sección superior: Contador */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className={`
                flex-shrink-0
                w-10 h-10
                rounded-full
                bg-white/50 backdrop-blur-sm
                flex items-center justify-center
                border border-gray-200
              `}
            >
              <Clock className="w-5 h-5 text-gray-600" />
            </div>

            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium">Tiempo que tienes para responder</p>
              <p className={`text-lg font-mono font-bold ${colorConfig.text}`}>
                {formatTiempo()}
              </p>
            </div>

            {/* Pulsing dot */}
            <div className="flex-shrink-0">
              <motion.div
                className={`w-2.5 h-2.5 rounded-full ${colorConfig.dot}`}
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  type: 'tween',
                }}
              />
            </div>
          </div>

          {/* Barra de progreso */}
          <motion.div className="mt-3 h-1.5 bg-white/50 rounded-full overflow-hidden border border-gray-200/50">
            <motion.div
              className={`h-full bg-gradient-to-r ${colorConfig.progress} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(porcentaje, 100)}%` }}
              transition={{
                type: 'spring',
                stiffness: 80,
                damping: 25,
                mass: 1.2,
              }}
            />
          </motion.div>
        </div>

        {/* Sección inferior: Botones o estado expandido */}
        <AnimatePresence mode="wait">
          {expanded ? (
            // Estado expandido: Botones de acción - Layout horizontal minimalista
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.25,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="p-3 flex gap-2 justify-center items-center"
              variants={containerVariants}
            >
              {/* Botón Aceptar */}
              <motion.button
                variants={itemVariants}
                onClick={() => {
                  onAceptar?.()
                  setExpanded(false)
                }}
                disabled={disabled}
                whileHover={{
                  scale: 1.08,
                  transition: { type: 'tween', ease: [0.34, 1.56, 0.64, 1], duration: 0.2 },
                }}
                whileTap={{
                  scale: 0.92,
                  transition: { type: 'tween', ease: [0.34, 1.56, 0.64, 1], duration: 0.1 },
                }}
                title="Aceptar cotización" 
                aria-label="Aceptar cotización"
                className={`
                  flex-shrink-0
                  w-7 h-7
                  flex items-center justify-center
                  rounded-lg
                  bg-green-600 hover:bg-green-700
                  border border-green-700
                  shadow-md shadow-green-300/40
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <Check className="w-5 h-5 text-white" />
              </motion.button>

              {/* Botón Proponer */}
              <motion.button
                variants={itemVariants}
                onClick={() => {
                  onNuevaProuesta?.()
                  setExpanded(false)
                }}
                disabled={disabled}
                whileHover={{
                  scale: 1.08,
                  transition: { type: 'tween', ease: [0.34, 1.56, 0.64, 1], duration: 0.2 },
                }}
                whileTap={{
                  scale: 0.92,
                  transition: { type: 'tween', ease: [0.34, 1.56, 0.64, 1], duration: 0.1 },
                }}
                title="Proponer cambios"                
                className={`
                  flex-shrink-0
                  w-7 h-7
                  flex items-center justify-center
                  rounded-lg
                  bg-blue-600 hover:bg-blue-700
                  border border-blue-700
                  shadow-md shadow-blue-300/40
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <Lightbulb className="w-5 h-5 text-white" />
              </motion.button>

              {/* Botón Rechazar */}
              <motion.button
                variants={itemVariants}
                onClick={() => {
                  onRechazar?.()
                  setExpanded(false)
                }}
                disabled={disabled}
                whileHover={{
                  scale: 1.08,
                  transition: { type: 'tween', ease: [0.34, 1.56, 0.64, 1], duration: 0.2 },
                }}
                whileTap={{
                  scale: 0.92,
                  transition: { type: 'tween', ease: [0.34, 1.56, 0.64, 1], duration: 0.1 },
                }}
                title="Rechazar cotización"
                className={`
                  flex-shrink-0
                  w-7 h-7
                  flex items-center justify-center
                  rounded-lg
                  bg-red-600 hover:bg-red-700
                  border border-red-700
                  shadow-md shadow-red-300/40
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>

              {/* Botón Cerrar */}
              <motion.button
                variants={itemVariants}
                onClick={() => setExpanded(false)}
                className={`
                  flex-shrink-0
                  w-7 h-7
                  flex items-center justify-center
                  rounded-lg
                  bg-gray-200 hover:bg-gray-300
                  border border-gray-300
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title="Cerrar opciones"
              >
                <span className="text-gray-600 font-bold text-lg">✕</span>
              </motion.button>
            </motion.div>
          ) : (
            // Estado colapsado: Botón de expandir
            <motion.button
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.25,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              onClick={() => setExpanded(true)}
              disabled={disabled}
              className={`
                w-full
                p-4
                flex items-center justify-between
                gap-3
                text-gray-700 hover:text-gray-800
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
              `}
            >
              <div>
                <span className="text-sm font-semibold block">¿Qué decides?</span></div>
                <p className="text-xs text-gray-500">Haz clic para responder</p>              
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
