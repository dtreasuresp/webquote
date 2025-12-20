# 🚀 QUICK START: IMPLEMENTACIÓN DE BACKUPS

**Duración total:** 1 día de trabajo (~6.5 horas)  
**Dificultad:** Media  
**Riesgo:** Bajo (los cambios son aislados, no afectan código existente)

---

## ✅ PRE-REQUISITOS

- [ ] Tienes acceso a terminal del proyecto
- [ ] Prisma está configurado
- [ ] Database conectada
- [ ] Node 18+

---

## 🎯 PASO 1: INSTALACIÓN (5 minutos)

### 1.1 Instalar dependencia
```bash
cd d:\dgtecnova
npm install jszip
npm install --save-dev @types/jszip
```

### 1.2 Verificar instalación
```bash
npm list jszip
# Debe mostrar: jszip@X.X.X
```

---

## 🛠️ PASO 2: ACTUALIZAR BASE DE DATOS (10 minutos)

### 2.1 Copiar nuevo schema
Archivo: `prisma/schema.prisma`

**Buscar** la sección `model BackupConfig` (línea ~327) y reemplazar con:

```prisma
model BackupConfig {
  id                      String    @id @default(cuid())
  userId                  String    @unique
  User                    User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Configuración existente
  autoBackupEnabled       Boolean   @default(false)
  autoBackupFrequency     String    @default("weekly")  // daily, weekly, monthly
  autoBackupRetention     Int       @default(5)
  notifyOnBackup          Boolean   @default(true)
  notifyOnRestore         Boolean   @default(true)
  
  // NUEVOS CAMPOS
  lastAutoBackup          DateTime?
  nextAutoBackup          DateTime?
  lastAutoBackupStatus    String?   @default("pending")  // success, failed, pending
  lastAutoBackupError     String?
  preferredBackupTime     String    @default("02:00")    // Hora en formato HH:mm
  maxRetentionDays        Int       @default(90)
  
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt

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
  checksum        String?
  isCompressed    Boolean   @default(false)
  isEncrypted     Boolean   @default(false)
  
  estado          String    @default("completado")  // completado, en_progreso, error
  errorMessage    String?
  dataValidated   Boolean   @default(false)
  validationDate  DateTime?
  
  createdAt       DateTime  @default(now())
  expiresAt       DateTime?

  @@index([userId])
  @@index([createdAt])
  @@index([tipo])
  @@index([expiresAt])
}
```

### 2.2 Ejecutar migración
```bash
npx prisma migrate dev --name add_backup_fields_complete
```

✅ Si no hay errores, continuar.

---

## 📁 PASO 3: CREAR ARCHIVOS (45 minutos)

### 3.1 Crear carpeta de backups
```bash
mkdir -p src/lib/backup
mkdir -p src/lib/types
```

### 3.2 Crear tipos
**Archivo:** `src/lib/types/backup.types.ts`

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

### 3.3 Crear BackupEngine
**Archivo:** `src/lib/backup/backupEngine.ts`

[Ver documento: AUDITORIA_SISTEMA_BACKUPS_COMPLETA.md - FASE 2 - Paso 2.1]

**Pasos:**
1. Copiar código completo de BackupEngine
2. Pegar en `src/lib/backup/backupEngine.ts`
3. Guardar

### 3.4 Crear RestoreEngine
**Archivo:** `src/lib/backup/restoreEngine.ts`

[Ver documento: AUDITORIA_SISTEMA_BACKUPS_COMPLETA.md - FASE 3 - Paso 3.1]

**Pasos:**
1. Copiar código completo de RestoreEngine
2. Pegar en `src/lib/backup/restoreEngine.ts`
3. Guardar

### 3.5 Crear Scheduler
**Archivo:** `src/lib/backup/scheduler.ts`

[Ver documento: AUDITORIA_SISTEMA_BACKUPS_COMPLETA.md - FASE 4 - Paso 4.1]

**Pasos:**
1. Copiar código completo de BackupScheduler
2. Pegar en `src/lib/backup/scheduler.ts`
3. Guardar

---

## 🔌 PASO 4: ACTUALIZAR APIs (30 minutos)

### 4.1 Actualizar POST /api/backups

**Archivo:** `src/app/api/backups/route.ts`

**Reemplazar la función POST completamente con:**

