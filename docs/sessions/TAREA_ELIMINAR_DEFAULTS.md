# 🗑️ Tarea: Eliminar Valores por Defecto de Componentes

**Fecha de creación:** 9 de diciembre de 2025  
**Última verificación:** 14 de diciembre de 2025  
**Estado:** ❌ **NO COMPLETADA - PENDIENTE**  
**Prioridad:** Alta  
**Dependencia:** Completar Fase 10 (Sistema de Backup/Restauración) primero

> ⚠️ **VERIFICADO 14/12/2025:** Todos los `default*` todavía existen en el código. Esta tarea NO ha sido implementada.

---

## 📋 Descripción

Eliminar todos los valores por defecto (`default*`) de los componentes de contenido para que:
1. El usuario siempre vea campos vacíos hasta que guarde datos
2. Los datos siempre vengan de la BD, nunca de fallbacks predefinidos
3. El botón "Reset" elimine los datos de la BD (con confirmación)

---

## 🎯 Objetivo

- **Sin datos default:** Los campos deben estar vacíos si no hay datos en BD
- **Datos desde BD:** Siempre cargar desde base de datos
- **Reset = Eliminar:** El botón reset eliminará datos de BD con diálogo de confirmación

---

## 📁 Archivos a Modificar

### Defaults a Eliminar

| Archivo | Constante a Eliminar |
|---------|---------------------|
| `src/features/admin/components/content/oferta/PaquetesCaracteristicasContent.tsx` | `defaultPaquetesCaracteristicas` |
| `src/features/admin/components/content/oferta/MetodosPagoContent.tsx` | `defaultMetodosPago` |
| `src/features/admin/components/content/contenido/PresupuestoCronogramaContent.tsx` | `defaultPresupuestoCronograma` |
| `src/features/admin/components/content/contenido/AnalisisRequisitosContent.tsx` | `defaultAnalisisRequisitos` |
| `src/features/admin/components/content/contenido/FortalezasContent.tsx` | `defaultFortalezas` |
| `src/features/admin/components/content/contenido/DinamicoVsEstaticoContent.tsx` | `defaultDinamicoVsEstatico` |
| `src/features/admin/components/content/contenido/TablaComparativaContent.tsx` | `defaultTablaComparativa` |
| `src/features/admin/components/content/contenido/ObservacionesContent.tsx` | `defaultObservaciones` |
| `src/features/admin/components/content/contenido/ConclusionContent.tsx` | `defaultConclusion` |
| `src/features/admin/components/content/contenido/CuotasContent.tsx` | `defaultCuotas` |
| `src/components/admin/content/contenido/PresupuestoCronogramaContent.tsx` | `defaultPresupuestoCronograma` (duplicado) |

### Exports a Actualizar

| Archivo | Cambio |
|---------|--------|
| `src/features/admin/components/content/oferta/index.ts` | Eliminar export de `defaultPaquetesCaracteristicas`, `defaultMetodosPago` |
| `src/features/admin/components/content/contenido/index.ts` | Eliminar exports de todos los defaults |

### Archivos que Usan Defaults (Actualizar Fallbacks)

| Archivo | Uso Actual | Cambio Requerido |
|---------|------------|------------------|
| `src/app/admin/page.tsx` | `presupuestoCronograma?.titulo \|\| defaultPaquetesCaracteristicas.titulo` | Cambiar a `presupuestoCronograma?.titulo \|\| ''` |
| `src/features/admin/components/tabs/OfertaTab.tsx` | `data={paquetesCaracteristicasData \|\| defaultPaquetesCaracteristicas}` | Cambiar a estructura vacía |
| `src/features/admin/components/tabs/ContenidoTab.tsx` | Múltiples merges con defaults | Cambiar a usar datos de BD o vacío |
| `src/app/page.tsx` (pública) | Merge con defaults para visualización | Ocultar secciones sin datos |

---

## 🔄 Cambios por Archivo

### 1. PaquetesCaracteristicasContent.tsx

**Antes:**
```typescript
export const defaultPaquetesCaracteristicas: PaquetesCaracteristicasData = {
  titulo: 'Paquetes Disponibles',
  subtitulo: 'Características incluidas en cada paquete',
  notaImportante: 'Los precios pueden variar...',
  caracteristicasPorPaquete: {},
  ordenPaquetes: [],
}
```

**Después:**
```typescript
// Eliminar completamente la constante
// Crear estructura vacía para inicialización
export const emptyPaquetesCaracteristicas: PaquetesCaracteristicasData = {
  titulo: '',
  subtitulo: '',
  notaImportante: '',
  caracteristicasPorPaquete: {},
  ordenPaquetes: [],
}
```

### 2. admin/page.tsx

**Antes:**
```typescript
return {
  titulo: presupuestoCronograma?.titulo || defaultPaquetesCaracteristicas.titulo,
  subtitulo: presupuestoCronograma?.subtitulo || defaultPaquetesCaracteristicas.subtitulo,
  notaImportante: presupuestoCronograma?.presupuesto?.notaImportante || defaultPaquetesCaracteristicas.notaImportante,
  ...
}
```

