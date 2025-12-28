# 🗺️ MAPEO: Componentes Actuales → Nueva Sidebar Unificada

**Fecha:** 27 de Diciembre de 2025  
**Propósito:** Guía de migración de components a la nueva estructura

---

## 📊 TABLA DE MAPEO

### SECCIÓN: COTIZACIÓN

| Item | ID | Componente Actual | Ubicación | Estado |
|---|---|---|---|---|
| 📄 Información | `cot-info` | `CotizacionInfoContent` | `src/features/admin/components/content/cotizacion/` | ✅ Existe |
| 📍 Cliente | `cot-cliente` | `ClienteContent` | `src/features/admin/components/content/cotizacion/` | ✅ Existe |
| 📧 Proveedor | `cot-proveedor` | `ProveedorContent` | `src/features/admin/components/content/cotizacion/` | ✅ Existe |

**TAB que contiene:** `CotizacionTab.tsx`  
**Sidebar local actual:** `AdminSidebar` (genérico)  
**Acción:** Remover sidebar local, pasar `activeSection` como prop

---

### SECCIÓN: OFERTA

| Item | ID | Componente Actual | Ubicación | Estado |
|---|---|---|---|---|
| 📦 Descripción | `oferta-desc` | `PaqueteContent` | `src/features/admin/components/content/oferta/` | ✅ Existe |
| 🎁 Servicios Base | `oferta-base` | `ServiciosBaseContent` | `src/features/admin/components/content/oferta/` | ✅ Existe |
| 🧩 Opcionales | `oferta-opcionales` | `ServiciosOpcionalesContent` | `src/features/admin/components/content/oferta/` | ✅ Existe |
| 💰 Financiero | `oferta-financiero` | `FinancieroContent` | `src/features/admin/components/content/oferta/` | ✅ Existe |
| 📦 Paquetes | `oferta-paquetes` | `PaquetesContent` | `src/features/admin/components/content/oferta/` | ✅ Existe |
| ⭐ Características | `oferta-caracteristicas` | `PaquetesCaracteristicasContent` | `src/features/admin/components/content/oferta/` | ✅ Existe |

**TAB que contiene:** `OfertaTab.tsx`  
**Sidebar local actual:** `AdminSidebar` (genérico, con badges)  
**Acción:** Remover sidebar local, pasar `activeSection` como prop, mantener badges

---

### SECCIÓN: CONTENIDO

| Item | ID | Componente Actual | Ubicación | Estado |
|---|---|---|---|---|
| 📄 Resumen | `cont-resumen` | `ResumenEjecutivoContent` | `src/features/admin/components/content/contenido/` | ✅ Existe |
| 📊 Análisis | `cont-analisis` | `AnalisisContent` | `src/features/admin/components/content/contenido/` | ✅ Existe |
| ⭐ Fortalezas | `cont-fortalezas` | `FortalezasContent` | `src/features/admin/components/content/contenido/` | ✅ Existe |
| ↔️ Comparativa | `cont-comparativa` | `ComparativaContent` | `src/features/admin/components/content/contenido/` | ✅ Existe |
| 📅 Cronograma | `cont-cronograma` | `CronogramaContent` | `src/features/admin/components/content/contenido/` | ✅ Existe |
| 💳 Cuotas | `cont-cuotas` | `CuotasContent` | `src/features/admin/components/content/contenido/` | ✅ Existe |
| 📋 Paquetes | `cont-paquetes` | `TablaContent` | `src/features/admin/components/content/contenido/` | ✅ Existe |
| ⚠️ Notas | `cont-notas` | `ObservacionesContent` | `src/features/admin/components/content/contenido/` | ✅ Existe |
| 🚩 Conclusión | `cont-conclusion` | `ConclusionContent` | `src/features/admin/components/content/contenido/` | ✅ Existe |
| ❓ FAQ | `cont-faq` | `FAQContent` | `src/features/admin/components/content/contenido/` | ✅ Existe |
| 🛡️ Garantías | `cont-garantias` | `GarantíasContent` | `src/features/admin/components/content/contenido/` | ✅ Existe |
| 📞 Contacto | `cont-contacto` | `ContactoContent` | `src/features/admin/components/content/contenido/` | ✅ Existe |
| ⚖️ Términos | `cont-terminos` | `TerminosContent` | `src/features/admin/components/content/contenido/` | ✅ Existe |

