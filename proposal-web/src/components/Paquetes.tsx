'use client'

import { motion } from 'framer-motion'
import { FaStar } from 'react-icons/fa'
import useSnapshots from '@/lib/hooks/useSnapshots'
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
  pages: number | string
  timelineWeeks: number
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

    // Páginas y timeline por nombre
    const nombreUpper = snap.nombre.toUpperCase()
    let pages: number | string = '8+'
    let timelineWeeks = 6
    let nivelProfesional = 'ESTÁNDAR'

    if (nombreUpper.includes('CONSTRUCTOR')) {
      pages = 8
      timelineWeeks = 4
      nivelProfesional = 'BÁSICO'
    } else if (nombreUpper.includes('OBRA')) {
      nivelProfesional = 'PROFESIONAL'
    } else if (nombreUpper.includes('IMPERIO')) {
      timelineWeeks = 8
      nivelProfesional = 'PREMIUM'
    }

    return {
      id: snap.id,
      nombre: nombreUpper,
      slug: slugify(snap.nombre),
      href: `/paquete/${slugify(snap.nombre)}`,
      icon: '🎁',
      nivelProfesional,
      tipo: snap.paquete.tipo || '',
      subtitulo: `INVERSIÓN ANUAL: $${inversionAnio1} USD`,
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
    <section id="paquetes" className="py-20 px-4 bg-gradient-to-br from-secondary via-secondary-light to-neutral-900 min-h-[900px]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
            ¿Qué ofrecemos?
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-primary">
            DGTECNOVA te presenta los siguientes paquetes de Servicios
          </h2>
          <p className="text-center text-xl text-neutral-200 mb-12">
            Hemos diseñado opciones que se ajustan a diferentes necesidades y presupuestos
          </p>

          <div className={`grid ${activos.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-8`}>
            {loading && (
              <>
                {['skel-1', 'skel-2', 'skel-3'].map((id) => (
                  <div key={id} className="rounded-2xl bg-white/10 border border-white/10 p-8 animate-pulse h-96" />
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
            className="mt-16 bg-gradient-to-r from-primary via-primary-dark to-secondary text-white p-12 rounded-2xl shadow-2xl border-2 border-accent"
          >
            <h3 className="text-3xl font-bold mb-8">🎁 ¿QUÉ ESTÁ INCLUIDO SIEMPRE?</h3>
            <p className="text-xl mb-8">
              Independientemente del paquete que elijas, todos incluyen 3 meses gratis de Hosting y Mailbox, 6 meses de Dominio y 1 mes gratis de gestión de contenidos. También ofrecemos actualizaciones planificadas libres de costo en dependencia del paquete contratado. Además de lo anterior siempre recibes:
            </p>

            <div className="grid md:grid-cols-2 gap-8">
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
                <div key={section.title}>
                  <h4 className="text-2xl font-bold mb-4">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={`${section.title}-${item}`} className="flex items-start gap-3">
                        <span className="text-accent mt-1 font-bold">✓</span>
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
        container: 'bg-white border-4 border-accent shadow-2xl shadow-accent/50 scale-105',
        badge: 'bg-gradient-to-r from-accent to-accent-dark',
        priceBox: 'bg-gradient-to-br from-accent/10 to-accent-light/20 border-l-4 border-accent',
        priceText: 'text-accent-dark',
        button: 'bg-gradient-to-r from-accent to-accent-dark text-white hover:from-accent-dark hover:to-accent shadow-lg',
      }
    }
    if (data.colorScheme === 'rojo') {
      return {
        container: 'bg-white border-2 border-red-500 shadow-lg',
        badge: '',
        priceBox: 'bg-gradient-to-br from-red-500/10 to-red-500/5 border-l-4 border-red-500',
        priceText: 'text-red-600',
        button: 'bg-red-600 text-white hover:bg-red-700',
      }
    }
    if (data.colorScheme === 'negro') {
      return {
        container: 'bg-white border-2 border-neutral-900 shadow-lg',
        badge: '',
        priceBox: 'bg-gradient-to-br from-neutral-900/10 to-neutral-900/5 border-l-4 border-neutral-900',
        priceText: 'text-neutral-900',
        button: 'bg-neutral-900 text-white hover:bg-neutral-800',
      }
    }
    // neutro
    return {
      container: 'bg-white border-2 border-neutral-300 shadow-lg',
      badge: '',
      priceBox: 'bg-gradient-to-br from-neutral-300/10 to-neutral-300/5 border-l-4 border-neutral-300',
      priceText: 'text-neutral-700',
      button: 'bg-neutral-700 text-white hover:bg-neutral-800',
    }
  }

  const styles = getCardStyles()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-2xl overflow-hidden transition-all ${styles.container}`}
    >
      {/* Reservar espacio para badge (10px height) */}
      <div className="h-[44px] relative">
        {data.recomendado && (
          <div className={`absolute top-0 left-0 right-0 ${styles.badge} text-white py-2 text-center font-bold flex items-center justify-center gap-2 z-10`}>
            <FaStar /> ⭐ RECOMENDADO
          </div>
        )}
      </div>

      <div className="p-8 h-full flex flex-col">
        <div className="text-center mb-6 min-h-[140px] flex flex-col justify-center">
          <span className="text-4xl">{data.icon}</span>
          {data.tipo ? (
            <p className="mt-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">{data.tipo}</p>
          ) : (
            <p className="mt-2 text-xs font-semibold tracking-wide text-neutral-500">{data.nivelProfesional}</p>
          )}
          <h3 className="text-2xl font-bold text-secondary mt-2">{data.nombre}</h3>
          <p className={`${styles.priceText} font-bold text-lg`}>{data.subtitulo}</p>
        </div>

        <p className="text-neutral-700 text-center mb-6 flex-grow min-h-[60px]">{data.description}</p>

        <div className={`${styles.priceBox} p-4 rounded-lg mb-6`}>
          <p className="text-sm text-neutral-600">Pago Inicial</p>
          <p className={`text-3xl font-bold ${styles.priceText}`}>${data.pagoInicial} USD</p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6 flex-grow">
          {data.features.map((feature) => (
            <div key={`feat-${feature.category}`} className="text-sm">
              <p className="font-semibold text-secondary text-xs leading-tight">{feature.category}</p>
              <p className="text-neutral-600 text-xs">{feature.items[0]}</p>
            </div>
          ))}

          {data.gestion && (
            <div key="gestion" className="text-sm border-t border-neutral-200 pt-3 mt-3">
              <p className="font-semibold text-secondary text-xs leading-tight">Gestión Mensual</p>
              <p className="text-neutral-600 text-xs">${data.gestion.precioMensual} USD/mes</p>
            </div>
          )}

          {data.serviciosOpcionales && data.serviciosOpcionales.length > 0 && (
            <div key="opcionales" className="text-sm border-t border-neutral-200 pt-3 mt-3">
              <p className="font-semibold text-secondary text-xs leading-tight">Servicios Opcionales</p>
              {data.serviciosOpcionales.map((srv) => (
                <p key={srv.nombre} className="text-neutral-600 text-xs">
                  {srv.nombre}: ${srv.precio} USD
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-neutral-200">
          <div className="text-center">
            <p className={`text-2xl font-bold ${styles.priceText}`}>{data.pages}</p>
            <p className="text-xs text-neutral-600">Páginas</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${styles.priceText}`}>{data.timelineWeeks}</p>
            <p className="text-xs text-neutral-600">Semanas</p>
          </div>
        </div>

        <a
          href={data.href}
          className={`mt-6 py-3 px-4 rounded-lg font-bold text-center transition-all ${styles.button}`}
        >
          Ver Detalles
        </a>
      </div>
    </motion.div>
  )
}
