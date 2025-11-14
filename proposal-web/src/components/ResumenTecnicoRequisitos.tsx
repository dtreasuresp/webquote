'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

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
    <section id="resumen-tecnico" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
            Resumen técnico de los requisitos del cliente
          </h2>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-secondary/20">
            {/* Header con botón de expansión */}
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Especificaciones Técnicas</h3>
                  <p className="text-white/90 text-sm">
                    {technicalData.length} aspectos técnicos evaluados
                  </p>
                </div>
                <button
                  onClick={() => setIsTableExpanded(!isTableExpanded)}
                  className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg ${
                    isTableExpanded 
                      ? 'bg-secondary text-white hover:bg-secondary-light' 
                      : 'bg-accent text-white hover:bg-accent-dark'
                  }`}
                >
                  {isTableExpanded ? (
                    <>
                      <span className="text-xl">▲</span>
                      <span className="hidden sm:inline">Colapsar Tabla</span>
                      <span className="sm:hidden">Colapsar</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">▼</span>
                      <span className="hidden sm:inline">Ver Detalles Completos</span>
                      <span className="sm:hidden">Ver Detalles</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Vista previa colapsada */}
            {!isTableExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-6">
                  {[
                    { label: 'Aspectos', value: '18+', icon: '📋' },
                    { label: 'Productos', value: '~10', icon: '📦' },
                    { label: 'Uptime', value: '99.9%', icon: '⚡' },
                    { label: 'Carga', value: '<3s', icon: '🚀' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600">
                  👆 Haz clic en <span className="font-bold text-primary">"Ver Detalles Completos"</span> para explorar todas las especificaciones
                </p>
              </motion.div>
            )}

            {/* Tabla completa expandida */}
            {isTableExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-x-auto"
              >
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-accent/10 to-accent/20 sticky top-0">
                    <tr className="border-b-2 border-accent">
                      <th className="text-left p-4 font-bold text-secondary">Aspecto Técnico</th>
                      <th className="text-left p-4 font-bold text-secondary">Especificación</th>
                      <th className="text-left p-4 font-bold text-secondary">Justificación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {technicalData.map((row, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-accent/5 transition-colors"
                      >
                        <td className="p-4 font-semibold text-gray-900">{row.aspect}</td>
                        <td className="p-4 text-gray-700 font-medium">{row.spec}</td>
                        <td className="p-4 text-gray-600 text-sm">{row.just}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </div>

          {/* Información Adicional */}
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl p-8 border-l-4 border-primary"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">📦 Información a Mostrar por Producto</h3>
              <ul className="space-y-3">
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
                  <div key={idx} className="flex gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-accent/10 to-accent/20 rounded-2xl p-8 border-l-4 border-accent"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">🎯 Acciones Esperadas del Visitante</h3>
              <ul className="space-y-3">
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
                  <div key={idx} className="flex gap-3">
                    <span className="text-accent font-bold">→</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Consideraciones Técnicas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-r from-primary/5 to-primary-dark/5 border-2 border-primary/20 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">🔧 Consideraciones Técnicas Importantes</h3>
            <div className="grid md:grid-cols-3 gap-6">
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
                <div key={idx} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-3">{section.icon}</div>
                  <h4 className="font-bold text-gray-900 mb-3">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.items.map((item, iidx) => (
                      <li key={iidx} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-primary">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
