'use client'

import { motion } from 'framer-motion'
import { FaCheck, FaLightbulb } from 'react-icons/fa'

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
                'Actualizaciones frecuentes: Tu catálogo cambia según tus necesidades (nuevos servicios, precios, disponibilidad)',
                'Bajo nivel de tecnicismo: El sitio dinámico gestiona contenido desde interfaz intuitiva',
                'Posibilidad de crear blog para marketing: Excelente para SEO y posicionamiento',
                'Crecimiento sin límites: Si quieres vender online en el futuro',
                'Independencia: Si en algún momento deseas cambiar de proveedor o si quieres gestionar tú mismo el sitio',
                'Mejor inversión a largo plazo: Aunque el costo inicial y los pagos recurrentes son mayores, es más rentable con el tiempo',
                'Profesionalismo: Transmite imagen más profesional y moderna',
                'Funcionalidades avanzadas: Permite realizar búsqueda, filtros e integración con redes sociales',
                'Optimización: Mejores prácticas para posicionamiento en Google',
                'Seguridad: Actualizaciones y parches regulares para proteger tu sitio',
              ].map((reason) => (
                <div key={reason} className="flex items-start gap-3 bg-white/20 p-4 rounded-lg">
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
}: Readonly<{ 
  title: string
  color: 'static' | 'dynamic'
  items: Array<{ label: string; value?: string; list?: string[] }>
}>) {
  const bgColor = color === 'static' ? 'bg-neutral-50' : 'bg-accent/10'
  const borderColor = color === 'static' ? 'border-neutral-400' : 'border-accent'
  const textColor = 'text-secondary'
  const iconColor = color === 'static' ? 'text-neutral-600' : 'text-accent'

  return (
    <motion.div
      initial={{ opacity: 0, x: color === 'static' ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`${bgColor} p-8 rounded-2xl border-0 ${borderColor}`}
    >
      <h3 className={`text-2xl font-bold mb-6 ${textColor}`}>{title}</h3>
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.label}>
            <p className={`font-bold ${textColor} mb-2`}>{item.label}</p>
            {item.value && (
              <p className="text-gray-700 mb-2">{item.value}</p>
            )}
            {item.list && (
              <ul className="space-y-2">
                {item.list.map((listItem) => (
                  <li key={listItem} className="flex items-start gap-2 text-gray-700">
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