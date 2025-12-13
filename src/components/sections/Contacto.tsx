'use client'

import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaWhatsapp, FaEnvelope, FaPhone } from 'react-icons/fa'
import type { ContactoInfo, VisibilidadConfig } from '@/lib/types'
import { FluentSection, FluentGlass, FluentReveal, FluentRevealGroup, FluentRevealItem } from '@/components/motion'
import { fluentStaggerItem } from '@/lib/animations/variants'
import { spring } from '@/lib/animations/config'

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
    <FluentSection 
      id="contacto" 
      animation="stagger"
      paddingY="sm"
      className="bg-gradient-to-b from-light-bg via-light-bg-secondary to-white border-t border-light-border/50"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header con animación Fluent */}
        <FluentReveal className="text-center mb-6">
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-light-success to-green-600 rounded-2xl mb-5 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={spring.fluentBouncy}
          >
            <FaWhatsapp className="text-white" size={28} />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-light-text mb-3 tracking-tight">
            {contacto.titulo || '¿Listo para comenzar?'}
          </h2>
          <p className="text-lg text-light-text-secondary max-w-xl mx-auto">
            {contacto.subtitulo || 'Elige el canal que prefieras para contactarnos'}
          </p>
        </FluentReveal>

        {/* Canales de Comunicación - Grid con stagger */}
        <FluentRevealGroup className="grid sm:grid-cols-3 gap-5 mb-6">
          {/* WhatsApp */}
          <FluentRevealItem>
            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full"
              whileTap={{ scale: 0.98 }}
            >
              <FluentGlass
                variant="normal"
                className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-300 h-full hover:shadow-[0_20px_40px_rgba(34,197,94,0.2)]"
              >
                {/* Gradiente de fondo al hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div 
                      className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={spring.fluentBouncy}
                    >
                      <FaWhatsapp className="text-white" size={24} />
                    </motion.div>
                    <div>
                      <h3 className="text-base font-semibold text-light-text">WhatsApp</h3>
                      <p className="text-xs text-light-text-muted">Respuesta inmediata</p>
                    </div>
                  </div>
                  <p className="text-base font-medium text-light-text mb-4">{contacto.whatsapp}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600 group-hover:translate-x-1 transition-transform">
                    Iniciar chat
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.042-.018.75.75 0 0 1-.018-1.042l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06z"/>
                    </svg>
                  </span>
                </div>
              </FluentGlass>
            </motion.a>
          </FluentRevealItem>

          {/* Email */}
          <FluentRevealItem>
            <motion.a
              href={emailUrl}
              className="block h-full"
              whileTap={{ scale: 0.98 }}
            >
              <FluentGlass
                variant="normal"
                className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-300 h-full hover:shadow-[0_20px_40px_rgba(0,120,212,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-light-accent to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div 
                      className="w-14 h-14 bg-gradient-to-br from-light-accent to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={spring.fluentBouncy}
                    >
                      <FaEnvelope className="text-white" size={20} />
                    </motion.div>
                    <div>
                      <h3 className="text-base font-semibold text-light-text">Email</h3>
                      <p className="text-xs text-light-text-muted">Comunicación formal</p>
                    </div>
                  </div>
                  <p className="text-base font-medium text-light-text mb-4 break-all">{contacto.email}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-light-accent group-hover:translate-x-1 transition-transform">
                    Enviar email
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.042-.018.75.75 0 0 1-.018-1.042l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06z"/>
                    </svg>
                  </span>
                </div>
              </FluentGlass>
            </motion.a>
          </FluentRevealItem>

          {/* Teléfono */}
          <FluentRevealItem>
            <motion.a
              href={telUrl}
              className="block h-full"
              whileTap={{ scale: 0.98 }}
            >
              <FluentGlass
                variant="normal"
                className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-300 h-full hover:shadow-[0_20px_40px_rgba(139,92,246,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div 
                      className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={spring.fluentBouncy}
                    >
                      <FaPhone className="text-white" size={18} />
                    </motion.div>
                    <div>
                      <h3 className="text-base font-semibold text-light-text">Teléfono</h3>
                      <p className="text-xs text-light-text-muted">Atención directa</p>
                    </div>
                  </div>
                  <p className="text-base font-medium text-light-text mb-4">{contacto.telefono}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 group-hover:translate-x-1 transition-transform">
                    Llamar ahora
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.042-.018.75.75 0 0 1-.018-1.042l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06z"/>
                    </svg>
                  </span>
                </div>
              </FluentGlass>
            </motion.a>
          </FluentRevealItem>
        </FluentRevealGroup>

        {/* Ubicación - Card con mapa */}
        <FluentReveal className="mb-6">
          <FluentGlass
            variant="normal"
            className="rounded-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-light-bg-secondary to-light-bg-tertiary px-6 py-4 border-b border-light-border/50">
              <h3 className="text-sm font-semibold text-light-text flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-light-accent to-blue-600 rounded-lg">
                  <FaMapMarkerAlt className="text-white" size={12} />
                </div>
                Ubicación
              </h3>
            </div>
            
            {/* Mapa */}
            <div className="aspect-[3/1] w-full bg-light-bg-tertiary relative">
              <iframe
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
                title={`Ubicación ${contacto.empresaNombre}`}
              />
              {/* Overlay sutil */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white/20 to-transparent" />
            </div>
            
            {/* Dirección */}
            <div className="p-6">
              <p className="text-base text-light-text font-semibold mb-1">{contacto.direccion}</p>
              <p className="text-sm text-light-text-secondary mb-3">{contacto.ciudad}</p>
              <motion.span 
                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-light-warning-bg to-amber-50 text-light-warning text-xs font-medium rounded-full border border-light-warning/20"
                whileHover={{ scale: 1.05 }}
                transition={spring.fluent}
              >
                ⏰ Con cita previa
              </motion.span>
            </div>
          </FluentGlass>
        </FluentReveal>
      </div>

      {/* Footer con fondo diferenciado */}
      <motion.div 
        className="mt-8 pt-6 pb-4 bg-gradient-to-r from-light-bg-secondary via-light-bg-tertiary to-light-bg-secondary border-t border-light-border/50"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-base text-light-text font-semibold mb-1">
            {contacto.nombreCeo} | CEO {contacto.empresaNombre}
          </p>
          <p className="text-sm text-light-text-secondary mb-2">
            Propuesta actualizada: {contacto.fechaPropuesta} • Versión {contacto.versionPropuesta}
          </p>
          <p className="text-xs text-light-text-muted">
            {contacto.copyright}
          </p>
        </div>
      </motion.div>
    </FluentSection>
  )
}
