# Configuración de Fase 4: Automatización y Reportes

## Variables de Entorno Requeridas

### 1. Retención de Logs de Auditoría
```bash
# Número de días a retener logs de auditoría (default: 180)
AUDIT_RETENTION_DAYS=180
```

**Descripción:**
- Logs más antiguos que este valor serán eliminados automáticamente
- Mínimo recomendado: 90 días
- Máximo recomendado: 365 días (1 año)
- Ejemplo: AUDIT_RETENTION_DAYS=180 retiene 6 meses de logs

**Casos de Uso:**
- Regulaciones de cumplimiento: Verificar GDPR, HIPAA, SOC 2 requirements
- Capacidad de almacenamiento: Ajustar según crecimiento de datos
- Análisis histórico: Aumentar si necesita análisis a largo plazo

---

### 2. Token de Autorización para Cron Jobs
```bash
# Secret para autorizar solicitudes cron (generar con: openssl rand -hex 32)
CRON_SECRET=your-secure-secret-here
```

**Descripción:**
- Token usado en header `X-Cron-Secret` para ejecutar purga automática
- CRÍTICO: Debe ser una cadena aleatoria fuerte
- Previene acceso no autorizado a endpoints de cron

**Cómo Generar:**
```bash
# En Linux/macOS:
openssl rand -hex 32

# En Windows PowerShell:
$randomBytes = [byte[]]::new(32); [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($randomBytes); [System.Convert]::ToHexString($randomBytes)

# Resultado esperado:
# 4a7f9c2e1b8d5f3a6c9e2b1d4f7a3c8e
```

**Uso en Solicitudes:**
```bash
curl -H "X-Cron-Secret: 4a7f9c2e1b8d5f3a6c9e2b1d4f7a3c8e" \
  https://yourdomain.com/api/cron/audit-purge
```

---

### 3. Debug Secret (Desarrollo)
```bash
# Secret para testing manual en desarrollo
DEBUG_SECRET=dev-secret-for-testing
```

**Descripción:**
- Solo se usa en `NODE_ENV=development`
- Permite probar cron jobs manualmente
- NO usar en producción

---

## Configuración por Plataforma

### Vercel (Deployment Recomendado)
Vercel tiene soporte nativo para cron jobs.

**1. Crear archivo `vercel.json`:**
```json
{
  "crons": [
    {
      "path": "/api/cron/audit-purge",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**2. Ejecutar diariamente a las 2 AM UTC:**
```bash
# Crontab format: (minuto) (hora) (día) (mes) (día-semana)
0 2 * * *   # Cada día a las 2 AM UTC
```

**3. Agregar secreto en Dashboard:**
- Ir a Settings → Environment Variables
- Agregar `CRON_SECRET` con valor seguro
- Agregar `AUDIT_RETENTION_DAYS` (default: 180)

---

### Fly.io
```bash
# En fly.toml, agregar:
[env]
  AUDIT_RETENTION_DAYS = "180"
  CRON_SECRET = "your-secret"

[[services]]
  # El endpoint debe ser accesible públicamente
  processes = ["app"]
```

Ejecutar cron con:
```bash
flyctl machines run --schedule "0 2 * * *" curl -H "X-Cron-Secret: $CRON_SECRET" https://yourdomain.com/api/cron/audit-purge
```

---

### Docker / Self-Hosted
Usar contenedor con `curl` + `crontab`:

**Dockerfile:**
```dockerfile
FROM node:18-alpine

# Instalar curl y otros herramientas
RUN apk add --no-cache curl

# Agregar entrada cron (ejecutar cada día a las 2 AM)
RUN echo "0 2 * * * curl -H \"X-Cron-Secret: \$CRON_SECRET\" http://localhost:3000/api/cron/audit-purge" | crontab -

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Scripts de Purga Manual

### Ejecutar Purga con Retención Predeterminada
```bash
npx ts-node scripts/purge-old-audit-logs.ts
```

**Resultado:**
```
🗑️  Iniciando purga de logs de auditoría...
📅 Fecha límite: 2024-06-15T10:30:00.000Z
📊 Retención: 180 días

📋 Logs encontrados para eliminar: 1,245

📊 Desglose por acción:
   QUOTATION_CREATED: 523 registro(s)
   SNAPSHOT_UPDATED: 345 registro(s)
   LOGIN_SUCCESS: 189 registro(s)
   ...

📅 Desglose por mes:
   2024-01: 567 registro(s)
   2024-02: 678 registro(s)

✅ Purga completada exitosamente. 1,245 logs eliminados.
📊 Logs restantes en base de datos: 45,123
```

---

### Ejecutar Purga con Retención Customizada
```bash
# Retener solo 90 días (purgar logs más antiguos)
npx ts-node scripts/purge-old-audit-logs.ts --days=90

# Retener 1 año (purgar logs más antiguos a 365 días)
npx ts-node scripts/purge-old-audit-logs.ts --days=365
```

