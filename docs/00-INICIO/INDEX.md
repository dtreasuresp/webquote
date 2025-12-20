# 📁 ESTRUCTURA DEL PROYECTO - WEBQUOTE

## 🎯 Descripción General

**WebQuote** es una aplicación Next.js 14+ para gestionar propuestas de cotización con capacidades offline, sincronización en tiempo real y análisis de datos.

**Branch:** `feature/oferta-sidebar-navigation`  
**Status:** 🟢 En desarrollo activo  
**Última actualización:** 30 de noviembre de 2025

---

## 📂 Estructura de Directorios

### Raíz del Proyecto

```
webquote/
├── 📄 Archivos de Configuración (EN RAÍZ - Requeridos por Next.js)
│  ├── next.config.js               # Configuración de Next.js
│  ├── tailwind.config.js           # Configuración de Tailwind CSS
│  ├── postcss.config.js            # Configuración de PostCSS
│  ├── tsconfig.json                # Configuración de TypeScript
│  ├── .eslintrc.json               # Configuración de ESLint
│  ├── package.json                 # Dependencias del proyecto
│  └── .npmrc                       # Configuración de NPM
│
├── 🔧 Archivos de Entorno (git-ignored)
│  ├── .env                         # Variables de entorno
│  ├── .env.local                   # Variables locales
│  ├── .env.vercel                  # Variables de Vercel
│  └── .vercelignore                # Archivos ignorados
│
├── 📚 Documentación Principal
│  ├── README.md                    # Introducción y guía de inicio
│  ├── CODE_OF_CONDUCT.md           # Código de conducta
│  ├── LICENSE                      # Licencia del proyecto
│  └── CONTRIBUTING.md              # Guía de contribución
│
├── 📁 Directorios Principales
│  ├── src/                         # ⭐ CÓDIGO FUENTE
│  ├── docs/                        # 📖 DOCUMENTACIÓN DEL PROYECTO
│  ├── prisma/                      # 🗄️ BD Y MIGRACIONES
│  ├── public/                      # 🖼️ ARCHIVOS PÚBLICOS
│  ├── tests/                       # ✅ TESTS Y PRUEBAS
│  ├── scripts/                     # 🚀 SCRIPTS DE UTILIDAD
│  ├── scripts-util/                # 🛠️ SCRIPTS DE VALIDACIÓN
│  ├── netlify/                     # 🌐 CONFIGURACIÓN NETLIFY
│  ├── .github/                     # 👨‍💼 CONFIGURACIÓN GITHUB
│  ├── node_modules/                # 📦 DEPENDENCIAS (git-ignored)
│  ├── .next/                       # 🔨 BUILD (git-ignored)
│  └── .vercel/                     # ☁️ VERCEL (git-ignored)
│
└── 🔧 Despliegue
   ├── netlify.toml                # Configuración de Netlify
   └── vercel.json                 # Configuración de Vercel
```

---

## 🔴 CÓDIGO FUENTE - `/src`

```
src/
├── app/                              # 📱 App Router de Next.js 14+
│  ├── administrador/
│  │  ├── page.tsx                    # 🎛️ Panel Admin Principal (4267 líneas)
│  │  └── layout.tsx                  # Layout del admin
│  ├── layout.tsx                     # Layout raíz
│  ├── page.tsx                       # Página de inicio
│  └── api/                           # ✅ API Routes
│     └── quotation-config/           # API para cotizaciones
│
├── components/                       # 🧩 COMPONENTES REUTILIZABLES
│  ├── layout/
│  │  ├── Navigation.tsx              # Barra de navegación
│  │  ├── TabsModal.tsx               # Modal genérico
│  │  ├── Toast.tsx                   # Sistema de notificaciones
│  │  └── ...
│  └── ...
│
├── features/                         # 🎯 FEATURES POR DOMINIO
│  └── admin/                         # Feature: Panel Administrativo
│     ├── components/
│     │  ├── tabs/                    # Todos los tabs del panel
│     │  │  ├── CotizacionTab.tsx
│     │  │  ├── OfertaTab.tsx
│     │  │  ├── AnalyticsTab.tsx      # ✨ Tab de Analytics
│     │  │  └── ...
│     │  ├── AnalyticsDashboard.tsx   # 📊 Dashboard de analytics
│     │  ├── SyncStatusIndicator.tsx  # ✨ Indicador de sincronización
│     │  └── DialogoGenerico.tsx      # ✨ Modal de conflictos
│     ├── hooks/
│     │  ├── useLoadingPhase.ts       # ✨ Estados visuales (CORREGIDO)
│     │  ├── useConnectionRecovery.ts # ✨ Detección reconexión
│     │  └── ...
│     ├── contexts/
│     │  └── AnalyticsContext.ts      # Contexto de analytics
│     └── ...
│
├── hooks/                            # ⚙️ HOOKS GLOBALES
│  ├── useQuotationCache.ts           # ✨ Gestión caché offline
│  ├── useOfflineStatus.ts            # ✨ Detecta online/offline
│  └── ...
│
├── lib/                              # 📚 UTILIDADES Y CORE
│  ├── cache/                         # 💾 SISTEMA DE CACHÉ
│  │  ├── index.ts                    # Entrada principal
│  │  ├── quotationCache.ts           # Gestión de caché
│  │  ├── syncManager.ts              # Gestor sincronización
│  │  └── types.ts                    # Tipos del sistema
│  ├── types/                         # 📝 TIPOS GLOBALES
│  ├── utils/                         # 🛠️ UTILIDADES
│  │  ├── validation.ts
│  │  ├── discountCalculator.ts
│  │  └── ...
│  └── ...
│
├── styles/                           # 🎨 ESTILOS GLOBALES
│  └── globals.css
│
└── img/                              # 🖼️ IMÁGENES
```