**Después:**
```typescript
return {
  titulo: presupuestoCronograma?.titulo || '',
  subtitulo: presupuestoCronograma?.subtitulo || '',
  notaImportante: presupuestoCronograma?.presupuesto?.notaImportante || '',
  ...
}
```

### 3. ContenidoTab.tsx

**Antes:**
```typescript
const presupuestoCronogramaData = presupuestoFromDB ? {
  ...defaultPresupuestoCronograma,
  ...presupuestoFromDB,
  presupuesto: { ...defaultPresupuestoCronograma.presupuesto, ...presupuestoFromDB.presupuesto },
  cronograma: { ...defaultPresupuestoCronograma.cronograma, ...presupuestoFromDB.cronograma },
} : defaultPresupuestoCronograma
```

**Después:**
```typescript
const presupuestoCronogramaData = presupuestoFromDB || {
  titulo: '',
  subtitulo: '',
  presupuesto: { visible: true, titulo: '', descripcion: '', rangos: [], notaImportante: '' },
  cronograma: { visible: true, titulo: '', descripcion: '', duracionTotal: '', fases: [] },
  caracteristicasPorPaquete: {},
  ordenPaquetes: [],
}
```

### 4. page.tsx (Página Pública)

**Cambio:** Ocultar secciones que no tienen datos en lugar de mostrar defaults.

```typescript
// Antes: Siempre muestra la sección con datos default
{presupuestoCronograma && <PresupuestoSection data={presupuestoCronograma} />}

// Después: Solo mostrar si hay contenido real
{presupuestoCronograma?.titulo && <PresupuestoSection data={presupuestoCronograma} />}
```

---

## ✅ Checklist de Implementación

### Preparación
- [ ] Completar Fase 10: Sistema de Backup/Restauración
- [ ] Verificar que hay datos guardados en BD para pruebas
- [ ] Crear backup de la BD antes de cambios

### Eliminación de Defaults
- [ ] Eliminar `defaultPaquetesCaracteristicas` de `PaquetesCaracteristicasContent.tsx`
- [ ] Eliminar `defaultMetodosPago` de `MetodosPagoContent.tsx`
- [ ] Eliminar `defaultPresupuestoCronograma` de `PresupuestoCronogramaContent.tsx`
- [ ] Eliminar `defaultAnalisisRequisitos` de `AnalisisRequisitosContent.tsx`
- [ ] Eliminar `defaultFortalezas` de `FortalezasContent.tsx`
- [ ] Eliminar `defaultDinamicoVsEstatico` de `DinamicoVsEstaticoContent.tsx`
- [ ] Eliminar `defaultTablaComparativa` de `TablaComparativaContent.tsx`
- [ ] Eliminar `defaultObservaciones` de `ObservacionesContent.tsx`
- [ ] Eliminar `defaultConclusion` de `ConclusionContent.tsx`
- [ ] Eliminar `defaultCuotas` de `CuotasContent.tsx`

### Actualización de Exports
- [ ] Actualizar `src/features/admin/components/content/oferta/index.ts`
- [ ] Actualizar `src/features/admin/components/content/contenido/index.ts`

### Actualización de Consumidores
- [ ] Actualizar `admin/page.tsx` - cambiar fallbacks a strings vacíos
- [ ] Actualizar `OfertaTab.tsx` - usar estructura vacía
- [ ] Actualizar `ContenidoTab.tsx` - eliminar merges con defaults
- [ ] Actualizar `page.tsx` (pública) - ocultar secciones sin datos

### Verificación
- [ ] Probar carga con datos existentes en BD
- [ ] Probar carga sin datos (nuevo usuario)
- [ ] Verificar que Reset funciona con el nuevo sistema de backup
- [ ] Verificar página pública oculta secciones vacías

---

## ⚠️ Notas Importantes

1. **NO implementar hasta completar Fase 10** - El sistema de backup debe estar listo para proteger datos antes de eliminar defaults

2. **El archivo `src/lib/animations/config.ts`** contiene `defaultConfig` para animaciones - **NO eliminar**, es diferente a los defaults de contenido

3. **Mantener estructuras vacías** como `emptyPaquetesCaracteristicas` para inicialización de estados

4. **La página pública** debe manejar gracefully las secciones sin datos (ocultarlas, no mostrar vacío)

---

## 📅 Estimación

| Tarea | Tiempo Estimado |
|-------|-----------------|
| Eliminar defaults de componentes | 30 min |
| Actualizar exports | 15 min |
| Actualizar consumidores | 1 hora |
| Pruebas y verificación | 45 min |
| **Total** | **~2.5 horas** |

---

*Documento creado el 9 de diciembre de 2025*  
*Implementar después de completar Fase 10 del documento maestro*
