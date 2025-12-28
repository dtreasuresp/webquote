# 📐 ESPECIFICACIÓN TÉCNICA: Sidebar Unificada + CRM

**Fecha:** 27 de Diciembre de 2025  
**Versión:** 1.0  
**Estado:** 🟢 LISTO PARA IMPLEMENTACIÓN

---

## 📋 RESUMEN

Se ha creado una **Sidebar Unificada** que consolida toda la navegación del panel admin en un único componente modular. Incluye todas las TABs existentes más la nueva sección de **CRM** con 11 subsecciones.

---

## 🏗️ ESTRUCTURA DE DATOS

### Tipos TypeScript

```typescript
export type SidebarSection = 
  // Cotización (3 items)
  | 'cot-info'
  | 'cot-cliente'
  | 'cot-proveedor'
  // Oferta (6 items)
  | 'oferta-desc'
  | 'oferta-base'
  | 'oferta-opcionales'
  | 'oferta-financiero'
  | 'oferta-paquetes'
  | 'oferta-caracteristicas'
  // Contenido (13 items)
  | 'cont-resumen'
  | 'cont-analisis'
  | 'cont-fortalezas'
  | 'cont-comparativa'
  | 'cont-cronograma'
  | 'cont-cuotas'
  | 'cont-paquetes'
  | 'cont-notas'
  | 'cont-conclusion'
  | 'cont-faq'
  | 'cont-garantias'
  | 'cont-contacto'
  | 'cont-terminos'
  // Historial (1 item)
  | 'hist-main'
  // Preferencias (8 items)
  | 'pref-general'
  | 'pref-sincronizacion'
  | 'pref-usuarios'
  | 'pref-organizaciones'
  | 'pref-seguridad'
  | 'pref-logs'
  | 'pref-backups'
  | 'pref-reportes'
  // CRM (11 items)
  | 'crm-clientes'
  | 'crm-contactos'
  | 'crm-productos'
  | 'crm-oportunidades'
  | 'crm-interacciones'
  | 'crm-historial'
  | 'crm-pricing'
  | 'crm-suscripciones'
  | 'crm-compliance'
  | 'crm-reglas'
  | 'crm-plantillas'

export type SidebarCategory = 'cotizacion' | 'oferta' | 'contenido' | 'historial' | 'crm' | 'preferencias'
```

---

## 📊 ESTRUCTURA DE CATEGORÍAS

```
┌─ Cotización (3 items)
│  ├── 📄 Información
│  ├── 📍 Cliente
│  └── 📧 Proveedor
│
├─ Oferta (6 items)
│  ├── 📦 Descripción
│  ├── 🎁 Servicios Base
│  ├── 🧩 Opcionales
│  ├── 💰 Financiero
│  ├── 📦 Paquetes
│  └── ⭐ Características
│
├─ Contenido (13 items)
│  ├── 📄 Resumen
│  ├── 📊 Análisis
│  ├── ⭐ Fortalezas
│  ├── ↔️ Comparativa
│  ├── 📅 Cronograma
│  ├── 💳 Cuotas
│  ├── 📋 Paquetes
│  ├── ⚠️ Notas
│  ├── 🚩 Conclusión
│  ├── ❓ FAQ
│  ├── 🛡️ Garantías
│  ├── 📞 Contacto
│  └── ⚖️ Términos
│
├─ Historial (1 item)
│  └── 📊 Versiones
│
├─ CRM ⭐ NUEVO (11 items)
│  ├── 📇 Clientes
│  ├── 👥 Contactos
│  ├── 📦 Productos
│  ├── 🎯 Oportunidades
│  ├── 💬 Interacciones
│  ├── 📊 Auditoría
│  ├── 💰 Pricing
│  ├── 📅 Suscripciones
│  ├── ✅ Cumplimiento
│  ├── ⚙️ Reglas
│  └── 📄 Plantillas
│
└─ Preferencias (8 items)
   ├── ⚙️ Configuración
   ├── 🔄 Sincronización
   ├── 👥 Usuarios
   ├── 🏢 Organizaciones
   ├── 🔒 Seguridad
   ├── 📋 Logs
   ├── 🛡️ Backups
   └── 📊 Reportes
```

**Total: 42 items en 6 categorías**

---

## 🎯 CARACTERÍSTICAS

### Sidebar Unificada

✅ **Expandible/Colapsable** - Categorías expandibles con animación  
✅ **Persistencia** - Recuerda qué categorías estaban expandidas  
✅ **Active State** - Indica visualmente la sección activa  
✅ **Tooltips** - Descripciones al pasar el mouse  
✅ **Badges** - Soporte para indicadores (cantidad de items)  
✅ **Animaciones** - Transiciones suaves con Framer Motion  
✅ **Accesibilidad** - Navegación por teclado  
✅ **Responsive** - Diseño adaptable (colapsable en mobile)  