---

### Simular Purga sin Eliminar
```bash
# Ver cuántos logs se eliminarían sin hacer cambios reales
npx ts-node scripts/purge-old-audit-logs.ts --dryRun

# Simular con retención customizada
npx ts-node scripts/purge-old-audit-logs.ts --days=90 --dryRun
```

---

## Scripts de Reportes

### Generar Reporte Mensual
```bash
npx ts-node scripts/generate-audit-report.ts
```

**Resultado:** `docs/reports/audit-report-monthly-2024-12-15.html`

---

### Generar Reporte Semanal
```bash
npx ts-node scripts/generate-audit-report.ts --period=weekly
```

**Resultado:** `docs/reports/audit-report-weekly-2024-12-15.html`

---

### Generar Reporte Personalizado
```bash
# Últimos 90 días
npx ts-node scripts/generate-audit-report.ts --days=90

# Últimos 180 días (6 meses)
npx ts-node scripts/generate-audit-report.ts --days=180
```

---

## Monitoreo y Alertas

### Verificar Ejecución de Cron

**En Vercel:**
- Ir a Dashboard → Deployments → Recent Deployments
- Ver logs en Deployment Details → Functions

**En Vercel CLI:**
```bash
vercel logs --follow
```

---

### Endpoint de Salud
```bash
curl -H "X-Cron-Secret: $CRON_SECRET" \
  https://yourdomain.com/api/cron/audit-purge
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Purga completada: 1,245 logs eliminados en 5234ms",
  "deleted": 1245,
  "remaining": 45123,
  "cutoffDate": "2024-06-15T10:30:00.000Z",
  "duration": 5234
}
```

**Respuesta sin Logs (200):**
```json
{
  "success": true,
  "message": "No había logs para eliminar. Retención en orden.",
  "deleted": 0,
  "remaining": 45123,
  "cutoffDate": "2024-06-15T10:30:00.000Z",
  "duration": 342
}
```

**Error de Autenticación (401):**
```json
{
  "success": false,
  "error": "Token de autenticación inválido o faltante"
}
```

---

## Recomendaciones de Seguridad

### 1. Proteger CRON_SECRET
- ✅ Generar con `openssl rand -hex 32`
- ✅ Guardar en `.env.local` (nunca en git)
- ✅ Rotar cada 6 meses
- ❌ NO usar contraseñas simples
- ❌ NO publicar en repositorio público

### 2. Limitar Acceso
- ✅ Usar IP whitelist si es posible
- ✅ Validar User-Agent header
- ✅ Ejecutar en horario específico (2 AM UTC)

### 3. Monitoreo
- ✅ Registrar todas las ejecuciones
- ✅ Alertar si falla 2+ veces consecutivas
- ✅ Verificar regularmente el count de logs

---

## Troubleshooting

### Cron no ejecuta
1. Verificar `CRON_SECRET` en variables de entorno
2. Verificar que endpoint está publicado (no `development` mode)
3. Verificar logs en plataforma (Vercel, Fly.io, etc.)
4. Probar manualmente: `curl -H "X-Cron-Secret: $CRON_SECRET" https://yourdomain.com/api/cron/audit-purge`

### Purga muy lenta
1. Aumentar `BATCH_SIZE` en route.ts (actualmente 5000)
2. Ejecutar en horario de baja actividad
3. Considerar archivado de logs en lugar de eliminación

### Logs no se eliminan
1. Verificar `AUDIT_RETENTION_DAYS` está configurado
2. Verificar logs existentes: `SELECT COUNT(*) FROM "AuditLog"`
3. Revisar permisos de base de datos (DELETE must be allowed)

---

## Checklist de Implementación

- [ ] Generar `CRON_SECRET` con openssl
- [ ] Configurar variables en plataforma (.env.local / dashboard)
- [ ] Crear `vercel.json` con schedule (si usa Vercel)
- [ ] Probar script de purga manual: `npx ts-node scripts/purge-old-audit-logs.ts --dryRun`
- [ ] Probar reporte: `npx ts-node scripts/generate-audit-report.ts`
- [ ] Ejecutar cron endpoint manualmente
- [ ] Verificar logs en plataforma
- [ ] Crear alertas para fallos de cron
- [ ] Documentar en runbook del equipo
- [ ] Revisar regularmente (mensualmente)

---

## Próximos Pasos

1. **Notificaciones:** Agregar Slack/Email alerts en route.ts
2. **Webhook:** Llamar webhook externo al completar purga
3. **Backup:** Archivado de logs antes de eliminar
4. **Analytics:** Dashboard con métricas de auditoría
5. **Exportación:** Reportes automáticos enviados por email

