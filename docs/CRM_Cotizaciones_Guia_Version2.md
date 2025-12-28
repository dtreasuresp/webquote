# Guía completa: Datos que debe tener un CRM para gestionar clientes y crear cotizaciones
Fecha: 2025-12-23  
Usuario: dtreasuresp

Resumen
-------
Documento práctico y adaptado a tu negocio (mezcla de productos y servicios), con integración y requisitos fiscales. Contiene:

- Campos imprescindibles (MVP) para cuentas y contactos.
- Campos y estructura necesarios para generar cotizaciones/propuestas.
- Campos avanzados y recomendaciones específicas para productos + servicios (y suscripciones).
- Modelo de datos (ERD) y SQL completo para Postgres.
- Plantilla HTML + CSS lista para generar PDF de cotización (con logo).
- Especificación OpenAPI para crear cotizaciones.
- Reglas de automatización y flujo de aprobaciones en lenguaje legible.
- Siguientes pasos e integraciones recomendadas.

IMPORTANTE: Este documento complementa y amplía la versión previa. Incluye un ERD/SQL completo recomendado para Postgres, plantilla PDF y OpenAPI.

-------------------------------------------------------------------------------
CONTENIDO PRINCIPAL (resumen de secciones previas)
-------------------------------------------------------------------------------
(Se mantienen todos los campos y recomendaciones descritas en la versión anterior:
clientes/accounts, contactos, líneas de cotización, validaciones fiscales, reglas de precios,
integraciones con ERP/e-sign/impuestos, buenas prácticas de datos, y flujo de cotización).

A continuación se añaden las secciones solicitadas con detalle técnico.

-------------------------------------------------------------------------------
A. Esquema ERD / SQL completo (Postgres recomendado)
-------------------------------------------------------------------------------
Descripción general
- Diseño relacional normalizado, orientado a soportar: cuentas, contactos, catálogo, cotizaciones (con líneas), oportunidades, órdenes, facturas, pagos, actividades, y auditar versiones de cotización (historia).
- Uso de UUIDs (gen_random_uuid()) para PKs; secuencia para número legible de cotización por serie (por país/año).
- Índices para búsquedas frecuentes (account_id, quote_number, status, created_at).
- Tablas auxiliares: roles de aprobación, price_lists, taxes, warehouses (si aplica).

Diagrama relacional resumido (texto)
- accounts 1..* contacts
- accounts 1..* opportunities
- opportunities 1..* quotes
- quotes 1..* quote_line_items
- products 1..* quote_line_items (opcional)
- quotes 0..1 -> orders -> invoices -> payments
- activities (polimórfica) -> vinculado a account/contact/quote

SQL completo recomendado (Postgres)
Nota: requiere extensión pgcrypto para gen_random_uuid() y citext para emails si se desea case-insensitive.

-- Requisitos previos (ejecutar como superuser una vez)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Tabla: accounts
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name TEXT NOT NULL,
  trade_name TEXT,
  customer_type TEXT NOT NULL, -- 'company' | 'individual' | 'prospect'
  tax_id TEXT, -- NIF/CIF/RUT
  country CHAR(2),
  fiscal_address JSONB,
  billing_address JSONB,
  phone TEXT,
  email citext,
  website TEXT,
  currency CHAR(3) DEFAULT 'EUR',
  language TEXT DEFAULT 'es',
  industry TEXT,
  employees INTEGER,
  annual_revenue NUMERIC,
  status TEXT DEFAULT 'prospect', -- 'prospect'|'active'|'inactive'
  default_payment_terms TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_accounts_taxid ON accounts(tax_id);
CREATE INDEX idx_accounts_email ON accounts(email);

-- Tabla: contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (COALESCE(first_name,'') || ' ' || COALESCE(last_name,'')) STORED,
  job_title TEXT,
  email citext,
  phone TEXT,
  role_in_purchase TEXT, -- 'decision_maker'|'influencer'|'user'|'technical'
  preferred_contact_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_contacts_account ON contacts(account_id);
CREATE INDEX idx_contacts_email ON contacts(email);

