# Configuración de Reportes Automáticos de Auditoría

## Descripción General

Sistema de generación automática de reportes de auditoría basado en preferencias del usuario. Los reportes se generan en períodos configurables (diarios, semanales, mensuales) y se almacenan en la base de datos.

## Arquitectura

```
UserPreferences
  ├─ auditAutoReportEnabled (boolean)    → Habilita/deshabilita reportes
  └─ auditAutoReportPeriod (string)     → Período: "daily", "weekly", "monthly"
          ↓
  AuditReport Scheduler
  (ejecuta en intervalos regulares)
          ↓
  AuditReport Table
  (almacena reportes generados)
  
  API Endpoints
  ├─ GET  /api/audit-reports           → Listar reportes del usuario
  ├─ GET  /api/audit-reports/:id       → Obtener reporte específico
  ├─ POST /api/audit-reports/generate   → Generar reporte manual
  ├─ DELETE /api/audit-reports/:id     → Eliminar reporte
  └─ POST /api/cron/audit-reports      → Ejecutar scheduler (cron)
```

## Componentes

### 1. **Librería: `src/lib/audit-report-generator.ts`**
Funciones reutilizables para generar reportes:
- `generateAuditReport()` - Genera reporte completo
- `getTopActions()` - Acciones más frecuentes
- `getEntityDistribution()` - Distribución por tipo de entidad
- `getTopUsers()` - Usuarios más activos
- `getDailyActivity()` - Actividad diaria

### 2. **Servicio: `src/lib/audit-report-scheduler.ts`**
Orquestación de la generación de reportes:
- `runAutoReportScheduler()` - Ejecuta scheduler para todos los usuarios
- `generateAndSaveReport()` - Genera y almacena reporte para un usuario
- `testGenerateReport()` - Función de prueba

### 3. **API: `src/app/api/audit-reports/`**
Endpoints REST para gestionar reportes:
- `route.ts` - GET (listar), POST (generar manual)
- `[id]/route.ts` - GET (detalle), DELETE (eliminar)

### 4. **Cron Handler: `src/app/api/cron/audit-reports/route.ts`**
Endpoint para ejecutar scheduler desde cron externo

## Configuración

### Variable de Entorno
```env
CRON_SECRET=tu-secreto-seguro-aqui  # Opcional, para proteger endpoint cron
```

### Preferencias del Usuario
```typescript
UserPreferences {
  auditAutoReportEnabled: true          // Habilitar reportes automáticos
  auditAutoReportPeriod: "weekly"       // "daily", "weekly", o "monthly"
}
```

## Opciones de Ejecución

### Opción 1: Vercel Cron (Recomendado si usas Vercel)
Crear archivo `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/audit-reports",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Opción 2: External Cron Service
Usar servicios como cron-job.org o similar:
```
URL: https://tudominio.com/api/cron/audit-reports
Headers: Authorization: Bearer {CRON_SECRET}
Frecuencia: Cada 24 horas (o según necesites)
```

### Opción 3: Node.js Cron (Producción Local)
Instalar dependencia:
```bash
npm install node-cron
```

Crear archivo `src/services/cron.ts`:
```typescript
import cron from 'node-cron';
import { runAutoReportScheduler } from '@/lib/audit-report-scheduler';

export function initCronJobs() {
  // Ejecutar cada día a las 3 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('[CRON] Ejecutando scheduler de reportes...');
    await runAutoReportScheduler();
  });
  
  console.log('[CRON] Cron jobs inicializados');
}
```

Inicializar en `src/app/layout.tsx`:
```typescript
import { initCronJobs } from '@/services/cron';

if (typeof window === 'undefined') {
  initCronJobs();
}
```

## Uso Manual (Testing)

### Desde Script
```bash
# Generar reporte para usuario específico
npx ts-node scripts/test-auto-reports.ts --userId=admin --period=weekly
```

### Desde API
```bash
# Listar reportes
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/api/audit-reports

# Generar reporte manualmente
curl -X POST -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"period":"weekly"}' \
  http://localhost:3000/api/audit-reports/generate

# Ejecutar scheduler (con secreto)
curl -X POST -H "Authorization: Bearer {CRON_SECRET}" \
  http://localhost:3000/api/cron/audit-reports
```

## Estructura de AuditReport

```typescript
AuditReport {
  id: string                           // ID único
  userId: string                       // Usuario propietario
  period: "daily" | "weekly" | "monthly"
  dateRangeFrom: DateTime              // Inicio período
  dateRangeTo: DateTime                // Fin período
  
  // Resumen
  totalLogs: number
  uniqueUsers: number
  uniqueActions: number
  uniqueEntities: number
  
  // Datos completos (JSON)
  reportData: {
    generatedAt: Date
    period: string
    dateRange: { from, to }
    summary: { totalLogs, uniqueUsers, uniqueActions, uniqueEntities }
    topActions: ActionStats[]
    entityDistribution: EntityStats[]
    topUsers: UserStats[]
    dailyActivity: DailyActivity[]
  }
  
  // Metadata
  generatedAt: DateTime
  generatedBy: "system" | userId
  status: "completed" | "failed" | "pending"
  errorMessage?: string
  filePath?: string
}
```

## Flujo de Ejecución

1. **Scheduler se ejecuta** (vía cron o manual)
2. **Obtiene usuarios** con `auditAutoReportEnabled: true`
3. **Para cada usuario**:
   - Lee período configurado (daily/weekly/monthly)
   - Genera reporte con datos de ese período
   - Almacena en BD table `AuditReport`
4. **Registra resultado** (éxito o error)

## Retención de Datos

Los reportes se almacenan indefinidamente. Para limpiar reportes antiguos:

```typescript
// Eliminar reportes más antiguos de 1 año
await prisma.auditReport.deleteMany({
  where: {
    generatedAt: {
      lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    }
  }
});
```

## Seguridad

1. **Autenticación**: Todos los endpoints requieren sesión activa
2. **Autorización**: Solo el usuario propietario puede ver sus reportes
3. **Token de Cron**: Proteger endpoint cron con `CRON_SECRET`
4. **Rate Limiting**: Considerar agregar límite de generación manual

## Troubleshooting

### Reportes no se generan
- ✓ Verificar que `auditAutoReportEnabled: true` en preferencias
- ✓ Verificar que cron se ejecuta (revisar logs)
- ✓ Verificar que hay logs de auditoría en el período

### Error: "reportData is not valid JSON"
- ✓ Asegurar que el reporte se genera correctamente
- ✓ Revisar logs de scheduler

### Reporte vacío
- ✓ Verificar que hay logs de auditoría en ese período
- ✓ Revisar que `auditRetentionDays` permite acceso a esos logs