### Integración CRM

✅ **11 Subsecciones** - Gestión completa de clientes  
✅ **Modelos de BD** - Account, Contact, Product, Opportunity, Interaction  
✅ **APIs** - Endpoints RESTful para CRUD  
✅ **Validaciones** - NIF/CIF/RUT, VIES, KYC  
✅ **Reportes** - Dashboard con KPIs  
✅ **Escalabilidad** - Fácil agregar más funcionalidades  

---

## 📁 ARCHIVOS MODIFICADOS/CREADOS

### Nuevo
- ✅ `src/features/admin/components/UnifiedAdminSidebar.tsx` - Sidebar principal

### A Modificar
- 📝 `src/app/admin/page.tsx` - Integrar nueva sidebar
- 📝 `src/features/admin/components/tabs/CotizacionTab.tsx` - Remover AdminSidebar local
- 📝 `src/features/admin/components/tabs/OfertaTab.tsx` - Remover AdminSidebar local
- 📝 `src/features/admin/components/tabs/ContenidoTab.tsx` - Remover AdminSidebar local
- 📝 `src/features/admin/components/tabs/PreferenciasTab.tsx` - Remover PreferenciasSidebar local

### A Crear (Fase CRM)
```
src/features/admin/components/tabs/
  └── CrmTab.tsx

src/features/admin/components/content/crm/
  ├── CrmSidebar.tsx (Deprecated - usar UnifiedAdminSidebar)
  ├── CrmContainer.tsx
  ├── sections/
  │   ├── ClientsSection.tsx
  │   ├── ContactsSection.tsx
  │   ├── ProductsSection.tsx
  │   ├── OpportunitiesSection.tsx
  │   ├── InteractionsSection.tsx
  │   ├── HistorySection.tsx
  │   ├── PricingSection.tsx
  │   ├── SubscriptionsSection.tsx
  │   ├── ComplianceSection.tsx
  │   ├── RulesSection.tsx
  │   └── PdfTemplatesSection.tsx
  └── modals/
      ├── ClientModal.tsx
      ├── ContactModal.tsx
      ├── ProductModal.tsx
      ├── OpportunityModal.tsx
      └── InteractionModal.tsx
```

---

## 🔄 FLUJO DE NAVEGACIÓN

```
admin/page.tsx
  │
  ├─ UnifiedAdminSidebar (Nueva)
  │  └─ onChange: (section: SidebarSection) => setActiveSection(section)
  │
  ├─ Tab dinámico basado en activeSection
  │  ├─ Si es cotizacion/*  → <CotizacionTab />
  │  ├─ Si es oferta/*      → <OfertaTab />
  │  ├─ Si es contenido/*   → <ContenidoTab />
  │  ├─ Si es historial/*   → <Historial />
  │  ├─ Si es crm/*         → <CrmTab /> (NUEVO)
  │  └─ Si es pref/*        → <PreferenciasTab />
  │
  └─ SidebarContainer
     ├─ Ancho: w-56
     ├─ Altura: h-full
     └─ Scroll: overflow-y-auto
```

---

## 🔌 INTEGRACIÓN CON admin/page.tsx

### Estructura Actual
```tsx
const [activeTab, setActiveTab] = useState<TabId>('analytics')
```

### Nueva Estructura
```tsx
const [activeTab, setActiveTab] = useState<TabId>('analytics' | 'cotizacion')
const [activeSection, setActiveSection] = useState<SidebarSection>('cot-info')
const [activeCategory, setActiveCategory] = useState<SidebarCategory>('cotizacion')

// Determinar si mostrar sidebar unificada
const showUnifiedSidebar = activeTab !== 'analytics'
```

### Render
```tsx
<div className="flex h-screen">
  {/* Sidebar unificada */}
  {showUnifiedSidebar && (
    <UnifiedAdminSidebar
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onCategoryChange={setActiveCategory}
    />
  )}

  {/* Contenido principal */}
  <div className="flex-1">
    {/* Tab principal */}
    {activeTab === 'cotizacion' && (
      <CotizacionTab activeSection={activeSection} {...props} />
    )}
    {activeTab === 'crm' && (
      <CrmTab activeSection={activeSection} {...props} />
    )}
    {/* ... resto de tabs */}
  </div>
</div>
```

---

## 🚀 FASES DE IMPLEMENTACIÓN

### FASE 1: Integración Sidebar Unificada (1-2 semanas)

**Objetivo:** Reemplazar sidebars locales por la sidebar unificada

