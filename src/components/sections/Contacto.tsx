'use client'

import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaWhatsapp, FaEnvelope, FaPhone } from 'react-icons/fa'
import type { ContactoInfo, VisibilidadConfig } from '@/lib/types'

interface ContactoProps {
  readonly data?: ContactoInfo
  readonly visibilidad?: VisibilidadConfig
}

export default function Contacto({ data, visibilidad }: ContactoProps) {
  // Si la sección está oculta o no hay datos, no renderizar nada
  if (visibilidad?.contacto === false || !data) {
    return null
  }

  // Usar datos de BD
  const contacto = data

  // Generar URLs para WhatsApp y email
  const whatsappUrl = `https://wa.me/${contacto.whatsapp?.replaceAll(/\D/g, '')}?text=Hola,%20estoy%20interesado%20en%20la%20propuesta`
  const emailUrl = `mailto:${contacto.email}?subject=Consulta sobre Propuesta&body=Hola, me interesa conocer más detalles sobre...`
  const telUrl = `tel:${contacto.telefono?.replaceAll(/[^0-9+]/g, '')}`
  const mapsQuery = encodeURIComponent(`${contacto.direccion}, ${contacto.ciudad}`)

  return (
    <section id="contacto" className="py-6 md:py-8 px-4 bg-light-bg font-github border-t border-light-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-light-success-bg rounded-full mb-4">
              <FaWhatsapp className="text-light-success" size={20} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
              {contacto.titulo || '¿Listo para comenzar?'}
            </h2>
            <p className="text-sm text-light-text-secondary">
              {contacto.subtitulo || 'Elige el canal que prefieras para contactarnos'}
            </p>
          </div>

          {/* Canales de Comunicación */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {/* WhatsApp */}
            <motion.a
              whileHover={{ y: -2 }}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-light-bg rounded-lg border border-light-border p-5 hover:border-light-success hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-light-success-bg rounded-full flex items-center justify-center">
                  <FaWhatsapp className="text-light-success" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-light-text">WhatsApp</h3>
                  <p className="text-xs text-light-text-muted">Respuesta inmediata</p>
                </div>
              </div>
              <p className="text-sm font-medium text-light-text mb-3">{contacto.whatsapp}</p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-light-success group-hover:underline">
                Iniciar chat →
              </span>
            </motion.a>

            {/* Email */}
            <motion.a
              whileHover={{ y: -2 }}
              href={emailUrl}
              className="bg-light-bg rounded-lg border border-light-border p-5 hover:border-light-accent hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-light-info-bg rounded-full flex items-center justify-center">
                  <FaEnvelope className="text-light-accent" size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-light-text">Email</h3>
                  <p className="text-xs text-light-text-muted">Comunicación formal</p>
                </div>
              </div>
              <p className="text-sm font-medium text-light-text mb-3 break-all">{contacto.email}</p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-light-accent group-hover:underline">
                Enviar email →
              </span>
            </motion.a>

            {/* Teléfono */}
            <motion.a
              whileHover={{ y: -2 }}
              href={telUrl}
              className="bg-light-bg rounded-lg border border-light-border p-5 hover:border-light-text-secondary hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-light-bg-tertiary rounded-full flex items-center justify-center">
                  <FaPhone className="text-light-text-secondary" size={14} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-light-text">Teléfono</h3>
                  <p className="text-xs text-light-text-muted">Atención directa</p>
                </div>
              </div>
              <p className="text-sm font-medium text-light-text mb-3">{contacto.telefono}</p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-light-text-secondary group-hover:underline">
                Llamar ahora →
              </span>
            </motion.a>
          </div>

          {/* Ubicación */}
          <div className="rounded-lg border border-light-border overflow-hidden bg-light-bg mb-10">
            <div className="bg-light-bg-secondary px-5 py-3 border-b border-light-border">
              <h3 className="text-sm font-semibold text-light-text flex items-center gap-2">
                <FaMapMarkerAlt className="text-light-text-secondary" size={14} />
                Ubicación
              </h3>
            </div>
            
            {/* Mapa */}
            <div className="aspect-[3/1] w-full bg-light-bg-tertiary">
              <iframe
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
                title={`Ubicación ${contacto.empresaNombre}`}
              />
            </div>
            
            {/* Dirección */}
            <div className="p-5">
              <p className="text-sm text-light-text font-medium mb-1">{contacto.direccion}</p>
              <p className="text-xs text-light-text-secondary">{contacto.ciudad}</p>
              <span className="inline-flex items-center mt-3 px-2 py-1 bg-light-warning-bg text-light-warning text-xs font-medium rounded">
                ⏰ Con cita previa
              </span>
            </div>
          </div>

          {/* Footer */}
        </motion.div>
      </div>

      {/* Footer con fondo diferenciado - ocupa todo el ancho inferior */}
      <div className="mt-6 pt-5 pb-3 bg-light-bg-secondary border-t border-light-border">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-light-text font-medium mb-1">
            {contacto.nombreCeo} | CEO {contacto.empresaNombre}
          </p>
          <p className="text-xs text-light-text-secondary mb-2">
            Propuesta actualizada: {contacto.fechaPropuesta} • Versión {contacto.versionPropuesta}
          </p>
          <p className="text-xs text-light-text-muted">
            {contacto.copyright}
          </p>
        </div>
      </div>
    </section>
  )
}
