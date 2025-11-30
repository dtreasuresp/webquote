'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  FaDollarSign, 
  FaCreditCard, 
  FaPercent, 
  FaTags, 
  FaGift, 
  FaEye, 
  FaPlus, 
  FaTrash,
  FaCheckCircle,
  FaStickyNote
} from 'react-icons/fa'
import { 
  ServicioBase, 
  Servicio, 
  OpcionPago, 
  ConfigDescuentos,
  TipoDescuento 
} from '@/lib/types'

export interface FinancieroContentProps {
  // Desarrollo
  desarrolloCosto: number
  setDesarrolloCosto: (v: number) => void
  descuentoBase: number
  setDescuentoBase: (v: number) => void
  
  // Esquema de Pagos
  opcionesPago: OpcionPago[]
  setOpcionesPago: (ops: OpcionPago[]) => void
  
  // Método y Notas
  metodoPagoPreferido: string
  setMetodoPagoPreferido: (m: string) => void
  notasPago: string
  setNotasPago: (n: string) => void
  
  // Configuración de Descuentos
  configDescuentos: ConfigDescuentos
  setConfigDescuentos: (c: ConfigDescuentos) => void
  
  // Para cálculos de vista previa
  serviciosBase: ServicioBase[]
  serviciosOpcionales: Servicio[]
}

// Valores por defecto para ConfigDescuentos
const defaultConfigDescuentos: ConfigDescuentos = {
  tipoDescuento: 'ninguno',
  descuentoGeneral: {
    porcentaje: 0,
    aplicarA: { desarrollo: false, serviciosBase: false, otrosServicios: false }
  },
  descuentosGranulares: {
    desarrollo: 0,
    serviciosBase: {},
    otrosServicios: {}
  },
  descuentoPagoUnico: 0,
  descuentoDirecto: 0
}

