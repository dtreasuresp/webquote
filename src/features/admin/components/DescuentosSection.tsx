'use client'

import { motion } from 'framer-motion'

export default function DescuentosSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      {/* PARTE 1: Información de Descuentos */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          💸 Sistema de Descuentos
        </h3>

        <p className="text-neutral-300 mb-4">
          Los descuentos se aplican a nivel de snapshot (paquete guardado) en el modal de edición.
        </p>
      </div>

      {/* PARTE 2: Gestión de Descuentos */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          ⚙️ Gestión en Modal de Edición
        </h3>

        <p className="text-neutral-300 mb-4">
          Al abrir el modal de edición de un snapshot, podrás gestionar:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-neutral-300">
            <span className="text-accent font-bold">✓</span>
            <span>Descuentos generales (aplicables a desarrollo, servicios base u otros servicios)</span>
          </li>
          <li className="flex items-start gap-2 text-neutral-300">
            <span className="text-accent font-bold">✓</span>
            <span>Descuentos por servicio individual</span>
          </li>
          <li className="flex items-start gap-2 text-neutral-300">
            <span className="text-accent font-bold">✓</span>
            <span>Descuento por pago único</span>
          </li>
          <li className="flex items-start gap-2 text-neutral-300">
            <span className="text-accent font-bold">✓</span>
            <span>Vista previa en tiempo real de montos con descuentos aplicados</span>
          </li>
        </ul>
      </div>
    </motion.div>
  )
}
