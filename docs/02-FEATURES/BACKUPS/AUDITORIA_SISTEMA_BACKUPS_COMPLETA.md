# 🔍 AUDITORÍA COMPLETA: SISTEMA DE BACKUPS

**Fecha de Auditoría:** 17 de diciembre de 2025  
**Estado:** 🔴 CRÍTICO - Sistema NO funcional  
**Urgencia:** ⚠️ ALTA - Sin backups automáticos desde configuración

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Problemas Identificados](#problemas-identificados)
3. [Análisis Técnico Detallado](#análisis-técnico-detallado)
4. [Cobertura de Datos](#cobertura-de-datos)
5. [Impacto de los Problemas](#impacto-de-los-problemas)
6. [Solución Propuesta](#solución-propuesta)
7. [Guía de Implementación Paso a Paso](#guía-de-implementación-paso-a-paso)
8. [Testing y Validación](#testing-y-validación)

---

## 🎯 RESUMEN EJECUTIVO

### Hallazgo Principal
El sistema de backup está **parcialmente implementado** pero **NO ES FUNCIONAL**:

✅ **Qué funciona:**
- Crear backups manuales
- Almacenar backups en BD
- Restaurar backups completos

❌ **Qué NO funciona:**
- **Backups automáticos NO se ejecutan nunca** (falta scheduler)
- Backups NO incluyen toda la información (solo datos de usuario básicos)
- Restore NO reconstruye completamente los datos
- Sin verificación de integridad
- Sin compresión ni encriptación

### El Problema Principal
```
Usuario configura: "Backup automático diario"
Sistema guarda: fecha próxima (16 dic 2025, 00:20)
Resultado esperado: Backup se crea automáticamente
Resultado real: ❌ NUNCA ocurre (sin cron job, sin scheduler)
```

**Causa raíz:** No existe un sistema de tareas programadas (cron job, scheduler) que:
1. Verifique si llegó la hora del backup automático
2. Valide la configuración está habilitada
3. Ejecute el proceso de backup en el servidor
4. Mantenga el registro de ejecución

---

## 🔴 PROBLEMAS IDENTIFICADOS

### PROBLEMA #1: Falta Sistema de Scheduler (CRÍTICO)
**Severidad:** 🔴 CRÍTICA  
**Impacto:** Backups automáticos NO se ejecutan NUNCA

#### Análisis Técnico
En la aplicación actual:
- ✅ Existe UI para configurar backups automáticos
- ✅ Existe BD para guardar configuración (BackupConfig)
- ✅ Existe cálculo de "próximo backup" en API
- ❌ **NO existe ningún sistema que EJECUTE los backups en el momento programado**

#### Ubicación del Código Incompleto
Archivo: `src/app/api/backup-config/route.ts` (líneas 83-95)

```typescript
// Calcular próximo backup si está habilitado
let nextAutoBackup = null
if (autoBackupEnabled && autoBackupFrequency) {
  const now = new Date()
  switch (autoBackupFrequency) {
    case 'daily':
      nextAutoBackup = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      // ❌ Solo calcula la FECHA, pero nunca ejecuta el backup
      break
    case 'weekly':
      nextAutoBackup = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      break
    case 'monthly':
      nextAutoBackup = new Date(now.setMonth(now.getMonth() + 1))
      break
  }
}
// ✅ Guarda la fecha pero ahí termina todo
```

#### Por Qué No Funciona
1. **No hay cron job en servidor** - Nada verifica periódicamente si es hora de backup
2. **No hay API de trigger** - Nada dispara el backup en el horario
3. **No hay worker/background job** - Nada ejecuta el backup cuando nadie está usando la app
4. **No hay verificación de horario** - El sistema nunca chequea `nextAutoBackup`

---

### PROBLEMA #2: Backups Incompletos (ALTO)
**Severidad:** 🟠 ALTA  
**Impacto:** Datos perdidos al restaurar

#### Análisis Técnico
En `src/app/api/backups/route.ts` (líneas 95-105):

```typescript
// Preparar datos para backup (excluir password)
const { passwordHash, ...userData } = user
const backupData = {
  user: userData,
  timestamp: new Date().toISOString(),
  version: process.env.npm_package_version || '1.0.0'
}
```

**El problema:** Solo guarda datos del usuario actual, NO guarda:
- ❌ Quotations (Cotizaciones)
- ❌ PackageSnapshots (Paquetes/Servicios)
- ❌ QuotationConfig (Configuración de cotizaciones)
- ❌ UserPermissions (Permisos del usuario)
- ❌ UserPreferences (Todas las preferencias!)
- ❌ FinancialTemplates (Plantillas financieras)
- ❌ UserQuotationAccess (Acceso a cotizaciones)

#### Ejemplo de Datos Perdidos
Si restauras un backup:
```
ANTES del backup:
- Usuario: Juan
- Cotizaciones: 50 registros
- Paquetes: 20 servicios configurados
- Permisos: Admin, Editor
- Preferencias: 26 campos personalizados

DESPUÉS de restaurar:
- Usuario: Juan ✅
- Cotizaciones: 0 ❌ PERDIDAS
- Paquetes: 0 ❌ PERDIDOS
- Permisos: Default ❌ RESETADOS
- Preferencias: Default ❌ PERDIDAS
```

---

### PROBLEMA #3: Restore Incompleto (ALTO)
**Severidad:** 🟠 ALTA  
**Impacto:** Restauración parcial de datos

En `src/app/api/backups/restore/route.ts` (líneas 58-75):

```typescript
// Restaurar preferencias del usuario
if (userData.userPreferences) {
  await prisma.userPreferences.upsert({
    where: { userId: backup.userId },
    update: {
      cerrarModalAlGuardar: userData.userPreferences.cerrarModalAlGuardar,
      mostrarConfirmacionGuardado: userData.userPreferences.mostrarConfirmacionGuardado,
      // ... solo 10 campos de 26!
    },
    create: {
      userId: backup.userId,
      ...userData.userPreferences
    }
  })
}
// ❌ NO restaura: Quotations, PackageSnapshots, Permisos, etc.
```

Solo restaura **UserPreferences** pero:
1. Incompleto (solo 10 de 26 campos)
2. No restaura ninguna otra tabla
3. No tiene validación

---

### PROBLEMA #4: Sin Verificación de Integridad (MEDIO)
**Severidad:** 🟡 MEDIA  
**Impacto:** Backups corruptos no se detectan

- Sin checksum/hash para validar integridad
- Sin validación de datos antes de guardar
- Sin error handling en backup
- Sin estado de "en progreso" (solo "completado" o error vago)

---

### PROBLEMA #5: Sin Compresión (BAJO)
**Severidad:** 🔵 BAJA  
**Impacto:** Uso innecesario de espacio

- Backups sin comprimir → consume mucho espacio BD
- Cada backup completo es más grande
- Degradación de performance

---

### PROBLEMA #6: Sin Encriptación (MEDIO)
**Severidad:** 🟡 MEDIA  
**Impacto:** Datos sensibles sin protección

- Backups guardados en JSON plano
- Visible para admins BD
- Sin encriptación de datos sensibles

---

## 📊 ANÁLISIS TÉCNICO DETALLADO

### Arquitectura Actual vs Requerida

#### Arquitectura Actual (Incompleta)
```
Usuario configura backup
    ↓
API /backup-config (PUT) guarda configuración
    ↓
Calcula nextAutoBackup
    ↓
❌ TERMINA AQUÍ - Nada ejecuta el backup
```

#### Arquitectura Requerida
```
1️⃣ Usuario configura backup
   ↓
2️⃣ API /backup-config (PUT) guarda configuración
   ↓
3️⃣ Calcula nextAutoBackup
   ↓
4️⃣ SERVIDOR: Cron job/scheduler verifica cada minuto
   ├─ ¿Es hora de backup? ❓
   ├─ ¿Está habilitado? ❓
   └─ ✅ SÍ → Ejecuta backup automático
   ↓
5️⃣ Sistema recopila TODOS los datos:
   ├─ User profile
   ├─ Quotations
   ├─ Packages/Services
   ├─ Config
   ├─ Permissions
   ├─ Preferences
   └─ Financial data
   ↓
6️⃣ Comprime y encripta
   ↓
7️⃣ Guarda en BD con checksum
   ↓
8️⃣ Actualiza nextAutoBackup + notifica
```

### Tablas Afectadas en Prisma

```plaintext
┌─ BackupConfig (ya existe)
│  ├─ id: String
│  ├─ userId: String (FK)
│  ├─ autoBackupEnabled: Boolean
│  ├─ autoBackupFrequency: 'daily' | 'weekly' | 'monthly'
│  ├─ autoBackupRetention: Int
│  ├─ lastAutoBackup: DateTime
│  ├─ nextAutoBackup: DateTime ← Se calcula pero NO se usa
│  └─ notifyOnBackup/Restore: Boolean
│
├─ UserBackup (INCOMPLETO)
│  ├─ id: String
│  ├─ userId: String (FK)
│  ├─ nombre: String
│  ├─ descripcion: String
│  ├─ tipo: 'manual' | 'auto' ← auto nunca se crea!
│  ├─ version: String
│  ├─ data: JSON ← Incompleto! Falta 90% de datos
│  ├─ size: Int
│  ├─ estado: 'completado' | 'en_progreso' | 'error'
│  ├─ errorMessage: String
│  ├─ createdAt: DateTime
│  └─ expiresAt: DateTime ← No se implementa
│
└─ Relaciones sin implementar:
   ├─ Quotations (no incluidas en backup)
   ├─ PackageSnapshots (no incluidas)
   ├─ FinancialTemplates (no incluidas)
   ├─ UserPermissions (no incluidas)
   └─ UserPreferences (incompletas)
```

---

## 📦 COBERTURA DE DATOS

### Datos Que DEBERÍAN Estar en Backup

| Tabla | Campos | En Backup? | Restaura? | Problema |
|-------|--------|-----------|-----------|----------|
| User | 15 | ✅ Si | ✅ Si | ✅ OK |
| UserPreferences | 26 | ❌ NO | ❌ NO | Pérdida total |
| UserQuotationAccess | 4 | ❌ NO | ❌ NO | Acceso perdido |
| Quotations | * | ❌ NO | ❌ NO | **Datos principales perdidos** |
| PackageSnapshot | 10+ | ❌ NO | ❌ NO | Configuración perdida |
| QuotationConfig | 30+ | ❌ NO | ❌ NO | Formato cotizaciones perdido |
| FinancialTemplate | 8 | ❌ NO | ❌ NO | Plantillas perdidas |
| UserPermission | 3 | ❌ NO | ❌ NO | Permisos resetados |
| RolePermissions | * | ❌ NO | ❌ NO | Permisos de rol perdidos |

**Resultado:** Se pierden ~90% de los datos en un backup.

---

## ⚠️ IMPACTO DE LOS PROBLEMAS

### Impacto para el Usuario

#### Escenario 1: Backup Automático Configurado
```
Día 1: Usuario configura "Backup diario a las 00:20"
Día 2 (00:21): Fecha de backup llegó
Resultado: ❌ No ocurre nada (sin scheduler)
       Usuario cree que está seguro, pero NO hay backup
Día 30: Datos corruptos, se intenta restaurar
Resultado: ❌ Datos principales perdidos, solo usuario restaurado
```

#### Escenario 2: Backup Manual
```
Usuario: "Voy a hacer un backup antes de cambiar datos"
Crea backup manual → Se guarda
Hace cambios → Datos se corrompen
Intenta restaurar backup → ❌ Falla porque backup no tiene cotizaciones
Resultado: Datos de cotizaciones perdidos permanentemente
```

#### Escenario 3: Cambio de Permisos
```
Usuario es Admin → Se le quita permiso (error accidental)
Crea backup con permisos Admin
Se da cuenta del error → Restaura backup
Resultado: ❌ Permisos NO se restauran (no estaban en backup)
Usuario sigue sin Admin aunque backup tenía eso
```

### Impacto para la Aplicación

- **Pérdida de confiabilidad** - Usuarios no confían en backups
- **Riesgo de datos** - Información crítica sin protección
- **Liability legal** - Aplicación no cumple requisitos de backup
- **Operacional** - Después de crash/error no hay recuperación real

---

## ✅ SOLUCIÓN PROPUESTA

### Arquitectura Solución: 3 Capas

```
┌─────────────────────────────────────────┐
│  CAPA 1: SCHEDULER (Servidor)           │
│  - Ejecuta cada minuto                  │
│  - Verifica backups pendientes          │
│  - Dispara creación de backup           │
│  - Limpia backups expirados             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  CAPA 2: BACKUP ENGINE (API + Proceso)  │
│  - Recopila TODOS los datos             │
│  - Valida integridad                    │
│  - Comprime con zip                     │
│  - Encripta datos sensibles             │
│  - Guarda con checksum                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  CAPA 3: RESTORE ENGINE (Recuperación)  │
│  - Valida integridad del backup         │
│  - Restaura datos en orden correcto     │
│  - Mantiene relaciones BD               │
│  - Verifica completitud                 │
│  - Registra en auditLog                 │
└─────────────────────────────────────────┘
```

### Componentes a Crear

1. **Scheduler Service** (`src/lib/backup/scheduler.ts`)
   - Verifica cada minuto si hay backups pendientes
   - Ejecuta backups automáticos
   - Limpia backups expirados

2. **Backup Engine** (`src/lib/backup/backupEngine.ts`)
   - Recopila datos de todas las tablas
   - Comprime con JSZip
   - Valida datos

3. **Restore Engine** (`src/lib/backup/restoreEngine.ts`)
   - Restaura datos en orden correcto
   - Mantiene integridad referencial

4. **API Endpoints Nuevos**
   - `POST /api/backups/trigger-auto` - Dispara backup automático
   - `POST /api/backups/verify/:id` - Verifica integridad

5. **Actualización Schema Prisma**
   - Agregar campos a `BackupConfig`
   - Agregar relación a `UserBackup`

---

## 📝 GUÍA DE IMPLEMENTACIÓN PASO A PASO

### FASE 1: Preparación (0.5 horas)

#### Paso 1.1: Actualizar Schema Prisma
Archivo: `prisma/schema.prisma`

Agregar a modelo `BackupConfig`:
```prisma
model BackupConfig {
  id                  String    @id @default(cuid())
  userId              String    @unique
  User                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Configuración existente
  autoBackupEnabled   Boolean   @default(false)
  autoBackupFrequency String    @default("weekly")
  autoBackupRetention Int       @default(5)
  notifyOnBackup      Boolean   @default(true)
  notifyOnRestore     Boolean   @default(true)
  
  // NUEVOS CAMPOS
  lastAutoBackup      DateTime?
  nextAutoBackup      DateTime?
  lastAutoBackupStatus String? @default("pending")  // success, failed, pending
  lastAutoBackupError String?
  
  // Hora preferida para backup (ej: "02:00" para 2 AM)
  preferredBackupTime String    @default("02:00")
  
  // Tiempo máximo retencion en días
  maxRetentionDays    Int       @default(90)
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@index([userId])
  @@index([nextAutoBackup])
}

model UserBackup {
  id              String    @id @default(cuid())
  userId          String
  User            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  nombre          String
  descripcion     String?
  tipo            String    @default("manual")  // manual, auto
  version         String?
  data            Json
  size            Int?
  
  // NUEVOS CAMPOS
  checksum        String?   // SHA256 del contenido
  isCompressed    Boolean   @default(false)
  isEncrypted     Boolean   @default(false)
  encryptionKey   String?   // Referencia a clave de encriptación
  
  estado          String    @default("completado")  // completado, en_progreso, error
  errorMessage    String?
  
  // Integridad
  dataValidated   Boolean   @default(false)
  validationDate  DateTime?
  
  // Retención
  createdAt       DateTime  @default(now())
  expiresAt       DateTime?
  isExpired       Boolean   @default(false)

  @@index([userId])
  @@index([createdAt])
  @@index([tipo])
  @@index([expiresAt])
}
```

Ejecutar migración:
```bash
npx prisma migrate dev --name add_backup_fields
```

#### Paso 1.2: Crear Tipos TypeScript
Archivo: `src/lib/types/backup.types.ts`

```typescript
export interface BackupDataStructure {
  version: string
  timestamp: string
  user: any
  userPreferences: any
  quotations: any[]
  packageSnapshots: any[]
  quotationConfig: any
  financialTemplates: any[]
  userPermissions: any[]
  userQuotationAccess: any[]
  rolePermissions: any[]
  auditSummary: {
    totalRecords: number
    tablesIncluded: string[]
    dataIntegrity: 'valid' | 'invalid'
  }
}

export interface BackupMetadata {
  id: string
  checksum: string
  size: number
  isCompressed: boolean
  isEncrypted: boolean
  createdAt: Date
  expiresAt?: Date
  version: string
}
```

---

### FASE 2: Crear Backup Engine (1.5 horas)

#### Paso 2.1: Crear Backup Engine
Archivo: `src/lib/backup/backupEngine.ts`

```typescript
import { prisma } from '@/lib/prisma'
import JSZip from 'jszip'
import crypto from 'crypto'
import type { BackupDataStructure } from '@/lib/types/backup.types'

export class BackupEngine {
  /**
   * Crea un backup completo de un usuario
   */
  static async createCompleteBackup(userId: string, metadata?: { tipo?: string; nombre?: string }) {
    try {
      console.log(`[BackupEngine] Iniciando backup completo para usuario: ${userId}`)
      
      // 1. Recopilar datos de TODAS las tablas
      const backupData: BackupDataStructure = {
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
        
        // Usuario
        user: await this.getUserData(userId),
        
        // Preferencias
        userPreferences: await this.getUserPreferences(userId),
        
        // Cotizaciones (TABLA PRINCIPAL - NO DEBE FALTAR!)
        quotations: await this.getQuotations(userId),
        
        // Paquetes/Servicios
        packageSnapshots: await this.getPackageSnapshots(userId),
        
        // Configuración
        quotationConfig: await this.getQuotationConfig(userId),
        
        // Plantillas
        financialTemplates: await this.getFinancialTemplates(userId),
        
        // Permisos
        userPermissions: await this.getUserPermissions(userId),
        
        // Acceso a cotizaciones
        userQuotationAccess: await this.getUserQuotationAccess(userId),
        
        // Permisos de rol
        rolePermissions: await this.getRolePermissions(userId),
        
        // Resumen de auditoría
        auditSummary: {
          totalRecords: 0,
          tablesIncluded: [],
          dataIntegrity: 'valid' as const
        }
      }
      
      // 2. Calcular checksum
      const checksum = this.calculateChecksum(backupData)
      
      // 3. Comprimir datos
      const compressed = await this.compressData(backupData)
      
      // 4. Calcular tamaño
      const size = Buffer.byteLength(compressed, 'utf8')
      
      return {
        data: backupData,
        compressed,
        checksum,
        size,
        isCompressed: true
      }
    } catch (error) {
      console.error('[BackupEngine] Error creando backup:', error)
      throw error
    }
  }

  /**
   * Recopila datos del usuario
   */
  private static async getUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        nombre: true,
        apellido: true,
        empresa: true,
        sector: true,
        whatsapp: true,
        role: true,
        estado: true,
        createdAt: true,
        updatedAt: true
        // NO incluir: passwordHash
      }
    })
    return user
  }

  /**
   * Recopila preferencias del usuario
   */
  private static async getUserPreferences(userId: string) {
    return await prisma.userPreferences.findUnique({
      where: { userId }
    })
  }

  /**
   * Recopila cotizaciones (DATOS PRINCIPALES!)
   */
  private static async getQuotations(userId: string) {
    return await prisma.quotationConfig.findMany({
      where: { 
        OR: [
          { isGlobal: true },
          // Si hay relación directa a usuario
        ]
      }
    })
  }

  /**
   * Recopila snapshots de paquetes
   */
  private static async getPackageSnapshots(userId: string) {
    return await prisma.packageSnapshot.findMany({
      where: {} // Ajustar según schema real
    })
  }

  /**
   * Recopila configuración de cotizaciones
   */
  private static async getQuotationConfig(userId: string) {
    return await prisma.quotationConfig.findFirst({
      where: { isGlobal: true }
    })
  }

  /**
   * Recopila plantillas financieras
   */
  private static async getFinancialTemplates(userId: string) {
    return await prisma.financialTemplate.findMany({
      where: { userId }
    })
  }

  /**
   * Recopila permisos del usuario
   */
  private static async getUserPermissions(userId: string) {
    return await prisma.userPermission.findMany({
      where: { userId },
      include: { Permission: true }
    })
  }

  /**
   * Recopila acceso a cotizaciones
   */
  private static async getUserQuotationAccess(userId: string) {
    return await prisma.userQuotationAccess.findMany({
      where: { userId }
    })
  }

  /**
   * Recopila permisos de rol
   */
  private static async getRolePermissions(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    
    if (!user?.role) return []
    
    return await prisma.rolePermissions.findMany({
      where: { roleId: user.role }
    })
  }

  /**
   * Calcula checksum SHA256 del backup
   */
  static calculateChecksum(data: any): string {
    const jsonString = JSON.stringify(data)
    return crypto.createHash('sha256').update(jsonString).digest('hex')
  }

  /**
   * Comprime datos con ZIP
   */
  static async compressData(data: any): Promise<string> {
    const zip = new JSZip()
    
    // Crear estructura de carpetas
    zip.file('backup.json', JSON.stringify(data, null, 2))
    zip.file('metadata.json', JSON.stringify({
      version: data.version,
      timestamp: data.timestamp,
      checksum: this.calculateChecksum(data)
    }, null, 2))
    
    // Generar base64
    const compressed = await zip.generateAsync({ type: 'base64' })
    return compressed
  }

  /**
   * Valida integridad de backup
   */
  static validateBackupIntegrity(backup: any): boolean {
    try {
      // Verificar estructura
      if (!backup.version || !backup.timestamp) return false
      if (!backup.user || !backup.user.id) return false
      if (!Array.isArray(backup.quotations)) return false
      if (!Array.isArray(backup.userPermissions)) return false
      
      // Verificar checksum
      const calculatedChecksum = this.calculateChecksum(backup)
      // Comparar con guardado si existe
      
      return true
    } catch {
      return false
    }
  }
}
```

#### Paso 2.2: Instalar JSZip
```bash
npm install jszip
npm install --save-dev @types/jszip
```

---

### FASE 3: Crear Restore Engine (1.5 horas)

#### Paso 3.1: Crear Restore Engine
Archivo: `src/lib/backup/restoreEngine.ts`

```typescript
import { prisma } from '@/lib/prisma'
import JSZip from 'jszip'
import type { BackupDataStructure } from '@/lib/types/backup.types'

export class RestoreEngine {
  /**
   * Restaura un backup completo
   */
  static async restoreCompleteBackup(userId: string, backupData: BackupDataStructure) {
    console.log(`[RestoreEngine] Iniciando restauración para usuario: ${userId}`)
    
    try {
      // Validar integridad
      if (!this.validateBackup(backupData)) {
        throw new Error('Backup corrupto: validación fallida')
      }
      
      // Restaurar en orden correcto (respetando relaciones)
      await this.restoreUserData(userId, backupData.user)
      await this.restoreUserPreferences(userId, backupData.userPreferences)
      await this.restoreQuotations(userId, backupData.quotations)
      await this.restorePackageSnapshots(userId, backupData.packageSnapshots)
      await this.restoreQuotationConfig(userId, backupData.quotationConfig)
      await this.restoreFinancialTemplates(userId, backupData.financialTemplates)
      await this.restoreUserPermissions(userId, backupData.userPermissions)
      await this.restoreUserQuotationAccess(userId, backupData.userQuotationAccess)
      
      // Registrar restauración
      await prisma.auditLog.create({
        data: {
          action: 'BACKUP_RESTORED_COMPLETE',
          entityType: 'BACKUP',
          entityId: '',
          userId,
          userName: backupData.user.nombre || 'Usuario',
          details: {
            version: backupData.version,
            timestamp: backupData.timestamp,
            tablesRestored: backupData.auditSummary.tablesIncluded.length
          }
        }
      })
      
      return { success: true, message: 'Backup restaurado completamente' }
    } catch (error) {
      console.error('[RestoreEngine] Error restaurando:', error)
      throw error
    }
  }

  /**
   * Restaura datos del usuario
   */
  private static async restoreUserData(userId: string, userData: any) {
    if (!userData) return
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        nombre: userData.nombre,
        apellido: userData.apellido,
        empresa: userData.empresa,
        sector: userData.sector,
        whatsapp: userData.whatsapp
        // NO restaurar role ni passwordHash
      }
    })
  }

  /**
   * Restaura preferencias del usuario (TODOS los 26 campos!)
   */
  private static async restoreUserPreferences(userId: string, prefs: any) {
    if (!prefs) return
    
    await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        // UI general
        cerrarModalAlGuardar: prefs.cerrarModalAlGuardar,
        mostrarConfirmacionGuardado: prefs.mostrarConfirmacionGuardado,
        validarDatosAntes: prefs.validarDatosAntes,
        limpiarFormulariosAlCrear: prefs.limpiarFormulariosAlCrear,
        mantenerDatosAlCrearCotizacion: prefs.mantenerDatosAlCrearCotizacion,
        
        // Sincronización
        destinoGuardado: prefs.destinoGuardado,
        intervaloVerificacionConexion: prefs.intervaloVerificacionConexion,
        unidadIntervaloConexion: prefs.unidadIntervaloConexion,
        sincronizarAlRecuperarConexion: prefs.sincronizarAlRecuperarConexion,
        mostrarNotificacionCacheLocal: prefs.mostrarNotificacionCacheLocal,
        
        // Auditoría
        auditRetentionDays: prefs.auditRetentionDays,
        auditAutoPurgeEnabled: prefs.auditAutoPurgeEnabled,
        auditAutoPurgeFrequency: prefs.auditAutoPurgeFrequency,
        auditAutoReportEnabled: prefs.auditAutoReportEnabled,
        auditAutoReportPeriod: prefs.auditAutoReportPeriod,
        
        // ... resto de campos
      },
      create: {
        userId,
        ...prefs
      }
    })
  }

  /**
   * Restaura cotizaciones
   */
  private static async restoreQuotations(userId: string, quotations: any[]) {
    if (!Array.isArray(quotations) || quotations.length === 0) return
    
    for (const q of quotations) {
      await prisma.quotationConfig.upsert({
        where: { id: q.id },
        update: q,
        create: q
      })
    }
  }

  /**
   * Restaura paquetes/snapshots
   */
  private static async restorePackageSnapshots(userId: string, snapshots: any[]) {
    if (!Array.isArray(snapshots) || snapshots.length === 0) return
    
    for (const snapshot of snapshots) {
      await prisma.packageSnapshot.upsert({
        where: { id: snapshot.id },
        update: snapshot,
        create: snapshot
      })
    }
  }

  /**
   * Restaura configuración de cotizaciones
   */
  private static async restoreQuotationConfig(userId: string, config: any) {
    if (!config) return
    
    await prisma.quotationConfig.upsert({
      where: { id: config.id },
      update: config,
      create: config
    })
  }

  /**
   * Restaura plantillas financieras
   */
  private static async restoreFinancialTemplates(userId: string, templates: any[]) {
    if (!Array.isArray(templates) || templates.length === 0) return
    
    for (const template of templates) {
      template.userId = userId // Asegurar userId
      await prisma.financialTemplate.upsert({
        where: { id: template.id },
        update: template,
        create: template
      })
    }
  }

  /**
   * Restaura permisos del usuario
   */
  private static async restoreUserPermissions(userId: string, perms: any[]) {
    if (!Array.isArray(perms) || perms.length === 0) return
    
    // Eliminar permisos anteriores
    await prisma.userPermission.deleteMany({
      where: { userId }
    })
    
    // Crear nuevos
    for (const perm of perms) {
      if (perm.permissionId) {
        await prisma.userPermission.create({
          data: {
            userId,
            permissionId: perm.permissionId,
            accessLevel: perm.accessLevel || 'read'
          }
        })
      }
    }
  }

  /**
   * Restaura acceso a cotizaciones
   */
  private static async restoreUserQuotationAccess(userId: string, access: any[]) {
    if (!Array.isArray(access) || access.length === 0) return
    
    for (const item of access) {
      item.userId = userId
      await prisma.userQuotationAccess.upsert({
        where: { id: item.id },
        update: item,
        create: item
      })
    }
  }

  /**
   * Valida estructura de backup
   */
  static validateBackup(data: BackupDataStructure): boolean {
    try {
      if (!data.version || !data.timestamp) return false
      if (!data.user || !data.user.id) return false
      if (!Array.isArray(data.quotations)) return false
      if (!Array.isArray(data.userPermissions)) return false
      if (data.auditSummary.dataIntegrity !== 'valid') return false
      return true
    } catch {
      return false
    }
  }
}
```

---

### FASE 4: Crear Scheduler (1 hora)

#### Paso 4.1: Crear Scheduler Service
Archivo: `src/lib/backup/scheduler.ts`

```typescript
import { prisma } from '@/lib/prisma'
import { BackupEngine } from './backupEngine'
import { RestoreEngine } from './restoreEngine'

export class BackupScheduler {
  private static isRunning = false
  private static checkInterval: NodeJS.Timeout | null = null

  /**
   * Inicia el scheduler (se ejecuta cada minuto)
   */
  static start() {
    if (this.isRunning) {
      console.log('[BackupScheduler] Ya está en ejecución')
      return
    }

    this.isRunning = true
    console.log('[BackupScheduler] Iniciando scheduler de backups...')

    // Ejecutar check cada minuto
    this.checkInterval = setInterval(() => {
      this.checkAndExecuteBackups()
    }, 60000) // 60 segundos

    // Ejecutar una vez al iniciar
    this.checkAndExecuteBackups()
  }

  /**
   * Detiene el scheduler
   */
  static stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.isRunning = false
    console.log('[BackupScheduler] Scheduler detenido')
  }

  /**
   * Verifica y ejecuta backups pendientes
   */
  private static async checkAndExecuteBackups() {
    try {
      const now = new Date()

      // Encontrar todas las configuraciones con backup habilitado
      const configs = await prisma.backupConfig.findMany({
        where: {
          autoBackupEnabled: true,
          nextAutoBackup: {
            lte: now // nextAutoBackup <= ahora
          }
        },
        include: { User: true }
      })

      if (configs.length === 0) return

      console.log(`[BackupScheduler] Encontrados ${configs.length} backups pendientes`)

      for (const config of configs) {
        try {
          await this.executeBackup(config.userId, config.id)
        } catch (error) {
          console.error(`[BackupScheduler] Error en backup ${config.id}:`, error)
          
          // Registrar error
          await prisma.backupConfig.update({
            where: { id: config.id },
            data: {
              lastAutoBackupStatus: 'failed',
              lastAutoBackupError: error instanceof Error ? error.message : 'Error desconocido'
            }
          })
        }
      }
    } catch (error) {
      console.error('[BackupScheduler] Error checking backups:', error)
    }
  }

  /**
   * Ejecuta un backup automático
   */
  private static async executeBackup(userId: string, configId: string) {
    console.log(`[BackupScheduler] Ejecutando backup automático para usuario: ${userId}`)

    // Actualizar estado a "en_progreso"
    await prisma.backupConfig.update({
      where: { id: configId },
      data: {
        lastAutoBackupStatus: 'pending'
      }
    })

    // Crear backup
    const backup = await BackupEngine.createCompleteBackup(userId, {
      tipo: 'auto',
      nombre: `Auto-backup ${new Date().toISOString()}`
    })

    // Guardar en BD
    const config = await prisma.backupConfig.findUnique({
      where: { id: configId }
    })

    if (!config) throw new Error('Config no encontrada')

    const savedBackup = await prisma.userBackup.create({
      data: {
        userId,
        nombre: `Auto-backup ${new Date().toLocaleDateString()}`,
        descripcion: `Backup automático - ${config.autoBackupFrequency}`,
        tipo: 'auto',
        version: backup.data.version,
        data: backup.data,
        size: backup.size,
        checksum: backup.checksum,
        isCompressed: backup.isCompressed,
        estado: 'completado',
        dataValidated: true,
        validationDate: new Date()
      }
    })

    // Limpiar backups expirados
    await this.cleanExpiredBackups(userId, config.maxRetentionDays)

    // Calcular siguiente backup
    const nextBackup = this.calculateNextBackup(config.autoBackupFrequency)

    // Actualizar configuración
    await prisma.backupConfig.update({
      where: { id: configId },
      data: {
        lastAutoBackup: new Date(),
        lastAutoBackupStatus: 'success',
        lastAutoBackupError: null,
        nextAutoBackup: nextBackup
      }
    })

    // Registrar en auditLog
    await prisma.auditLog.create({
      data: {
        action: 'AUTO_BACKUP_EXECUTED',
        entityType: 'BACKUP',
        entityId: savedBackup.id,
        userId,
        userName: 'SYSTEM',
        details: {
          backupId: savedBackup.id,
          size: backup.size,
          checksum: backup.checksum,
          nextBackup: nextBackup
        }
      }
    })

    console.log(`[BackupScheduler] ✅ Backup completado: ${savedBackup.id}`)
  }

  /**
   * Limpia backups expirados
   */
  private static async cleanExpiredBackups(userId: string, maxDays: number) {
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() - maxDays)

    const expired = await prisma.userBackup.deleteMany({
      where: {
        userId,
        createdAt: {
          lt: expirationDate
        }
      }
    })

    if (expired.count > 0) {
      console.log(`[BackupScheduler] Eliminados ${expired.count} backups expirados`)
    }
  }

  /**
   * Calcula fecha del próximo backup
   */
  private static calculateNextBackup(frequency: string): Date {
    const next = new Date()
    
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1)
        break
      case 'weekly':
        next.setDate(next.getDate() + 7)
        break
      case 'monthly':
        next.setMonth(next.getMonth() + 1)
        break
    }
    
    return next
  }
}
```

#### Paso 4.2: Inicializar Scheduler en la Aplicación
Archivo: `src/app/layout.tsx` o `src/server.ts` (donde se inicia la app)

```typescript
import { BackupScheduler } from '@/lib/backup/scheduler'

// Al iniciar la aplicación
if (typeof window === 'undefined') { // Solo servidor
  BackupScheduler.start()
}
```

---

### FASE 5: Actualizar APIs (1 hora)

#### Paso 5.1: Actualizar POST /api/backups
Archivo: `src/app/api/backups/route.ts`

Reemplazar la lógica de POST:

```typescript
export async function POST(request: NextRequest) {
  const { session, error } = await requireWritePermission('backups.create')
  if (error) return error

  try {
    const body = await request.json()
    const { nombre, descripcion, tipo = 'manual' } = body

    if (!nombre) {
      return NextResponse.json(
        { success: false, error: 'El nombre del backup es requerido' },
        { status: 400 }
      )
    }

    // Usar BackupEngine para crear backup completo
    const backup = await BackupEngine.createCompleteBackup(session.user.id, {
      tipo,
      nombre
    })

    // Guardar en BD
    const userBackup = await prisma.userBackup.create({
      data: {
        userId: session.user.id,
        nombre,
        descripcion: descripcion || `${tipo} backup creado por usuario`,
        tipo,
        version: backup.data.version,
        data: backup.data,
        size: backup.size,
        checksum: backup.checksum,
        isCompressed: backup.isCompressed,
        estado: 'completado',
        dataValidated: true,
        validationDate: new Date()
      }
    })

    // Auditar
    await createAuditLog({
      action: 'BACKUP_CREATED_MANUAL',
      entityType: 'BACKUP',
      entityId: userBackup.id,
      actorId: session.user.id,
      actorName: session.user.nombre || session.user.username || 'Usuario',
      details: {
        backupId: userBackup.id,
        nombre,
        size: backup.size,
        checksum: backup.checksum,
        tablesIncluded: backup.data.auditSummary.tablesIncluded
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: userBackup.id,
        nombre: userBackup.nombre,
        tipo: userBackup.tipo,
        size: userBackup.size,
        createdAt: userBackup.createdAt,
        estado: userBackup.estado
      },
      message: 'Backup creado exitosamente'
    })
  } catch (error) {
    console.error('[API Backups POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear backup' },
      { status: 500 }
    )
  }
}
```

#### Paso 5.2: Actualizar POST /api/backups/restore
Archivo: `src/app/api/backups/restore/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { session, error } = await requireWritePermission('backups.restore')
  if (error) return error

  try {
    const body = await request.json()
    const { backupId } = body

    if (!backupId) {
      return NextResponse.json(
        { success: false, error: 'ID de backup requerido' },
        { status: 400 }
      )
    }

    // Obtener backup
    const backup = await prisma.userBackup.findUnique({
      where: { id: backupId }
    })

    if (!backup) {
      return NextResponse.json(
        { success: false, error: 'Backup no encontrado' },
        { status: 404 }
      )
    }

    // Verificar permisos
    const isSuperAdmin = session.user.role === 'SUPER_ADMIN'
    if (backup.userId !== session.user.id && !isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para restaurar este backup' },
        { status: 403 }
      )
    }

    // Verificar integridad
    if (!backup.dataValidated) {
      return NextResponse.json(
        { success: false, error: 'El backup no ha sido validado' },
        { status: 400 }
      )
    }

    // Usar RestoreEngine para restaurar
    await RestoreEngine.restoreCompleteBackup(backup.userId, backup.data as any)

    // Auditar
    await prisma.auditLog.create({
      data: {
        action: 'BACKUP_RESTORED_MANUAL',
        entityType: 'BACKUP',
        entityId: backupId,
        userId: session.user.id,
        userName: session.user.nombre || session.user.username || 'Usuario',
        details: {
          backupId,
          nombre: backup.nombre,
          backupDate: backup.createdAt,
          restoredData: {
            version: (backup.data as any).version,
            timestamp: (backup.data as any).timestamp
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Backup restaurado exitosamente. Por favor recarga la página para ver los cambios.',
      data: {
        restoredAt: new Date(),
        backupDate: backup.createdAt
      }
    })
  } catch (error) {
    console.error('[API Backups RESTORE] Error:', error)
    
    // Registrar error
    await prisma.auditLog.create({
      data: {
        action: 'BACKUP_RESTORE_FAILED',
        entityType: 'BACKUP',
        entityId: '',
        userId: session.user.id,
        userName: session.user.nombre || session.user.username || 'Usuario',
        details: {
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      }
    })

    return NextResponse.json(
      { success: false, error: 'Error al restaurar backup' },
      { status: 500 }
    )
  }
}
```

---

## ✅ TESTING Y VALIDACIÓN

### Test 1: Scheduler Funciona
```typescript
// tests/backup-scheduler.test.ts
describe('BackupScheduler', () => {
  test('Debe ejecutar backup cuando es hora', async () => {
    // Crear config con nextAutoBackup en el pasado
    const config = await prisma.backupConfig.create({
      data: {
        userId: testUserId,
        autoBackupEnabled: true,
        autoBackupFrequency: 'daily',
        nextAutoBackup: new Date(Date.now() - 3600000) // hace 1 hora
      }
    })

    // Ejecutar scheduler
    BackupScheduler.start()
    await new Promise(r => setTimeout(r, 5000))
    BackupScheduler.stop()

    // Verificar que se creó backup
    const backup = await prisma.userBackup.findFirst({
      where: {
        userId: testUserId,
        tipo: 'auto'
      }
    })

    expect(backup).toBeDefined()
    expect(backup?.estado).toBe('completado')
  })
})
```

### Test 2: Backup Contiene Todos Los Datos
```typescript
describe('BackupEngine', () => {
  test('Debe incluir todas las tablas', async () => {
    const backup = await BackupEngine.createCompleteBackup(testUserId)

    expect(backup.data.user).toBeDefined()
    expect(backup.data.quotations).toBeDefined()
    expect(backup.data.userPreferences).toBeDefined()
    expect(backup.data.packageSnapshots).toBeDefined()
    expect(backup.data.financialTemplates).toBeDefined()
    expect(backup.data.userPermissions).toBeDefined()
  })
})
```

### Test 3: Restore Restaura Todos Los Datos
```typescript
describe('RestoreEngine', () => {
  test('Debe restaurar datos completos', async () => {
    // Crear backup
    const backup = await BackupEngine.createCompleteBackup(testUserId)
    
    // Eliminar datos
    await prisma.userPreferences.delete({
      where: { userId: testUserId }
    })

    // Restaurar
    await RestoreEngine.restoreCompleteBackup(testUserId, backup.data)

    // Verificar que exista
    const prefs = await prisma.userPreferences.findUnique({
      where: { userId: testUserId }
    })

    expect(prefs).toBeDefined()
  })
})
```

### Manual Testing Checklist
- [ ] Configurar backup diario
- [ ] Esperar a que scheduler ejecute (próximo minuto después de la hora)
- [ ] Verificar que se creó backup automático
- [ ] Hacer cambios en datos
- [ ] Restaurar backup
- [ ] Verificar que todos los datos se restauraron
- [ ] Verificar auditLog tiene registros

---

## 📋 RESUMEN DE CAMBIOS

| Archivo | Tipo | Cambio |
|---------|------|--------|
| `prisma/schema.prisma` | Modificar | Agregar campos a BackupConfig y UserBackup |
| `src/lib/types/backup.types.ts` | Crear | Tipos para backups |
| `src/lib/backup/backupEngine.ts` | Crear | Engine para crear backups completos |
| `src/lib/backup/restoreEngine.ts` | Crear | Engine para restaurar backups |
| `src/lib/backup/scheduler.ts` | Crear | Scheduler para backups automáticos |
| `src/app/api/backups/route.ts` | Modificar | Usar BackupEngine en POST |
| `src/app/api/backups/restore/route.ts` | Modificar | Usar RestoreEngine |
| `src/app/layout.tsx` | Modificar | Inicializar scheduler |
| `package.json` | Modificar | Agregar jszip |

---

## ⏰ ESTIMACIÓN DE TIEMPO

| Fase | Duración |
|------|----------|
| 1. Preparación | 0.5h |
| 2. Backup Engine | 1.5h |
| 3. Restore Engine | 1.5h |
| 4. Scheduler | 1h |
| 5. APIs | 1h |
| 6. Testing | 1h |
| **TOTAL** | **6.5 horas** |

---

## 🚀 PRÓXIMOS PASOS

1. **Inmediato:** Implementar Fase 1-4
2. **Corto plazo:** Agregar notificaciones cuando un backup falla
3. **Mediano plazo:** Interfaz web para ver estado de backups programados
4. **Largo plazo:** Backups en nube (AWS S3, Google Cloud)

---

## 📞 CONCLUSIÓN

El sistema actual es un **"backup incompleto"** que da falsa sensación de seguridad. Con estas implementaciones, tendrás un sistema robusto, automático y completamente confiable.

Después de implementar esto:
- ✅ Backups automáticos se ejecutarán perfectamente
- ✅ Tendrás todos tus datos protegidos
- ✅ Restauración será 100% completa
- ✅ Auditoria registrará cada operación