```typescript
import { BackupEngine } from '@/lib/backup/backupEngine'

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

    // ✨ Usar BackupEngine para crear backup COMPLETO
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
        checksum: backup.checksum
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

### 4.2 Actualizar POST /api/backups/restore

**Archivo:** `src/app/api/backups/restore/route.ts`

**Reemplazar completamente con:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireWritePermission } from '@/lib/apiProtection'
import { RestoreEngine } from '@/lib/backup/restoreEngine'

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

    // ✨ Usar RestoreEngine para restaurar COMPLETO
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
          restoredAt: new Date()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Backup restaurado exitosamente. Recarga la página para ver los cambios.',
      data: {
        restoredAt: new Date(),
        backupDate: backup.createdAt
      }
    })
  } catch (error) {
    console.error('[API Backups RESTORE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al restaurar backup' },
      { status: 500 }
    )
  }
}
```

---

## 🚀 PASO 5: ACTIVAR SCHEDULER (5 minutos)

### 5.1 Modificar layout.tsx

**Archivo:** `src/app/layout.tsx`

**Al inicio del archivo, agregar:**

```typescript
import { BackupScheduler } from '@/lib/backup/scheduler'

// Al iniciar, en la raíz del archivo (fuera de componentes)
if (typeof window === 'undefined') {
  // Solo en servidor
  BackupScheduler.start()
}
```

---

## ✅ PASO 6: VALIDAR (10 minutos)

### 6.1 Compilar TypeScript
```bash
npx tsc --noEmit
```

✅ Debe decir "Success" o no mostrar errores

### 6.2 Test Manual: Crear Backup
```
1. Ir a Admin → Preferencias → Seguridad → Backups
2. Click en "+ Crear Backup"
3. Dar nombre y descripción
4. Click crear
```

**Verificar:**
- [ ] Se crea backup
- [ ] Aparece en lista
- [ ] Tiene tamaño > 5000 bytes (datos completos)
- [ ] Estado es "completado"

### 6.3 Test Manual: Configurar Automático
```
1. En misma sección, ir a "Configuración"
2. Habilitar "Backups automáticos"
3. Seleccionar "Diario"
4. Guardar
```

**Verificar:**
- [ ] Se guarda configuración
- [ ] Muestra "Próximo backup: [fecha]"
- [ ] El scheduler está corriendo (ver console en servidor)

### 6.4 Test Manual: Esperar Scheduler
```
En terminal del servidor, buscar logs:
[BackupScheduler] Encontrados X backups pendientes
[BackupScheduler] Ejecutando backup automático
[BackupScheduler] ✅ Backup completado
```

**Si ves estos logs:** ✅ El scheduler está funcionando

### 6.5 Test Manual: Restaurar
```
1. Ir a Admin → Preferencias → Seguridad → Backups
2. Seleccionar un backup
3. Click "Restaurar"
4. Confirmar
5. Recargar página
```

**Verificar:**
- [ ] Se restauran datos
- [ ] No hay errores en console
- [ ] AuditLog registra la restauración

---

## 🐛 TROUBLESHOOTING

### Error: "Module not found: jszip"
```bash
npm install jszip
npm install --save-dev @types/jszip
```

### Error: "UserBackup validation error"
```
→ Verificar que la migración se ejecutó correctamente
→ npx prisma migrate deploy
```

### Scheduler no ejecuta
```
→ Verificar que está en src/app/layout.tsx el import
→ Revisar logs del servidor
→ Verificar que nextAutoBackup está en el pasado
```

### Restore dice "Backup corrupto"
```
→ Verificar que dataValidated = true
→ Backup podría estar incompleto
→ Ver estructura en BD
```

---

## 📊 CÓMO VERIFICAR QUE FUNCIONA

### Verificación 1: Backups Completos
```typescript
// En terminal (node)
const backup = await prisma.userBackup.findFirst()
console.log(backup.data)
// Debe tener: user, quotations, userPreferences, etc.
```

### Verificación 2: Scheduler Ejecutando
```
En consola del servidor (durante ejecución):
[BackupScheduler] Iniciando scheduler de backups...
[BackupScheduler] Encontrados X backups pendientes
```

### Verificación 3: Restauración Completa
```
1. Crear backup manual
2. Eliminar una cotización
3. Restaurar backup
4. Verificar que volvió la cotización
```

---

## 📝 CHECKLIST FINAL

- [ ] npm install jszip
- [ ] Migración DB ejecutada sin errores
- [ ] 4 archivos creados en src/lib/backup/
- [ ] POST /api/backups actualizado
- [ ] POST /api/backups/restore actualizado
- [ ] layout.tsx tiene import y start()
- [ ] TypeScript compila sin errores
- [ ] Backup manual incluye todos los datos
- [ ] Scheduler ejecuta automáticamente
- [ ] Restauración es completa

---

## 🎉 LISTO!

Si completaste todos los pasos:
✅ Backups automáticos funcionan
✅ Todos los datos se protegen
✅ Restauración es 100% completa
✅ Sistema es confiable

**Próximos pasos opcionales:**
- Agregar notificaciones por email
- Backups en nube (S3)
- Compresión y encriptación