---

## 📖 DOCUMENTACIÓN - `/docs`

```
docs/
├── INDEX.md                          # ← Estás aquí
├── README.md                         # Documentación general
├── project-docs/                     # 📋 Documentación del Proyecto
│  ├── BEFORE_AFTER_CÓDIGO.md
│  ├── DETALLES_REFACTORIZACIÓN_PAGE.md
│  ├── EXPLICACION_ANALYTICS_EVENTS.md
│  ├── REFACTORIZACIÓN_PAGE.md
│  └── PENDIENTE_AHORA.md
│
├── reports/                          # 📊 Reportes y Validaciones
│  ├── PRUEBAS_FINAL_REPORT.md        # ✅ Reporte final (24/24 tests)
│  ├── SYSTEM_VALIDATION_OFFLINE_SYNC.md
│  └── PRUEBAS_RESUMEN_VISUAL.txt
│
├── phases/                           # 🚀 Documentación de Fases
│  ├── PHASE_7_DELIVERY_SUMMARY.md
│  ├── PHASE_11_ADVANCED_VALIDATION.md
│  ├── PHASE_12_SNAPSHOT_IMPROVEMENTS.md
│  ├── PHASE_14_PERFORMANCE_OPTIMIZATION.md
│  ├── PHASE_15_TESTING_PLAN.md
│  ├── PLAN_PHASES_11-15.md
│  └── RESUMEN_IMPLEMENTACION_FASES_11_15.md
│
├── architecture/                     # 🏗️ Arquitectura
│  ├── ARCHITECTURE_CURRENT_STATE.md
│  ├── ADMIN_PANEL_DESIGN_SYSTEM.md
│  ├── ANALYTICS_ARQUITECTURA.md
│  └── ...
│
├── audits/                           # ✓ Auditorías
│  ├── AUDITORIA_FASE_10_COMPLETA.md
│  ├── CHECKLIST_FINAL_FASES_11_15.md
│  └── CHECKLIST_PHASE_10_COMPLETITUD.md
│
├── propuestas/                       # 💼 Propuestas Comerciales
│  ├── PROPUESTA_COMERCIAL_2025_FINAL.md
│  ├── PROPUESTA_2025_Version1.md
│  └── _PROPUESTA_FINAL_URBANISMA_CONSTRUCTORA_2025_v1.md
│
├── deployment/                       # 🌐 Guides de Despliegue
│  ├── NETLIFY_DEPLOY.md
│  ├── VERCEL_DEPLOY.md
│  └── SNAPSHOTS_REFRESH_IMPLEMENTATION.md
│
├── especificaciones/                 # 📋 Especificaciones
├── refactorizacion/                  # 🔄 Documentación Refactorización
├── sessions/                         # 📝 Registros de Sesiones
└── testing/                          # ✅ Testing
```

---

## 🗄️ BASE DE DATOS - `/prisma`

```
prisma/
├── schema.prisma                     # 📋 Esquema principal de BD
├── seed.ts                           # 🌱 Script de seeding
├── migrate-payment-options.ts        # 📊 Migración opciones de pago
├── migrate-servicios-base.ts         # 📊 Migración servicios base
├── backups/                          # 💾 Copias de seguridad
└── migrations/                       # 📜 Historial de migraciones
```

---

## 🛠️ SCRIPTS Y UTILIDADES

### `/scripts` - Scripts del Proyecto
```
scripts/
├── backup-and-migrate.ts             # Backup + migración
├── backup-data.js                    # Backup de datos
├── backup-sql.js                     # Backup SQL
├── build-and-migrate.sh              # Build + migración
├── check-contenido.js                # Verificación de contenido
├── diagnose-db.ts                    # Diagnóstico de BD
├── fix-relationships.ts              # Reparación de relaciones
├── restore-data.ts                   # Restauración de datos
├── test-neon.js                      # Test de Neon
└── test-prisma.js                    # Test de Prisma
```

### `/scripts-util` - Scripts de Validación
```
scripts-util/
└── validation-script.js              # ✅ Script de validación (24 tests)
```

---

## ✅ TESTS - `/tests`

```
tests/
└── offline-sync.test.ts              # ✅ Tests offline→online
```

---

## 📱 RECURSOS PÚBLICOS - `/public`

