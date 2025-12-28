# Integración: Cómo incorporar el ERD/SQL, Plantillas, OpenAPI y Automatizaciones en WebQuote
Fecha: 2025-12-23  
Repo objetivo: dtreasuresp/webquote  
Descripción breve del repo: "WebQuote es una solución digital que transforma la complejidad de las cotizaciones..."  
Lenguaje principal: TypeScript (~97%)

Resumen
-------
Documento con pasos prácticos y comparativos para integrar las piezas descritas en CRM_Cotizaciones_Guia.md dentro de tu proyecto WebQuote (TypeScript). Incluye arquitectura propuesta, librerías recomendadas, pasos de migración, y ejemplos de integración.

1) Evaluación rápida del repo (dtreasuresp/webquote)
----------------------------------------------------
- Lenguaje: TypeScript (mayormente backend y/o frontend).
- Probablemente estructura típica: server (Express/Nest/Next API), frontend (React/Vue), scripts, tests.
- Dado que WebQuote ya es una solución de cotizaciones, se integrarán:
  - Base de datos Postgres (migraciones).
  - Endpoints REST (OpenAPI).
  - Motor de plantillas + generación de PDF (server-side).
  - Worker/cola para procesos asíncronos (PDF, integraciones).
  - Módulo de automatización/aprobaciones.

2) Arquitectura propuesta (alto nivel)
-------------------------------------
- Monolito modular en TypeScript o microservicios ligeros:
  - API server (Express/Nest/Next API) -> Exponer OpenAPI endpoints (/api/v1/quotes).
  - DB Postgres -> esquema provisto en CRM_Cotizaciones_Guia.md.
  - Worker service (Node) -> Puppeteer + generación PDF + subida a S3.
  - Queue (Redis + BullMQ) -> jobs: generate-pdf, send-email, sync-erp, approval-check.
  - Storage: S3 (o servicio compatible) para PDFs.
  - Integraciones externas: ERP, e-sign, pagos, tax service (con adaptadores).
  - UI: módulos para crear/editar quotes, ver versiones, flujo de aprobación.

3) Librerías y herramientas recomendadas (ecosistema TypeScript)
----------------------------------------------------------------
- DB & ORM / Query builder:
  - Prisma (recomendado por migraciones y DX) o TypeORM / Knex.
  - pg (driver Postgres).
- Migraciones:
  - Prisma Migrate o Umzug / Knex Migrations para SQL raw.
- Validación & schema:
  - zod (runtime + typescript) o ajv para JSON Schema.
- API framework:
  - NestJS (estructura modular, DTOs) o Express + routing-controllers.
- Background jobs:
  - BullMQ (Redis) o Bee-Queue.
- PDF generation:
  - Puppeteer (headless chrome) (preferible) o Playwright.
- Storage:
  - AWS SDK v3 (S3), or DigitalOcean Spaces.
- Email:
  - nodemailer, or transactional email (SendGrid, Mailgun).
- Observability:
  - Sentry (errores), Prometheus + Grafana (métricas).
- Tests:
  - Jest + supertest para endpoints.
- OpenAPI & Docs:
  - tsoa, NestJS Swagger, or openapi-generator.

4) Pasos concretos de integración
---------------------------------
Paso 0 — Preparación
- Fork / branch en repo webquote: feature/quotes-erp-integration.
- Añade variables de entorno en .env.example:
  - DATABASE_URL, REDIS_URL, S3_BUCKET, S3_KEY, S3_SECRET, JWT_SECRET, TAX_SERVICE_KEY, ERP_API_KEY.

Paso 1 — Esquema DB y migraciones
- Elegir herramienta (ej. Prisma).
  - Si Prisma: añadir schema.prisma y migraciones SQL con `prisma migrate dev`.
  - Si prefieres SQL raw: crear migrations SQL con Flyway/Liquibase o scripts.
- Ejecutar migración de staging y verificar integridad.

Paso 2 — Modelos y repositorios
- Crear módulos TypeScript para: accounts, contacts, products, quotes, quote-line-items, quote-versions.
- Implementar repositorios (Prisma client / TypeORM repositories) con funciones:
  - createQuote(payload), getQuote(id), listQuotes(filters), createLineItem, addQuoteVersion.

Paso 3 — Endpoints OpenAPI
- Implementar POST /api/v1/quotes conforme al spec OpenAPI incluido.
- Validar request body (zod / ajv) y responder 201 con ubicación.
- Añadir middleware de autenticación JWT y autorización por roles.

Paso 4 — Generación de PDF en background
- Implementar job producer: al crear quote -> encolar job `generate-quote-pdf` con quoteId.
- Worker (separado o en mismo proceso con worker pool) que:
  - Recupera datos de db, renderiza template (usar Handlebars/EJS/Liquid).
  - Lanza Puppeteer para renderizar HTML y obtener PDF.
  - Sube PDF a S3 y guarda URL en quotes.pdf_url y crea quote_versions.
  - Notifica al usuario (notificación en-app + email).