**TAB que contiene:** `ContenidoTab.tsx` (1,303 líneas - la más grande)  
**Sidebar local actual:** `AdminSidebar` (genérico, 13 items)  
**Acción:** Remover sidebar local, pasar `activeSection` como prop, mantener colapsibles internos

---

### SECCIÓN: HISTORIAL

| Item | ID | Componente Actual | Ubicación | Estado |
|---|---|---|---|---|
| 📊 Versiones | `hist-main` | `Historial` | `src/features/admin/components/tabs/` | ✅ Existe |

**TAB que contiene:** `Historial.tsx` (862 líneas)  
**Sidebar local actual:** ❌ NINGUNA (solo contenido)  
**Acción:** Crear wrapper para que funcione con la nueva estructura

---

### SECCIÓN: PREFERENCIAS

| Item | ID | Componente Actual | Ubicación | Estado |
|---|---|---|---|---|
| ⚙️ Configuración | `pref-general` | `ConfiguracionGeneralContent` | `src/features/admin/components/content/preferencias/` | ✅ Existe |
| 🔄 Sincronización | `pref-sincronizacion` | `SincronizacionContent` | `src/features/admin/components/content/preferencias/` | ✅ Existe |
| 👥 Usuarios | `pref-usuarios` | `UsersTable` | `src/features/admin/components/` | ✅ Existe |
| 🏢 Organizaciones | `pref-organizaciones` | `OrganizacionContent` | `src/features/admin/components/content/preferencias/` | ✅ Existe |
| 🔒 Seguridad | `pref-seguridad` | `SeguridadContent` | `src/features/admin/components/content/preferencias/` | ✅ Existe |
| 📋 Logs | `pref-logs` | `LogsAuditoriaContent` | `src/features/admin/components/content/preferencias/seguridad/` | ✅ Existe |
| 🛡️ Backups | `pref-backups` | `BackupContent` | `src/features/admin/components/content/preferencias/seguridad/` | ✅ Existe |
| 📊 Reportes | `pref-reportes` | `ReportesAuditoriaContent` | `src/features/admin/components/content/preferencias/` | ✅ Existe |

**TAB que contiene:** `PreferenciasTab.tsx`  
**Sidebar local actual:** `PreferenciasSidebar` (especializada con subsecciones)  
**Acción:** Remover PreferenciasSidebar, integrar en UnifiedAdminSidebar, pasar `activeSection` como prop

---

### SECCIÓN: CRM ⭐ NUEVO

| Item | ID | Componente Actual | Ubicación | Estado |
|---|---|---|---|---|
| 📇 Clientes | `crm-clientes` | ❌ NUEVO | `src/features/admin/components/content/crm/sections/` | 📅 Fase 3 |
| 👥 Contactos | `crm-contactos` | ❌ NUEVO | `src/features/admin/components/content/crm/sections/` | 📅 Fase 4 |
| 📦 Productos | `crm-productos` | ❌ NUEVO | `src/features/admin/components/content/crm/sections/` | 📅 Fase 5 |
| 🎯 Oportunidades | `crm-oportunidades` | ❌ NUEVO | `src/features/admin/components/content/crm/sections/` | 📅 Fase 6 |
| 💬 Interacciones | `crm-interacciones` | ❌ NUEVO | `src/features/admin/components/content/crm/sections/` | 📅 Fase 7 |
| 📊 Auditoría | `crm-historial` | ❌ NUEVO | `src/features/admin/components/content/crm/sections/` | 📅 Fase 7 |
| 💰 Pricing | `crm-pricing` | ❌ NUEVO | `src/features/admin/components/content/crm/sections/` | 📅 Fase 8 |
| 📅 Suscripciones | `crm-suscripciones` | ❌ NUEVO | `src/features/admin/components/content/crm/sections/` | 📅 Fase 8 |
| ✅ Cumplimiento | `crm-compliance` | ❌ NUEVO | `src/features/admin/components/content/crm/sections/` | 📅 Fase 8 |
| ⚙️ Reglas | `crm-reglas` | ❌ NUEVO | `src/features/admin/components/content/crm/sections/` | 📅 Fase 8 |
| 📄 Plantillas | `crm-plantillas` | ❌ NUEVO | `src/features/admin/components/content/crm/sections/` | 📅 Fase 8 |