```
public/
└── img/                              # Imágenes y assets estáticos
```

---

## 🌐 DESPLIEGUE

### Netlify
```
netlify/
└── functions/                        # Funciones serverless
```
**Config:** `netlify.toml` (en raíz)

### Vercel
**Config:** `vercel.json` (en raíz)

---

## 🔑 ARCHIVOS CRÍTICOS EN RAÍZ

| Archivo | Propósito | ⚠️ |
|---------|-----------|---|
| `package.json` | Dependencias NPM | Esencial |
| `next.config.js` | Configuración Next.js | ⚠️ NO MOVER |
| `tsconfig.json` | Configuración TypeScript | ⚠️ NO MOVER |
| `tailwind.config.js` | Configuración Tailwind | ⚠️ NO MOVER |
| `.eslintrc.json` | Configuración ESLint | ⚠️ NO MOVER |
| `postcss.config.js` | Configuración PostCSS | ⚠️ NO MOVER |
| `.env.local` | Variables de entorno | 🔐 Secreto |
| `README.md` | Guía del proyecto | Documentación |
| `LICENSE` | Licencia | Legal |

⚠️ = Estos archivos DEBEN estar en raíz para que Next.js/Tools los encuentren

---

## ✨ SISTEMA OFFLINE→ONLINE

### Componentes Clave

**Hooks (Sistema Offline):**
- `useQuotationCache.ts` - Gestión de caché con verificación offline
- `useOfflineStatus.ts` - Detecta estado online/offline en tiempo real
- **`useLoadingPhase.ts`** - ✅ CORREGIDO - Mapea estado a fases visuales
- `useConnectionRecovery.ts` - Detecta reconexión offline→online y compara datos

**Componentes:**
- `SyncStatusIndicator.tsx` - Indicador visual en esquina superior
- `DialogoGenerico.tsx` - Modal de resolución de conflictos

**Estados Visuales:**
- 🟢 Sincronizado (online)
- 📦 Datos del caché (offline)
- 🔄 Sincronizando
- ⚠️ Error

**Resolución de Conflictos:**
- 📦 **Usar Caché** - Mantener datos locales
- 🔄 **Usar BD** - Reemplazar con datos del servidor
- ✨ **Fusionar** - Combinar datos inteligentemente

---

## 🔧 ESTADO DEL DESARROLLO

### ✅ Completado
- Hydration errors - RESUELTO
- Visual loading sequence - IMPLEMENTADO
- Analytics styling - UNIFORMIZADO
- Offline→Online system - COMPLETO
- Tests (24/24) - TODOS PASANDO
- **useLoadingPhase.ts - CORREGIDO** (30/11/2025)
- Organización de archivos - COMPLETA

### 🔴 CRÍTICO RESUELTO
**Problema:** 500 error en `/administrador`  
**Causa:** Syntax error en `useLoadingPhase.ts` (duplicate dependency array)  
**Solución:** ✅ CORREGIDO  
**Status:** Ready to test

### ⏳ En Progreso
- Verificación de compilación
- Testing del sistema completo

---

## 🚀 CÓMO NAVEGAR

### Para Entender la Arquitectura
1. Lee: `/src/app/administrador/page.tsx` (controlador principal)
2. Lee: `/src/features/admin/` (dominio de admin)
3. Lee: `/src/lib/cache/` (sistema de caché)

### Para Probar Offline
```bash
npm run dev
# Abre: http://localhost:3000/administrador
# DevTools → Network → Offline
# Edita datos y experimenta
```

### Para Ver Tests
```bash
node scripts-util/validation-script.js
# Lee: docs/reports/PRUEBAS_FINAL_REPORT.md
```

### Para Contribuir
1. Lee: `CONTRIBUTING.md`
2. Lee: `CODE_OF_CONDUCT.md`
3. Revisa: `docs/project-docs/`

---

## 📊 ESTADÍSTICAS

- **Líneas de Código:** ~15,000+
- **Hooks Custom:** 10+
- **Componentes:** 30+
- **Tests Pasando:** 24/24 ✅
- **Tipos TypeScript:** 50+
- **Branch Actual:** `feature/oferta-sidebar-navigation`

---

## 📝 Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Frontend:** React 18+ con TypeScript
- **Styling:** Tailwind CSS + temas personalizados
- **BD:** Prisma ORM + PostgreSQL (Neon)
- **Cache:** localStorage + IndexedDB
- **Offline:** Sistema híbrido localStorage→online sync
- **Despliegue:** Vercel + Netlify (redundancia)

---

## 🎓 Recursos Rápidos

- [Fases de Desarrollo](./phases/) - Roadmap del proyecto
- [Reportes](./reports/) - Estado y validaciones
- [Arquitectura](./architecture/) - Diseño técnico
- [Auditorías](./audits/) - Verificaciones
- [Propuestas](./propuestas/) - Contexto comercial

---

**✅ Status Actual:** Sistema offline→online implementado y validado  
**⏰ Actualización:** 30 de noviembre de 2025  
**🔀 Branch:** `feature/oferta-sidebar-navigation`