Paso 5 — Plantilla HTML y assets
- Añadir carpeta templates/quotes/ con template HTML y CSS.
- Permitir plantillas por idioma/pais: templates/quotes/es/default.hbs, en/default.hbs, etc.
- Permitir custom logos por account: store logo URLs en accounts.metadata or separate table.

Paso 6 — Cola y retries
- Configurar BullMQ (worker concurrency, retries, backoff).
- Implementar observabilidad: logs, metrics, dead-letter queue.

Paso 7 — Automatizaciones y aprobaciones
- Crear tabla approval_requests (id, quote_id, type, status, requested_by, approver_role, reason, created_at).
- Implementar workflow:
  - Al crear quote: ejecutar motor de reglas (lib JS) que evalúa umbrales.
  - Si approval required -> crear approval_request y notificar roles (email + in-app).
  - Endpoints para manager: GET /approvals/pending, POST /approvals/{id}/decision.
- Opcional: UI para aprobación (lista, vista detalle, aprobar/rechazar con comentarios).

Paso 8 — Integración con ERP / impuestos / pagos
- Crear adaptadores de integración (layer) con interfaces:
  - ERPAdapter.createOrder(orderPayload)
  - TaxAdapter.calculateTaxes(quoteData)
  - PaymentAdapter.createPaymentIntent(invoice)
- Encapsular llamadas externas con retries y circuit-breaker.

Paso 9 — Webhooks y eventos
- Publicar eventos (quote.created, quote.pdf_ready, quote.sent, quote.approved, quote.converted).
- Exponer endpoint webhook para recibir aceptación externa (p. ej. e-sign) y procesar conversión.

Paso 10 — Tests y despliegue
- Tests unitarios y e2e para flow de creación, validaciones fiscales y aprobaciones.
- CI: pipeline con migraciones en staging, tests, build, deploy.
- Monitoreo: healthchecks, job-queue metrics.

5) Mapeo directo de artefactos a codebase (sugerencia de estructura)
--------------------------------------------------------------------
/src
  /api
    /v1
      quotes.controller.ts   <-- endpoints OpenAPI
      approvals.controller.ts
  /services
    quote.service.ts         <-- lógica de creación + business rules
    pdf.service.ts           <-- encola y orquesta generación de PDF
    approval.service.ts
    tax.service.ts
  /workers
    pdf.worker.ts
    sync-erp.worker.ts
  /db
    prisma/ (o typeorm entities)
    migrations/
  /templates
    quotes/
      default.hbs
  /integrations
    erp.adapter.ts
    s3.adapter.ts
    esign.adapter.ts
  /jobs
    queues.ts
  /utils
    validators (zod schemas)
    formatters (currency, date)
  /config
    index.ts

6) Consideraciones prácticas y recomendaciones
----------------------------------------------
- Usa DTOs y validaciones desde el inicio (zod) para evitar errores en producción.
- Externaliza generación de PDF en worker para escalabilidad.
- Mantén plantillas y assets versionados (plantilla usada en quote.template_name).
- Evita bloquear la respuesta de creación con generación de PDF (async).
- Guarda snapshot de la cotización en `quote_versions` antes de cualquier cambio.
- Implementa feature toggles para desplegar gradualmente el motor de aprobaciones.
- Respeta normativa fiscal del país: logs, fields obligatorios para facturación electrónica.

7) Ejemplo rápido de flujo de integración (resumen)
---------------------------------------------------
1) Usuario crea cotización en UI -> POST /api/v1/quotes
2) API valida y crea registro en Postgres (quotes + quote_line_items).
3) API encola job generate-pdf y, si aplica, crea approval_request.
4) Worker genera PDF, sube a S3 y actualiza quote.pdf_url.
5) Notificaciones: email + in-app.
6) Si approval pending -> manager actúa -> estado actualizado.
7) Si cliente acepta -> webhook/endpoint -> crear order/invoice y sincronizar con ERP.

8) Checklist de despliegue
--------------------------
- [ ] Migraciones aplicadas en staging.
- [ ] Worker y Redis configurados.
- [ ] Buckets S3 y permisos.
- [ ] Claves de integración (ERP, Tax Service, e-sign).
- [ ] Monitorización y alertas en jobs fail.
- [ ] Tests de integración (PDF generation + approvals).

-------------------------------------------------------------------------------
Conclusión
-------
Integrar el ERD/SQL, plantillas HTML/PDF, OpenAPI y reglas de automatización en WebQuote es un esfuerzo manejable porque el repo ya es TypeScript. Recomiendo dividir la implementación en fases: DB + endpoints → PDF worker + templates → approval engine → integraciones externas. Si quieres, puedo:
- Generar las migraciones SQL listas para aplicar (Postgres).
- Crear la plantilla Handlebars con placeholders vinculables directamente a tu modelo.
- Generar ejemplos de código TypeScript (controllers/services/workers) adaptados a NestJS o Express.
¿Cuál prefieres que desarrolle primero?
-------------------------------------------------------------------------------
Fin de Integracion_WebQuote.md