# Guía completa: Datos que debe tener un CRM para gestionar clientes y crear cotizaciones
Fecha: 2025-12-23  
Usuario: dtreasuresp

Resumen
-------
Documento práctico y adaptado a tu negocio (mezcla de productos y servicios), con necesidad de integraciones y cumplimiento de requisitos fiscales. Aquí tienes:

- Campos imprescindibles (MVP) para cuentas y contactos.
- Campos y estructura necesarios para generar cotizaciones/propuestas.
- Campos avanzados y recomendaciones específicas para productos + servicios (y suscripciones).
- Modelo de datos y relaciones sugeridas.
- Validaciones y reglas de negocio obligatorias (incluyendo fiscales).
- Flujo recomendado para crear y gestionar cotizaciones.
- Integraciones clave y buenas prácticas de calidad de datos.
- Ejemplos: JSON de cotización y esquema SQL básico.
- Siguientes pasos recomendados.

1) Datos mínimos imprescindibles (MVP) — Cliente y Contactos
------------------------------------------------------------
Cliente (Account)
- id interno (UUID o secuencial)
- nombre legal / razón social
- nombre comercial (si difiere)
- tipo: empresa / particular / prospecto
- NIF / CIF / RUT / ID fiscal (por país)
- dirección fiscal completa (calle, número, ciudad, provincia/estado, CP, país)
- dirección de entrega (si aplica; multi-sede)
- teléfono principal
- email principal de contacto
- website
- moneda preferida
- idioma preferido
- sector / industria
- tamaño (nº empleados, ingresos aproximados)
- estado: prospecto / lead / cliente activo / inactivo
- fecha de creación / fuente (origen del lead)
- condiciones comerciales estándar (p. ej. Net30)
- etiquetas / categorías

Contacto (persona asociada)
- id de contacto
- nombre completo
- cargo / puesto
- email
- teléfono móvil / fijo
- rol en la compra (decisor, influenciador, usuario, técnico)
- preferencia de comunicación (email, teléfono)
- horarios de contacto preferidos
- notas / historial de relación
- cuenta_id (relación con Account)

2) Datos necesarios para generar cotizaciones (nivel documento)
---------------------------------------------------------------
Cabecera de la cotización (Quote)
- quote_id (Q-YYYY-XXXX) — numeración secuencial por serie/pais/año
- account_id
- contacto_principal_id
- oportunidad_id (opcional)
- usuario/vendedor_responsable_id
- fecha_emisión
- fecha_validez
- estado: borrador / enviado / aceptado / rechazado / expirado / convertido
- moneda (ISO)
- tipo_de_cambio (si moneda ≠ moneda_base) y fecha del tipo
- subtotal, impuestos_desglosados, descuento_total, cargos_adicionales, total
- impuestos_retención (si aplica)
- forma_pago propuesta (transferencia, tarjeta, crédito, etc.)
- términos y condiciones / notas comerciales
- plantilla_documento (referencia a la plantilla PDF/HTML)
- link a PDF generado / adjuntos
- canal de envío (email, portal cliente)
- meta: validez interna (aprobaciones requeridas)

Líneas de la cotización (QuoteLineItem)
- línea_id
- quote_id
- producto_id (si existe en catálogo) o descripción libre
- SKU / código producto
- tipo: producto / servicio / suscripción / tarifa
- unidad_de_medida
- cantidad
- precio_unitario (antes de impuestos)
- descuento_por_línea (% o importe)
- impuestos_por_línea (tipo y %)
- coste_unitario (para margen interno)
- importe_neto_línea, importe_total_línea
- fecha_entrega_estimada (si aplica)
- lead_time / plazo de ejecución (para servicios)
- notas de la línea (exclusiones, supuestos)
- condiciones de entrega/logística

