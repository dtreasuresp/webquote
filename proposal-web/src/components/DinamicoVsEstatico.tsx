'use client'

import { motion } from 'framer-motion'
import { FaCheck, FaTimes, FaLightbulb } from 'react-icons/fa'
import { useState } from 'react'

export default function DinamicoVsEstatico() {
  const [isTableExpanded, setIsTableExpanded] = useState(false)
  const [isAdvantagesExpanded, setIsAdvantagesExpanded] = useState(false)

  return (
    <section id="dinamico-vs-estatico" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            Sitios Dinámicos vs Sitios Estáticos
          </h2>
          <p className="text-center text-xl text-gray-600 mb-12">
            Este es un punto crucial para entender por qué recomendamos un sitio web dinámico.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Sitios Estáticos */}
            <ComparisonCard 
              title="🔴 SITIOS ESTÁTICOS"
              color="static"
              items={[
                { label: '¿Qué son?', value: 'Páginas web fijas que no cambian a menos que alguien modifique el código HTML/CSS directamente. El contenido es idéntico para todos los visitantes.' },
                { 
                  label: 'Características',
                  list: [
                    'Contenido fijo (no cambia automáticamente)',
                    'Páginas HTML simples',
                    'No tienen base de datos',
                    'Muy rápidos (cargan en milisegundos)',
                    'Difíciles de actualizar (requieren programador cada vez)',
                  ]
                },
              ]}
            />

            {/* Sitios Dinámicos */}
            <ComparisonCard 
              title="🔵 SITIOS DINÁMICOS"
              color="dynamic"
              items={[
                { label: '¿Qué son?', value: 'Sitios web cuyo contenido SÍ cambia automáticamente según lo que necesites. El servidor procesa solicitudes en tiempo real y muestra información personalizada de una base de datos.' },
                { 
                  label: 'Características',
                  list: [
                    'Contenido que cambia dinámicamente',
                    'Tienen base de datos (MySQL)',
                    'Servidor procesa solicitudes en tiempo real',
                    'Panel de administración intuitivo',
                    'Fáciles de actualizar (usuario no técnico)',
                    'Más funcionalidad',
                  ]
                },
              ]}
            />
          </div>

          {/* Ventajas y Desventajas - EXPANDIBLE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 md:p-8 rounded-2xl border-2 border-secondary overflow-hidden mb-12"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-2xl font-bold text-secondary">⚖️ VENTAJAS Y DESVENTAJAS</h3>
              <button
                onClick={() => setIsAdvantagesExpanded(!isAdvantagesExpanded)}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-md ${
                  isAdvantagesExpanded 
                    ? 'bg-secondary text-white hover:bg-secondary-light' 
                    : 'bg-accent text-white hover:bg-accent-dark'
                }`}
              >
                {isAdvantagesExpanded ? (
                  <>
                    <span className="text-xl">▲</span>
                    <span className="hidden sm:inline">Ocultar Detalles</span>
                    <span className="sm:hidden">Ocultar</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">▼</span>
                    <span className="hidden sm:inline">Ver detalles</span>
                    <span className="sm:hidden">Ver Detalles</span>
                  </>
                )}
              </button>
            </div>

            {/* Vista previa colapsada */}
            {!isAdvantagesExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6"
              >
                <p className="text-gray-600">
                  Comparación de <span className="font-bold text-primary">4 aspectos clave</span> entre sitios estáticos y dinámicos
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  👆 Haz clic para ver todas las ventajas y desventajas
                </p>
              </motion.div>
            )}

            {/* Detalles expandidos */}
            {isAdvantagesExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-neutral-50 p-8 rounded-2xl border-2 border-neutral-300">
                    <h3 className="text-2xl font-bold mb-6 text-secondary">
                      Sitios Estáticos - Ventajas
                    </h3>
                    <ul className="space-y-3">
                      {[
                        'Ultra rápidos',
                        'Muy seguros',
                        'Sin costos recurrentes',
                        'Excelente para SEO',
                        'Sin mantenimiento',
                        'Ideales para sitios simples y pequeños',
                        'Bajo costo inicial',
                      ].map((item, index) => (
                        <motion.li 
                          key={index} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center gap-3 text-gray-800"
                        >
                          <FaCheck className="text-accent flex-shrink-0" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-primary/10 p-8 rounded-2xl border-2 border-primary">
                    <h3 className="text-2xl font-bold mb-6 text-secondary">
                      Sitios Estáticos - Desventajas
                    </h3>
                    <ul className="space-y-3">
                      {[
                        'Difíciles de actualizar',
                        'Requieren programador cada vez que cambies algo',
                        'Limitados en funcionalidad',
                        'NO permiten interacción con los usuarios',
                        'No tienen base de datos',
                        'No son ideales para catálogos o tiendas',
                        'No permiten blogs o noticias fácilmente',
                      ].map((item, index) => (
                        <motion.li 
                          key={index} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center gap-3 text-gray-800"
                        >
                          <FaTimes className="text-primary flex-shrink-0" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-accent/10 p-8 rounded-2xl border-2 border-accent">
                    <h3 className="text-2xl font-bold mb-6 text-secondary">
                      Sitios Dinámicos - Ventajas
                    </h3>
                    <ul className="space-y-3">
                      {[
                        'Muy fáciles de actualizar',
                        'Panel de administración intuitivo',
                        'Ideal para usuarios no técnicos',
                        'Funcionalidad completa',
                        'Perfectos para catálogos y tiendas',
                        'Permiten interacción de usuarios',
                        'Base de datos y seguridad avanzada',
                        'Escalables (crecen contigo)',
                        'Permiten blogs y noticias fácilmente',
                        'Actualizaciones en tiempo real',
                        'Independencia del programador para cambios',
                      ].map((item, index) => (
                        <motion.li 
                          key={index} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center gap-3 text-gray-800"
                        >
                          <FaCheck className="text-accent flex-shrink-0" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-primary/10 p-8 rounded-2xl border-2 border-primary">
                    <h3 className="text-2xl font-bold mb-6 text-secondary">
                      Sitios Dinámicos - Desventajas
                    </h3>
                    <ul className="space-y-3">
                      {[
                        'Ligeramente más lentos que los estáticos (pero sigue siendo rápido)',
                        'Requieren mantenimiento (actualizaciones via Portal Admin)',
                        'Costos recurrentes (hosting, dominio, mantenimiento)',
                        'Más complejos técnicamente, pero no tienes que preocuparte por esto',
                      ].map((item, index) => (
                        <motion.li 
                          key={index} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center gap-3 text-gray-800"
                        >
                          <FaTimes className="text-primary flex-shrink-0" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Problema y Beneficio */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              whileInView={{ scale: 1.02 }}
              viewport={{ once: true }}
              className="bg-primary/10 p-8 rounded-2xl border-3 border-primary"
            >
              <h3 className="text-2xl font-bold mb-4 text-secondary">
                ❌ PROBLEMA PARA TI (Sitios Estáticos)
              </h3>
              <p className="text-gray-800 text-lg">
                Si tu administras y gestionas el sitio web y tu catálogo cambia (nuevo servicio, cambio de precio, nueva foto), necesitarías contactarnos cada vez e incurrir en gastos recurrentes.
              </p>
              <p className="text-primary font-bold text-lg mt-4">INEFICIENTE ❌</p>
            </motion.div>

            <motion.div
              whileInView={{ scale: 1.02 }}
              viewport={{ once: true }}
              className="bg-accent/10 p-8 rounded-2xl border-3 border-accent"
            >
              <h3 className="text-2xl font-bold mb-4 text-secondary">
                ✅ BENEFICIO PARA TI (Sitios Dinámicos)
              </h3>
              <p className="text-gray-800 text-lg">
                Si tu administras y gestionas el sitio web y puedes actualizar el contenido desde un panel administrativo sin llamarnos. Esto aplica si en algún momento quieres transferir tu sitio web a otro proveedor o desarrollador. Por el momento y según tus requerimientos, nosotros hacemos todo el trabajo por ti, aunque con un costo adicional acequible.
              </p>
              <p className="text-accent-dark font-bold text-lg mt-4">MÁS EFICIENTE ✅</p>
            </motion.div>
          </div>

          {/* Tabla Comparativa */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 md:p-8 rounded-2xl border-2 border-secondary overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-2xl font-bold text-secondary"> TABLA COMPARATIVA DE TIPOS DE SITIOS</h3>
              <button
                onClick={() => setIsTableExpanded(!isTableExpanded)}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-md ${
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
                    <span className="hidden sm:inline">Ver detalles</span>
                    <span className="sm:hidden">Ver Tabla</span>
                  </>
                )}
              </button>
            </div>

            {/* Vista previa colapsada */}
            {!isTableExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <p className="text-gray-600 mb-4">
                  Comparación detallada de <span className="font-bold text-accent">{comparativeData.length} aspectos clave</span> entre sitios estáticos y dinámicos
                </p>
                <p className="text-sm text-gray-500">
                  👆 Haz clic en el botón para ver la tabla completa
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
                <table className="w-full text-sm md:text-base">
                  <thead>
                    <tr className="border-b-2 border-secondary">
                      <th className="text-left p-3 font-bold text-secondary">Aspecto</th>
                      <th className="text-center p-3 font-bold text-neutral-700 bg-neutral-100/50">ESTÁTICO</th>
                      <th className="text-center p-3 font-bold text-accent-dark bg-accent/5">DINÁMICO ✓</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparativeData.map((row, index) => (
                      <motion.tr 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-neutral-200 hover:bg-white/80 transition-colors"
                      >
                        <td className="p-3 font-semibold text-secondary">{row.aspect}</td>
                        <td className="p-3 text-center bg-neutral-50/30">{row.static}</td>
                        <td className="p-3 text-center bg-accent/5 font-medium">{row.dynamic}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </motion.div>

          {/* Recomendación Final */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-r from-primary via-primary-dark to-secondary text-white p-12 rounded-2xl shadow-2xl border-2 border-accent"
          >
            <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <FaLightbulb className="text-accent" />
              ¿CUÁL RECOMENDAMOS PARA Urbanísima Constructora S.R.L?
            </h3>
            <p className="text-xl mb-6 font-semibold">
              NUESTRA RECOMENDACIÓN: <span className="text-2xl text-accent">SITIO DINÁMICO</span>
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Actualizaciones frecuentes: Tu catálogo cambia (nuevos servicios, precios, disponibilidad)',
                'No técnico: El sitio dinámico gestiona contenido desde interfaz intuitiva',
                'Blog para marketing: Excelente para SEO y posicionamiento',
                'Crecimiento sin límites: Si quieres vender online en el futuro',
                'Independencia: El programador no necesita intervenir cada vez',
                'Transferencia fácil: Se transfiere toda la documentación sin problemas',
                'Mejor inversión a largo plazo: Aunque el costo inicial es mayor, es más rentable',
                'Profesionalismo: Transmite imagen más profesional y moderna',
                'Funcionalidades avanzadas: Búsqueda, filtros, chat, mapas, redes sociales',
                'Optimización SEO: Mejores prácticas de SEO para posicionamiento en Google',
              ].map((reason, index) => (
                <div key={index} className="flex items-start gap-3 bg-white/20 p-4 rounded-lg">
                  <FaCheck className="text-accent mt-1 flex-shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function ComparisonCard({ 
  title, 
  color, 
  items 
}: { 
  title: string
  color: 'static' | 'dynamic'
  items: Array<{ label: string; value?: string; list?: string[] }>
}) {
  const bgColor = color === 'static' ? 'bg-neutral-50' : 'bg-accent/10'
  const borderColor = color === 'static' ? 'border-neutral-400' : 'border-accent'
  const textColor = color === 'static' ? 'text-secondary' : 'text-secondary'
  const iconColor = color === 'static' ? 'text-neutral-600' : 'text-accent'

  return (
    <motion.div
      initial={{ opacity: 0, x: color === 'static' ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`${bgColor} p-8 rounded-2xl border-2 ${borderColor}`}
    >
      <h3 className={`text-2xl font-bold mb-6 ${textColor}`}>{title}</h3>
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index}>
            <p className={`font-bold ${textColor} mb-2`}>{item.label}</p>
            {item.value && (
              <p className="text-gray-700 mb-2">{item.value}</p>
            )}
            {item.list && (
              <ul className="space-y-2">
                {item.list.map((listItem, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className={`mt-1 ${iconColor}`}>•</span>
                    <span>{listItem}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

const comparativeData = [
  { aspect: 'Velocidad de carga', static: '⚡⚡⚡ Ultra rápido', dynamic: '⚡⚡ Muy Rápido' },
  { aspect: 'Base de datos', static: '❌ No', dynamic: '✅ Sí' },
  { aspect: 'Facilidad actualizar contenido', static: '🔴 Muy difícil', dynamic: '🟢 Muy fácil' },
  { aspect: 'Panel de administración', static: '❌ No tiene', dynamic: '✅ Intuitivo' },
  { aspect: 'Para usuarios no técnicos', static: '❌ No', dynamic: '✅ Sí' },
  { aspect: 'Catálogo de productos', static: '⚠️ Limitado', dynamic: '✅ Ilimitado' },
  { aspect: 'Seguridad', static: '🟢 Muy seguro', dynamic: '🟢 Igualmente Seguro' },
  { aspect: 'Blog/Noticias', static: '⚠️ Baja compatibilidad', dynamic: '✅ Muy fácil' },
  { aspect: 'Funcionalidad completa', static: '⚠️ Limitada', dynamic: '✅ Completa' },
  { aspect: 'Tienda online futura', static: '❌ No', dynamic: '✅ Sí' },
  { aspect: 'Mantenimiento', static: 'Bajo', dynamic: 'Moderado' },
  { aspect: 'Escalabilidad', static: '🟢 Flexible', dynamic: '🟢 Infinita' },
]
