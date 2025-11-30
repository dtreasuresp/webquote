'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaFlagCheckered } from 'react-icons/fa'
import ContentHeader from './ContentHeader'
import ToggleSwitch from '@/features/admin/components/ToggleSwitch'

// Tipos para Conclusión
export interface ConclusionData {
  titulo: string
  subtitulo: string
  parrafoPrincipal: string
  parrafoSecundario: string
  llamadaAccion: {
    visible: boolean
    titulo: string
    descripcion: string
    textoBoton: string
    urlBoton: string
  }
  firmaDigital: {
    visible: boolean
    nombreEmpresa: string
    eslogan: string
    textoFinal: string
  }
}

interface ConclusionContentProps {
  readonly data: ConclusionData
  readonly onChange: (data: ConclusionData) => void
  readonly visible: boolean
  readonly onVisibleChange: (visible: boolean) => void
  readonly updatedAt?: string | null
  readonly onGuardar: () => void
  readonly onReset: () => void
  readonly guardando: boolean
  readonly hasChanges?: boolean
}

// Datos por defecto
export const defaultConclusion: ConclusionData = {
  titulo: 'Conclusión',
  subtitulo: 'El siguiente paso hacia su presencia digital',
  parrafoPrincipal: 'Agradecemos la oportunidad de presentar esta propuesta comercial. Nuestro equipo está comprometido con entregar soluciones web de alta calidad que no solo cumplan, sino que superen sus expectativas.',
  parrafoSecundario: 'Estamos seguros de que juntos podemos crear una presencia digital que refleje la excelencia de su marca y contribuya al crecimiento de su negocio. Quedamos a su disposición para cualquier consulta o aclaración adicional.',
  llamadaAccion: {
    visible: true,
    titulo: '¿Listo para comenzar?',
    descripcion: 'Contáctenos hoy mismo para agendar una reunión y discutir los detalles de su proyecto.',
    textoBoton: 'Contactar Ahora',
    urlBoton: '#contacto',
  },
  firmaDigital: {
    visible: true,
    nombreEmpresa: 'WebQuote Solutions',
    eslogan: 'Transformando ideas en experiencias digitales',
    textoFinal: 'Gracias por su confianza',
  },
}

export default function ConclusionContent({
  data,
  onChange,
  visible,
  onVisibleChange,
  updatedAt,
  onGuardar,
  onReset,
  guardando,
  hasChanges,
}: ConclusionContentProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <ContentHeader
        title="Conclusión"
        icon={<FaFlagCheckered className="text-gh-success" />}
        updatedAt={updatedAt}
        onGuardar={onGuardar}
        onReset={onReset}
        guardando={guardando}
        hasChanges={hasChanges}
      />

      {/* Toggle de visibilidad global - Fila 2 */}
      <div className="flex items-center justify-between p-3 bg-gh-bg-secondary border border-gh-border rounded-lg">
        <span className="text-sm text-gh-text">Mostrar sección en la página pública</span>
        <ToggleSwitch enabled={visible} onChange={onVisibleChange} />
      </div>

      {/* Contenedor con opacity si global OFF */}
      <div className={`space-y-4 transition-opacity duration-200 ${!visible ? 'opacity-50' : ''}`}>
        
        {/* Subsección: Títulos */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm text-gh-text font-medium">📌 Título y Subtítulo</span>
            <ToggleSwitch 
              enabled={true} 
              onChange={() => {}} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Título de la sección</label>
              <input
                type="text"
                value={data.titulo}
                onChange={(e) => onChange({ ...data, titulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Subtítulo</label>
              <input
                type="text"
                value={data.subtitulo}
                onChange={(e) => onChange({ ...data, subtitulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CONTENIDO PRINCIPAL */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
              📝 Contenido Principal
            </span>
            <ToggleSwitch 
              enabled={true} 
              onChange={() => {}} 
            />
          </div>
          
          <div>
            <label className="block text-gh-text-muted text-xs mb-1">Párrafo Principal</label>
            <textarea
              value={data.parrafoPrincipal}
              onChange={(e) => onChange({ ...data, parrafoPrincipal: e.target.value })}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
              rows={3}
              placeholder="Mensaje principal de la conclusión..."
            />
          </div>

          <div>
            <label className="block text-gh-text-muted text-xs mb-1">Párrafo Secundario</label>
            <textarea
              value={data.parrafoSecundario}
              onChange={(e) => onChange({ ...data, parrafoSecundario: e.target.value })}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
              rows={3}
              placeholder="Mensaje de cierre complementario..."
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* LLAMADA A LA ACCIÓN */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
              🎯 Llamada a la Acción (CTA)
            </span>
            <ToggleSwitch
              enabled={data.llamadaAccion.visible}
              onChange={(v) => onChange({ ...data, llamadaAccion: { ...data.llamadaAccion, visible: v } })}
            />
          </div>

          {data.llamadaAccion.visible && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Título del CTA</label>
                  <input
                    type="text"
                    value={data.llamadaAccion.titulo}
                    onChange={(e) => onChange({ ...data, llamadaAccion: { ...data.llamadaAccion, titulo: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Texto del Botón</label>
                  <input
                    type="text"
                    value={data.llamadaAccion.textoBoton}
                    onChange={(e) => onChange({ ...data, llamadaAccion: { ...data.llamadaAccion, textoBoton: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gh-text-muted text-xs mb-1">Descripción del CTA</label>
                <textarea
                  value={data.llamadaAccion.descripcion}
                  onChange={(e) => onChange({ ...data, llamadaAccion: { ...data.llamadaAccion, descripcion: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-gh-text-muted text-xs mb-1">URL del Botón</label>
                <input
                  type="text"
                  value={data.llamadaAccion.urlBoton}
                  onChange={(e) => onChange({ ...data, llamadaAccion: { ...data.llamadaAccion, urlBoton: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  placeholder="#contacto o https://..."
                />
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* FIRMA DIGITAL */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
              ✍️ Firma Digital
            </span>
            <ToggleSwitch
              enabled={data.firmaDigital.visible}
              onChange={(v) => onChange({ ...data, firmaDigital: { ...data.firmaDigital, visible: v } })}
            />
          </div>

          {data.firmaDigital.visible && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Nombre de la Empresa</label>
                  <input
                    type="text"
                    value={data.firmaDigital.nombreEmpresa}
                    onChange={(e) => onChange({ ...data, firmaDigital: { ...data.firmaDigital, nombreEmpresa: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Eslogan</label>
                  <input
                    type="text"
                    value={data.firmaDigital.eslogan}
                    onChange={(e) => onChange({ ...data, firmaDigital: { ...data.firmaDigital, eslogan: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gh-text-muted text-xs mb-1">Texto Final de Despedida</label>
                <input
                  type="text"
                  value={data.firmaDigital.textoFinal}
                  onChange={(e) => onChange({ ...data, firmaDigital: { ...data.firmaDigital, textoFinal: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  )
}
