'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Box, Boxes, Puzzle, Layers, DollarSign, Star } from 'lucide-react'
import { ServicioBase, Servicio, Package, PackageSnapshot, QuotationConfig, DialogConfig, OpcionPago, ConfigDescuentos, DescripcionPaqueteTemplate, MetodoPreferido, FinancialTemplate } from '@/lib/types'
import AdminSidebar from '@/features/admin/components/AdminSidebar'
import PaqueteContent from '@/features/admin/components/content/oferta/PaqueteContent'
import ServiciosBaseContent from '@/features/admin/components/content/oferta/ServiciosBaseContent'
import ServiciosOpcionalesContent from '@/features/admin/components/content/oferta/ServiciosOpcionalesContent'
import PaquetesContent from '@/features/admin/components/content/oferta/PaquetesContent'
import FinancieroContent from '@/features/admin/components/content/oferta/FinancieroContent'
import PaquetesCaracteristicasContent, { PaquetesCaracteristicasData, defaultPaquetesCaracteristicas } from '@/features/admin/components/content/oferta/PaquetesCaracteristicasContent'
import { MetodosPagoData } from '@/features/admin/components/content/oferta/MetodosPagoContent'
import { useEventTracking } from '@/features/admin/hooks'

interface ToastHandler {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

interface OfertaTabProps {
  serviciosBase: ServicioBase[]
  setServiciosBase: (servicios: ServicioBase[]) => void
  nuevoServicioBase: { nombre: string; precio: number; mesesGratis: number; mesesPago: number }
  setNuevoServicioBase: (servicio: any) => void
  editandoServicioBaseId: string | null
  setEditandoServicioBaseId: (id: string | null) => void
  servicioBaseEditando: ServicioBase | null
  setServicioBaseEditando: (servicio: ServicioBase | null) => void
  paqueteActual: Package
  setPaqueteActual: (paquete: Package) => void
  serviciosOpcionales: Servicio[]
  setServiciosOpcionales: (servicios: Servicio[]) => void
  nuevoServicio: { nombre: string; precio: number; mesesGratis: number; mesesPago: number }
  setNuevoServicio: (servicio: any) => void
  editandoServicioId: string | null
  setEditandoServicioId: (id: string | null) => void
  servicioEditando: Servicio | null
  setServicioEditando: (servicio: Servicio | null) => void
  descripcionTextareaRef: React.RefObject<HTMLTextAreaElement | null>
  agregarServicioBase: () => void
  abrirEditarServicioBase: (servicio: ServicioBase) => void
  guardarEditarServicioBase: () => void
  cancelarEditarServicioBase: () => void
  eliminarServicioBase: (id: string) => void
  agregarServicioOpcional: () => void
  abrirEditarServicioOpcional: (servicio: Servicio) => void
  guardarEditarServicioOpcional: () => void
  cancelarEditarServicioOpcional: () => void
  eliminarServicioOpcional: (id: string) => void
  normalizarMeses: (mesesGratis: number, mesesPago: number) => { mesesGratis: number; mesesPago: number }
  serviciosOpcionalesValidos: boolean
  todoEsValido: boolean
  // Props para PaquetesContent
  snapshots: PackageSnapshot[]
  setSnapshots: (s: PackageSnapshot[]) => void
  cargandoSnapshots: boolean
  errorSnapshots: string | null
  abrirModalEditar: (snapshot: PackageSnapshot) => void
  handleEliminarSnapshot: (id: string) => void
  calcularCostoInicialSnapshot: (snapshot: PackageSnapshot) => number
  calcularCostoAño1Snapshot: (snapshot: PackageSnapshot) => number
  calcularCostoAño2Snapshot: (snapshot: PackageSnapshot) => number
  actualizarSnapshot: (id: string, snapshot: PackageSnapshot) => Promise<PackageSnapshot>
  refreshSnapshots: () => Promise<void>
  toast: ToastHandler
  mostrarDialogoGenerico: (config: DialogConfig) => void
  cotizacionConfig: QuotationConfig | null
  /** Handler para comparar un paquete con sus versiones anteriores */
  onCompararPaquete?: (snapshot: PackageSnapshot) => void
  /** Handler para comparar dos paquetes individuales */
  onCompararPaqueteIndividual?: (snapshot: PackageSnapshot) => void
  /** Paquete actualmente seleccionado para comparación individual */
  paqueteParaComparar?: PackageSnapshot | null
  // Props para Financiero
  opcionesPago: OpcionPago[]
  setOpcionesPago: (ops: OpcionPago[]) => void
  metodoPagoPreferido: string
  setMetodoPagoPreferido: (m: string) => void
  notasPago: string
  setNotasPago: (n: string) => void
  metodosPreferidos: MetodoPreferido[]
  setMetodosPreferidos: (m: MetodoPreferido[]) => void
  configDescuentos: ConfigDescuentos
  setConfigDescuentos: (c: ConfigDescuentos) => void
  // Props para modo edición del paquete (descripción)
  modoEdicionPaquete?: boolean
  setModoEdicionPaquete?: (modo: boolean) => void
  // Props para templates de descripción de paquete
  descripcionesTemplate?: DescripcionPaqueteTemplate[]
  setDescripcionesTemplate?: (templates: DescripcionPaqueteTemplate[]) => void
  // Props para Características de Paquetes
  paquetesCaracteristicasData?: PaquetesCaracteristicasData
  onPaquetesCaracteristicasChange?: (data: PaquetesCaracteristicasData) => void
  // Indica si la configuración de cotización aún está cargando
  isConfigLoading?: boolean
  // Props para Métodos de Pago (contenido)
  metodosPagoData?: MetodosPagoData
  onMetodosPagoChange?: (data: MetodosPagoData) => void
  // Props para Templates Financieros
  financialTemplates?: FinancialTemplate[]
  setFinancialTemplates?: (templates: FinancialTemplate[]) => void
  onSaveFinancialTemplate?: (data: Omit<FinancialTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<FinancialTemplate>
  onUpdateFinancialTemplate?: (id: string, data: Partial<FinancialTemplate>) => Promise<FinancialTemplate>
  onDeleteFinancialTemplate?: (id: string) => Promise<void>
  onNuevaOfertaFinanciera?: () => void
}

export default function OfertaTab({
  serviciosBase,
  setServiciosBase,
  nuevoServicioBase,
  setNuevoServicioBase,
  editandoServicioBaseId,
  setEditandoServicioBaseId,
  servicioBaseEditando,
  setServicioBaseEditando,
  paqueteActual,
  setPaqueteActual,
  serviciosOpcionales,
  setServiciosOpcionales,
  nuevoServicio,
  setNuevoServicio,
  editandoServicioId,
  setEditandoServicioId,
  servicioEditando,
  setServicioEditando,
  descripcionTextareaRef,
  agregarServicioBase,
  abrirEditarServicioBase,
  guardarEditarServicioBase,
  cancelarEditarServicioBase,
  eliminarServicioBase,
  agregarServicioOpcional,
  abrirEditarServicioOpcional,
  guardarEditarServicioOpcional,
  cancelarEditarServicioOpcional,
  eliminarServicioOpcional,
  normalizarMeses,
  serviciosOpcionalesValidos,
  todoEsValido,
  // PaquetesContent props
  snapshots,
  setSnapshots,
  cargandoSnapshots,
  errorSnapshots,
  abrirModalEditar,
  handleEliminarSnapshot,
  calcularCostoInicialSnapshot,
  calcularCostoAño1Snapshot,
  calcularCostoAño2Snapshot,
  actualizarSnapshot,
  refreshSnapshots,
  toast,
  mostrarDialogoGenerico,
  cotizacionConfig,
  onCompararPaquete,
  onCompararPaqueteIndividual,
  paqueteParaComparar,
  // Financiero props
  opcionesPago,
  setOpcionesPago,
  metodoPagoPreferido,
  setMetodoPagoPreferido,
  notasPago,
  setNotasPago,
  metodosPreferidos,
  setMetodosPreferidos,
  configDescuentos,
  setConfigDescuentos,
  // Props modo edición paquete
  modoEdicionPaquete,
  setModoEdicionPaquete,
  // Props templates descripción
  descripcionesTemplate,
  setDescripcionesTemplate,
  // Props Características de Paquetes
  paquetesCaracteristicasData,
  onPaquetesCaracteristicasChange,
  isConfigLoading,
  // Props Métodos de Pago (contenido)
  metodosPagoData,
  onMetodosPagoChange,
  // Props Templates Financieros
  financialTemplates,
  setFinancialTemplates,
  onSaveFinancialTemplate,
  onUpdateFinancialTemplate,
  onDeleteFinancialTemplate,
  onNuevaOfertaFinanciera,
}: Readonly<OfertaTabProps>) {
  const [activeItem, setActiveItem] = useState<'paquete' | 'servicios-base' | 'servicios-opcionales' | 'financiero' | 'paquetes' | 'caracteristicas'>('paquete')
  
  // Tracking de navegación
  const { trackOfertaSectionViewed } = useEventTracking()
  
  const handleSectionChange = useCallback((id: string) => {
    setActiveItem(id as typeof activeItem)
    trackOfertaSectionViewed(id)
  }, [trackOfertaSectionViewed])

  const items = [
    { id: 'paquete', label: 'Descripción', icon: Box },
    { id: 'servicios-base', label: 'Base', icon: Boxes, badge: serviciosBase.length },
    { id: 'servicios-opcionales', label: 'Opcionales', icon: Puzzle, badge: serviciosOpcionales.length },
    { id: 'financiero', label: 'Financiero', icon: DollarSign },
    { id: 'paquetes', label: 'Paquetes', icon: Layers, badge: snapshots.length },
    { id: 'caracteristicas', label: 'Características', icon: Star },
  ] as const

  return (
    <div className="pl-2 pr-6 py-6 flex gap-6 items-stretch">
      <AdminSidebar
        items={items.map(i => ({ id: i.id, label: i.label, icon: i.icon, badge: 'badge' in i ? i.badge : undefined }))}
        activeItem={activeItem}
        onItemClick={handleSectionChange}
        title="Oferta"
        titleIcon={Box}
      />

      <div className="flex-1">
        {activeItem === 'paquete' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <PaqueteContent
              paqueteActual={paqueteActual}
              setPaqueteActual={setPaqueteActual}
              descripcionTextareaRef={descripcionTextareaRef}
              modoEdicion={modoEdicionPaquete}
              setModoEdicion={setModoEdicionPaquete}
              descripcionesTemplate={descripcionesTemplate || []}
              setDescripcionesTemplate={setDescripcionesTemplate}
              mostrarDialogoGenerico={mostrarDialogoGenerico}
              toast={toast}
              updatedAt={cotizacionConfig?.updatedAt}
            />
          </motion.div>
        )}

        {activeItem === 'servicios-base' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ServiciosBaseContent
              serviciosBase={serviciosBase}
              setServiciosBase={setServiciosBase}
              nuevoServicioBase={nuevoServicioBase}
              setNuevoServicioBase={setNuevoServicioBase}
              editandoServicioBaseId={editandoServicioBaseId}
              setEditandoServicioBaseId={setEditandoServicioBaseId}
              servicioBaseEditando={servicioBaseEditando}
              setServicioBaseEditando={setServicioBaseEditando}
              agregarServicioBase={agregarServicioBase}
              abrirEditarServicioBase={abrirEditarServicioBase}
              guardarEditarServicioBase={guardarEditarServicioBase}
              cancelarEditarServicioBase={cancelarEditarServicioBase}
              eliminarServicioBase={eliminarServicioBase}
              updatedAt={cotizacionConfig?.updatedAt}
            />
          </motion.div>
        )}

