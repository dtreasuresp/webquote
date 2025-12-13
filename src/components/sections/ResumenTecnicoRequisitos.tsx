'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaClipboardList, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { FluentSection, FluentGlass, FluentReveal, FluentRevealGroup, FluentRevealItem } from '@/components/motion'
import { fluentHoverCard, fluentSlideUp } from '@/lib/animations/variants'
import { spring, viewport } from '@/lib/animations/config'

export default function ResumenTecnicoRequisitos() {
  const [isTableExpanded, setIsTableExpanded] = useState(false)

  const technicalData = [
    {
      aspect: 'Tipo de Sitio',
      spec: 'Catálogo Dinámico + Servicios',
      just: 'Permite actualizar contenido sin código',
    },
    {
      aspect: 'Cantidad de Productos',
      spec: '~10 productos (1 categoría)',
      just: 'Rango manejable para inicio, escalable',
    },
    {
      aspect: 'Fotos por Producto',
      spec: '4 fotografías',
      just: 'Presentación profesional del catálogo',
    },
    {
      aspect: 'Categorías',
      spec: '1 categoría principal',
      just: 'Simplifica estructura inicial',
    },
    {
      aspect: 'Información por Producto',
      spec: 'Nombre, descripción, fotos, precio, especificaciones',
      just: 'Información completa para decisión de compra',
    },
    {
      aspect: 'Funcionalidades Búsqueda',
      spec: 'Búsqueda, filtros por categoría/características',
      just: 'Mejora experiencia del usuario',
    },
    {
      aspect: 'Funcionalidades Avanzadas',
      spec: 'Comparador, chat en vivo, mapas, calendario',
      just: 'Según paquete seleccionado',
    },
    {
      aspect: 'Integraciones Requeridas',
      spec: 'Facebook, WhatsApp Business, Google Maps, Pixel',
      just: 'Contacto y análisis de conversiones',
    },
    {
      aspect: 'Multimedia',
      spec: 'Imágenes, videos, documentos PDF',
      just: 'Contenido rico y atractivo',
    },
    {
      aspect: 'CMS Necesario',
      spec: 'Sí (actualizaciones por proveedor)',
      just: 'Gestión sin acceso cliente',
    },
    {
      aspect: 'Versión Móvil',
      spec: 'Responsive design 100%',
      just: 'Crítica - mayoría usos en móvil',
    },
    {
      aspect: 'SEO',
      spec: 'Recomendado con enfoque local',
      just: 'Posicionamiento en Google crucial',
    },
    {
      aspect: 'Analytics',
      spec: 'Meta Pixel + Google Analytics',
      just: 'Seguimiento de conversiones',
    },
    {
      aspect: 'Velocidad de Carga',
      spec: '< 3 segundos (meta: <2s)',
      just: 'Mejora conversión y SEO',
    },
    {
      aspect: 'Uptime Garantizado',
      spec: '99.9%',
      just: 'Disponibilidad 24/7',
    },
    {
      aspect: 'SSL/HTTPS',
      spec: 'Gratis y automático',
      just: 'Seguridad y confianza',
    },
    {
      aspect: 'Backups',
      spec: 'Diarios automáticos',
      just: 'Protección de datos',
    },
    {
      aspect: 'Soporte',
      spec: '24/7 (tiempos varían)',
      just: 'Resolución rápida de problemas',
    },
  ]

  return (
    <FluentSection 
      id="resumen-tecnico" 
      animation="stagger"
      paddingY="lg"
      className="bg-gradient-to-b from-light-bg-secondary to-light-bg"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-6"
          variants={fluentSlideUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport.default}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-light-accent to-indigo-600 rounded-2xl mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={spring.fluent}
          >
            <FaClipboardList className="text-white" size={24} />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
            Resumen técnico de los requisitos del cliente
          </h2>
          <p className="text-sm text-light-text-secondary max-w-2xl mx-auto">
            Especificaciones técnicas evaluadas para tu proyecto
          </p>
        </motion.div>

        {/* Tabla Principal */}
        <FluentReveal>
          <FluentGlass
            variant="elevated"
            className="rounded-2xl overflow-hidden border border-light-border/50 mb-6"
          >
          {/* Header con botón de expansión */}
          <div className="bg-gradient-to-r from-light-accent to-blue-600 text-white p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Especificaciones Técnicas</h3>
                <p className="text-white/80 text-sm">
                  {technicalData.length} aspectos técnicos evaluados
                </p>
              </div>
              <motion.button
                onClick={() => setIsTableExpanded(!isTableExpanded)}
                className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
                  isTableExpanded 
                    ? 'bg-white/20 text-white hover:bg-white/30' 
                    : 'bg-white text-light-accent hover:bg-white/90'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={spring.fluent}
              >
                {isTableExpanded ? (
                  <>
                    <FaChevronUp size={12} />
                    <span>Colapsar</span>
                  </>
                ) : (
                  <>
                    <FaChevronDown size={12} />
                    <span>Ver Detalles</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Vista previa colapsada */}
          {!isTableExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <FluentRevealGroup className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-6">
                {[
                  { label: 'Aspectos', value: '18+', icon: '📋' },
                  { label: 'Productos', value: '~10', icon: '📦' },
                  { label: 'Uptime', value: '99.9%', icon: '⚡' },
                  { label: 'Carga', value: '<3s', icon: '🚀' },
                ].map((stat, idx) => (
                  <FluentRevealItem key={`stat-${stat.label}-${idx}`}>
                    <motion.div 
                      className="bg-gradient-to-br from-light-accent/5 to-light-accent/10 rounded-xl p-4 border border-light-accent/20 h-full"
                      whileHover={fluentHoverCard}
                    >
                      <div className="text-2xl mb-2">{stat.icon}</div>
                      <div className="text-xl font-bold text-light-accent mb-1">{stat.value}</div>
                      <div className="text-xs text-light-text-secondary">{stat.label}</div>
                    </motion.div>
                  </FluentRevealItem>
                ))}
              </FluentRevealGroup>
              <p className="text-light-text-secondary text-sm">
                👆 Haz clic en <span className="font-medium text-light-accent">"Ver Detalles"</span> para explorar todas las especificaciones
              </p>
            </motion.div>
          )}

          {/* Tabla completa expandida */}
          {isTableExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
              className="overflow-x-auto"
            >
              <table className="w-full">
                <thead className="bg-light-accent/10 sticky top-0">
                  <tr className="border-b-2 border-light-accent/30">
                    <th className="text-left p-4 font-semibold text-light-text text-sm">Aspecto Técnico</th>
                    <th className="text-left p-4 font-semibold text-light-text text-sm">Especificación</th>
                    <th className="text-left p-4 font-semibold text-light-text text-sm">Justificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border">
                  {technicalData.map((row, idx) => (
                    <motion.tr
                      key={`row-${row.aspect}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02, ...spring.fluent }}
                      className="hover:bg-light-accent/5 transition-colors"
                    >
                      <td className="p-4 font-medium text-light-text text-sm">{row.aspect}</td>
                      <td className="p-4 text-light-text-secondary text-sm">{row.spec}</td>
                      <td className="p-4 text-light-text-muted text-xs">{row.just}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
          </FluentGlass>
        </FluentReveal>

        {/* Información Adicional */}
        <FluentRevealGroup className="grid md:grid-cols-2 gap-6 mb-6">
          <FluentRevealItem>
            <FluentGlass
              variant="normal"
              className="rounded-2xl p-6 border-l-4 border-light-accent h-full"
            >
            <h3 className="text-lg font-semibold text-light-text mb-5 flex items-center gap-2">
              📦 Información a Mostrar por Producto
            </h3>
            <ul className="space-y-2.5">
              {[
                'Nombre del producto/servicio',
                'Descripción corta y detallada',
                'Fotografías (4 por producto)',
                'Especificaciones técnicas',
                'Precio referencial',
                'Disponibilidad',
                'Videos demostrativos',
                'Documentos descargables (fichas técnicas)',
              ].map((item, idx) => (
                <motion.div 
                  key={`product-info-${item.slice(0, 20)}-${idx}`} 
                  className="flex gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <span className="text-light-accent font-medium">✓</span>
                  <span className="text-light-text-secondary text-sm">{item}</span>
                </motion.div>
              ))}
            </ul>
          </FluentGlass>
        </FluentRevealItem>

          <FluentRevealItem>
            <FluentGlass
              variant="normal"
              className="rounded-2xl p-6 border-l-4 border-light-success h-full"
            >
            <h3 className="text-lg font-semibold text-light-text mb-5 flex items-center gap-2">
              🎯 Acciones Esperadas del Visitante
            </h3>
            <ul className="space-y-2.5">
              {[
                'Contactar por WhatsApp',
                'Llamar por teléfono',
                'Visitar tienda física',
                'Seguir en redes sociales',
                'Suscribirse a newsletter',
                'Dejar comentarios/reviews',
                'Solicitar cotización',
                'Compartir con amigos',
              ].map((item, idx) => (
                <motion.div 
                  key={`action-${item.slice(0, 20)}-${idx}`} 
                  className="flex gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <span className="text-light-success font-medium">→</span>
                  <span className="text-light-text-secondary text-sm">{item}</span>
                </motion.div>
              ))}
            </ul>
          </FluentGlass>
        </FluentRevealItem>
        </FluentRevealGroup>

        {/* Consideraciones Técnicas */}
        <FluentReveal>
          <FluentGlass
            variant="elevated"
            className="border border-light-border/50 rounded-2xl p-8"
          >
            <h3 className="text-lg font-semibold text-light-text mb-6 flex items-center gap-2">
              🔧 Consideraciones Técnicas Importantes
            </h3>
            <FluentRevealGroup className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: '📱',
                  title: 'Responsive Design',
                  items: ['Mobile-first', 'Tablet optimizado', 'Desktop completo'],
                },
                {
                  icon: '⚡',
                  title: 'Rendimiento',
                  items: ['Caché inteligente', 'CDN para contenido', 'Imágenes optimizadas'],
                },
                {
                  icon: '🔒',
                  title: 'Seguridad',
                  items: ['SSL/TLS 256-bit', 'Backups diarios', 'Actualizaciones automáticas'],
                },
              ].map((section, idx) => (
                <FluentRevealItem key={`tech-${section.title}-${idx}`}>
                  <motion.div 
                    className="bg-light-bg-secondary rounded-xl p-5 border border-light-border/50 h-full"
                    whileHover={fluentHoverCard}
                  >
                    <div className="text-2xl mb-3">{section.icon}</div>
                    <h4 className="font-semibold text-light-text mb-3 text-sm">{section.title}</h4>
                    <ul className="space-y-1.5">
                      {section.items.map((item, iidx) => (
                        <li key={`tech-item-${item}-${iidx}`} className="text-xs text-light-text-secondary flex gap-2">
                          <span className="text-light-accent">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </FluentRevealItem>
              ))}
            </FluentRevealGroup>
          </FluentGlass>
        </FluentReveal>
      </div>
    </FluentSection>
  )
}