export default function FinancieroContent({
  desarrolloCosto,
  setDesarrolloCosto,
  descuentoBase,
  setDescuentoBase,
  opcionesPago,
  setOpcionesPago,
  metodoPagoPreferido,
  setMetodoPagoPreferido,
  notasPago,
  setNotasPago,
  configDescuentos = defaultConfigDescuentos,
  setConfigDescuentos,
  serviciosBase,
  serviciosOpcionales,
}: Readonly<FinancieroContentProps>) {
  // Validaciones
  const totalPorcentajePagos = opcionesPago.reduce((sum, op) => sum + (op.porcentaje || 0), 0)
  const esquemaPagosValido = totalPorcentajePagos === 100
  const tieneDescuentos = configDescuentos.tipoDescuento !== 'ninguno' || 
                          configDescuentos.descuentoPagoUnico > 0 || 
                          configDescuentos.descuentoDirecto > 0
  const tieneMetodoPago = metodoPagoPreferido && metodoPagoPreferido.trim() !== ''

  // Helpers para actualizar configDescuentos
  const updateTipoDescuento = (tipo: TipoDescuento) => {
    setConfigDescuentos({ ...configDescuentos, tipoDescuento: tipo })
  }

  const updateDescuentoGeneral = (field: string, value: number | boolean) => {
    if (field === 'porcentaje') {
      setConfigDescuentos({
        ...configDescuentos,
        descuentoGeneral: { ...configDescuentos.descuentoGeneral, porcentaje: value as number }
      })
    } else {
      setConfigDescuentos({
        ...configDescuentos,
        descuentoGeneral: {
          ...configDescuentos.descuentoGeneral,
          aplicarA: { ...configDescuentos.descuentoGeneral.aplicarA, [field]: value }
        }
      })
    }
  }

  const updateDescuentoGranular = (categoria: 'desarrollo' | 'serviciosBase' | 'otrosServicios', id: string | null, valor: number) => {
    if (categoria === 'desarrollo') {
      setConfigDescuentos({
        ...configDescuentos,
        descuentosGranulares: { ...configDescuentos.descuentosGranulares, desarrollo: valor }
      })
    } else if (id) {
      setConfigDescuentos({
        ...configDescuentos,
        descuentosGranulares: {
          ...configDescuentos.descuentosGranulares,
          [categoria]: { ...configDescuentos.descuentosGranulares[categoria], [id]: valor }
        }
      })
    }
  }

  // Opciones de pago CRUD
  const agregarOpcionPago = () => {
    setOpcionesPago([...opcionesPago, { nombre: '', porcentaje: 0, descripcion: '' }])
  }

  const actualizarOpcionPago = (index: number, field: keyof OpcionPago, value: string | number) => {
    const nuevas = [...opcionesPago]
    nuevas[index] = { ...nuevas[index], [field]: value }
    setOpcionesPago(nuevas)
  }

  const eliminarOpcionPago = (index: number) => {
    setOpcionesPago(opcionesPago.filter((_, i) => i !== index))
  }

  // Cálculos para Vista Previa
  const calcularVistaPrevia = () => {
    let desarrolloOriginal = desarrolloCosto
    let desarrolloConDescuento = desarrolloCosto * (1 - descuentoBase / 100)
    
    // Aplicar descuentos adicionales al desarrollo
    if (configDescuentos.tipoDescuento === 'general' && configDescuentos.descuentoGeneral.aplicarA.desarrollo) {
      desarrolloConDescuento *= (1 - configDescuentos.descuentoGeneral.porcentaje / 100)
    } else if (configDescuentos.tipoDescuento === 'granular') {
      desarrolloConDescuento *= (1 - (configDescuentos.descuentosGranulares.desarrollo || 0) / 100)
    }

    // Servicios Base
    const serviciosBaseDesglose = serviciosBase.map(s => {
      const original = s.precio * s.mesesPago
      let descuentoAplicado = 0
      
      if (configDescuentos.tipoDescuento === 'general' && configDescuentos.descuentoGeneral.aplicarA.serviciosBase) {
        descuentoAplicado = configDescuentos.descuentoGeneral.porcentaje
      } else if (configDescuentos.tipoDescuento === 'granular') {
        descuentoAplicado = configDescuentos.descuentosGranulares.serviciosBase[s.id] || 0
      }
      
      const conDescuento = original * (1 - descuentoAplicado / 100)
      return { ...s, original, conDescuento, descuentoAplicado }
    })
    
    const totalServiciosBase = serviciosBaseDesglose.reduce((sum, s) => sum + s.original, 0)
    const totalServiciosBaseConDesc = serviciosBaseDesglose.reduce((sum, s) => sum + s.conDescuento, 0)

    // Servicios Opcionales
    const serviciosOpcionalesDesglose = serviciosOpcionales.map((s, idx) => {
      const original = s.precio * s.mesesPago
      let descuentoAplicado = 0
      
      if (configDescuentos.tipoDescuento === 'general' && configDescuentos.descuentoGeneral.aplicarA.otrosServicios) {
        descuentoAplicado = configDescuentos.descuentoGeneral.porcentaje
      } else if (configDescuentos.tipoDescuento === 'granular') {
        const key = s.id || `otro-${idx}`
        descuentoAplicado = configDescuentos.descuentosGranulares.otrosServicios[key] || 0
      }
      
      const conDescuento = original * (1 - descuentoAplicado / 100)
      return { ...s, original, conDescuento, descuentoAplicado }
    })
    
    const totalOpcionales = serviciosOpcionalesDesglose.reduce((sum, s) => sum + s.original, 0)
    const totalOpcionalesConDesc = serviciosOpcionalesDesglose.reduce((sum, s) => sum + s.conDescuento, 0)

    // Subtotal antes de descuento directo
    const subtotalConDescuentos = desarrolloConDescuento + totalServiciosBaseConDesc + totalOpcionalesConDesc
    const subtotalOriginal = desarrolloOriginal + totalServiciosBase + totalOpcionales

    // Aplicar descuento directo al final
    const totalFinal = subtotalConDescuentos * (1 - (configDescuentos.descuentoDirecto || 0) / 100)
    const ahorroTotal = subtotalOriginal - totalFinal
    const porcentajeAhorro = subtotalOriginal > 0 ? (ahorroTotal / subtotalOriginal) * 100 : 0

    return {
      desarrollo: { original: desarrolloOriginal, conDescuento: desarrolloConDescuento },
      serviciosBase: { desglose: serviciosBaseDesglose, total: totalServiciosBase, conDescuento: totalServiciosBaseConDesc },
      serviciosOpcionales: { desglose: serviciosOpcionalesDesglose, total: totalOpcionales, conDescuento: totalOpcionalesConDesc },
      subtotalOriginal,
      subtotalConDescuentos,
      totalFinal,
      ahorroTotal,
      porcentajeAhorro
    }
  }

  const preview = calcularVistaPrevia()

  const metodoLabels: Record<string, string> = {
    transferencia: 'Transferencia Bancaria',
    tarjeta: 'Tarjeta de Crédito/Débito',
    cheque: 'Cheque',
    paypal: 'PayPal',
    efectivo: 'Efectivo',
  }

  // Badge de estado
  const getBadge = () => {
    if (tieneDescuentos && esquemaPagosValido && tieneMetodoPago) {
      return { text: 'Completo ✓', className: 'bg-gh-success/10 text-gh-success' }
    } else if (tieneDescuentos || opcionesPago.length > 0 || tieneMetodoPago) {
      return { text: 'En progreso', className: 'bg-gh-warning/10 text-gh-warning' }
    }
    return { text: 'Sin configurar', className: 'bg-gh-bg-secondary text-gh-text-muted' }
  }

  const badge = getBadge()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gh-text flex items-center gap-2 uppercase tracking-wide">
          <FaDollarSign className="text-gh-success" /> Financiero
        </h4>
        <span className={`text-xs px-2 py-1 rounded ${badge.className}`}>
          {badge.text}
        </span>
      </div>

      {/* CARD PRINCIPAL */}
      <div className="space-y-6 p-6 bg-gh-bg-overlay border border-gh-border rounded-lg">
        
        {/* SECCIÓN 1: DESARROLLO */}
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-gh-text uppercase tracking-wide flex items-center gap-2 border-b border-gh-border pb-2">
            💻 Desarrollo
          </h5>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1">
                Costo de Desarrollo ($)
              </label>
              <input
                type="number"
                min={0}
                value={desarrolloCosto}
                onChange={(e) => setDesarrolloCosto(Math.max(0, Number.parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 text-sm text-gh-text outline-none transition"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1">
                Descuento Base (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={descuentoBase}
                onChange={(e) => setDescuentoBase(Math.min(100, Math.max(0, Number.parseFloat(e.target.value) || 0)))}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 text-sm text-gh-text outline-none transition"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: ESQUEMA DE PAGOS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gh-border pb-2">
            <h5 className="text-xs font-semibold text-gh-text uppercase tracking-wide flex items-center gap-2">
              📊 Esquema de Pagos (Cuotas)
            </h5>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
              esquemaPagosValido 
                ? 'bg-gh-success/10 border-gh-success text-gh-success' 
                : 'bg-gh-danger/10 border-gh-danger text-gh-danger'
            }`}>
              Total: {totalPorcentajePagos}% {esquemaPagosValido ? '✓' : '⚠️'}
            </span>
          </div>

          {opcionesPago.length > 0 ? (
            <div className="space-y-2">
              {opcionesPago.map((opcion, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[2fr,1fr,3fr,auto] gap-2 p-3 bg-gh-bg-secondary border border-gh-border rounded-md items-end"
                >
                  <div>
                    <label className="block text-[10px] font-medium text-gh-text-muted mb-1">Nombre</label>
                    <input
                      type="text"
                      value={opcion.nombre}
                      onChange={(e) => actualizarOpcionPago(idx, 'nombre', e.target.value)}
                      placeholder="Ej: Inicial"
                      className="w-full px-2 py-1.5 bg-gh-bg border border-gh-border rounded text-xs text-gh-text focus:border-gh-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gh-text-muted mb-1">%</label>
                    <input
                      type="number"
                      value={opcion.porcentaje}
                      onChange={(e) => actualizarOpcionPago(idx, 'porcentaje', Math.max(0, Math.min(100, Number.parseFloat(e.target.value) || 0)))}
                      min={0}
                      max={100}
                      placeholder="30"
                      className="w-full px-2 py-1.5 bg-gh-bg border border-gh-border rounded text-xs text-gh-text focus:border-gh-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gh-text-muted mb-1">Descripción</label>
                    <input
                      type="text"
                      value={opcion.descripcion}
                      onChange={(e) => actualizarOpcionPago(idx, 'descripcion', e.target.value)}
                      placeholder="Ej: Al firmar contrato"
                      className="w-full px-2 py-1.5 bg-gh-bg border border-gh-border rounded text-xs text-gh-text focus:border-gh-accent focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => eliminarOpcionPago(idx)}
                    className="w-8 h-8 text-gh-text-muted hover:text-gh-danger hover:bg-gh-danger/10 rounded transition-colors flex items-center justify-center"
                    title="Eliminar"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gh-text-muted text-xs italic py-2">
              Sin opciones de pago configuradas. Se usará el esquema por defecto.
            </p>
          )}

          <button
            onClick={agregarOpcionPago}
            className="px-3 py-1.5 bg-gh-success hover:bg-gh-success-hover text-white rounded-md transition-colors flex items-center gap-2 font-medium text-xs"
          >
            <FaPlus size={10} /> Agregar Cuota
          </button>
        </div>

        {/* SECCIÓN 3: MÉTODO Y NOTAS DE PAGO */}
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-gh-text uppercase tracking-wide flex items-center gap-2 border-b border-gh-border pb-2">
            <FaCreditCard className="text-gh-accent" /> Preferencias de Pago
          </h5>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1">
                Método de Pago Preferido
              </label>
              <select
                value={metodoPagoPreferido}
                onChange={(e) => setMetodoPagoPreferido(e.target.value)}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 text-sm text-gh-text outline-none transition"
              >
                <option value="">Selecciona un método</option>
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                <option value="cheque">Cheque</option>
                <option value="paypal">PayPal</option>
                <option value="efectivo">Efectivo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1">
                <FaStickyNote className="inline mr-1" /> Notas de Pago
              </label>
              <textarea
                rows={3}
                placeholder="Ej: Pago inicial del 50%, resto a la entrega..."
                value={notasPago}
                onChange={(e) => setNotasPago(e.target.value)}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 text-sm text-gh-text outline-none transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: TIPO DE DESCUENTO */}
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-gh-text uppercase tracking-wide flex items-center gap-2 border-b border-gh-border pb-2">
            <FaTags className="text-gh-warning" /> Tipo de Descuento
          </h5>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'ninguno' as TipoDescuento, label: '❌ Ninguno', color: 'gh-text-muted' },
              { id: 'granular' as TipoDescuento, label: '🎯 Granular', color: 'gh-warning' },
              { id: 'general' as TipoDescuento, label: '📊 General', color: 'gh-success' },
            ].map(({ id, label, color }) => (
              <label
                key={id}
                className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer border transition-all ${
                  configDescuentos.tipoDescuento === id
                    ? `bg-${color}/10 border-${color}`
                    : 'border-gh-border hover:bg-gh-bg-secondary'
                }`}
              >
                <input
                  type="radio"
                  name="tipoDescuento"
                  checked={configDescuentos.tipoDescuento === id}
                  onChange={() => updateTipoDescuento(id)}
                  className="accent-gh-accent"
                />
                <span className="text-xs text-gh-text">{label}</span>
              </label>
            ))}
          </div>
          <p className="text-[10px] text-gh-text-muted">
            Granulares: % individual por servicio | General: Un % uniforme para categorías
          </p>
        </div>

        {/* SECCIÓN 4.1: DESCUENTO GENERAL (condicional) */}
        {configDescuentos.tipoDescuento === 'general' && (
          <div className="space-y-3 p-4 bg-gh-success/5 border border-gh-success/30 rounded-lg">
            <h5 className="text-xs font-semibold text-gh-text flex items-center gap-2">
              <FaPercent className="text-gh-success" /> Configuración de Descuento General
            </h5>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gh-text mb-1">Porcentaje</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={configDescuentos.descuentoGeneral.porcentaje}
                    onChange={(e) => updateDescuentoGeneral('porcentaje', Math.max(0, Math.min(100, Number.parseFloat(e.target.value) || 0)))}
                    min={0}
                    max={100}
                    className="flex-1 px-3 py-2 bg-gh-bg border border-gh-border rounded-md focus:border-gh-success focus:outline-none text-sm text-gh-text"
                  />
                  <span className="text-gh-text-muted">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gh-text mb-1">Aplicar a:</label>
                <div className="space-y-1">
                  {[
                    { key: 'desarrollo', label: '💻 Desarrollo' },
                    { key: 'serviciosBase', label: '🔧 Servicios Base' },
                    { key: 'otrosServicios', label: '✨ Otros Servicios' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer text-xs text-gh-text">
                      <input
                        type="checkbox"
                        checked={configDescuentos.descuentoGeneral.aplicarA[key as keyof typeof configDescuentos.descuentoGeneral.aplicarA]}
                        onChange={(e) => updateDescuentoGeneral(key, e.target.checked)}
                        className="w-3.5 h-3.5 accent-gh-success"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN 4.2: DESCUENTOS GRANULARES (condicional) */}
        {configDescuentos.tipoDescuento === 'granular' && (
          <div className="space-y-3 p-4 bg-gh-warning/5 border border-gh-warning/30 rounded-lg">
            <h5 className="text-xs font-semibold text-gh-text flex items-center gap-2">
              <FaTags className="text-gh-warning" /> Descuentos por Servicio
            </h5>
            
            {/* Desarrollo */}
            <div>
              <h6 className="text-[10px] text-gh-text-muted mb-1 uppercase tracking-wider">Desarrollo</h6>
              <div className="flex items-center justify-between p-2 bg-gh-bg rounded border border-gh-border">
                <span className="text-xs text-gh-text">💻 Costo de Desarrollo</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={configDescuentos.descuentosGranulares.desarrollo}
                    onChange={(e) => updateDescuentoGranular('desarrollo', null, Math.max(0, Math.min(100, Number.parseFloat(e.target.value) || 0)))}
                    min={0}
                    max={100}
                    className="w-16 px-2 py-1 bg-gh-bg-secondary border border-gh-border rounded text-xs text-gh-text"
                  />
                  <span className="text-[10px] text-gh-text-muted">%</span>
                </div>
              </div>
            </div>

            {/* Servicios Base */}
            {serviciosBase.length > 0 && (
              <div>
                <h6 className="text-[10px] text-gh-text-muted mb-1 uppercase tracking-wider">Servicios Base</h6>
                <div className="space-y-1">
                  {serviciosBase.map((servicio) => (
                    <div key={servicio.id} className="flex items-center justify-between p-2 bg-gh-bg rounded border border-gh-border">
                      <span className="text-xs text-gh-text">🔧 {servicio.nombre}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={configDescuentos.descuentosGranulares.serviciosBase[servicio.id] || 0}
                          onChange={(e) => updateDescuentoGranular('serviciosBase', servicio.id, Math.max(0, Math.min(100, Number.parseFloat(e.target.value) || 0)))}
                          min={0}
                          max={100}
                          className="w-16 px-2 py-1 bg-gh-bg-secondary border border-gh-border rounded text-xs text-gh-text"
                        />
                        <span className="text-[10px] text-gh-text-muted">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Servicios Opcionales */}
            {serviciosOpcionales.length > 0 && (
              <div>
                <h6 className="text-[10px] text-gh-text-muted mb-1 uppercase tracking-wider">Servicios Opcionales</h6>
                <div className="space-y-1">
                  {serviciosOpcionales.map((servicio, idx) => {
                    const key = servicio.id || `otro-${idx}`
                    return (
                      <div key={key} className="flex items-center justify-between p-2 bg-gh-bg rounded border border-gh-border">
                        <span className="text-xs text-gh-text">✨ {servicio.nombre}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={configDescuentos.descuentosGranulares.otrosServicios[key] || 0}
                            onChange={(e) => updateDescuentoGranular('otrosServicios', key, Math.max(0, Math.min(100, Number.parseFloat(e.target.value) || 0)))}
                            min={0}
                            max={100}
                            className="w-16 px-2 py-1 bg-gh-bg-secondary border border-gh-border rounded text-xs text-gh-text"
                          />
                          <span className="text-[10px] text-gh-text-muted">%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN 5: DESCUENTOS ESPECIALES */}
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-gh-text uppercase tracking-wide flex items-center gap-2 border-b border-gh-border pb-2">
            <FaGift className="text-gh-accent" /> Descuentos Especiales
          </h5>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1">
                Descuento Pago Único (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={configDescuentos.descuentoPagoUnico}
                onChange={(e) => setConfigDescuentos({ ...configDescuentos, descuentoPagoUnico: Math.min(100, Math.max(0, Number.parseFloat(e.target.value) || 0)) })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 text-sm text-gh-text outline-none transition"
              />
              <p className="text-[10px] text-gh-text-muted mt-1">Aplica solo al desarrollo si paga todo de una vez</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1">
                Descuento Directo (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={configDescuentos.descuentoDirecto}
                onChange={(e) => setConfigDescuentos({ ...configDescuentos, descuentoDirecto: Math.min(100, Math.max(0, Number.parseFloat(e.target.value) || 0)) })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 text-sm text-gh-text outline-none transition"
              />
              <p className="text-[10px] text-gh-text-muted mt-1">Se aplica al total final, después de otros descuentos</p>
            </div>
          </div>
        </div>

        {/* SECCIÓN 6: VISTA PREVIA FINANCIERA UNIFICADA */}
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-gh-text uppercase tracking-wide flex items-center gap-2 border-b border-gh-border pb-2">
            <FaEye className="text-gh-accent" /> Vista Previa de Costos y Pagos
          </h5>
          
          <div className="p-4 bg-gh-bg border border-gh-border rounded-lg space-y-4">
            {/* Desarrollo */}
            <div className="border-b border-gh-border pb-3">
              <div className="flex justify-between text-xs text-gh-text-muted uppercase mb-1">
                <span>💻 Desarrollo</span>
                {preview.desarrollo.conDescuento < preview.desarrollo.original && (
                  <span className="text-gh-success">-{Math.round((1 - preview.desarrollo.conDescuento / preview.desarrollo.original) * 100)}%</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gh-text">Costo</span>
                <div className="text-right">
                  {preview.desarrollo.conDescuento < preview.desarrollo.original && (
                    <span className="line-through text-gh-text-muted text-xs mr-2">${preview.desarrollo.original.toFixed(2)}</span>
                  )}
                  <span className="font-bold text-gh-success">${preview.desarrollo.conDescuento.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Servicios Base */}
            {preview.serviciosBase.desglose.length > 0 && (
              <div className="border-b border-gh-border pb-3">
                <div className="flex justify-between text-xs text-gh-text-muted uppercase mb-1">
                  <span>🔧 Servicios Base</span>
                  {preview.serviciosBase.conDescuento < preview.serviciosBase.total && (
                    <span className="text-gh-success">-{Math.round((1 - preview.serviciosBase.conDescuento / preview.serviciosBase.total) * 100)}%</span>
                  )}
                </div>
                <div className="space-y-1 pl-2">
                  {preview.serviciosBase.desglose.map((s, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-gh-text">{s.nombre} (${s.precio} × {s.mesesPago}m)</span>
                      <div className="text-right">
                        {s.descuentoAplicado > 0 && (
                          <span className="line-through text-gh-text-muted mr-2">${s.original.toFixed(2)}</span>
                        )}
                        <span className={s.descuentoAplicado > 0 ? 'text-gh-success' : 'text-gh-text'}>${s.conDescuento.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 pt-1 border-t border-gh-border/50 text-xs">
                  <span className="text-gh-text-muted">Subtotal</span>
                  <span className="font-medium text-gh-text">${preview.serviciosBase.conDescuento.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Servicios Opcionales */}
            {preview.serviciosOpcionales.desglose.length > 0 && (
              <div className="border-b border-gh-border pb-3">
                <div className="flex justify-between text-xs text-gh-text-muted uppercase mb-1">
                  <span>✨ Servicios Opcionales</span>
                  {preview.serviciosOpcionales.conDescuento < preview.serviciosOpcionales.total && (
                    <span className="text-gh-success">-{Math.round((1 - preview.serviciosOpcionales.conDescuento / preview.serviciosOpcionales.total) * 100)}%</span>
                  )}
                </div>
                <div className="space-y-1 pl-2">
                  {preview.serviciosOpcionales.desglose.map((s, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-gh-text">{s.nombre} (${s.precio} × {s.mesesPago}m)</span>
                      <div className="text-right">
                        {s.descuentoAplicado > 0 && (
                          <span className="line-through text-gh-text-muted mr-2">${s.original.toFixed(2)}</span>
                        )}
                        <span className={s.descuentoAplicado > 0 ? 'text-gh-success' : 'text-gh-text'}>${s.conDescuento.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 pt-1 border-t border-gh-border/50 text-xs">
                  <span className="text-gh-text-muted">Subtotal</span>
                  <span className="font-medium text-gh-text">${preview.serviciosOpcionales.conDescuento.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Esquema de Pagos - Vista Previa */}
            {opcionesPago.length > 0 && desarrolloCosto > 0 && (
              <div className="border-b border-gh-border pb-3">
                <div className="text-xs text-gh-text-muted uppercase mb-2">📊 Esquema de Pagos (Desarrollo: ${preview.desarrollo.conDescuento.toFixed(2)})</div>
                <div className="space-y-1 pl-2">
                  {opcionesPago.map((op, idx) => {
                    const monto = (preview.desarrollo.conDescuento * (op.porcentaje || 0)) / 100
                    return (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gh-text">{op.nombre || `Pago ${idx + 1}`} ({op.porcentaje}%)</span>
                        <span className="font-medium text-gh-text">${monto.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-2 pt-1 border-t border-gh-border/50 text-xs">
                  <span className="font-bold text-gh-text">TOTAL</span>
                  <span className={`font-bold ${esquemaPagosValido ? 'text-gh-success' : 'text-gh-danger'}`}>
                    ${preview.desarrollo.conDescuento.toFixed(2)} {esquemaPagosValido ? '✓' : '⚠️'}
                  </span>
                </div>
              </div>
            )}

            {/* Método de Pago */}
            {tieneMetodoPago && (
              <div className="border-b border-gh-border pb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gh-text-muted uppercase">💳 Método de Pago</span>
                  <span className="text-gh-text">{metodoLabels[metodoPagoPreferido] || metodoPagoPreferido}</span>
                </div>
              </div>
            )}

            {/* Descuentos Aplicados */}
            {tieneDescuentos && (
              <div className="bg-gh-bg-secondary p-3 rounded-md border-b border-gh-border">
                <div className="text-xs font-medium text-gh-text mb-2 flex items-center gap-1">
                  <FaPercent size={10} className="text-gh-warning" /> Descuentos Aplicados
                </div>
                <div className="text-[10px] text-gh-text-muted space-y-0.5">
                  {configDescuentos.tipoDescuento === 'general' && (
                    <div>• Descuento general del {configDescuentos.descuentoGeneral.porcentaje}%</div>
                  )}
                  {configDescuentos.tipoDescuento === 'granular' && (
                    <div>• Descuentos granulares por servicio</div>
                  )}
                  {configDescuentos.descuentoPagoUnico > 0 && (
                    <div>• Pago único: {configDescuentos.descuentoPagoUnico}% al desarrollo</div>
                  )}
                  {configDescuentos.descuentoDirecto > 0 && (
                    <div>• Descuento directo: {configDescuentos.descuentoDirecto}% al total final</div>
                  )}
                </div>
              </div>
            )}

            {/* Total Final */}
            <div className="bg-gradient-to-r from-gh-success/10 to-gh-bg rounded-lg p-4 border border-gh-success/30">
              {/* Subtotal (antes de desc. directo) */}
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gh-text-muted">Subtotal (antes de desc. directo)</span>
                <span className="text-gh-text">${preview.subtotalOriginal.toFixed(2)}</span>
              </div>
              {/* Total Final */}
              <div className="flex justify-between font-bold">
                <span className="text-gh-text">💰 Total Final</span>
                <span className="text-gh-success text-lg">${preview.totalFinal.toFixed(2)}</span>
              </div>
              {/* Ahorro Total - solo si hay ahorro */}
              {preview.ahorroTotal > 0 && (
                <div className="flex justify-between text-xs text-gh-success mt-1">
                  <span>🎉 Ahorro Total</span>
                  <span className="font-bold">${preview.ahorroTotal.toFixed(2)} ({preview.porcentajeAhorro.toFixed(1)}% OFF)</span>
                </div>
              )}
            </div>

            {/* Notas de Pago */}
            {notasPago && notasPago.trim() !== '' && (
              <div className="bg-gh-bg-secondary p-3 rounded-md">
                <div className="text-xs text-gh-text-muted uppercase mb-1">📝 Notas de Pago</div>
                <p className="text-xs text-gh-text italic">&quot;{notasPago}&quot;</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 bg-gh-bg-secondary rounded-lg border border-gh-border text-xs flex flex-wrap gap-4 items-center justify-between">
        <span className="text-gh-text-muted flex items-center gap-1.5">
          Cuotas: <span className="font-medium text-gh-text">{opcionesPago.length}</span>
        </span>
        <span className="text-gh-text-muted flex items-center gap-1.5">
          Método: <span className="font-medium text-gh-text">{tieneMetodoPago ? metodoLabels[metodoPagoPreferido] || metodoPagoPreferido : '—'}</span>
        </span>
        <span className="text-gh-text-muted flex items-center gap-1.5">
          Desc: <span className="font-medium text-gh-text">{configDescuentos.tipoDescuento === 'ninguno' ? 'Ninguno' : configDescuentos.tipoDescuento}</span>
        </span>
        {preview.ahorroTotal > 0 && (
          <span className="text-gh-success flex items-center gap-1.5">
            <FaCheckCircle size={12} /> Ahorro: {preview.porcentajeAhorro.toFixed(1)}%
          </span>
        )}
      </div>
    </motion.div>
  )
}
