# Integración Completa: Reportes Automáticos de Auditoría

## Estado de Implementación ✅

### Componentes Creados:

1. **`src/lib/audit-report-generator.ts`** - Librería reutilizable
   - Generación de reportes completos
   - Análisis de acciones, entidades y usuarios
   - Cálculo de actividad diaria

2. **`src/lib/audit-report-scheduler.ts`** - Servicio de scheduler
   - Obtiene usuarios con reportes automáticos habilitados
   - Genera y almacena reportes en BD
   - Manejo de errores y fallbacks

3. **`src/app/api/audit-reports/route.ts`** - API principal
   - `GET` - Listar reportes (con paginación y filtros)
   - `POST` - Generar reporte manual

4. **`src/app/api/audit-reports/[id]/route.ts`** - API detalle
   - `GET` - Obtener reporte específico
   - `DELETE` - Eliminar reporte

5. **`src/app/api/cron/audit-reports/route.ts`** - Cron handler
   - Ejecuta scheduler vía llamada HTTP
   - Protegido con token secreto (CRON_SECRET)

6. **`src/features/admin/components/content/preferencias/ReportesAuditoriaContent.tsx`** - Componente UI
   - Interfaz para visualizar reportes
   - Generación manual de reportes
   - Diálogo de detalles con DialogoGenericoDinamico
   - Gestión (eliminar) de reportes

7. **Database: Tabla `AuditReport`**
   - Almacena reportes generados
   - Metadata y datos completos en JSON
   - Índices para búsqueda eficiente

8. **Documentación: `docs/REPORTES_AUTOMATICOS.md`**
   - Arquitectura completa
   - Guía de configuración
   - Opciones de ejecución del cron

## Flujo de Datos

```
1. Usuario habilita "auditAutoReportEnabled" en preferencias
2. Configura período: daily, weekly o monthly
3. Scheduler ejecuta (cada hora vía cron)
4. Verifica usuarios con reportes habilitados
5. Genera reporte para cada usuario
6. Almacena en tabla AuditReport
7. Usuario puede:
   - Ver lista de reportes (API GET)
   - Generar manual (API POST)
   - Ver detalles (diálogo UI)
   - Eliminar (API DELETE)
```

## Integración en Preferencias

### Sidebar Update
- Agregado `BarChart3` icon
- Nueva sección: "reportes" type
- Tipo: `SidebarSection = 'general' | 'sincronizacion' | 'usuarios' | 'seguridad' | 'reportes'`

### Tab Integration
- ImportedReportesAuditoriaContent
- Renderiza cuando `activeSection === 'reportes'`
- Recibe props: `isDirty`, `onSave`

## Cómo Funciona

### Generar Reportes Automáticamente

**Opción 1: Vercel Cron (Recomendado)**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/audit-reports",
    "schedule": "0 0 * * *"
  }]
}
```

**Opción 2: External Cron Service**
- URL: `https://tudominio.com/api/cron/audit-reports`
- Headers: `Authorization: Bearer {CRON_SECRET}`
- Ejecutar cada 24 horas

**Opción 3: Node.js Cron (Local)**
```bash
npm install node-cron
# Ver docs/REPORTES_AUTOMATICOS.md para integración
```

### Usar API Directamente

```bash
# Generar reportes manual
curl -X POST http://localhost:3000/api/audit-reports/generate \
  -H "Authorization: Bearer {sesion-token}" \
  -H "Content-Type: application/json" \
  -d '{"period":"weekly"}'

# Listar reportes
curl http://localhost:3000/api/audit-reports \
  -H "Authorization: Bearer {sesion-token}"
```

## Testing Manual

```bash
# Generar reporte para testing
npx ts-node scripts/test-auto-reports.ts --userId=admin --period=weekly
```

## Variables de Entorno

```env
# Proteger endpoint cron
CRON_SECRET=tu-secreto-seguro-aqui
```

## Schema de Datos

### UserPreferences
```typescript
auditAutoReportEnabled: boolean      // Habilitar reportes
auditAutoReportPeriod: string        // "daily" | "weekly" | "monthly"
```

### AuditReport (Nueva tabla)
```typescript
id: string                           // ID único
userId: string                       // Propietario
period: string                       // daily/weekly/monthly
dateRangeFrom: DateTime              // Inicio
dateRangeTo: DateTime                // Fin
totalLogs: number
uniqueUsers: number
uniqueActions: number
uniqueEntities: number
reportData: Json                     // Datos completos
generatedAt: DateTime
status: string                       // completed/failed/pending
```

## Rutas Implementadas

```
GET    /api/audit-reports                → Listar reportes
GET    /api/audit-reports/:id           → Obtener reporte
POST   /api/audit-reports/generate      → Generar manual
DELETE /api/audit-reports/:id           → Eliminar reporte
POST   /api/cron/audit-reports          → Ejecutar scheduler
```

## Componentes UI Utilizados

- **DialogoGenericoDinamico** - Modal de detalles del reporte
- Iconos de **lucide-react** - BarChart3, Loader2, Trash2, etc.
- **motion/framer-motion** - Animaciones suaves

## Próximos Pasos (Opcional)

1. **Exportar reportes a PDF**
   - Usar librería como `pdfkit` o `puppeteer`
   - Agregar botón "Descargar PDF" en UI

2. **Email automático**
   - Enviar reporte por email después de generarlo
   - Template HTML personalizado

3. **Dashboard de analytics**
   - Gráficos de tendencias
   - Comparación período a período

4. **Notificaciones**
   - Toast cuando se completa generación
   - Badge en sidebar si hay reportes nuevos

## Seguridad

✅ Autenticación requerida en todos endpoints
✅ Autorización: solo usuario propietario puede ver sus reportes
✅ Token secreto opcional para endpoint cron
✅ Error handling completo
✅ Logs de cada operación

## Performance

- Índices en: userId, period, generatedAt, createdAt
- Paginación en listado (default 20 por página)
- Generación asincrónica (no bloquea UI)
- Datos JSON flexible para futuros campos

## Mantenimiento

### Limpiar reportes antiguos
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

### Monitorear ejecución
- Revisar logs: `[AUDIT REPORT]` prefix
- Verificar tabla `AuditReport` en BD
- Confirmar que cron está ejecutándose

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Reportes no se generan | Verificar `auditAutoReportEnabled: true` en BD |
| Error en cron | Revisar logs de servidor, validar CRON_SECRET |
| Reporte vacío | Verificar que hay logs en ese período |
| API devuelve 401 | Validar sesión activa |
| Error de BD | Ejecutar `npx prisma db push` |

---

**Estado**: ✅ Completamente implementado y listo para producción
**Última actualización**: 18 de diciembre de 2025