Elementos documentales
- descuentos_globales y reglas aplicadas (historial)
- impuestos aplicados por jurisdicción (detallar tasa y base)
- retenciones aplicables por cliente/servicio
- código de proyecto/obra (si aplica)
- anexos: especificaciones técnicas, SOW (Statement of Work)

3) Campos avanzados / opcionales (recomendados)
------------------------------------------------
Catálogo de productos/servicios:
- product_id, nombre, descripción larga, SKU, familia/categoría
- coste_estándar, precio_lista, unidades_disponibles (stock), lead_time
- atributos (color, tamaño, versión, configurable)
- reglas de bundle / kits
- tipo_implicado (bien físico / servicio / licencia / suscripción)

Oportunidades / pipeline:
- oportunidad_id, etapa, probabilidad (%), importe_estimado, fecha_cierre_esperada, fuente, score

Historial e interacciones:
- actividades: email (con tracking), llamadas, reuniones, tareas, notas
- adjuntos: propuestas anteriores, contratos, comprobantes de pago

Pricing avanzado:
- listas_de_precios por cliente / por grupo
- precios por volumen (tramos), descuentos por campaña
- reglas de autorización para descuentos (roles/umbrales)

Suscripciones y servicios recurrentes:
- ciclo_facturación, periodo_inicio, periodo_fin, renovación_automática, penalizaciones

Cumplimiento y fiscal:
- registros de consentimiento (RGPD)
- documentación KYC / anti-fraude para grandes cuentas
- validación NIF / comprobantes fiscales
- reglas de IVA intracomunitario y retenciones locales por tipo de servicio

4) Modelo de datos y relaciones (alto nivel)
--------------------------------------------
Entidades principales:
- Account (clientes)
- Contact (personas)
- Product (catálogo)
- Opportunity (oportunidad de venta)
- Quote (cotización) -> QuoteLineItems
- Order / Contract (cuando se convierte)
- Invoice / Payment
- Activity (email, call, meeting)
- Document (PDFs, contratos)

Relaciones clave:
- Account 1..* Contact
- Account 1..* Opportunity
- Opportunity 1..* Quote
- Quote 1..* QuoteLineItem
- Quote -> Invoice (0..1 cuando se factura)
- Product 1..* QuoteLineItem (opcional)
- Account 1..* Invoice / Payment

5) Validaciones y reglas de negocio importantes (especial énfasis fiscal)
--------------------------------------------------------------------------
Reglas obligatorias antes de emitir cotización:
- Cliente y contacto principal obligatorios.
- Moneda declarada y, si procede, tipo de cambio con fecha.
- Al menos una línea con cantidad > 0 y precio_unitario definido.
- Fecha de emisión y fecha de validez.
- NIF/CIF válido (validación por país) cuando se requiere para facturación.
- Aplicación correcta del IVA / impuestos según país y tipo de servicio / producto.
- Exenciones: controles para IVA intracomunitario (verificación VIES) y retenciones aplicables.
- Control de descuentos: límites por rol (por ejemplo: vendedores hasta 10%, gerentes hasta 25%).
- Control de stock (productos físicos): alerta si cantidad > stock disponible o colocar backorder.
- Versionado: no sobrescribir cotizaciones históricas; guardar PDF + metadatos (quién, cuándo).

Reglas fiscales a considerar:
- Determinar si la prestación es sujeta a IVA, exenta o sujeta a retención según tipo de servicio y país.
- Para ventas intracomunitarias, registrar NIF intracomunitario y comprobación VIES.
- Integrar cálculo de impuestos por jurisdicción (pais + estado/provincia) y por producto/servicio.
- Registrar retenciones a cuenta cuando la normativa lo exija (p. ej. servicios profesionales con retención).
- Almacenamiento de datos requeridos para facturación electrónica (si aplica).