-- Tabla: products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  product_type TEXT NOT NULL, -- 'product' | 'service' | 'subscription'
  category TEXT,
  unit_of_measure TEXT,
  cost_price NUMERIC,
  list_price NUMERIC,
  stock INTEGER DEFAULT 0,
  lead_time_days INTEGER,
  attributes JSONB, -- configurable attributes
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products USING gin (to_tsvector('spanish', name));

-- Tabla: taxes (aplicables)
CREATE TABLE taxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT,
  name TEXT,
  rate NUMERIC NOT NULL, -- e.g. 21.0
  country CHAR(2),
  region TEXT, -- estado/provincia si aplica
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_taxes_country ON taxes(country);

-- Tabla: price_lists (opcional)
CREATE TABLE price_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  currency CHAR(3) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE price_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id UUID REFERENCES price_lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  price NUMERIC,
  min_quantity NUMERIC DEFAULT 1
);
CREATE INDEX idx_price_list_product ON price_list_items(price_list_id, product_id);

-- Tabla: opportunities (opcional)
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  name TEXT,
  description TEXT,
  stage TEXT,
  probability NUMERIC,
  estimated_value NUMERIC,
  close_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_opps_account ON opportunities(account_id);

-- Secuencia y tabla para generar quote_number por serie (ej: Q-2025-ES-00001)
CREATE TABLE quote_series (
  id TEXT PRIMARY KEY, -- ejemplo 'ES-2025'
  last_seq INTEGER DEFAULT 0
);

-- Función para next number (transaccional)
CREATE OR REPLACE FUNCTION next_quote_number(series_id TEXT) RETURNS TEXT AS $$
DECLARE
  nxt INTEGER;
  prefix TEXT := series_id;
  result TEXT;
BEGIN
  LOOP
    UPDATE quote_series SET last_seq = last_seq + 1 WHERE id = series_id RETURNING last_seq INTO nxt;
    IF FOUND THEN
      result := prefix || '-' || lpad(nxt::text, 5, '0');
      RETURN result;
    END IF;
    BEGIN
      INSERT INTO quote_series(id, last_seq) VALUES (series_id, 0);
    EXCEPTION WHEN unique_violation THEN
      -- someone inserted concurrently, retry
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Tabla: quotes (cotizaciones)
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT UNIQUE, -- generado por next_quote_number('ES-2025') o similar
  series_id TEXT, -- referencia para la serie (ej 'ES-2025')
  account_id UUID REFERENCES accounts(id),
  contact_id UUID REFERENCES contacts(id),
  opportunity_id UUID REFERENCES opportunities(id),
  created_by UUID, -- user id
  status TEXT DEFAULT 'draft', -- 'draft'|'sent'|'accepted'|'rejected'|'expired'|'converted'
  currency CHAR(3),
  exchange_rate NUMERIC DEFAULT 1.0,
  issue_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  subtotal NUMERIC,
  tax_total NUMERIC,
  discount_total NUMERIC,
  other_charges NUMERIC,
  total NUMERIC,
  payment_terms TEXT,
  template_name TEXT,
  pdf_url TEXT,
  approval_status TEXT DEFAULT 'not_required', -- 'pending'|'approved'|'rejected'|'not_required'
  approval_flow_id UUID, -- si aplica
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_quotes_account ON quotes(account_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_number ON quotes(quote_number);

-- Tabla: quote_line_items
CREATE TABLE quote_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  line_number INTEGER,
  product_id UUID REFERENCES products(id),
  sku TEXT,
  description TEXT,
  item_type TEXT, -- 'product'|'service'|'subscription'
  quantity NUMERIC DEFAULT 1,
  unit TEXT,
  unit_price NUMERIC,
  discount_percent NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  tax_id UUID REFERENCES taxes(id),
  tax_rate NUMERIC,
  cost_price NUMERIC,
  line_subtotal NUMERIC, -- quantity * unit_price - discount
  line_tax NUMERIC,
  line_total NUMERIC,
  delivery_date DATE,
  notes TEXT
);
CREATE INDEX idx_qli_quote ON quote_line_items(quote_id);

