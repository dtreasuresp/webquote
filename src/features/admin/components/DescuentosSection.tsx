'use client'

import { motion } from 'framer-motion'

export default function DescuentosSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-xl border-l-4 border-primary p-8"
    >
      <h2 className="text-2xl font-bold text-secondary mb-6">
        💸 Descuentos (Administración Integrada en Modal de Snapshots)
      </h2>

      <div className="p-6 bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl border-2 border-dashed border-accent/40">
        <p className="text-secondary">
          Los descuentos se aplican a nivel de snapshot (paquete guardado) en el modal de edición.
        </p>
        <p className="text-secondary mt-2">
          Al abrir el modal de edición de un snapshot, podrás gestionar:
        </p>
        <ul className="list-disc list-inside text-secondary mt-2 space-y-1">
          <li>Descuentos generales (aplicables a desarrollo, servicios base u otros servicios)</li>
          <li>Descuentos por servicio individual</li>
          <li>Descuento por pago único</li>
          <li>Vista previa en tiempo real de montos con descuentos aplicados</li>
        </ul>
      </div>
    </motion.div>
  )
}