**TAB que contiene:** `CrmTab.tsx` (❌ POR CREAR)  
**Sidebar local actual:** ❌ NINGUNA (usará UnifiedAdminSidebar)  
**Acción:** Crear CrmTab y todas las secciones en fases

---

## 🔄 FLUJO DE MIGRACIÓN

### Paso 1: Sidebar Unificada

```
admin/page.tsx
  │
  ├─ OLD: [Analytics] [Cotización] [Oferta] [Contenido] [Historial] [Preferencias]
  │
  └─ NEW:
     ├─ UnifiedAdminSidebar (izquierda)
     │  └─ 6 categorías expandibles (Cotización, Oferta, Contenido, Historial, CRM, Preferencias)
     │
     └─ Contenido (derecha)
        └─ Se renderiza según activeSection (ej: 'cot-info', 'oferta-base', etc.)
```

### Paso 2: Props Flow

**Actual (CotizacionTab):**
```tsx
<CotizacionTab
  cotizacionConfig={cotizacionConfig}
  setCotizacionConfig={setCotizacionConfig}
  {...props}
/>
  └─ Internamente controla activeItem con AdminSidebar local
```

**Nuevo (CotizacionTab):**
```tsx
<CotizacionTab
  cotizacionConfig={cotizacionConfig}
  setCotizacionConfig={setCotizacionConfig}
  activeSection={activeSection}  // ← NEW PROP
  {...props}
/>
  └─ Renderiza contenido basado en activeSection (ej: 'cot-info', 'cot-cliente')
  └─ No controla sidebar (ella está en admin/page.tsx)
```

### Paso 3: Renderizado de Contenido

**Nuevo patrón en admin/page.tsx:**
```tsx
const renderMainContent = () => {
  // Extraer categoría del activeSection
  const category = activeSection.split('-')[0] // 'cot', 'oferta', etc.
  
  switch (category) {
    case 'cot':
      return <CotizacionTab activeSection={activeSection} {...props} />
    case 'oferta':
      return <OfertaTab activeSection={activeSection} {...props} />
    case 'cont':
      return <ContenidoTab activeSection={activeSection} {...props} />
    case 'hist':
      return <Historial {...props} />
    case 'crm':
      return <CrmTab activeSection={activeSection} {...props} />
    case 'pref':
      return <PreferenciasTab activeSection={activeSection} {...props} />
    default:
      return <AnalyticsDashboard />
  }
}
```

---

## 📝 CAMBIOS POR ARCHIVO

### Archivos a MODIFICAR

#### 1. `src/app/admin/page.tsx`
```diff
- const [activeTab, setActiveTab] = useState<TabId>('analytics')
+ const [activeTab, setActiveTab] = useState<TabId>('analytics')
+ const [activeSection, setActiveSection] = useState<SidebarSection>('cot-info')

+ import UnifiedAdminSidebar from '@/features/admin/components/UnifiedAdminSidebar'

  return (
    <div className="flex h-screen">
+     {/* Nueva Sidebar Unificada */}
+     {activeTab !== 'analytics' && (
+       <UnifiedAdminSidebar
+         activeSection={activeSection}
+         onSectionChange={setActiveSection}
+       />
+     )}

-     {/* Old individual TABs */}
+     {/* Contenido que usa activeSection */}
      <div className="flex-1">
        {/* renderizar TABs basados en activeSection */}
      </div>
    </div>
  )
```