**Tareas:**
1. Integrar `UnifiedAdminSidebar` en `admin/page.tsx`
2. Eliminar `AdminSidebar` de CotizacionTab
3. Eliminar `AdminSidebar` de OfertaTab
4. Eliminar `AdminSidebar` de ContenidoTab
5. Eliminar `PreferenciasSidebar` de PreferenciasTab
6. Pasar `activeSection` como prop a cada TAB
7. Tomar como activeTab lo que determina la categoría
8. Crear Zustand store para persistencia de sidebar (qué categorías están expandidas)

**Deliverables:**
- ✅ Sidebar unificada funcional
- ✅ Navegación completa entre secciones
- ✅ Persistencia de estado (categorías expandidas)
- ✅ Sin regresiones en funcionalidad

---

### FASE 2: Estructura CRM (2-3 semanas)

**Objetivo:** Crear framework de CRM en sidebar

**Tareas:**
1. Crear `CrmTab.tsx` como contenedor
2. Crear `CrmContainer.tsx` para routing dinámico
3. Crear carpeta `sections/` con placeholders
4. Crear carpeta `modals/` con placeholders
5. Actualizar `UnifiedAdminSidebar` para soportar badges dinámicos
6. Crear Zustand store para CRM state

**Deliverables:**
- ✅ CrmTab navegable
- ✅ Secciones renderizables
- ✅ Integración con sidebar unificada

---

### FASE 3: Modelos de BD CRM (2-3 semanas)

**Objetivo:** Crear modelos Prisma para CRM

**Tareas:**
1. Crear migración Prisma con modelos:
   - Account (Cliente)
   - Contact (Contacto)
   - Product (Producto)
   - Opportunity (Oportunidad)
   - Interaction (Interacción)
   - PriceList (Pricing)
   - Subscription (Suscripción)
   - ComplianceRecord (Cumplimiento)

2. Crear relaciones entre modelos
3. Crear seeders de datos
4. Crear índices para búsquedas

---

### FASE 4+: Implementación de Secciones (4-6 semanas)

**FASE 4:** CRUD de Clientes  
**FASE 5:** CRUD de Contactos  
**FASE 6:** Catálogo de Productos  
**FASE 7:** Pipeline de Oportunidades  
**FASE 8:** Interacciones y Auditoría  
**FASE 9:** Funciones Avanzadas (Pricing, Compliance, etc.)  

---

## 📝 CHECKLIST

### Sidebar Unificada
- [ ] Crear `UnifiedAdminSidebar.tsx`
- [ ] Integrar en `admin/page.tsx`
- [ ] Remover sidebars locales
- [ ] Crear Zustand store para estado
- [ ] Testear navegación completa
- [ ] Testear persistencia de estado
- [ ] Testear responsive

### CRM Foundation
- [ ] Crear `CrmTab.tsx`
- [ ] Crear `CrmContainer.tsx`
- [ ] Crear secciones con contenido placeholder
- [ ] Crear modales de CRUD placeholder
- [ ] Testear navegación CRM
- [ ] Documentar interfaces

### Base de Datos (Phase 2)
- [ ] Crear migración Prisma
- [ ] Validar esquema
- [ ] Crear seeders
- [ ] Documentar modelos
- [ ] Testear relaciones

---

## ✅ VALIDACIONES

### Sidebar
- ✅ Se expande/colapsa correctamente
- ✅ El item activo está resaltado
- ✅ Las categorías expandidas se recuerdan
- ✅ Navega a la sección correcta
- ✅ No hay regresiones en TABs actuales

### CRM
- ✅ Secciones renderizables
- ✅ Modales abribles
- ✅ Flujo de datos funcional
- ✅ Validaciones funcionan
- ✅ APIs responden correctamente

---

## 🎨 DISEÑO VISUAL

### Coherencia
✅ Colores GitHub Light Theme  
✅ Iconos Lucide React  
✅ Animaciones Framer Motion  
✅ Tipografía consistente  
✅ Espaciado uniforme  

### Accesibilidad
✅ Contraste suficiente  
✅ Navegación por teclado  
✅ ARIA labels  
✅ Tooltips descriptivos  

---

## 📞 SOPORTE Y REFERENCIA

**Documento de auditoría:** `docs/AUDITORÍA_CRM_GESTIÓN_CLIENTES.md`  
**Arquitectura CRM:** Secciones 5-7 del documento de auditoría  
**Componente sidebar:** `src/features/admin/components/UnifiedAdminSidebar.tsx`  

---

**Estado:** 🟢 LISTO PARA IMPLEMENTACIÓN  
**Próximo paso:** Integración en admin/page.tsx
