'use client'

import React, { useState, useCallback } from 'react'
import { ServicioBase, Servicio, Package, PackageSnapshot, QuotationConfig, DialogConfig, OpcionPago, ConfigDescuentos, DescripcionPaqueteTemplate } from '@/lib/types'
import AdminSidebar from '@/features/admin/components/AdminSidebar'
import { FaBox, FaCubes, FaPuzzlePiece, FaLayerGroup, FaDollarSign } from 'react-icons/fa'
import PaqueteContent from '@/features/admin/components/content/oferta/PaqueteContent'
import ServiciosBaseContent from '@/features/admin/components/content/oferta/ServiciosBaseContent'
import ServiciosOpcionalesContent from '@/features/admin/components/content/oferta/ServiciosOpcionalesContent'
import PaquetesContent from '@/features/admin/components/content/oferta/PaquetesContent'
import FinancieroContent from '@/features/admin/components/content/oferta/FinancieroContent'
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
  // Props para Financiero
  opcionesPago: OpcionPago[]
  setOpcionesPago: (ops: OpcionPago[]) => void
  metodoPagoPreferido: string
  setMetodoPagoPreferido: (m: string) => void
  notasPago: string
  setNotasPago: (n: string) => void
  configDescuentos: ConfigDescuentos
  setConfigDescuentos: (c: ConfigDescuentos) => void
  // Props para modo edición del paquete (descripción)
  modoEdicionPaquete?: boolean
  setModoEdicionPaquete?: (modo: boolean) => void
  // Props para templates de descripción de paquete
  descripcionesTemplate?: DescripcionPaqueteTemplate[]
  setDescripcionesTemplate?: (templates: DescripcionPaqueteTemplate[]) => void
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
  // Financiero props
  opcionesPago,
  setOpcionesPago,
  metodoPagoPreferido,
  setMetodoPagoPreferido,
  notasPago,
  setNotasPago,
  configDescuentos,
  setConfigDescuentos,
  // Props modo edición paquete
  modoEdicionPaquete,
  setModoEdicionPaquete,
  // Props templates descripción
  descripcionesTemplate,
  setDescripcionesTemplate,
}: Readonly<OfertaTabProps>) {
  const [activeItem, setActiveItem] = useState<'paquete' | 'servicios-base' | 'servicios-opcionales' | 'financiero' | 'paquetes'>('paquete')
  
  // Tracking de navegación
  const { trackOfertaSectionViewed } = useEventTracking()
  
  const handleSectionChange = useCallback((id: string) => {
    setActiveItem(id as typeof activeItem)
    trackOfertaSectionViewed(id)
  }, [trackOfertaSectionViewed])

  const items = [
    { id: 'paquete', label: 'Descripción', icon: FaBox },
    { id: 'servicios-base', label: 'Base', icon: FaCubes, badge: serviciosBase.length },
    { id: 'servicios-opcionales', label: 'Opcionales', icon: FaPuzzlePiece, badge: serviciosOpcionales.length },
    { id: 'financiero', label: 'Financiero', icon: FaDollarSign },
    { id: 'paquetes', label: 'Paquetes', icon: FaLayerGroup, badge: snapshots.length },
  ] as const

  return (
    <div className="pl-2 pr-6 py-6 flex gap-6">
      <AdminSidebar
        items={items.map(i => ({ id: i.id, label: i.label, icon: i.icon, badge: 'badge' in i ? i.badge : undefined }))}
        activeItem={activeItem}
        onItemClick={handleSectionChange}
      />

      <div className="flex-1">
        {activeItem === 'paquete' && (
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
          />
        )}

        {activeItem === 'servicios-base' && (
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
          />
        )}

        {activeItem === 'servicios-opcionales' && (
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
          />
        )}

        {activeItem === 'paquetes' && (
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
          />
        )}

        {activeItem === 'financiero' && (
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
            configDescuentos={configDescuentos}
            setConfigDescuentos={setConfigDescuentos}
            serviciosBase={serviciosBase}
            serviciosOpcionales={serviciosOpcionales}
          />
        )}
      </div>
    </div>
  )
}
