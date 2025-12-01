'use client'

import { motion } from 'framer-motion'
import { FaStar, FaBox } from 'react-icons/fa'
import useSnapshots from '@/features/admin/hooks/useSnapshots'
import type { OtroServicioSnapshot } from '@/lib/types'

function slugify(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .split('')
    .filter((c) => {
      const cp = c.codePointAt(0) ?? 0
      return cp < 0x0300 || cp > 0x036f
    })
    .join('')
    .split(/[^a-z0-9\s-]/u)
    .join('')
    .trim()
    .split(/\s+/)
    .join('-')
}

// Función para parsear semanas desde tiempoEntrega
function parseSemanasFromTiempoEntrega(tiempoEntrega: string): number | null {
  if (!tiempoEntrega) return null
  
  // Buscar patrones como "4 semanas", "5-6 semanas", "4-6 Semanas"
  const semanasMatch = tiempoEntrega.match(/(\d+)(?:-(\d+))?\s*semanas?/i)
  if (semanasMatch) {
    // Si es rango (5-6), usar el mayor
    return semanasMatch[2] ? parseInt(semanasMatch[2]) : parseInt(semanasMatch[1])
  }
  
  // Si dice "días", convertir a semanas
  const diasMatch = tiempoEntrega.match(/(\d+)\s*d[ií]as?/i)
  if (diasMatch) {
    return Math.ceil(parseInt(diasMatch[1]) / 7)
  }
  
  return null // No se pudo parsear
}

interface PackageData {
  id: string
  nombre: string
  slug: string
  href: string
  icon: string
  nivelProfesional: string
  tipo?: string
  subtitulo: string
  pagoInicial: number
  inversionAnio1: number
  description: string
  features: Array<{ category: string; items: string[] }>
  serviciosOpcionales?: Array<{ nombre: string; precio: number }>
  gestion?: { nombre: string; precioMensual: number }
  pages: string  // Opcional - si vacío no se muestra
  timelineWeeks: number | null  // Opcional - si null no se muestra
  colorScheme: 'rojo' | 'dorado' | 'negro' | 'neutro'
  recomendado: boolean
}