-- Tabla: quote_versions (histórico de PDFs/metadatos)
CREATE TABLE quote_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  version_number INTEGER,
  pdf_url TEXT,
  snapshot JSONB, -- snapshot completo de la cotización
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: orders, invoices y payments (esquema básico)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id),
  account_id UUID REFERENCES accounts(id),
  order_number TEXT UNIQUE,
  status TEXT,
  total NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  invoice_number TEXT UNIQUE,
  issue_date DATE,
  due_date DATE,
  total NUMERIC,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id),
  payment_date DATE,
  amount NUMERIC,
  method TEXT,
  reference TEXT
);

-- Tabla: activities (registro de interacciones)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT, -- 'email'|'call'|'meeting'|'task'
  subject TEXT,
  body TEXT,
  related_type TEXT, -- 'account'|'contact'|'quote' ...
  related_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Muestras de triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_accounts_update BEFORE UPDATE ON accounts
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_products_update BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Índices compuestos adicionales según consultas
CREATE INDEX idx_quotes_account_status_created ON quotes(account_id, status, created_at);

-- Vistas recomendadas
CREATE VIEW vw_quote_summary AS
SELECT q.id, q.quote_number, q.account_id, a.legal_name, q.status, q.total, q.issue_date, q.valid_until
FROM quotes q JOIN accounts a ON q.account_id = a.id;

-------------------------------------------------------------------------------
B. Plantilla de cotización HTML + CSS lista para PDF
-------------------------------------------------------------------------------
Notas de uso
- Plantilla preparada para generar un HTML que luego se convierta a PDF con Puppeteer o wkhtmltopdf.
- Reemplaza {{PLACEHOLDER}} por tu motor de plantillas (Handlebars, Liquid, EJS).
- El logo puede subirse y almacenarse en S3/URL pública o embebido como base64.