        {activeItem === 'servicios-opcionales' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ServiciosOpcionalesContent
              serviciosOpcionales={serviciosOpcionales}
              setServiciosOpcionales={setServiciosOpcionales}
              nuevoServicio={nuevoServicio}
              setNuevoServicio={setNuevoServicio}
              editandoServicioId={editandoServicioId}
              setEditandoServicioId={setEditandoServicioId}
              servicioEditando={servicioEditando}
              setServicioEditando={setServicioEditando}
              agregarServicioOpcional={agregarServicioOpcional}
              abrirEditarServicioOpcional={abrirEditarServicioOpcional}
              guardarEditarServicioOpcional={guardarEditarServicioOpcional}
              cancelarEditarServicioOpcional={cancelarEditarServicioOpcional}
              eliminarServicioOpcional={eliminarServicioOpcional}
              normalizarMeses={normalizarMeses}
              serviciosOpcionalesValidos={serviciosOpcionalesValidos}
              todoEsValido={todoEsValido}
              updatedAt={cotizacionConfig?.updatedAt}
            />
          </motion.div>
        )}

        {activeItem === 'paquetes' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <PaquetesContent
              snapshots={snapshots}
              setSnapshots={setSnapshots}
              cargandoSnapshots={cargandoSnapshots}
              errorSnapshots={errorSnapshots}
              abrirModalEditar={abrirModalEditar}
              handleEliminarSnapshot={handleEliminarSnapshot}
              calcularCostoInicialSnapshot={calcularCostoInicialSnapshot}
              calcularCostoAño1Snapshot={calcularCostoAño1Snapshot}
              calcularCostoAño2Snapshot={calcularCostoAño2Snapshot}
              actualizarSnapshot={actualizarSnapshot}
              refreshSnapshots={refreshSnapshots}
              toast={toast}
              mostrarDialogoGenerico={mostrarDialogoGenerico}
              cotizacionConfig={cotizacionConfig}
              onCompararPaquete={onCompararPaquete}
              onCompararPaqueteIndividual={onCompararPaqueteIndividual}
              paqueteParaComparar={paqueteParaComparar}
              updatedAt={cotizacionConfig?.updatedAt}
            />
          </motion.div>
        )}

        {activeItem === 'financiero' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <FinancieroContent
              desarrolloCosto={paqueteActual.desarrollo || 0}
              setDesarrolloCosto={(v) => setPaqueteActual({ ...paqueteActual, desarrollo: v })}
              descuentoBase={paqueteActual.descuento || 0}
              setDescuentoBase={(v) => setPaqueteActual({ ...paqueteActual, descuento: v })}
              opcionesPago={opcionesPago}
              setOpcionesPago={setOpcionesPago}
              metodoPagoPreferido={metodoPagoPreferido}
              setMetodoPagoPreferido={setMetodoPagoPreferido}
              notasPago={notasPago}
              setNotasPago={setNotasPago}
              metodosPreferidos={metodosPreferidos}
              setMetodosPreferidos={setMetodosPreferidos}
              configDescuentos={configDescuentos}
              setConfigDescuentos={setConfigDescuentos}
              serviciosBase={serviciosBase}
              serviciosOpcionales={serviciosOpcionales}
              metodosPagoData={metodosPagoData}
              onMetodosPagoChange={onMetodosPagoChange}
              financialTemplates={financialTemplates}
              setFinancialTemplates={setFinancialTemplates}
              onSaveFinancialTemplate={onSaveFinancialTemplate}
              onUpdateFinancialTemplate={onUpdateFinancialTemplate}
              onDeleteFinancialTemplate={onDeleteFinancialTemplate}
              onNuevaOfertaFinanciera={onNuevaOfertaFinanciera}
              toast={toast}
              mostrarDialogoGenerico={mostrarDialogoGenerico}
              updatedAt={cotizacionConfig?.updatedAt}
            />
          </motion.div>
        )}

        {activeItem === 'caracteristicas' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <PaquetesCaracteristicasContent
              data={paquetesCaracteristicasData || defaultPaquetesCaracteristicas}
              onChange={onPaquetesCaracteristicasChange || (() => {})}
              isConfigLoading={isConfigLoading}
              updatedAt={cotizacionConfig?.updatedAt}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}