export default function Paquetes() {
  const { snapshots, loading } = useSnapshots()

  const activos = snapshots.filter((s) => s.activo)

  // Calcular inversión año 1 y datos por paquete
  const paquetesData: PackageData[] = activos.map((snap) => {
    const pagoInicial = snap.costos.inicial || 0
    const inversionAnio1 = snap.costos.año1 || 0

    // Construcción de features
    const features: Array<{ category: string; items: string[] }> = []
    for (const srv of snap.serviciosBase) {
      if (srv.nombre.toLowerCase() !== 'gestión') {
        const mesesGratis = srv.mesesGratis || 3
        const mesesPago = srv.mesesPago || 9
        const price = srv.precio || 0
        const acumulado = price * mesesPago
        const category = `${srv.nombre} (luego del ${mesesGratis + 1}º mes)`
        features.push({
          category,
          items: [`$${price} USD/mes ($${acumulado} USD/${mesesPago} meses)`],
        })
      }
    }

    // Servicios opcionales
    const serviciosOpcionales =
      snap.otrosServicios && snap.otrosServicios.length > 0
        ? snap.otrosServicios.map((s: OtroServicioSnapshot) => ({
            nombre: s.nombre,
            precio: s.precio || 0,
          }))
        : undefined

    // Gestión
    const gestionData = snap.gestion
      ? {
          nombre: 'Gestión Mensual',
          precioMensual: snap.gestion.precio || 0,
        }
      : undefined

    // Páginas desde datos del paquete (opcional)
    const pages = snap.paquete.cantidadPaginas || ''

    // Semanas desde tiempoEntrega (parsear si es posible)
    const timelineWeeks = parseSemanasFromTiempoEntrega(snap.paquete.tiempoEntrega || '')

    // Nivel profesional basado en tipo o nombre
    const nombreUpper = snap.nombre.toUpperCase()
    let nivelProfesional = snap.paquete.tipo || 'ESTÁNDAR'
    if (!snap.paquete.tipo) {
      if (nombreUpper.includes('CONSTRUCTOR')) {
        nivelProfesional = 'BÁSICO'
      } else if (nombreUpper.includes('OBRA')) {
        nivelProfesional = 'PROFESIONAL'
      } else if (nombreUpper.includes('IMPERIO')) {
        nivelProfesional = 'PREMIUM'
      }
    }

    return {
      id: snap.id,
      nombre: nombreUpper,
      slug: slugify(snap.nombre),
      href: `/paquete/${slugify(snap.nombre)}`,
      icon: '🎁',
      nivelProfesional,
      tipo: snap.paquete.tipo || '',
      subtitulo: `INVERSIÓN TOTAL: $${inversionAnio1} USD`,
      pagoInicial,
      inversionAnio1,
      description: snap.paquete.descripcion || `Paquete personalizado para empresas.`,
      features,
      serviciosOpcionales,
      gestion: gestionData,
      pages,
      timelineWeeks,
      colorScheme: 'neutro',
      recomendado: false,
    }
  })

  // Asignar colores y emojis según inversión
  if (paquetesData.length > 0) {
    // Sort por inversión (año1)
    paquetesData.sort((a, b) => a.inversionAnio1 - b.inversionAnio1)

    // Asignar emojis según cantidad de paquetes
    if (paquetesData.length <= 3) {
      // Solo medallas: 🥉, 🥈, 🥇
      const iconos = ['🥉', '🥈', '🥇']
      for (let idx = 0; idx < paquetesData.length; idx += 1) {
        paquetesData[idx].icon = iconos[idx]
      }
    } else {
      // Con estrella para el de mayor inversión: 🥉, 🥈, ..., ⭐
      // Todos empiezan como 🥉, 🥈, ..., 🥇
      const iconos = ['🥉', '🥈', '🥇']
      for (let idx = 0; idx < paquetesData.length - 1; idx += 1) {
        if (idx < iconos.length) {
          paquetesData[idx].icon = iconos[idx]
        } else {
          paquetesData[idx].icon = '🥇' // Medalla de oro para los intermedios si hay más de 4
        }
      }
      // El último (mayor inversión) recibe la estrella
      paquetesData[paquetesData.length - 1].icon = '⭐'
    }

    // Asignar colores
    // Rojo: menor costo (primer elemento)
    paquetesData[0].colorScheme = 'rojo'

    // Dorado: segundo elemento O si es ⭐ (VIP)
    if (paquetesData.length >= 2) {
      if (paquetesData[1].icon === '⭐') {
        paquetesData[1].colorScheme = 'dorado'
      } else {
        paquetesData[1].colorScheme = 'dorado'
        paquetesData[1].recomendado = true
      }
    }

    // Si hay ⭐ en posición 2 (índice 2), siempre dorado
    if (paquetesData.length >= 3 && paquetesData[2].icon === '⭐') {
      paquetesData[2].colorScheme = 'dorado'
    }

    // Negro: mayor costo (último elemento)
    if (paquetesData.length > 1) {
      paquetesData.at(-1)!.colorScheme = 'negro'
    }
  }

  return (
    <section id="paquetes" className="py-6 md:py-8 px-4 bg-light-bg font-github">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-light-accent/10 rounded-full mb-4">
              <FaBox className="text-light-accent" size={20} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
              Paquetes de Servicios
            </h2>
            <p className="text-sm text-light-text-secondary">
              Opciones diseñadas para diferentes necesidades y presupuestos
            </p>
          </div>

          <div className={`grid ${activos.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-6`}>
            {loading && (
              <>
                {['skel-1', 'skel-2', 'skel-3'].map((id) => (
                  <div key={id} className="rounded-md bg-light-bg border border-light-border p-6 animate-pulse h-96" />
                ))}
              </>
            )}
            {!loading &&
              paquetesData.map((paquete) => (
                <PaqueteCard
                  key={paquete.id}
                  data={paquete}
                />
              ))}
          </div>

          {/* Lo que siempre está incluido */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="mt-12 bg-light-bg border border-light-border p-8 rounded-md"
          >
            <h3 className="text-xl font-semibold mb-6 text-light-text flex items-center gap-2">
              <span>🎁</span> ¿QUÉ ESTÁ INCLUIDO SIEMPRE?
            </h3>
            <p className="text-light-text-secondary mb-6">
              Independientemente del paquete que elijas, todos incluyen 3 meses gratis de Hosting y Mailbox, 6 meses de Dominio y 1 mes gratis de gestión de contenidos. También ofrecemos actualizaciones planificadas libres de costo en dependencia del paquete contratado. Además de lo anterior siempre recibes:
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: '🔒 SEGURIDAD',
                  items: [
                    'Certificado SSL (candado 🔒 en el navegador)',
                    'Protección contra ataques',
                    'Backups automáticos periódicos',
                    'Actualización de seguridad',
                  ]
                },
                {
                  title: '⚡ RENDIMIENTO',
                  items: [
                    'Velocidad de carga optimizada',
                    'Funciona perfectamente en móvil',
                    'Servidor rápido y confiable',
                    'Disponibilidad del 99.9% de tu sitio web en internet',
                  ]
                },
                {
                  title: '📈 POSICIONAMIENTO',
                  items: [
                    'Optimizado para aparecer en Google',
                    'Reportes de tráfico',
                    'Sugerencias de mejora continua',
                  ]
                },
                {
                  title: '🎓 CAPACITACIÓN',
                  items: [
                    '2-6 horas según paquete contratado',
                    'Manual de usuario',
                    'Soporte',
                  ]
                },
              ].map((section) => (
                <div key={section.title} className="bg-light-bg-secondary rounded-md p-4 border border-light-border">
                  <h4 className="font-semibold mb-3 text-light-text">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={`${section.title}-${item}`} className="flex items-start gap-2 text-sm text-light-text-secondary">
                        <span className="text-light-success mt-0.5">✓</span>
                        <span>{item}</span>
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

function PaqueteCard({
  data,
}: Readonly<{
  data: PackageData
}>) {
  const getCardStyles = () => {
    if (data.colorScheme === 'dorado') {
      return {
        container: 'bg-light-bg border-2 border-light-warning shadow-md',
        badge: 'bg-light-warning text-white',
        priceBox: 'bg-light-warning/5 border-l-2 border-light-warning',
        priceText: 'text-light-warning',
        button: 'bg-light-warning text-white hover:bg-amber-600',
      }
    }
    if (data.colorScheme === 'rojo') {
      return {
        container: 'bg-light-bg border border-light-danger/50',
        badge: '',
        priceBox: 'bg-light-danger/5 border-l-2 border-light-danger',
        priceText: 'text-light-danger',
        button: 'bg-light-danger text-white hover:bg-red-700',
      }
    }
    if (data.colorScheme === 'negro') {
      return {
        container: 'bg-light-bg border border-light-text/30',
        badge: '',
        priceBox: 'bg-light-bg-tertiary border-l-2 border-light-text',
        priceText: 'text-light-text',
        button: 'bg-light-text text-white hover:bg-gray-800',
      }
    }
    // neutro
    return {
      container: 'bg-light-bg border border-light-border',
      badge: '',
      priceBox: 'bg-light-bg-secondary border-l-2 border-light-border',
      priceText: 'text-light-text-secondary',
      button: 'bg-light-accent text-white hover:bg-blue-700',
    }
  }

  const styles = getCardStyles()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-md overflow-hidden transition-all ${styles.container}`}
    >
      {/* Reservar espacio para badge */}
      <div className="h-[40px] relative">
        {data.recomendado && (
          <div className={`absolute top-0 left-0 right-0 ${styles.badge} py-2 text-center text-sm font-semibold flex items-center justify-center gap-2 z-10`}>
            <FaStar className="text-xs" /> MÁS POPULAR
          </div>
        )}
      </div>

      <div className="p-5 h-full flex flex-col">
        <div className="text-center mb-4 min-h-[100px] flex flex-col justify-center">
          <span className="text-3xl">{data.icon}</span>
          {data.tipo ? (
            <p className="mt-2 text-xs font-medium tracking-wide text-light-text-secondary uppercase">{data.tipo}</p>
          ) : (
            <p className="mt-2 text-xs font-medium tracking-wide text-light-text-secondary">{data.nivelProfesional}</p>
          )}
          <h3 className="text-lg font-semibold text-light-text mt-2">{data.nombre}</h3>
          <p className={`${styles.priceText} font-semibold text-sm`}>{data.subtitulo}</p>
        </div>

        <p className="text-light-text-secondary text-sm text-center mb-4 flex-grow min-h-[40px]">{data.description}</p>

        <div className={`${styles.priceBox} p-3 rounded-md mb-4`}>
          <p className="text-xs text-light-text-secondary">Pago Inicial</p>
          <p className={`text-2xl font-bold ${styles.priceText}`}>${data.pagoInicial} USD</p>
        </div>

        <div className="grid grid-cols-1 gap-2 mb-4 flex-grow">
          {data.features.map((feature) => (
            <div key={`feat-${feature.category}`} className="text-sm">
              <p className="font-medium text-light-text text-xs leading-tight">{feature.category}</p>
              <p className="text-light-text-secondary text-xs">{feature.items[0]}</p>
            </div>
          ))}

          {data.gestion && (
            <div key="gestion" className="text-sm border-t border-light-border pt-2 mt-2">
              <p className="font-medium text-light-text text-xs leading-tight">Gestión Mensual</p>
              <p className="text-light-text-secondary text-xs">${data.gestion.precioMensual} USD/mes</p>
            </div>
          )}

          {data.serviciosOpcionales && data.serviciosOpcionales.length > 0 && (
            <div key="opcionales" className="text-sm border-t border-light-border pt-2 mt-2">
              <p className="font-medium text-light-text text-xs leading-tight">Servicios Opcionales</p>
              {data.serviciosOpcionales.map((srv) => (
                <p key={srv.nombre} className="text-light-text-secondary text-xs">
                  {srv.nombre}: ${srv.precio} USD
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-light-border">
          <div className="text-center">
            <p className={`text-xl font-bold ${styles.priceText}`}>{data.pages}</p>
            <p className="text-xs text-light-text-secondary">Páginas</p>
          </div>
          <div className="text-center">
            <p className={`text-xl font-bold ${styles.priceText}`}>{data.timelineWeeks}</p>
            <p className="text-xs text-light-text-secondary">Semanas</p>
          </div>
        </div>

        <a
          href={data.href}
          className={`mt-4 py-2 px-4 rounded-md font-medium text-sm text-center transition-colors ${styles.button}`}
        >
          Ver Detalles
        </a>
      </div>
    </motion.div>
  )
}
