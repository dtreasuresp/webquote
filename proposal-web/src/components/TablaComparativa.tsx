'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function TablaComparativa() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  return (
    <section id="comparativa" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            📊 Tabla Comparativa de Paquetes
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Comparación detallada de todas las características y funcionalidades
          </p>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4 p-4">
              {comparisonData.map((row, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-lg p-4">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === row.category ? null : row.category)}
                    className="w-full text-left font-bold text-gray-900 flex justify-between items-center"
                  >
                    {row.category}
                    <span>{expandedCategory === row.category ? '▼' : '▶'}</span>
                  </button>
                  {expandedCategory === row.category && (
                    <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
                      {row.items.map((item, idx) => (
                        <div key={idx}>
                          <p className="font-semibold text-gray-700 mb-1">{item.feature}</p>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center">
                              <p className="text-xs text-gray-600 mb-1">Constructor</p>
                              <p className="text-primary font-bold">{item.constructor}</p>
                            </div>
                            <div className="text-center border-l-2 border-r-2 border-primary px-2">
                              <p className="text-xs text-gray-600 mb-1">Obra Maestra</p>
                              <p className="text-primary font-bold">{item.maestra}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600 mb-1">Imperio</p>
                              <p className="text-primary font-bold">{item.imperio}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary to-primary-dark text-white">
                  <tr>
                    <th className="text-left p-4 font-bold">Característica</th>
                    <th className="text-center p-4 font-bold">🥉 Constructor<br /><span className="text-sm">$208</span></th>
                    <th className="text-center p-4 font-bold bg-primary/80">🥈 Obra Maestra ⭐<br /><span className="text-sm">$257</span></th>
                    <th className="text-center p-4 font-bold">🥇 Imperio Digital<br /><span className="text-sm">$300</span></th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((category, catIdx) => (
                    <motion.tr
                      key={catIdx}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: catIdx * 0.05 }}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td colSpan={4} className="bg-gradient-to-r from-primary/10 to-gray-50 p-4">
                        <h3 className="font-bold text-lg text-gray-900">{category.category}</h3>
                      </td>
                    </motion.tr>
                  ))}

                  {comparisonData.map((category, catIdx) =>
                    category.items.map((item, itemIdx) => (
                      <motion.tr
                        key={`${catIdx}-${itemIdx}`}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: (catIdx * category.items.length + itemIdx) * 0.02 }}
                        className="border-b border-gray-100 hover:bg-blue-50/50"
                      >
                        <td className="p-4 font-semibold text-gray-900">{item.feature}</td>
                        <td className="p-4 text-center text-gray-700">{item.constructor}</td>
                        <td className="p-4 text-center text-gray-700 bg-primary/5">{item.maestra}</td>
                        <td className="p-4 text-center text-gray-700">{item.imperio}</td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nota importante */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded"
          >
            <p className="text-gray-900">
              <strong>📌 Nota:</strong> Todos los paquetes incluyen SSL/HTTPS gratis, backups diarios automáticos, soporte 24/7 (tiempos de respuesta varían), y actualizaciones de seguridad.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

const comparisonData = [
  {
    category: 'INVERSIÓN',
    items: [
      {
        feature: 'Inversión de Desarrollo',
        constructor: '$150',
        maestra: '$200',
        imperio: '$238',
      },
      {
        feature: 'Costo Total Año 1',
        constructor: '$600 USD',
        maestra: '$713 USD',
        imperio: '$796 USD',
      },
      {
        feature: 'Costo Anual (Años 2+)',
        constructor: '$450 USD/año',
        maestra: '$513 USD/año',
        imperio: '$558 USD/año',
      },
    ],
  },
  {
    category: 'INFRAESTRUCTURA',
    items: [
      {
        feature: 'Almacenamiento',
        constructor: '6-20 GB (SSD)',
        maestra: '~50 GB (NVMe)',
        imperio: '~100 GB (NVMe)',
      },
      {
        feature: 'Ancho de banda',
        constructor: 'Ilimitado',
        maestra: 'Ilimitado',
        imperio: 'Ilimitado',
      },
      {
        feature: 'Uptime Garantizado',
        constructor: '99.9%',
        maestra: '99.9%',
        imperio: '99.9%',
      },
      {
        feature: 'Backup Automático',
        constructor: 'Diario',
        maestra: 'Diario',
        imperio: 'Diario + Manual',
      },
      {
        feature: 'CDN Global',
        constructor: '✗',
        maestra: '✓ Incluido',
        imperio: '✓ Incluido',
      },
      {
        feature: 'Soporte 24/7',
        constructor: 'Máx 6 horas',
        maestra: 'Máx 3 horas',
        imperio: 'Prioritario 30 min',
      },
    ],
  },
  {
    category: 'PÁGINAS Y CONTENIDO',
    items: [
      {
        feature: 'Número de Páginas',
        constructor: '8 páginas',
        maestra: '8+ páginas',
        imperio: '8+ Ilimitadas',
      },
      {
        feature: 'Página Inicio',
        constructor: 'Banner simple',
        maestra: 'Banner + Slider',
        imperio: 'Mega optimizada',
      },
      {
        feature: 'Catálogo Productos',
        constructor: '10 servicios',
        maestra: '10 con detalle',
        imperio: 'Ilimitado',
      },
      {
        feature: 'Galería Proyectos',
        constructor: 'Hasta 15 fotos',
        maestra: '20 fotos + efectos',
        imperio: 'Ilimitada',
      },
      {
        feature: 'Blog',
        constructor: 'Básico',
        maestra: 'Con categorías',
        imperio: 'Avanzado',
      },
    ],
  },
  {
    category: 'FUNCIONALIDADES',
    items: [
      {
        feature: 'Búsqueda Productos',
        constructor: 'Simple',
        maestra: 'Filtros avanzados',
        imperio: 'Búsqueda por voz',
      },
      {
        feature: 'Chat WhatsApp',
        constructor: '✓ Integrado',
        maestra: '✓ Integrado',
        imperio: '✓ API Completa',
      },
      {
        feature: 'Chat en Vivo',
        constructor: '✗',
        maestra: '✗',
        imperio: '✓ + Chatbot IA',
      },
      {
        feature: 'Comparador Productos',
        constructor: '✗',
        maestra: '✓',
        imperio: '✓ Avanzado',
      },
      {
        feature: 'Sistema de Reservas',
        constructor: '✗',
        maestra: '✗',
        imperio: '✓ Online',
      },
      {
        feature: 'Calificaciones/Reviews',
        constructor: '✗',
        maestra: '✓',
        imperio: '✓ Automatizadas',
      },
    ],
  },
  {
    category: 'MARKETING Y ANALYTICS',
    items: [
      {
        feature: 'Google Analytics',
        constructor: 'Básico',
        maestra: 'Avanzado',
        imperio: 'Avanzado + Heatmap',
      },
      {
        feature: 'Meta Pixel',
        constructor: '✗',
        maestra: '✓',
        imperio: '✓ + Eventos',
      },
      {
        feature: 'Google Pixel',
        constructor: '✗',
        maestra: '✗',
        imperio: '✓ Google Ads',
      },
      {
        feature: 'A/B Testing',
        constructor: '✗',
        maestra: '✗',
        imperio: '✓',
      },
      {
        feature: 'SEO Optimización',
        constructor: 'Básica',
        maestra: '✓ Completa',
        imperio: '✓ Premium',
      },
    ],
  },
  {
    category: 'CAPACITACIÓN Y SOPORTE',
    items: [
      {
        feature: 'Horas de Capacitación',
        constructor: '2 horas',
        maestra: '3 horas',
        imperio: '6 horas',
      },
      {
        feature: 'Manual de Usuario',
        constructor: '✓ PDF',
        maestra: '✓ Detallado',
        imperio: '✓ Profesional',
      },
      {
        feature: 'Videos Tutoriales',
        constructor: '✗',
        maestra: '✓ Personalizados',
        imperio: '✓ Personalizados',
      },
      {
        feature: 'Garantía Técnica',
        constructor: '30 días',
        maestra: '60 días',
        imperio: '90 días',
      },
      {
        feature: 'Gestión Mensual Incluida',
        constructor: 'Hasta 2 cambios',
        maestra: 'Ilimitados',
        imperio: 'Ilimitados',
      },
    ],
  },
  {
    category: 'TIEMPO DE ENTREGA',
    items: [
      {
        feature: 'Semanas de Desarrollo',
        constructor: '4 semanas',
        maestra: '5-6 semanas',
        imperio: '7-8 semanas',
      },
    ],
  },
]