6) Flujo recomendado para crear una cotización (pasos)
------------------------------------------------------
1. Crear/seleccionar Account y Contact; verificar NIF y datos fiscales.
2. (Opcional) Crear Opportunity y asociarla a la cotización.
3. Seleccionar plantilla de cotización (idioma, moneda, branding).
4. Añadir líneas: producto/servicio, cantidades, precios (sugeridos por lista de precios).
5. Aplicar descuentos y promociones; sistema valida límites y solicita aprobación si excede.
6. Calcular impuestos según reglas fiscales (por línea y por documento).
7. Ejecutar validaciones (campos obligatorios, stock, NIF, tipo cambio).
8. Generar PDF con versión y firma opcional (e-sign).
9. Enviar por email desde CRM y registrar actividad (seguimiento, tracking de apertura).
10. Seguimiento: tareas, recordatorios automáticos, secuencia de contacto.
11. Si cliente acepta: convertir cotización a pedido/contrato y/o factura; sincronizar con ERP.
12. Mantener historial de versiones y estado final (aceptada/rechazada/expirada).

7) Campos mínimos por línea — resumen rápido
---------------------------------------------
- descripción, producto_id/SKU, cantidad, unidad, precio_unitario, descuento_linea, impuesto_linea, total_linea

8) Integraciones clave (tú necesitas integraciones)
----------------------------------------------------
Prioridad alta (recomendado):
- ERP / sistema de contabilidad (para sincronizar facturas, cuentas por cobrar y stock): Odoo, SAP, Microsoft Dynamics, Oracle, NetSuite.
- Plataforma de facturación electrónica si tu país lo requiere (p. ej. sistemas que generan facturas electrónicas con el formato fiscal local).
- Procesadores de pago (Stripe, PayPal, Adyen, PayU) para aceptar pagos desde la propia cotización.
- Firma electrónica (DocuSign, AdobeSign, ClickSign) para cerrar propuestas/contratos.
- Gestión de inventario / PIM (si manejas muchos SKU): sincronizar stock y lead times.
- Email y tracking (Gmail/Outlook + tracking de apertura) y soporte para plantillas.
- Herramientas de impuestos (TaxJar, Avalara) para cálculo automático por jurisdicción.
- Integración con herramientas BI/Reporting para análisis LTV, tasa de conversión y rendimiento comercial.

9) Buenas prácticas de calidad de datos
---------------------------------------
- Normalizar formatos de dirección y teléfono (usa librerías como libphonenumber).
- Validar NIF/ID fiscal según país antes de permitir facturación.
- Forzar campos obligatorios en flujos clave (cotización, facturación).
- Mantener audit trail (quién/qué/ cuándo) y no eliminar registros críticos.
- Gestión de duplicados: deduplicación por NIF + email + nombre.
- Regenerar PDF con cada versión y almacenar.
- Automatizar sincronización periódica con ERP para evitar divergencias.

10) Ejemplo mínimo JSON de una cotización
-----------------------------------------
```json
{
  "quote_id": "Q-2025-0001",
  "account_id": "A-100",
  "contact_id": "C-123",
  "opportunity_id": "O-50",
  "issue_date": "2025-12-23",
  "valid_until": "2026-01-06",
  "currency": "EUR",
  "exchange_rate": 1.0,
  "lines": [
    {
      "product_id": "P-10",
      "description": "Servicio de consultoría - 10h",
      "sku": "CONS-10",
      "type": "service",
      "quantity": 10,
      "unit": "hour",
      "unit_price": 80.00,
      "discount": 0,
      "tax_rate": 21.0,
      "line_total": 800.00
    },
    {
      "product_id": "P-200",
      "description": "Equipamiento - Modelo X",
      "sku": "EQX-200",
      "type": "product",
      "quantity": 2,
      "unit": "unit",
      "unit_price": 250.00,
      "discount": 10.0,
      "tax_rate": 21.0,
      "line_total": 450.00
    }
  ],
  "subtotal": 1250.00,
  "taxes": 262.50,
  "discount_total": 25.00,
  "total": 1487.50,
  "status": "sent",
  "sales_rep_id": "U-45",
  "pdf_url": "https://.../Q-2025-0001.pdf"
}
```

