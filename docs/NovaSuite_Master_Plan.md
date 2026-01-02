# 🚀 NovaSuite Master Plan: Reestructuración Modular y Refinamiento UI/UX

**Fecha:** 30 de diciembre de 2025  
**Versión:** 1.0  
**Estado:** Propuesta de Implementación  
**Proyecto:** NovaSuite (WebQuote Evolution)

---

## 1. Visión General
Este documento detalla la transformación de WebQuote en **NovaSuite**, un ecosistema ERP/SaaS modular. La reestructuración abarca una renovación visual profunda (estilo profesional, minimalista y con efectos de transparencia) y una reorganización funcional en módulos independientes y escalables.

---

## 2. Refinamiento UI/UX (NovaStyle)

### 2.1. Transparencias y Efectos Visuales
- **Fondo Global:** Se eliminará el fondo sólido `#0d1117` de los contenedores de las TAB para permitir que el fondo de la página administrativa sea visible.
- **Efecto Blur (Glassmorphism):**
  - **Navbar:** Fondo semi-transparente con `backdrop-blur-md`.
  - **Sidebar Unificado:** Fondo semi-transparente con `backdrop-blur-md`.
- **Coherencia Visual:** Aplicación de estos efectos en todos los módulos, incluyendo el actual `CRMTAB`.

### 2.2. Navegación y Header
- **Header Minimalista:** Refactorización del encabezado de la página admin para un diseño más profesional.
  - Eliminación del botón "Volver".
  - Estandarización de botones y tipografía.
- **Breadcrumbs en Navbar:** Los breadcrumbs se moverán al Navbar principal.
  - Serán interactivos (clicables).
  - Sincronización total con la URL y el estado de navegación.
- **Sidebars Colapsables:** Todos los sidebars internos de las TAB (Cotización, Oferta, Contenido, Preferencias, etc.) adoptarán el comportamiento colapsable del `CrmSidebar`.

---

## 3. Arquitectura Modular (NovaModules)

Se reorganizará el contenido actual y se crearán las bases para los nuevos módulos. Cada módulo tendrá su propia sección en el Sidebar Unificado.

### 3.1. Mapeo de Componentes Existentes
| Módulo Nuevo | Submódulo | Componente Actual (Origen) |
|--------------|-----------|----------------------------|
| **CRM** | Contactos | `ContactsSection.tsx` |
| **CRM** | Oportunidades | `OpportunitiesSection.tsx` |
| **CRM** | Actividades | `InteractionsSection.tsx` |
| **CRM** | Historial | `HistorySection.tsx` |
| **Sales** | Cotizaciones | `QuotesSection.tsx` |
| **Sales** | Facturación | `InvoicesSection.tsx` |
| **Inventory** | Productos | `ProductsSection.tsx` |
| **Settings** | Reglas | `RulesSection.tsx` |
| **Settings** | Plantillas | `TemplatesSection.tsx` |

### 3.2. Nuevos Módulos a Implementar
1.  **Analytics:** Nueva sección principal en el sidebar.
2.  **Finance:** Cuentas por cobrar/pagar, impuestos, contabilidad.
3.  **People (RRHH):** Gestión de empleados, nómina, asistencia.
4.  **Projects:** Proyectos, tareas, recursos.
5.  **POS:** Punto de venta, caja rápida.
6.  **eCommerce:** Gestión de tiendas, catálogo online, pasarelas.
7.  **Licensing (SaaS):** Suscripciones, planes, control de módulos.

---

## 4. Estructura de Archivos Propuesta

Para mantener el orden y evitar archivos "regados", se seguirá la siguiente estructura:

```
src/
  features/
    crm/
      components/
      hooks/
      services/
    sales/
      components/
      ...
    inventory/
    finance/
    people/
    projects/
    pos/
    ecommerce/
    licensing/
    admin/ (Componentes compartidos del panel)
```

---

## 5. Plan de Implementación (Fases)

### Fase 1: Estética y Layout (NovaStyle)
- [ ] Implementar efectos de blur en Navbar y Sidebar Unificado.
- [ ] Hacer transparentes los fondos de las TAB.
- [ ] Refactorizar el Header (eliminar "Volver", minimalismo).
- [ ] Mover Breadcrumbs al Navbar y asegurar interactividad.

### Fase 2: Sidebars Colapsables
- [ ] Refactorizar `PreferenciasSidebar`, `CotizacionSidebar`, etc., para que sean colapsables.
- [ ] Estandarizar el estado de colapso en un store global o local según convenga.

### Fase 3: Reestructuración Modular (NovaModules)
- [ ] Crear las nuevas categorías en `UnifiedAdminSidebar`.
- [ ] Mover componentes de `crm/sections` a sus respectivos nuevos módulos.
- [ ] Crear placeholders para los nuevos submódulos solicitados.
- [ ] Integrar la sección de **Analytics** en el sidebar.

### Fase 4: Licensing y eCommerce (SaaS Core)
- [ ] Implementar la lógica base de `Licensing` para control de acceso a módulos.
- [ ] Crear la estructura de `eCommerce` para gestión multi-tienda.

---

## 6. Consideraciones Técnicas
- **Zustand:** Se utilizarán stores para manejar el estado de cada módulo de forma global.
- **Import/Export:** Todos los componentes se diseñarán para ser reutilizables.
- **Coherencia:** Se respetarán estrictamente los colores de la marca, tamaños de fuente y estilos de botones definidos en el sistema de diseño.

---

**Aprobado por:** [Usuario]  
**Responsable:** GitHub Copilot (Gemini 3 Flash)
