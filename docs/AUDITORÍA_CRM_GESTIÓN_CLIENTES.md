# 🔍 AUDITORÍA: Gestión Centralizada de Clientes y CRM
**Fecha:** 22 de Diciembre de 2025  
**Proyecto:** WebQuote - Sistema de Cotizaciones  
**Objetivo:** Evaluar coherencia de datos de clientes e implementar CRM centralizado

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Hallazgos de la Auditoría](#hallazgos-de-la-auditoría)
3. [Problemas Identificados](#problemas-identificados)
4. [Análisis Técnico](#análisis-técnico)
5. [Propuesta de Implementación](#propuesta-de-implementación)
6. [Arquitectura CRMTAB](#arquitectura-crmtab)
7. [Fases de Implementación](#fases-de-implementación)
8. [Roadmap y Cronograma](#roadmap-y-cronograma)

---

## 📊 RESUMEN EJECUTIVO

### Situación Actual ❌
El proyecto WebQuote **NO tiene un sistema CRM centralizado**. Los datos de clientes se definen manualmente en cada cotización sin persistencia entre ellas. Esta fragmentación causa:

- **Redundancia de datos:** Misma información ingresada múltiples veces
- **Inconsistencia:** Diferentes variaciones del mismo cliente en distintas cotizaciones
- **Ineficiencia:** No hay reutilización de datos de clientes previos
- **Escalabilidad limitada:** Difícil gestionar múltiples clientes y relaciones

### Solución Propuesta ✅
Implementar **CRMTAB** como módulo centralizado en `/admin` que:
- Almacene datos de clientes de forma persistente en Prisma
- Permita gestionar contactos, productos, servicios, oportunidades
- Facilite reutilización de datos entre cotizaciones
- Integre validaciones y reglas de negocio fiscales
- Proporcione vistas de historial e interacciones

---

## 🔎 HALLAZGOS DE LA AUDITORÍA

### 1. Estructura Actual del Proyecto

#### 1.1 Base de Datos (Prisma Schema)
**Modelos actuales relacionados con clientes:**

```
✅ User (con campos de cliente limitados)
   - nombre, empresa, telefono, email, avatarUrl

✅ Organization (modelo de jerarquía corporativa)
   - nombre, sector, descripcion, email, telefono, direccion, ciudad, pais
   - parentId (jerarquía), nivel (RAIZ, EMPRESA, DEPARTAMENTO, etc.)

✅ QuotationConfig (datos de cotización embebidos)
   - empresa, sector, ubicacion, emailCliente, whatsappCliente
   - profesional, empresaProveedor, emailProveedor, whatsappProveedor

❌ FALTA: Modelo Account/Cliente
❌ FALTA: Modelo Contact (contacto específico dentro de cliente)
❌ FALTA: Modelo Product (catálogo de productos)
❌ FALTA: Modelo Service (catálogo de servicios)
❌ FALTA: Modelo Opportunity (oportunidades de venta)
❌ FALTA: Modelo Interaction (historial de comunicaciones)
❌ FALTA: Modelo Subscription (suscripciones y servicios recurrentes)
❌ FALTA: Modelo ComplianceRecord (validaciones fiscales)
```

#### 1.2 Componentes UI Relacionados

**Admin/page.tsx:**
- `CotizacionTab` → Define cliente manualmente en cada cotización
- `Historial` → Muestra versiones pero no gestiona clientes centralizados
- `PreferenciasTab` → Preferencias de usuario, no gestión de clientes
- **VACÍO:** No existe TAB para gestión de clientes

**Estructura de archivos:**
```
src/app/admin/
  ├── page.tsx (MONOLITO 6,588 líneas)
  └── layout.tsx

src/features/admin/components/tabs/
  ├── CotizacionTab.tsx ✓ (edición de datos de cliente inline)
  ├── OfertaTab.tsx
  ├── ContenidoTab.tsx
  ├── Historial.tsx
  ├── PreferenciasTab.tsx
  └── PaqueteContenidoTab.tsx

src/features/admin/components/content/cotizacion/
  ├── ClienteContent.tsx ✓ (formulario cliente)
  ├── ProveedorContent.tsx
  └── CotizacionInfoContent.tsx
```

#### 1.3 Integración de Datos de Clientes en Cotización

**Actualmente, en `ClienteContent.tsx`:**
```tsx
// Campos editables SIN validación centralizada
- empresa (string)
- sector (string)
- ubicacion (string)
- emailCliente (string)
- whatsappCliente (string)

// Cada cotización guarda estos datos LOCALMENTE
// Sin conexión con otros clientes ni reutilización
```

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### Problema 1: Fragmentación de Datos de Clientes
**Severidad:** 🔴 CRÍTICA

**Síntomas:**
- Al crear cotización para "Urbanísima Constructora", los datos se guardan en `QuotationConfig.empresa`
- Si luego necesito cotizar a "Urbanísima Constructora" nuevamente, debo reingresar todos los datos
- No hay búsqueda por cliente existente
- No hay histórico de cotizaciones por cliente

**Impacto:**
- Duplicación de datos en BD
- Inconsistencia (p.ej., "Urbanísima" vs "URBANÍSIMA Constructora")
- Imposible generar reportes por cliente

---

### Problema 2: Falta de Centralización de Contactos
**Severidad:** 🔴 CRÍTICA

**Síntomas:**
- Cada cotización tiene UN contacto implícito (`emailCliente`, `whatsappCliente`)
- No hay distinción entre persona/empresa/departamento
- No hay roles (decisor, técnico, usuario final, etc.)
- No hay historial de comunicaciones

**Impacto:**
- No se puede gestionar múltiples contactos por cliente
- Pérdida de contexto de relaciones comerciales
- Imposible automatizar seguimiento

---

### Problema 3: Catálogo de Productos/Servicios No Centralizado
**Severidad:** 🟠 ALTA

**Síntomas:**
- Servicios base definidos manualmente en cada cotización (`serviciosBase` array)
- Servicios opcionales también definidos por cotización
- No hay reutilización de templates
- No hay validación de disponibilidad/stock

**Impacto:**
- Imposible mantener catálogo único
- Variaciones inconsistentes de precios entre cotizaciones
- Difícil cambiar precio de un servicio globalmente

---

### Problema 4: Sin Validaciones Fiscales Centralizadas
**Severidad:** 🟠 ALTA

**Síntomas:**
- No hay validación de NIF/CIF/RUT
- No se detectan clientes intracomunitarios
- No hay cálculo de impuestos por jurisdicción
- No se registra información para facturación electrónica

**Impacto:**
- Riesgo de incumplimiento fiscal
- Imposible generar facturas electrónicas automáticamente
- Falta de auditoría de cumplimiento

---

### Problema 5: Falta de Oportunidades y Pipeline
**Severidad:** 🟡 MEDIA

**Síntomas:**
- No hay modelo de oportunidades de venta
- No se puede clasificar el estado del prospecto
- No hay probabilidad de cierre ni valor esperado
- Imposible generar reportes de pipeline/forecast

**Impacto:**
- Sin visibilidad de ventas en proceso
- Difícil administración de cartera comercial

---

### Problema 6: Sin Historial de Interacciones
**Severidad:** 🟡 MEDIA

**Síntomas:**
- No hay registro centralizado de emails, llamadas, reuniones
- No hay notas de relación con cliente
- No hay tracking de actividades de seguimiento

**Impacto:**
- Pérdida de contexto de relaciones
- Imposible auditar comunicaciones
- Falta de historial para nuevos integrantes del equipo

---

## 🔬 ANÁLISIS TÉCNICO

### 1. Estructura Actual de QuotationConfig

```prisma
model QuotationConfig {
  // ✅ Datos que PODRÍAN apuntar a un cliente centralizado
  empresa: String @default("")           // ← Debería ser: accountId
  sector: String @default("")            // ← Debería estar en Account
  ubicacion: String @default("")         // ← Debería estar en Account
  emailCliente: String @default("")      // ← Debería estar en Contact
  whatsappCliente: String @default("")   // ← Debería estar en Contact
  
  // ✅ Datos del proveedor (nosotros, QUIEN COTIZA)
  profesional: String @default("")       // ← Usuario responsable
  empresaProveedor: String @default("")  // ← Nuestra empresa
  ubicacionProveedor: String @default("")
  emailProveedor: String @default("")
  whatsappProveedor: String @default("")
  
  // ✅ Relaciones existentes
  User? @relation(...)                   // Usuario que gestiona esta cot.
  Organization? @relation(...)           // Organización jerarquía
  
  // ❌ FALTAN: Relaciones con cliente centralizado
}
```

### 2. Campos Que Necesitan Centralización

| Campo Actual | Modelo Destino | Tipo |
|---|---|---|
| `empresa` | `Account.legalName` | Cliente |
| `sector` | `Account.sector` | Cliente |
| `ubicacion` | `Account.address` | Cliente |
| `emailCliente` | `Contact.email` | Contacto |
| `whatsappCliente` | `Contact.phone` | Contacto |
| `serviciosBase[]` | `Product` + `Service` | Catálogo |
| servicios opcionales | `Product` + `Service` | Catálogo |

### 3. Modelos Nuevos Requeridos

#### Account (Cliente)
```prisma
model Account {
  id String @id @default(cuid())
  
  // Identificación
  legalName String        // Razón social
  commercialName String?  // Nombre comercial
  taxId String?           // NIF/CIF/RUT (único por país)
  type: AccountType       // EMPRESA, INDIVIDUAL, PROSPECT
  
  // Datos de Contacto
  email String?
  phone String?
  website String?
  
  // Dirección
  address String?
  city String?
  state String?
  zipCode String?
  country String?
  
  // Negocio
  sector String?          // Industria
  size String?            // Tamaño (STARTUP, SME, ENTERPRISE)
  status: AccountStatus   // PROSPECT, LEAD, ACTIVE, INACTIVE
  
  // Crédito y Términos
  creditLimit Decimal?
  paymentTerms String?    // Net30, Net60, etc.
  
  // Fiscalidad
  viesVerified Boolean @default(false)   // Intracomunitario validado
  complianceNotes String?
  
  // Relaciones
  contacts Contact[]
  quotations QuotationConfig[]
  opportunities Opportunity[]
  interactions Interaction[]
  invoices Invoice[]
  
  // Auditoría
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
}

enum AccountType { EMPRESA, INDIVIDUAL, PROSPECT }
enum AccountStatus { PROSPECT, LEAD, ACTIVE, INACTIVE, ARCHIVED }
```

#### Contact (Contacto)
```prisma
model Contact {
  id String @id @default(cuid())
  
  accountId String
  account Account @relation(fields: [accountId], references: [id], onDelete: Cascade)
  
  // Información Personal
  fullName String
  title String?           // Cargo: CEO, Desarrollador, etc.
  role: ContactRole       // DECISION_MAKER, INFLUENCER, USER, TECHNICAL
  
  // Contacto
  email String?           // Email personal
  phone String?
  mobile String?
  preferredContact: ContactPreference  // EMAIL, PHONE, WHATSAPP
  
  // Preferencias
  language String @default("es")
  timezone String?
  preferredContactHours String?
  
  // Relaciones
  quotations QuotationConfig[]
  interactions Interaction[]
  
  // Auditoría
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum ContactRole { DECISION_MAKER, INFLUENCER, USER, TECHNICAL }
enum ContactPreference { EMAIL, PHONE, WHATSAPP, SMS }
```

#### Product & Service (Catálogo)
```prisma
model Product {
  id String @id @default(cuid())
  
  name String              // "Hosting Cloud"
  sku String @unique       // Código único
  type: ProductType        // PRODUCT, SERVICE, LICENSE, SUBSCRIPTION
  category String          // Familia/Categoría
  
  description String?
  
  // Precios
  listPrice Decimal       // Precio de lista
  costPrice Decimal       // Costo para margen
  
  // Disponibilidad
  available Boolean @default(true)
  stock Int?              // NULL = ilimitado
  leadTimeDays Int?       // Días de entrega/implementación
  
  // Impuestos
  taxCategory String?     // Para cálculo de IVA
  appliesTax Boolean @default(true)
  
  // Frecuencia (para servicios)
  billingFrequency: BillingFrequency? // MONTHLY, ANNUAL, ONE_TIME
  
  quotelines QuoteLineItem[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum ProductType { PRODUCT, SERVICE, LICENSE, SUBSCRIPTION }
enum BillingFrequency { MONTHLY, QUARTERLY, ANNUAL, ONE_TIME }
```

#### Opportunity (Oportunidad)
```prisma
model Opportunity {
  id String @id @default(cuid())
  
  accountId String
  account Account @relation(fields: [accountId], references: [id])
  
  name String
  stage: OpportunitySt stage  // PROSPECT, QUALIFIED, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST
  probability Int @default(0) // 0-100
  
  estimatedValue Decimal?
  expectedCloseDate DateTime?
  
  quotations QuotationConfig[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Interaction (Interacción)
```prisma
model Interaction {
  id String @id @default(cuid())
  
  accountId String
  account Account @relation(fields: [accountId], references: [id], onDelete: Cascade)
  
  contactId String?
  contact Contact? @relation(fields: [contactId], references: [id], onDelete: SetNull)
  
  type: InteractionType    // EMAIL, CALL, MEETING, NOTE
  subject String?
  description String
  
  // Para emails
  messageId String?        // ID del email si está integrado
  
  // Asignación
  assignedTo String?       // User ID
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum InteractionType { EMAIL, CALL, MEETING, NOTE, DOCUMENT }
```

---

## 💡 PROPUESTA DE IMPLEMENTACIÓN

### Visión General

Crear **CRMTAB** como un módulo completo en `/admin/page.tsx` que funcione como:

```
┌─────────────────────────────────────────────────┐
│           ADMIN PAGE (/admin)                   │
├─────────────────────────────────────────────────┤
│  [Analytics] [CRM] [Cotización] [...]           │ ← TABs principales
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  CRM TAB                                │   │
│  ├─────────────────────────────────────────┤   │
│  │ Sidebar:                                │   │
│  │ • 📇 Clientes (Accounts)               │   │
│  │ • 👥 Contactos                         │   │
│  │ • 📦 Productos & Servicios             │   │
│  │ • 🎯 Oportunidades                     │   │
│  │ • 💬 Interacciones                     │   │
│  │ • 📊 Historial                         │   │
│  │ • 💰 Pricing Avanzado                  │   │
│  │ • 📅 Suscripciones                     │   │
│  │ • ✅ Cumplimiento Fiscal               │   │
│  │ • ⚙️ Validaciones                      │   │
│  │ • 📄 Plantillas PDF                    │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Contenido Principal (dinámico)         │   │
│  │  Basado en selección del Sidebar        │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🏗️ ARQUITECTURA CRMTAB

### 1. Estructura de Archivos

```
src/features/admin/components/
  ├── tabs/
  │   ├── CrmTab.tsx                    ← NUEVO: Contenedor principal
  │   ├── (otros TABs existentes)
  │   └── index.ts
  │
  └── content/
      └── crm/                           ← NUEVO: Módulo CRM
          ├── CrmSidebar.tsx             ← NUEVO: Navegación lateral
          ├── CrmContainer.tsx           ← NUEVO: Orquestador
          │
          ├── sections/                  ← NUEVO
          │   ├── ClientsSection.tsx     ← Gestión de cuentas
          │   ├── ContactsSection.tsx    ← Gestión de contactos
          │   ├── ProductsSection.tsx    ← Catálogo
          │   ├── OpportunitiesSection.tsx ← Pipeline
          │   ├── InteractionsSection.tsx ← Historial
          │   ├── HistorySection.tsx     ← Auditoría
          │   ├── PricingSection.tsx     ← Pricing avanzado
          │   ├── SubscriptionsSection.tsx ← Servicios recurrentes
          │   ├── ComplianceSection.tsx  ← Validaciones fiscales
          │   ├── RulesSection.tsx       ← Reglas de negocio
          │   ├── PdfTemplatesSection.tsx ← Plantillas
          │   └── index.ts
          │
          └── modals/                    ← NUEVO
              ├── ClientModal.tsx        ← CRUD cliente
              ├── ContactModal.tsx       ← CRUD contacto
              ├── ProductModal.tsx       ← CRUD producto
              ├── OpportunityModal.tsx   ← CRUD oportunidad
              ├── InteractionModal.tsx   ← Registrar interacción
              └── index.ts
```

### 2. Componente CrmTab (Contenedor)

```tsx
// src/features/admin/components/tabs/CrmTab.tsx

interface CrmTabProps {
  // Props del admin page
}

export default function CrmTab({}: CrmTabProps) {
  const [activeSection, setActiveSection] = useState<CrmSection>('clients')
  const [selectedClient, setSelectedClient] = useState<Account | null>(null)
  
  return (
    <div className="flex h-full gap-4">
      {/* Sidebar de navegación */}
      <CrmSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      {/* Contenido principal dinámico */}
      <CrmContainer
        activeSection={activeSection}
        selectedClient={selectedClient}
        onClientSelect={setSelectedClient}
      />
    </div>
  )
}
```

### 3. Sidebar Navigation

```tsx
// src/features/admin/components/content/crm/CrmSidebar.tsx

const CRM_SECTIONS = [
  { id: 'clients', label: '📇 Clientes', icon: Building2 },
  { id: 'contacts', label: '👥 Contactos', icon: Users },
  { id: 'products', label: '📦 Productos', icon: Package },
  { id: 'opportunities', label: '🎯 Oportunidades', icon: Target },
  { id: 'interactions', label: '💬 Interacciones', icon: MessageCircle },
  { id: 'history', label: '📊 Historial', icon: BarChart3 },
  { id: 'pricing', label: '💰 Pricing', icon: DollarSign },
  { id: 'subscriptions', label: '📅 Suscripciones', icon: Calendar },
  { id: 'compliance', label: '✅ Cumplimiento', icon: CheckCircle2 },
  { id: 'rules', label: '⚙️ Reglas', icon: Settings },
  { id: 'templates', label: '📄 Plantillas PDF', icon: FileText },
]

export default function CrmSidebar({ activeSection, onSectionChange }) {
  return (
    <aside className="w-56 bg-gh-bg-secondary border-r border-gh-border/30 p-4">
      <h2 className="text-sm font-bold text-gh-text mb-4">CRM Menu</h2>
      <nav className="space-y-2">
        {CRM_SECTIONS.map(section => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-gh-accent text-white'
                : 'text-gh-text hover:bg-gh-bg-tertiary'
            }`}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
```

### 4. Contenedor Dinámico

```tsx
// src/features/admin/components/content/crm/CrmContainer.tsx

export default function CrmContainer({ 
  activeSection, 
  selectedClient, 
  onClientSelect 
}) {
  const renderContent = () => {
    switch (activeSection) {
      case 'clients':
        return <ClientsSection onSelect={onClientSelect} />
      case 'contacts':
        return <ContactsSection selectedClient={selectedClient} />
      case 'products':
        return <ProductsSection />
      case 'opportunities':
        return <OpportunitiesSection selectedClient={selectedClient} />
      case 'interactions':
        return <InteractionsSection selectedClient={selectedClient} />
      case 'history':
        return <HistorySection selectedClient={selectedClient} />
      case 'pricing':
        return <PricingSection />
      case 'subscriptions':
        return <SubscriptionsSection />
      case 'compliance':
        return <ComplianceSection selectedClient={selectedClient} />
      case 'rules':
        return <RulesSection />
      case 'templates':
        return <PdfTemplatesSection />
      default:
        return <div>Selecciona una sección</div>
    }
  }
  
  return (
    <div className="flex-1 overflow-auto">
      {renderContent()}
    </div>
  )
}
```

### 5. Secciones Principales

#### 5.1 Clientes (Accounts)

```tsx
// src/features/admin/components/content/crm/sections/ClientsSection.tsx

Features:
- Tabla listado de clientes (Account)
- Buscar por nombre, NIF, email, ciudad
- Filtros: tipo (empresa/particular), estado (activo/inactivo)
- CRUD: Crear, Editar, Eliminar cliente
- Vista detalle: Información completa del cliente
- Acciones rápidas: Ver contactos, Ver oportunidades, Ver cotizaciones
- Datos mostrados:
  * Nombre legal + comercial
  * NIF/CIF/RUT (con validación VIES si aplica)
  * Sector / Tamaño
  * Email / Teléfono / Website
  * Dirección completa
  * Crédito límite
  * Estado (Prospect/Lead/Activo/Inactivo)
  * Última interacción
  * Cantidad de cotizaciones
  * Cantidad de contactos
```

#### 5.2 Contactos

```tsx
// src/features/admin/components/content/crm/sections/ContactsSection.tsx

Features (si hay cliente seleccionado):
- Tabla de contactos del cliente
- Campos: Nombre, Cargo, Email, Teléfono, Rol
- CRUD: Agregar, Editar, Eliminar contacto
- Marcar como contacto principal
- Preferencia de comunicación (email/tel/whatsapp)
- Horarios de contacto preferidos

Features (vista general):
- Todos los contactos de todos los clientes
- Buscar por nombre, email, cargo
- Filtrar por rol (decisor, técnico, usuario, etc.)
```

#### 5.3 Productos & Servicios

```tsx
// src/features/admin/components/content/crm/sections/ProductsSection.tsx

Features:
- Tabla de productos/servicios
- Campos: SKU, Nombre, Tipo, Categoría, Precio Venta, Precio Costo, Stock
- CRUD: Crear, Editar, Eliminar producto
- Importar desde Excel
- Gestionar categorías
- Frecuencia de facturación (si es servicio)
- Lead time / Plazo de entrega
- Configuración de impuestos por jurisdicción

Este es el CATÁLOGO CENTRALIZADO que se usa al crear cotizaciones,
en lugar de ingresar datos manualmente.
```

#### 5.4 Oportunidades

```tsx
// src/features/admin/components/content/crm/sections/OpportunitiesSection.tsx

Features (si hay cliente seleccionado):
- Tabla de oportunidades del cliente
- Campos: Nombre, Etapa, Probabilidad, Valor Estimado, Fecha Cierre
- CRUD: Crear, Editar, Eliminar oportunidad
- Etapas: PROSPECT → QUALIFIED → PROPOSAL → NEGOTIATION → CLOSED_WON/LOST
- Arrastrar para cambiar etapa (Kanban style, opcional)
- Vincular cotización a oportunidad
- Ver historial de cambios de etapa

Features (vista general):
- Pipeline visual (Kanban): columnas por etapa
- Suma de valores por etapa
- Forecast de ingresos
```

#### 5.5 Interacciones / Historial

```tsx
// src/features/admin/components/content/crm/sections/InteractionsSection.tsx

Features (si hay cliente seleccionado):
- Timeline de todas las interacciones del cliente
- Tipos: Email, Llamada, Reunión, Nota, Documento
- Crear nueva interacción (diálogo modal)
- Buscar por tipo, fecha, usuario
- Ver detalles y archivos adjuntos
- Asociar con contacto específico si aplica

Cada interacción registra:
- Tipo y fecha/hora
- Descripción/Notas
- Participantes (usuario nuestro + contacto)
- Archivos adjuntos
- Resultado/Siguiente paso
```

#### 5.6 Historial & Auditoría

```tsx
// src/features/admin/components/content/crm/sections/HistorySection.tsx

Features:
- Tabla con cambios realizados al cliente
- Quién, qué, cuándo
- Versiones anteriores
- Auditoría de cambios de estado
- Exportar reporte de historial

Campos registrados:
- Cambios de información (comparación antes/después)
- Cambios de estado de oportunidades
- Cambios de calificación crediticia
- Cambios de términos de pago
```

#### 5.7 Pricing Avanzado

```tsx
// src/features/admin/components/content/crm/sections/PricingSection.tsx

Features:
- Listas de precios por cliente/grupo
- Descuentos por volumen (tramos)
- Descuentos por campaña
- Reglas de autorización (quién aprueba descuentos > X%)
- Histórico de cambios de precios
- Precios especiales por cliente

Permite:
- Crear lista de precios personalizada
- Vincular a cliente o grupo de clientes
- Validar descuentos antes de cotizar
```

#### 5.8 Suscripciones & Servicios Recurrentes

```tsx
// src/features/admin/components/content/crm/sections/SubscriptionsSection.tsx

Features (si hay cliente seleccionado):
- Tabla de suscripciones activas
- Ciclo de facturación, fecha renovación
- Renovación automática (sí/no)
- Penalizaciones de cancelación
- Estadísticas: MRR (Monthly Recurring Revenue)

Permite:
- Crear suscripción
- Pausar/Reanudar
- Cambiar ciclo
- Cancelar con notificación
```

#### 5.9 Cumplimiento Fiscal

```tsx
// src/features/admin/components/content/crm/sections/ComplianceSection.tsx

Features (si hay cliente seleccionado):
- Validación de NIF/CIF/RUT (por país)
- Verificación VIES (si es intracomunitario)
- Estado de KYC (Know Your Customer)
- Documentos requeridos (contrato, factura, etc.)
- Registro de consentimiento RGPD
- Historial de incidencias de cumplimiento

Campos:
- NIF válido ✓/✗
- Intracomunitario (VIES) ✓/✗
- Requiere retención (sí/no, por país)
- Categoría fiscal (empresa/individual/exenta)
- Últimas fechas de verificación
```

#### 5.10 Validaciones & Reglas de Negocio

```tsx
// src/features/admin/components/content/crm/sections/RulesSection.tsx

Features:
- Configurar umbrales de descuento por rol
- Limites de crédito automáticos
- Validación de datos requeridos
- Reglas de cambio de estado
- Alertas automáticas (vencimiento, inactividad, etc.)
- Aprobaciones por monto

Ejemplo:
- Vendedor: máx 10% descuento
- Manager: máx 25% descuento
- Director: sin límite
- Si descuento > X → Requiere aprobación

(Similar al sistema de aprobaciones de cotizaciones existente)
```

#### 5.11 Plantillas PDF

```tsx
// src/features/admin/components/content/crm/sections/PdfTemplatesSection.tsx

Features:
- Gestionar plantillas de cotización por idioma/país
- Vista previa de plantilla
- Campos disponibles (nombre cliente, productos, precios, etc.)
- Subir logo/assets personalizados
- Historial de cambios en plantilla
- Probar generación de PDF

Permite:
- Crear nuevas plantillas
- Editar existentes (CSS, layout)
- Duplicar plantillas
- Establecer plantilla predeterminada por país/cliente
```

---

## 📅 FASES DE IMPLEMENTACIÓN

### FASE 1: Modelos de BD (1-2 semanas)
**Objetivo:** Crear estructura de datos centralizada

**Tareas:**
1. Crear migración Prisma con nuevos modelos:
   - Account (Cliente)
   - Contact (Contacto)
   - Product (Producto/Servicio)
   - Opportunity (Oportunidad)
   - Interaction (Interacción)

2. Crear seeders de datos de prueba

3. Crear índices para búsquedas rápidas

4. Documentar relaciones y restricciones

**Deliverables:**
- [ ] Migración Prisma ejecutada
- [ ] BD poblada con datos de prueba
- [ ] Documentación de esquema

---

### FASE 2: Componentes Base (2-3 semanas)
**Objetivo:** Crear estructura UI y navegación

**Tareas:**
1. Crear `CrmTab.tsx` como contenedor principal
2. Crear `CrmSidebar.tsx` con navegación
3. Crear `CrmContainer.tsx` como orquestador
4. Crear componentes de secciones vacíos (placeholders)
5. Integrar CrmTab en admin/page.tsx entre Analytics y Cotización

**Deliverables:**
- [ ] CrmTab funcional con navegación
- [ ] Sidebar interactivo
- [ ] Transiciones suaves entre secciones
- [ ] Estado persistente en store (Zustand)

---

### FASE 3: CRUD de Clientes (2-3 semanas)
**Objetivo:** Gestión completa de cuentas

**Tareas:**
1. Crear API endpoints:
   - `GET /api/crm/accounts` (listar con filtros)
   - `GET /api/crm/accounts/:id` (detalle)
   - `POST /api/crm/accounts` (crear)
   - `PUT /api/crm/accounts/:id` (editar)
   - `DELETE /api/crm/accounts/:id` (eliminar)

2. Crear `ClientsSection.tsx` con:
   - Tabla listado
   - Búsqueda y filtros
   - Modal crear/editar
   - Vista detalle

3. Integrar validación de NIF/CIF/RUT

4. Validación VIES para intracomunitarios (Opcional en fase inicial)

**Deliverables:**
- [ ] CRUD funcional de cuentas
- [ ] Tabla con búsqueda
- [ ] Modal de creación/edición
- [ ] API endpoints documentada

---

### FASE 4: CRUD de Contactos (1-2 semanas)
**Objetivo:** Gestión de contactos personales

**Tareas:**
1. Crear API endpoints similar a accounts
2. Crear `ContactsSection.tsx` con:
   - Tabla listado (filtrado por cliente si aplica)
   - Crear contacto vinculado a cliente
   - Marcar como principal
   - Preferencias de comunicación

**Deliverables:**
- [ ] CRUD funcional de contactos
- [ ] Vinculación con clientes
- [ ] Preferencias de contacto

---

### FASE 5: Catálogo de Productos (2 semanas)
**Objetivo:** Productos/Servicios centralizados

**Tareas:**
1. Crear API endpoints para productos
2. Crear `ProductsSection.tsx` con:
   - Tabla de productos
   - CRUD
   - Importar desde Excel (Optional)
   - Categorías
   - Validación de precios

3. Integrar con Cotización:
   - Al crear cotización, ofrecer "Usar productos del catálogo" vs "Crear manual"
   - Autocompletar precios desde catálogo

**Deliverables:**
- [ ] Catálogo funcional
- [ ] Integración con CotizacionTab
- [ ] Búsqueda y filtros

---

### FASE 6: Oportunidades & Pipeline (2 semanas)
**Objetivo:** Gestión de ventas y pipeline

**Tareas:**
1. Crear API endpoints
2. Crear `OpportunitiesSection.tsx` con:
   - Vista Kanban (etapas: prospect, qualified, proposal, etc.)
   - CRUD de oportunidades
   - Vincular cotización
   - Forecast de ingresos

**Deliverables:**
- [ ] Pipeline visual funcional
- [ ] CRUD de oportunidades
- [ ] Reporte de forecast

---

### FASE 7: Interacciones & Historial (2 semanas)
**Objetivo:** Auditoría y registro de comunicaciones

**Tareas:**
1. Crear API endpoints
2. Crear `InteractionsSection.tsx` con:
   - Timeline de interacciones
   - Crear interacción (email, llamada, reunión, nota)
   - Buscar y filtrar
   - Exportar historial

3. Crear `HistorySection.tsx` con:
   - Tabla de cambios
   - Quién, qué, cuándo
   - Comparación de versiones

**Deliverables:**
- [ ] Timeline funcional
- [ ] Crear interacciones
- [ ] Auditoría de cambios

---

### FASE 8: Pricing, Suscripciones y Compliance (2-3 semanas)
**Objetivo:** Funciones avanzadas

**Tareas:**
1. `PricingSection.tsx`:
   - Listas de precios
   - Descuentos por volumen
   - Autorización de descuentos

2. `SubscriptionsSection.tsx`:
   - Gestionar suscripciones
   - Ciclos de facturación
   - MRR tracking

3. `ComplianceSection.tsx`:
   - Validación fiscal
   - KYC
   - Auditoría de cumplimiento

4. `RulesSection.tsx`:
   - Configuración de reglas
   - Umbrales de descuento
   - Alertas automáticas

5. `PdfTemplatesSection.tsx`:
   - Gestionar plantillas
   - Previsualizar
   - Vincular a cliente

**Deliverables:**
- [ ] Pricing avanzado
- [ ] Gestión de suscripciones
- [ ] Validaciones fiscales
- [ ] Plantillas PDF

---

### FASE 9: Integración con CotizacionTab (1-2 semanas)
**Objetivo:** Unificar flujo de cotización con CRM

**Tareas:**
1. Modificar `CotizacionTab.tsx`:
   - Agregar selector de cliente existente
   - Autocompletar datos desde Account/Contact seleccionado
   - Ofrecer productos del catálogo
   - Vincular con oportunidad (opcional)

2. Crear flujo integrado:
   - Usuario va a CRM → Selecciona cliente
   - → Crea nueva cotización desde cliente
   - → Se autocompletan datos
   - → Se sugieren productos del catálogo

**Deliverables:**
- [ ] CotizacionTab integrada con CRM
- [ ] Flujo simplificado
- [ ] Autocompletar datos

---

### FASE 10: Reportes y Dashboards (1-2 semanas)
**Objetivo:** Análisis y KPIs

**Tareas:**
1. Crear reportes:
   - Clientes por estado
   - Valor total de oportunidades por etapa
   - MRR por servicio
   - Clientes inactivos

2. Integrar con Analytics existente (si aplica)

3. Exportar a Excel

**Deliverables:**
- [ ] Reportes funcionales
- [ ] Dashboards visuales
- [ ] Exportación a Excel

---

### FASE 11: Testing & Optimización (1-2 semanas)
**Objetivo:** Calidad y rendimiento

**Tareas:**
1. Tests unitarios y E2E
2. Validación de performance
3. Documentación de usuario
4. Training del equipo

**Deliverables:**
- [ ] Tests cobertura > 80%
- [ ] Performance optimizado
- [ ] Documentación completa

---

## 🗓️ ROADMAP Y CRONOGRAMA

### Timeline Estimado

```
┌─ FASE 1: Modelos BD (Semanas 1-2)
│
├─ FASE 2: Componentes Base (Semanas 3-5)
│
├─ FASE 3: CRUD Clientes (Semanas 5-7)
│
├─ FASE 4: CRUD Contactos (Semanas 7-9)
│
├─ FASE 5: Catálogo Productos (Semanas 9-11)
│
├─ FASE 6: Oportunidades (Semanas 11-13)
│
├─ FASE 7: Interacciones (Semanas 13-15)
│
├─ FASE 8: Funciones Avanzadas (Semanas 15-18)
│
├─ FASE 9: Integración (Semanas 18-20)
│
├─ FASE 10: Reportes (Semanas 20-22)
│
└─ FASE 11: Testing (Semanas 22-24)

Total: ~6 meses (5-7 developer weeks equivalentes)
Esfuerzo: 1 full-time developer + reviews
```

### Priorización

**MVP (Mínimo Viable Product) - Fases 1-4:**
- Modelos de BD
- Estructura UI
- CRUD de Clientes
- CRUD de Contactos

**Primera Iteración - Fases 5-6:**
- Catálogo de Productos
- Oportunidades & Pipeline

**Mejoras - Fases 7+:**
- Interacciones, Compliance, Reportes

---

## 📊 INTEGRACIÓN CON ARQUITECTURA EXISTENTE

### Ubicación en admin/page.tsx

```tsx
// Línea ~3636 (actual)
const pageTabs: TabItem[] = [
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <LineChart className="w-4 h-4" />,
    content: <AnalyticsDashboard ... />,
    hasChanges: false,
  },
  
  // ✅ NUEVO
  {
    id: 'crm',
    label: 'CRM',
    icon: <Users className="w-4 h-4" />,
    content: <CrmTab ... />,
    hasChanges: crmHasChanges,
  },
  
  {
    id: 'cotizacion',
    label: `Cotización${...}`,
    icon: <FileText className="w-4 h-4" />,
    content: <CotizacionTab ... />,
    hasChanges: ...,
  },
  
  // ... resto de TABs
]
```

### Estado Global con Zustand

Crear nuevo store:
```tsx
// src/stores/crmStore.ts

interface CrmStore {
  // Secciones
  activeCrmSection: 'clients' | 'contacts' | 'products' | ...
  setActiveCrmSection: (section) => void
  
  // Datos
  clients: Account[]
  contacts: Contact[]
  products: Product[]
  
  // UI
  selectedClient: Account | null
  selectedContact: Contact | null
  showClientModal: boolean
  
  // Loading
  loading: boolean
  error: string | null
  
  // Actions
  loadClients: () => Promise<void>
  createClient: (data) => Promise<void>
  // ... etc
}

export const useCrmStore = create<CrmStore>(...)
```

### APIs Requeridas

```
GET  /api/crm/accounts              # Listar clientes
GET  /api/crm/accounts/:id          # Detalle cliente
POST /api/crm/accounts              # Crear cliente
PUT  /api/crm/accounts/:id          # Actualizar cliente
DELETE /api/crm/accounts/:id        # Eliminar cliente

GET  /api/crm/contacts              # Listar contactos
POST /api/crm/contacts              # Crear contacto
PUT  /api/crm/contacts/:id          # Actualizar
DELETE /api/crm/contacts/:id        # Eliminar

GET  /api/crm/products              # Listar productos
POST /api/crm/products              # Crear
PUT  /api/crm/products/:id          # Actualizar
DELETE /api/crm/products/:id        # Eliminar

GET  /api/crm/opportunities         # Pipeline
POST /api/crm/opportunities         # Crear oportunidad
PUT  /api/crm/opportunities/:id     # Actualizar

GET  /api/crm/interactions          # Timeline
POST /api/crm/interactions          # Crear interacción

GET  /api/crm/accounts/:id/history  # Auditoría
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] BD: Crear migración Prisma
- [ ] BD: Crear seeders
- [ ] UI: CrmTab base
- [ ] UI: CrmSidebar
- [ ] UI: CrmContainer
- [ ] API: Endpoints CRUD Accounts
- [ ] API: Endpoints CRUD Contacts
- [ ] API: Endpoints CRUD Products
- [ ] API: Endpoints CRUD Opportunities
- [ ] API: Endpoints CRUD Interactions
- [ ] Integración: CotizacionTab + CRM
- [ ] Validaciones: NIF/CIF
- [ ] Reportes: Dashboard básico
- [ ] Tests: Cobertura > 80%
- [ ] Docs: Guía de usuario
- [ ] Docs: Guía técnica de desarrollador

---

## 📝 CONCLUSIÓN

La auditoría ha identificado que **WebQuote carece de un sistema CRM centralizado**. Sin embargo, la arquitectura base (Zustand stores, componentes modulares, schema Prisma flexible) permite implementar CRMTAB como un módulo extensible.

**La solución propuesta:**
1. ✅ Soluciona la fragmentación de datos
2. ✅ Proporciona gestión completa de clientes
3. ✅ Integra validaciones fiscales
4. ✅ Habilita reportes y análisis
5. ✅ Mejora la experiencia de usuario

**Próximos pasos:**
1. **Aprobación** de esta propuesta
2. **Planificación** de sprint (FASE 1-2)
3. **Desarrollo** iterativo (6 meses)
4. **Validación** con usuarios
5. **Go-Live** de CRM

---

**Documento preparado por:** GitHub Copilot  
**Última actualización:** 22 de Diciembre de 2025  
**Estado:** 🟡 PROPUESTA PARA REVISIÓN