#### 2. `src/features/admin/components/tabs/CotizacionTab.tsx`
```diff
- const [activeItem, setActiveItem] = useState<'cotizacion' | 'cliente' | 'proveedor'>('cotizacion')
+ // Recibir como prop
+ interface CotizacionTabProps {
+   activeSection: SidebarSection
+   ...rest
+ }
+ export default function CotizacionTab({ activeSection, ...props }) {
-   <AdminSidebar
-     items={items}
-     activeItem={activeItem}
-     onItemClick={setActiveItem}
-   />
+   {/* Remover AdminSidebar local */}

-   {activeItem === 'cotizacion' && <CotizacionInfoContent />}
-   {activeItem === 'cliente' && <ClienteContent />}
-   {activeItem === 'proveedor' && <ProveedorContent />}
+   {activeSection === 'cot-info' && <CotizacionInfoContent />}
+   {activeSection === 'cot-cliente' && <ClienteContent />}
+   {activeSection === 'cot-proveedor' && <ProveedorContent />}
  }
```

#### 3. `src/features/admin/components/tabs/OfertaTab.tsx`
```diff
- const [activeItem, setActiveItem] = useState<'paquete' | 'servicios-base' | ...>('paquete')
+ // Recibir como prop
+ interface OfertaTabProps {
+   activeSection: SidebarSection
+   ...rest
+ }

-   <AdminSidebar items={items} activeItem={activeItem} onItemClick={setActiveItem} />
+   {/* Remover AdminSidebar local */}

-   {activeItem === 'paquete' && <PaqueteContent />}
-   {activeItem === 'servicios-base' && <ServiciosBaseContent />}
+   {activeSection === 'oferta-desc' && <PaqueteContent />}
+   {activeSection === 'oferta-base' && <ServiciosBaseContent />}
```

#### 4. `src/features/admin/components/tabs/ContenidoTab.tsx`
```diff
- const [activeItem, setActiveItem] = useState<SidebarSection>('resumen')
+ // Recibir como prop
+ interface ContenidoTabProps {
+   activeSection: SidebarSection
+ }

-   <AdminSidebar items={sidebarItems} activeItem={activeItem} onItemClick={setActiveItem} />
+   {/* Remover AdminSidebar local */}

-   {activeItem === 'resumen' && <ResumenContent />}
-   {activeItem === 'analisis' && <AnalisisContent />}
+   {activeSection === 'cont-resumen' && <ResumenContent />}
+   {activeSection === 'cont-analisis' && <AnalisisContent />}
```

#### 5. `src/features/admin/components/tabs/PreferenciasTab.tsx`
```diff
- <PreferenciasSidebar
-   activeSection={activeSection}
-   onSectionChange={setActiveSection}
- />
+ {/* Remover PreferenciasSidebar - usar prop del padre */}

+ interface PreferenciasTabProps {
+   activeSection: SidebarSection
+   onSectionChange: (section: SidebarSection) => void
+ }

- {activeSection === 'general' && <ConfiguracionGeneralContent />}
+ {activeSection === 'pref-general' && <ConfiguracionGeneralContent />}
```

### Archivos a CREAR

#### `src/features/admin/components/tabs/CrmTab.tsx`
```tsx
import React, { useState } from 'react'
import type { SidebarSection } from '../UnifiedAdminSidebar'
import CrmContainer from '../content/crm/CrmContainer'

interface CrmTabProps {
  activeSection: SidebarSection
  // ... más props según necesario
}

export default function CrmTab({ activeSection, ...props }: CrmTabProps) {
  const [selectedClient, setSelectedClient] = useState(null)

  return (
    <div className="flex-1 overflow-auto">
      <CrmContainer
        activeSection={activeSection}
        selectedClient={selectedClient}
        onClientSelect={setSelectedClient}
        {...props}
      />
    </div>
  )
}
```