Plantilla (HTML + CSS inline):
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Cotización {{quote_number}}</title>
  <style>
    :root{--brand:#0b5fff;--muted:#6b7280;--bg:#fff;--text:#111827}
    body{font-family: "Inter", "Helvetica Neue", Arial, sans-serif; color:var(--text); margin:0; padding:32px; background:var(--bg); font-size:13px}
    .container{max-width:900px; margin:0 auto; border:1px solid #e5e7eb; padding:28px; border-radius:6px}
    header{display:flex; justify-content:space-between; align-items:start}
    .brand{display:flex; gap:16px; align-items:center}
    .logo{width:140px; height:auto}
    .company-info{font-size:12px; color:var(--muted)}
    h1{margin:0; font-size:18px; color:var(--brand)}
    .meta{text-align:right; font-size:12px; color:var(--muted)}
    .addresses{display:flex; gap:24px; margin-top:18px}
    .box{flex:1; background:#fafafa; padding:12px; border-radius:6px; border:1px solid #f3f4f6}
    table{width:100%; border-collapse:collapse; margin-top:18px}
    th, td{padding:10px; border-bottom:1px solid #e6e7eb; text-align:left; vertical-align:top}
    th{background:#f8fafc; font-weight:600; font-size:12px; color:#374151}
    .right{text-align:right}
    .currency{white-space:nowrap}
    tfoot td{border-top:2px solid #e6e7eb; font-weight:700}
    .notes{margin-top:16px; font-size:12px; color:var(--muted)}
    .footer{margin-top:28px; font-size:11px; color:var(--muted); text-align:center}
    .badge{display:inline-block; padding:6px 10px; border-radius:4px; background:#eef2ff; color:var(--brand); font-weight:600; font-size:12px}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <!-- Sustituye src por URL del logo o data:image/png;base64,... -->
        <img class="logo" src="{{company_logo_url}}" alt="{{company_name}} logo" />
        <div>
          <h1>{{company_name}}</h1>
          <div class="company-info">
            {{company_legal_name}}<br/>
            NIF: {{company_tax_id}}<br/>
            {{company_address_line}}<br/>
            {{company_email}} • {{company_phone}}
          </div>
        </div>
      </div>
      <div class="meta">
        <div class="badge">COTIZACIÓN</div>
        <div style="margin-top:10px">
          <div><strong>Nº</strong> {{quote_number}}</div>
          <div><strong>Emitida:</strong> {{issue_date}}</div>
          <div><strong>Validez:</strong> {{valid_until}}</div>
          <div><strong>Moneda:</strong> {{currency}}</div>
        </div>
      </div>
    </header>

    <div class="addresses">
      <div class="box">
        <strong>Cliente</strong><br/>
        {{account_legal_name}}<br/>
        Attn: {{contact_full_name}} - {{contact_job_title}}<br/>
        NIF: {{account_tax_id}}<br/>
        {{account_billing_address}}
      </div>
      <div class="box">
        <strong>Condiciones</strong><br/>
        Pago: {{payment_terms}}<br/>
        Entrega estimada: {{delivery_terms}}<br/>
        Vendedor: {{sales_rep_name}}<br/>
        Oportunidad: {{opportunity_name}}
      </div>
    </div>

    <table aria-describedby="items">
      <thead>
        <tr>
          <th style="width:6%">#</th>
          <th style="width:44%">Descripción</th>
          <th style="width:12%">SKU</th>
          <th style="width:8%">Cant.</th>
          <th style="width:10%">Precio unit.</th>
          <th style="width:10%">Impuesto</th>
          <th style="width:10%">Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each lines}}
        <tr>
          <td>{{line_number}}</td>
          <td>
            <strong>{{description}}</strong><br/>
            <small style="color:#6b7280">{{notes}}</small>
          </td>
          <td>{{sku}}</td>
          <td class="right">{{quantity}} {{unit}}</td>
          <td class="right currency">{{unit_price}}</td>
          <td class="right">{{tax_rate}}%</td>
          <td class="right currency">{{line_total}}</td>
        </tr>
        {{/each}}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5"></td>
          <td class="right">Subtotal</td>
          <td class="right currency">{{subtotal}}</td>
        </tr>
        <tr>
          <td colspan="5"></td>
          <td class="right">Descuento</td>
          <td class="right currency">-{{discount_total}}</td>
        </tr>
        <tr>
          <td colspan="5"></td>
          <td class="right">Impuestos</td>
          <td class="right currency">{{tax_total}}</td>
        </tr>
        <tr>
          <td colspan="5"></td>
          <td class="right">Total</td>
          <td class="right currency">{{total}}</td>
        </tr>
      </tfoot>
    </table>

    <div class="notes">
      <strong>Notas:</strong><br/>
      {{terms_and_conditions}}
    </div>

    <div class="footer">
      Documento generado desde WebQuote • {{company_website}} • {{company_email}}
    </div>
  </div>
</body>
</html>

Recomendaciones de generación de PDF
- Utiliza Puppeteer para mayor fidelidad (soporta CSS moderno): genera PDF desde HTML renderizado en headless Chrome.
- Alternativa: wkhtmltopdf (menos mantenimiento, puede fallar con CSS moderno).
- Genera una versión PDF por cada versión de cotización y guarda la URL en `quotes.pdf_url` o almacena en S3.
- Para imágenes (logo), usa URL pública o inserta data-uri base64 si quieres PDF autónomo.

-------------------------------------------------------------------------------
C. Especificación OpenAPI (spec) para crear cotizaciones
-------------------------------------------------------------------------------
OpenAPI 3.0 (YAML) — Endpoint principal: POST /api/v1/quotes

openapi: 3.0.3
info:
  title: WebQuote API
  version: "1.0.0"
  description: API para crear y gestionar cotizaciones
servers:
  - url: https://api.tudominio.com/api/v1
paths:
  /quotes:
    post:
      summary: Crear una nueva cotización
      operationId: createQuote
      tags:
        - quotes
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/QuoteCreate'
      responses:
        '201':
          description: Cotización creada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/QuoteResponse'
        '400':
          description: Datos inválidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: No autorizado
        '422':
          description: Validación fallida (ej. stock insuficiente, NIF inválido)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    LineItem:
      type: object
      required:
        - description
        - quantity
        - unit_price
      properties:
        product_id:
          type: string
          format: uuid
        sku:
          type: string
        description:
          type: string
        item_type:
          type: string
          enum: [product, service, subscription]
        quantity:
          type: number
          minimum: 0.0001
        unit:
          type: string
        unit_price:
          type: number
        discount_percent:
          type: number
          minimum: 0
        tax_id:
          type: string
          format: uuid
        delivery_date:
          type: string
          format: date
        notes:
          type: string
    QuoteCreate:
      type: object
      required: [account_id, contact_id, currency, lines]
      properties:
        account_id:
          type: string
          format: uuid
        contact_id:
          type: string
          format: uuid
        opportunity_id:
          type: string
          format: uuid
        currency:
          type: string
          example: "EUR"
        exchange_rate:
          type: number
          default: 1.0
        issue_date:
          type: string
          format: date
        valid_until:
          type: string
          format: date
        payment_terms:
          type: string
        template_name:
          type: string
        metadata:
          type: object
        lines:
          type: array
          items:
            $ref: '#/components/schemas/LineItem'
    QuoteResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        quote_number:
          type: string
        status:
          type: string
        pdf_url:
          type: string
        created_at:
          type: string
          format: date-time
        total:
          type: number
    Error:
      type: object
      properties:
        message:
          type: string
    ValidationError:
      type: object
      properties:
        errors:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              message:
                type: string

Consideraciones de implementación
- Validar request body con JSON Schema o librerías de validación (ajv, zod).
- Autorización: JWT con claims para user_id y roles (vendedor, manager).
- Tras crear la cotización en DB, disparar generación de PDF en background job; respuesta 201 puede incluir location y state `processing_pdf`.
- Emitir eventos/webhooks: quote.created, quote.sent, quote.approved, quote.converted.

-------------------------------------------------------------------------------
D. Reglas de automatización / flujo de aprobaciones (legible)
-------------------------------------------------------------------------------
Objetivo: automatizar aprobaciones y asegurar controles de negocio (descuento, fiscal, crédito, stock).

Reglas base (configurables)
1. Control de descuentos:
   - Vendedor junior: máximo 10% por línea o global.
   - Vendedor senior: máximo 20%.
   - Gerente: hasta 40% con aprobación explícita.
   - Si descuento_total > 20% -> crear solicitud de aprobación (approval_status = pending) y notificar al rol "manager".
2. Control de crédito:
   - Si account.credit_limit exists y (outstanding + quote_total) > credit_limit -> marcar `approval_status = pending_credit` y notificar a finanzas.
3. Control de stock / lead time:
   - Para productos físicos: si quantity > stock -> marcar `backorder = true` y notificar operaciones. Si stock insuficiente y lead_time > threshold -> notificar riesgo de entrega tardía.
4. Validaciones fiscales:
   - Si country ≠ empresa y marca venta intracomunitaria -> verificar NIF intracomunitario (VIES). Si falla -> bloquear emisión hasta que se valide.
   - Determinar si aplicar retención para servicios; si aplica, mostrar en desglose y en metadata.
5. Autorizaciones por monto:
   - Si total > X1 -> approval by Sales Manager required.
   - Si total > X2 -> approval by Director + Finances.
   - X1/X2 valores configurables por país/serie.
6. Aprobación automática (reglas de bypass):
   - Si cliente está en lista blanca (trusted_customers) y descuento < Y -> auto-approve.
7. Expiración y recordatorios:
   - Enviar recordatorio automático a los 7 y 2 días antes de `valid_until` si status = sent y no respuesta.
   - Si `valid_until` pasado -> marcar expired y notificar vendedor.
8. Conversión automática a pedido:
   - Si se recibe aceptación vía API / webhook (quote.accepted) -> crear orden, reservar stock y generar factura pendiente (según configuración).
9. Registro de auditoría:
   - Cada cambio de estado o aprobación debe guardarse en `quote_versions` o `activity` con user_id y timestamp.
10. Workflows de aprobaciones (ejemplo legible)
    - Paso 1: Vendedor crea quote (estado draft).
    - Paso 2: Vendedor envía quote (status -> sent). Sistema calcula reglas (descuento, stock, fiscal).
    - Paso 3: Si alguna regla dispara `approval_required`, crear approval request con metadata y enviar notificación al manager (email + app).
    - Paso 4: Manager revisa (resume con link a quote + razones). Decide: approve / reject / request changes.
      - Approve -> approval_status = approved, quote.status puede pasar a `sent` (o remain sent) y notificar vendedor.
      - Reject -> approval_status = rejected, quote.status -> `needs_changes`, asignar tarea al vendedor.
    - Paso 5: Si aprobado y cliente acepta -> endpoint `POST /quotes/{id}/accept` o webhook de e-sign -> convertir en order/invoice.
11. Integración con emails y firma:
    - Auto-incluir botón "Accept & Sign" en PDF/email que dirija al portal de cliente o e-sign.
    - Cuando el cliente firma, disparar evento de aceptación.
12. Notificaciones y canales:
    - Email (SMTP), in-app notifications, Slack/Teams para urgentes.
    - Webhooks para sistemas externos (ERP / contabilidad) cuando quote es converted/approved.

Reglas extensibles y parametrizables
- Mantén las reglas en una tabla/config JSON para poder actualizarlas sin re-desplegar.
- Exponer un admin UI para ajustar umbrales (X1, X2), listas blancas, roles y plantillas de notificación.

-------------------------------------------------------------------------------
E. Operativa recomendada para la generación de PDF y jobs background
-------------------------------------------------------------------------------
- Flujo:
  1) POST /quotes crea registro en DB (status=draft o sent).
  2) Sistema encola job "generate-quote-pdf" con id de quote.
  3) Worker (Puppeteer) renderiza template + datos -> genera PDF -> sube a S3 -> guarda URL en quotes.pdf_url y crea entry en quote_versions.
  4) Notifica usuario y/o envía email con adjunto o link.
- Uso de colas: bullmq (Redis), RabbitMQ o similar.
- Retry y observabilidad: exponer logs y métricas (Prometheus).

-------------------------------------------------------------------------------
F. Migraciones y Backwards compatibility
-------------------------------------------------------------------------------
- Versiona migraciones (Flyway, Liquibase, or TypeORM/Prisma migrations).
- Si ya tienes datos, escribir scripts para migrar accounts/contactos y mapear campos fiscales.
- Crear tabla `quote_versions` desde inicio para almacenar copias históricas.
- Prueba en staging con datos anonimizados.

-------------------------------------------------------------------------------
G. Seguridad y cumplimiento
-------------------------------------------------------------------------------
- Protección de endpoints con JWT + scopes (create:quotes, approve:quotes).
- Encripta datos sensibles (tokens de pago).
- Conserva consentimientos RGPD en accounts.metadata.consent.
- Registros de auditoría inmutables para requisitos fiscales.

-------------------------------------------------------------------------------
H. Siguientes pasos recomendados
-------------------------------------------------------------------------------
- Implementar migraciones en un entorno de staging.
- Crear el servicio de generación de PDF (Puppeteer) como worker independiente.
- Implementar endpoint POST /api/v1/quotes según OpenAPI y validar con ajv/zod.
- Configurar colas y notificaciones para aprobaciones.
- Integrar con sistema de impuestos (Avalara/TaxJar) si las reglas fiscales son complejas.
- Crear UI/UX para aprobaciones y gestión de versiones en WebQuote.

-------------------------------------------------------------------------------
Apéndice: Ejemplo de payload para crear cotización (ejecución)
-------------------------------------------------------------------------------
POST /api/v1/quotes
{
  "account_id": "a3f4...uuid",
  "contact_id": "c9b2...uuid",
  "currency": "EUR",
  "issue_date": "2025-12-23",
  "valid_until": "2026-01-06",
  "payment_terms": "Net30",
  "lines": [
    {
      "product_id": "p-10-uuid",
      "sku": "CONS-10",
      "description": "Servicio de consultoría - 10h",
      "item_type": "service",
      "quantity": 10,
      "unit": "hour",
      "unit_price": 80.00,
      "tax_id": "tax-iva-21"
    }
  ]
}

-------------------------------------------------------------------------------
Fin del documento CRM_Cotizaciones_Guia.md
-------------------------------------------------------------------------------