'use client'

import React, { useState } from 'react'
// iconos locales no usados directamente tras refactor
import { ServicioBase, Servicio, Package, PackageSnapshot, QuotationConfig, DialogConfig } from '@/lib/types'
import AdminSidebar from '@/components/admin/shared/AdminSidebar'
import { FaBox, FaPuzzlePiece, FaCreditCard } from 'react-icons/fa'
import OfertaContent from '@/components/admin/oferta/OfertaContent'
import PaquetesContent from '@/components/admin/oferta/PaquetesContent'
import PagoContent from '@/components/admin/oferta/PagoContent'

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
}: Readonly<OfertaTabProps>) {
  const [activeItem, setActiveItem] = useState<'oferta' | 'paquetes' | 'pago'>('oferta')

  const items = [
    { id: 'oferta', label: 'Oferta', icon: FaBox },
    { id: 'paquetes', label: 'Paquetes', icon: FaPuzzlePiece, badge: serviciosOpcionales.length },
    { id: 'pago', label: 'Pago', icon: FaCreditCard },
  ] as const

  return (
    <div className="flex gap-4">
      <AdminSidebar
        items={items.map(i => ({ id: i.id, label: i.label, icon: i.icon, badge: 'badge' in i ? i.badge : undefined }))}
        activeItem={activeItem}
        onItemClick={(id) => setActiveItem(id as any)}
      />

      <div className="flex-1 p-2 md:p-4">
        {activeItem === 'oferta' && (
          <OfertaContent
            serviciosBase={serviciosBase}
            setServiciosBase={setServiciosBase}
            nuevoServicioBase={nuevoServicioBase}
            setNuevoServicioBase={setNuevoServicioBase}
            editandoServicioBaseId={editandoServicioBaseId}
            setEditandoServicioBaseId={setEditandoServicioBaseId}
            servicioBaseEditando={servicioBaseEditando}
            setServicioBaseEditando={setServicioBaseEditando}
            paqueteActual={paqueteActual}
            setPaqueteActual={setPaqueteActual}
            serviciosOpcionales={serviciosOpcionales}
            setServiciosOpcionales={setServiciosOpcionales}
            nuevoServicio={nuevoServicio}
            setNuevoServicio={setNuevoServicio}
            editandoServicioId={editandoServicioId}
            setEditandoServicioId={setEditandoServicioId}
            servicioEditando={servicioEditando}
            setServicioEditando={setServicioEditando}
            descripcionTextareaRef={descripcionTextareaRef}
            agregarServicioBase={agregarServicioBase}
            abrirEditarServicioBase={abrirEditarServicioBase}
            guardarEditarServicioBase={guardarEditarServicioBase}
            cancelarEditarServicioBase={cancelarEditarServicioBase}
            eliminarServicioBase={eliminarServicioBase}
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

        {activeItem === 'pago' && (
          <PagoContent
            descuentoPaquete={paqueteActual.descuento || 0}
            setDescuentoPaquete={(v) => setPaqueteActual({ ...paqueteActual, descuento: v })}
          />
        )}
      </div>
    </div>
  )
}