#### `src/features/admin/components/content/crm/CrmContainer.tsx`
```tsx
import React from 'react'
import type { SidebarSection } from '../../UnifiedAdminSidebar'

// Import secciones cuando estén listas
// import ClientsSection from './sections/ClientsSection'
// ... etc

export default function CrmContainer({ activeSection, selectedClient, onClientSelect, ...props }) {
  const renderContent = () => {
    switch (activeSection) {
      case 'crm-clientes':
        // return <ClientsSection onSelect={onClientSelect} />
        return <div className="p-4">Sección de Clientes (Próximamente)</div>
      // ... etc
      default:
        return <div className="p-4">Selecciona una sección</div>
    }
  }

  return <div className="p-6">{renderContent()}</div>
}
```

---

## ✅ CHECKLIST DE MIGRACIÓN

### FASE 1: Sidebar Unificada (1-2 semanas)

#### Preparación
- [ ] Crear `UnifiedAdminSidebar.tsx`
- [ ] Crear `ESPECIFICACIÓN_SIDEBAR_UNIFICADA.md`
- [ ] Crear Zustand store para estado sidebar
- [ ] Validar tipado de TypeScript

#### Integración admin/page.tsx
- [ ] Importar `UnifiedAdminSidebar`
- [ ] Agregar estado `activeSection`
- [ ] Renderizar sidebar condicionalmente (si activeTab !== 'analytics')
- [ ] Implementar `renderMainContent()` basado en `activeSection`
- [ ] Testear que sidebar se muestre/oculte correctamente

#### Modificar CotizacionTab
- [ ] Agregar prop `activeSection`
- [ ] Remover `AdminSidebar` local
- [ ] Reemplazar condiciones `activeItem === 'x'` con `activeSection === 'cot-x'`
- [ ] Testear navegación entre subsecciones

#### Modificar OfertaTab
- [ ] Agregar prop `activeSection`
- [ ] Remover `AdminSidebar` local
- [ ] Reemplazar condiciones
- [ ] Mantener badges (cantidad de items)
- [ ] Testear navegación

#### Modificar ContenidoTab
- [ ] Agregar prop `activeSection`
- [ ] Remover `AdminSidebar` local
- [ ] Reemplazar condiciones (13 items)
- [ ] Mantener colapsibles internos
- [ ] Testear navegación

#### Modificar PreferenciasTab
- [ ] Agregar prop `activeSection`
- [ ] Remover `PreferenciasSidebar` local
- [ ] Reemplazar condiciones (pref-general, pref-sincronizacion, etc.)
- [ ] Testear navegación

#### Modificar Historial
- [ ] Crear wrapper para que funcione con nueva estructura
- [ ] Testear que siga funcionando igual

#### Testing
- [ ] Testear navegación entre todas las secciones
- [ ] Testear que se expandan/colapsen categorías
- [ ] Testear que activeSection se persista
- [ ] Testear que no haya regresiones
- [ ] Testear responsive

### FASE 2: CRM Foundation (2-3 semanas)

- [ ] Crear `CrmTab.tsx`
- [ ] Crear `CrmContainer.tsx`
- [ ] Crear `sections/` con placeholders
- [ ] Crear `modals/` con placeholders
- [ ] Integrar CRM en routing de admin/page.tsx
- [ ] Testear navegación CRM

### FASE 3+: CRM Implementation

- [ ] Modelos Prisma
- [ ] APIs
- [ ] CRUD Clientes
- [ ] CRUD Contactos
- [ ] Etc...

---

## 🎯 RESUMEN

✅ **Sidebar unificada creada:** `UnifiedAdminSidebar.tsx`  
✅ **Especificación creada:** `ESPECIFICACIÓN_SIDEBAR_UNIFICADA.md`  
✅ **Mapeo creado:** Este documento  
✅ **CRM integrado:** 11 secciones en la sidebar  

**Próximo paso:** Integración en `admin/page.tsx` y modificación de TABs existentes