11) Esquema SQL (tablas esenciales) — ejemplo básico
----------------------------------------------------
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  nombre_legal TEXT NOT NULL,
  nombre_comercial TEXT,
  nif TEXT,
  direccion JSONB,
  telefono TEXT,
  email TEXT,
  moneda_preferida CHAR(3),
  idioma_preferido TEXT,
  sector TEXT,
  estado TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE contacts (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  nombre TEXT,
  cargo TEXT,
  email TEXT,
  telefono TEXT,
  rol_compra TEXT,
  preferencias JSONB,
  created_at TIMESTAMP
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  sku TEXT UNIQUE,
  nombre TEXT,
  descripcion TEXT,
  tipo TEXT, -- product/service/subscription
  precio_lista NUMERIC,
  coste NUMERIC,
  stock INTEGER,
  lead_time_days INTEGER
);

CREATE TABLE quotes (
  id UUID PRIMARY KEY,
  quote_number TEXT UNIQUE,
  account_id UUID REFERENCES accounts(id),
  contact_id UUID REFERENCES contacts(id),
  opportunity_id UUID,
  estado TEXT,
  moneda CHAR(3),
  exchange_rate NUMERIC,
  subtotal NUMERIC,
  taxes NUMERIC,
  discount NUMERIC,
  total NUMERIC,
  terms TEXT,
  pdf_url TEXT,
  created_by UUID,
  created_at TIMESTAMP
);

CREATE TABLE quote_line_items (
  id UUID PRIMARY KEY,
  quote_id UUID REFERENCES quotes(id),
  product_id UUID,
  descripcion TEXT,
  sku TEXT,
  tipo TEXT,
  cantidad NUMERIC,
  unidad TEXT,
  precio_unitario NUMERIC,
  descuento NUMERIC,
  impuesto NUMERIC,
  total NUMERIC
);
```

12) Plantillas y generación de PDF
----------------------------------
- Mantén plantillas HTML por idioma/region y usa un motor de plantillas (Handlebars, Liquid).
- Genera PDF desde HTML con librerías fiables (wkhtmltopdf, Puppeteer).
- Incluir: logo, datos fiscales del emisor, datos fiscales del cliente, desglose líneas, impuestos, validez y condiciones, firma y datos bancarios.
- Versiona la plantilla y registra cuál se usó para cada cotización.

13) Siguientes pasos que puedo hacer por ti
--------------------------------------------
Puedo:
- Generar un esquema de datos completo (ERD) adaptado a tu stack (Postgres, MySQL).
- Crear una plantilla HTML/PDF de cotización en tu branding.
- Preparar endpoints API (OpenAPI) para crear/leer cotizaciones.
- Diseñar reglas de automatización (ej. aprobaciones por descuento).
- Crear scripts de validación de NIF/VIES y reglas fiscales para tu país.
Dime cuál de estos prefieres y te lo preparo.

Observaciones finales (personalización a tu negocio)
----------------------------------------------------
Dado que manejas mezcla de productos y servicios, asegúrate de:
- Diferenciar el tratamiento fiscal entre bienes y servicios.
- Soportar líneas con servicios (horas, milestones) y productos físicos (stock, envío).
- Implementar reglas de facturación recurrente si tienes suscripciones.
- Priorizar integraciones con tu ERP/contabilidad y con una solución de impuestos automatizada (Avalara/TaxJar) y firma electrónica.

Si quieres que genere alguno de los artefactos siguientes (elige uno o varios):
- Esquema ERD/SQL completo adaptado (Postgres recomendado).
- Plantilla de cotización HTML + CSS lista para PDF (con tu logo si lo subes).
- Endpoint OpenAPI (spec) para crear cotizaciones.
- Reglas de automatización / flujo de aprobaciones en lenguaje legible.

¿Con cuál quieres que empiece?