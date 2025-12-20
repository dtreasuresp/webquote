import ServiciosBaseSection from './ServiciosBaseSection'
import { useServicesStore } from '@/stores'
import type { ServicioBase as StoreServicioBase } from '@/stores/types/services.types'
import type { ServicioBase as LibServicioBase } from '@/lib/types'

type Props = {
  serviciosBase?: StoreServicioBase[] | LibServicioBase[]
  [key: string]: any
}

export default function ServiciosBaseAdapter(props: Props) {
  const { baseServices: storeBase, updateBaseService } = useServicesStore((s) => ({
    baseServices: s.baseServices,
    updateBaseService: s.updateBaseService,
  }))

  // Normalizar a shape esperado por `ServiciosBaseSection` (lib types)
  const serviciosSource = (props.serviciosBase ?? storeBase) as Array<StoreServicioBase | LibServicioBase>

  const servicios: LibServicioBase[] = serviciosSource.map((s) => ({
    id: s.id,
    nombre: (s as any).nombre,
    precio: (s as any).precio ?? 0,
    mesesGratis: (s as any).mesesGratis ?? 0,
    mesesPago: (s as any).mesesPago ?? 12,
    frecuenciaPago: (s as any).frecuenciaPago ?? 'mensual',
  }))

  return (
    <ServiciosBaseSection
      {...props}
      serviciosBase={servicios}
      setServiciosBase={(newServicios: LibServicioBase[] | ((prev: LibServicioBase[]) => LibServicioBase[])) => {
        const arr: LibServicioBase[] = typeof newServicios === 'function' ? (newServicios as any)(servicios) : (newServicios as LibServicioBase[])
        arr.forEach((servicio: LibServicioBase) => {
          // Mapear a la forma que entiende el store (store acepta propiedades adicionales)
          updateBaseService(servicio.id, {
            id: servicio.id,
            nombre: servicio.nombre,
            precio: servicio.precio,
            descripcion: (servicio as any).descripcion,
            activo: (servicio as any).activo,
            mesesGratis: servicio.mesesGratis,
            mesesPago: servicio.mesesPago,
            frecuenciaPago: servicio.frecuenciaPago,
          } as Partial<StoreServicioBase>)
        })
      }}
    />
  )
}
