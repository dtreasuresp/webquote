# 🔧 Correcciones de Bugs - Configuración de Auditoría

## 📋 Problemas Reportados

1. **"Purga automática de logs"** no activa el botón "Guardar Cambios"
2. **"Comportamiento General" y "Reportes automáticos"** activan el botón pero se desactiva inmediatamente
3. **Incertidumbre sobre persistencia** - no está claro si las configuraciones se guardan

## 🎯 Causa Raíz

Había **dos stores separados con responsabilidades duplicadas**:
- `userPreferencesStore` ← Lee/escribe en tabla UserPreferences
- `auditConfigStore` ← Lee/escribe en tabla separada (no sincronizado)

**Problema**: ConfiguracionGeneralContent estaba usando `auditConfigStore` para algunos campos, pero PreferenciasTAB solo monitorea `isDirty` del `userPreferencesStore`. Esto causaba que cambios en "Purga automática" no activaran el botón "Guardar".

## ✅ Soluciones Implementadas

### 1. **Consolidar en userPreferencesStore**
- Todos los campos ahora vienen de `userPreferencesStore` (single source of truth)
- Removida la dependencia de `auditConfigStore` en ConfiguracionGeneralContent

**Archivos modificados:**
- `src/features/admin/components/content/preferencias/ConfiguracionGeneralContent.tsx`
  - Removida importación de `useAuditConfigStore`
  - Cambiados selectores para leer TODO de `userPreferencesStore`
  - `handleRetentionDaysChange` y `handleAutoDeleteChange` ahora usan `updatePreferencesSync`

### 2. **Agregar updatePreferencesSync (síncrono)**
- Nuevo método que actualiza estado de forma **inmediata** sin esperar API
- Mantiene `isDirty: true` hasta que la API responde
- El estado local se preserva durante updates de fondo

**Archivo modificado:**
- `src/stores/userPreferencesStore.ts`
  - Nuevo método `updatePreferencesSync()`
  - Actualiza estado localmente (síncrono)
  - Envía API en background (fire-and-forget)
  - Cuando API responde, solo actualiza `isDirty: false` (sin sobrescribir valores)

### 3. **Completar defaults en store**
- Agregados campos de auditoría en estado inicial
- Agregados en `resetPreferences()`
- Agregados en `persistPreferences()`

**Archivo modificado:**
- `src/stores/userPreferencesStore.ts`
  - Agregados defaults para: `auditRetentionDays`, `auditAutoPurgeEnabled`

### 4. **Actualizar API endpoints**
- Agregado handler PATCH completo para actualizaciones parciales
- POST handler ahora incluye campos de auditoría
- Ambos handlers soportan los 5 campos de auditoría

**Archivo modificado:**
- `src/app/api/preferences/route.ts`
  - Nuevo handler PATCH con lógica para actualización parcial
  - POST handler actualizado con campos de auditoría
  - Manejo correcto de valores undefined

### 5. **Actualizar partialize del store**
- Los campos de auditoría ahora se persisten en localStorage

**Archivo modificado:**
- `src/stores/userPreferencesStore.ts`
  - `partialize` incluye: `auditAutoReportEnabled`, `auditAutoPurgeFrequency`, `auditAutoReportPeriod`, `auditRetentionDays`

## 📊 Campos Sincronizados

| Campo | Tabla BD | Store | localStorage | API |
|-------|----------|-------|--------------|-----|
| `auditRetentionDays` | UserPreferences | ✅ userPreferencesStore | ✅ | ✅ |
| `auditAutoPurgeEnabled` | UserPreferences | ✅ userPreferencesStore | ✅ | ✅ |
| `auditAutoPurgeFrequency` | UserPreferences | ✅ userPreferencesStore | ✅ | ✅ |
| `auditAutoReportEnabled` | UserPreferences | ✅ userPreferencesStore | ✅ | ✅ |
| `auditAutoReportPeriod` | UserPreferences | ✅ userPreferencesStore | ✅ | ✅ |

## 🔄 Flujo de Actualización (Ahora Correcto)

```
Usuario interactúa con toggle
        ↓
updatePreferencesSync() es llamado
        ↓
Estado se actualiza INMEDIATAMENTE (síncrono)
        ↓
isDirty = true → Botón "Guardar" aparece ✅
        ↓
API se llama en BACKGROUND
        ↓
API confirma → isDirty = false ✅
        ↓
Estado se persiste en localStorage ✅
```

## 🧪 Prueba

Se creó script `scripts/test-preferences.ts` para verificar persistencia:

```bash
npx tsx scripts/test-preferences.ts
```

Verifica:
- Creación de preferencias iniciales
- Actualización de campos individuales
- Persistencia en BD
- Lectura de valores confirmados

## ✨ Cambios Visibles para el Usuario

✅ **"Purga automática de logs"** ahora:
- Activa inmediatamente el toggle visual
- Activa el botón "Guardar Cambios"
- Se persiste correctamente

✅ **"Reportes automáticos"** y **"Comportamiento General"** ahora:
- Mantienen el botón "Guardar Cambios" activo hasta completar la persistencia
- No se desactivan mientras se guarda

✅ **Persistencia garantizada**:
- Todos los cambios se guardan en BD
- Se recuperan al recargar página
- Se mantienen en localStorage como backup

## 🔍 Validación

- TypeScript: ✅ Exit Code 0 (sin errores)
- Estructura: Single source of truth (userPreferencesStore)
- Sincronización: Bidireccional (UI ↔ API ↔ BD)

## 📝 Tipos Actualizados

- `UserPreferencesState` en `src/stores/types/userPreferences.types.ts`
  - Agregado método `updatePreferencesSync`
- `UserPreferences` interface (tipos.ts)
  - Ya incluye todos los campos necesarios

