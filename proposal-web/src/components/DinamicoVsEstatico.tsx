'use client'

import { motion } from 'framer-motion'
import { FaCheck, FaTimes, FaLightbulb } from 'react-icons/fa'

export default function DinamicoVsEstatico() {
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
            🔄 Explicación: Sitios Dinámicos vs Sitios Estáticos
          </h2>
          <p className="text-center text-xl text-gray-600 mb-12">
            Este es un punto crucial para entender por qué recomendamos un sitio web dinámico.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Sitios Estáticos */}
            <ComparisonCard 
              title="🟡 SITIOS ESTÁTICOS"
              color="yellow"
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
              title="🟢 SITIOS DINÁMICOS"
              color="green"
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

          {/* Ventajas y Desventajas */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-yellow-50 p-8 rounded-2xl border-2 border-yellow-200">
              <h3 className="text-2xl font-bold mb-6 text-yellow-900">
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
                  <li key={index} className="flex items-center gap-3 text-gray-800">
                    <FaCheck className="text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 p-8 rounded-2xl border-2 border-yellow-200">
              <h3 className="text-2xl font-bold mb-6 text-yellow-900">
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
                  <li key={index} className="flex items-center gap-3 text-gray-800">
                    <FaTimes className="text-red-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-green-50 p-8 rounded-2xl border-2 border-green-200">
              <h3 className="text-2xl font-bold mb-6 text-green-900">
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
                  <li key={index} className="flex items-center gap-3 text-gray-800">
                    <FaCheck className="text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 p-8 rounded-2xl border-2 border-green-200">
              <h3 className="text-2xl font-bold mb-6 text-green-900">
                Sitios Dinámicos - Desventajas
              </h3>
              <ul className="space-y-3">
                {[
                  'Ligeramente más lentos que los estáticos (pero sigue siendo rápido)',
                  'Requieren mantenimiento (actualizaciones via Portal Admin)',
                  'Costos recurrentes (hosting, dominio, mantenimiento)',
                  'Más complejos técnicamente, pero no tienes que preocuparte por esto',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-800">
                    <FaTimes className="text-red-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Problema y Beneficio */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              whileInView={{ scale: 1.02 }}
              viewport={{ once: true }}
              className="bg-red-50 p-8 rounded-2xl border-3 border-red-400"
            >
              <h3 className="text-2xl font-bold mb-4 text-red-900">
                ❌ PROBLEMA PARA TI (Sitios Estáticos)
              </h3>
              <p className="text-gray-800 text-lg">
                Si tu catálogo cambia (nuevo servicio, cambio de precio, nueva foto), necesitarías contactarnos cada vez e incurrir en gastos recurrentes no planificados.
              </p>
              <p className="text-red-700 font-bold text-lg mt-4">INEFICIENTE ❌</p>
            </motion.div>

            <motion.div
              whileInView={{ scale: 1.02 }}
              viewport={{ once: true }}
              className="bg-green-50 p-8 rounded-2xl border-3 border-green-400"
            >
              <h3 className="text-2xl font-bold mb-4 text-green-900">
                ✅ BENEFICIO PARA TI (Sitios Dinámicos)
              </h3>
              <p className="text-gray-800 text-lg">
                Si lo decides, puedes actualizar el contenido desde un panel fácil, sin llamar a programador. O si prefieres, nosotros lo hacemos.
              </p>
              <p className="text-green-700 font-bold text-lg mt-4">EFICIENTE ✅</p>
            </motion.div>
          </div>

          {/* Tabla Comparativa */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-200 overflow-x-auto"
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-900">📊 TABLA COMPARATIVA</h3>
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="border-b-2 border-blue-400">
                  <th className="text-left p-3 font-bold text-gray-900">Aspecto</th>
                  <th className="text-center p-3 font-bold text-yellow-900">ESTÁTICO</th>
                  <th className="text-center p-3 font-bold text-green-900">DINÁMICO</th>
                </tr>
              </thead>
              <tbody>
                {comparativeData.map((row, index) => (
                  <tr key={index} className="border-b border-blue-200 hover:bg-white/50">
                    <td className="p-3 font-semibold text-gray-900">{row.aspect}</td>
                    <td className="p-3 text-center">{row.static}</td>
                    <td className="p-3 text-center">{row.dynamic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Recomendación Final */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-r from-primary to-primary-dark text-white p-12 rounded-2xl shadow-2xl"
          >
            <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <FaLightbulb />
              ¿CUÁL RECOMENDAMOS PARA URBANISMA?
            </h3>
            <p className="text-xl mb-6 font-semibold">
              NUESTRA RECOMENDACIÓN: <span className="text-2xl text-yellow-300">SITIO DINÁMICO</span>
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
                  <FaCheck className="text-yellow-300 mt-1 flex-shrink-0" />
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
  color: 'yellow' | 'green'
  items: Array<{ label: string; value?: string; list?: string[] }>
}) {
  const bgColor = color === 'yellow' ? 'bg-yellow-50' : 'bg-green-50'
  const borderColor = color === 'yellow' ? 'border-yellow-400' : 'border-green-400'
  const textColor = color === 'yellow' ? 'text-yellow-900' : 'text-green-900'

  return (
    <motion.div
      initial={{ opacity: 0, x: color === 'yellow' ? -20 : 20 }}
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
                    <span className="mt-1">•</span>
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
  { aspect: 'Seguridad', static: '🟢 Muy seguro', dynamic: '🟢 Seguro' },
  { aspect: 'Blog/Noticias', static: '⚠️ Baja compatibilidad', dynamic: '✅ Muy fácil' },
  { aspect: 'Funcionalidad completa', static: '⚠️ Limitada', dynamic: '✅ Completa' },
  { aspect: 'Tienda online futura', static: '❌ No', dynamic: '✅ Sí' },
  { aspect: 'Mantenimiento', static: 'Bajo', dynamic: 'Moderado' },
  { aspect: 'Escalabilidad', static: '🟢 Infinita', dynamic: '🟢 Muy buena' },
]
