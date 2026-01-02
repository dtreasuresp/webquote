/**
 * Generador de HTML profesional para cotizaciones
 * Diseñado para ser convertido a PDF o visualizado en navegador
 */

export function generateQuoteHtml(quotation: any, customTemplate?: string): string {
  if (customTemplate) {
    // Reemplazar placeholders básicos en la plantilla personalizada
    let html = customTemplate;
    const placeholders: Record<string, any> = {
      numero: quotation.numero,
      empresa: quotation.empresa,
      presupuesto: quotation.presupuesto,
      moneda: quotation.moneda,
      fechaEmision: new Date(quotation.fechaEmision).toLocaleDateString('es-ES'),
      fechaVencimiento: new Date(quotation.fechaVencimiento).toLocaleDateString('es-ES'),
      profesional: quotation.profesional,
      empresaProveedor: quotation.empresaProveedor,
      emailProveedor: quotation.emailProveedor,
      whatsappProveedor: quotation.whatsappProveedor,
      ubicacionProveedor: quotation.ubicacionProveedor,
      heroTituloMain: quotation.heroTituloMain,
      heroTituloSub: quotation.heroTituloSub,
    };

    for (const [key, value] of Object.entries(placeholders)) {
      const val = value !== null && value !== undefined ? String(value) : '';
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), val);
    }
    
    // Si la plantilla no es un documento HTML completo, envolverla
    if (!html.toLowerCase().includes('<html')) {
      return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
    }
    
    return html;
  }

  const {
    numero,
    empresa,
    presupuesto,
    moneda,
    fechaEmision,
    fechaVencimiento,
    profesional,
    empresaProveedor,
    emailProveedor,
    whatsappProveedor,
    ubicacionProveedor,
    heroTituloMain,
    heroTituloSub,
    serviciosBaseTemplate,
    serviciosOpcionalesTemplate,
    opcionesPagoTemplate,
    notasPago
  } = quotation

  const formattedDate = new Date(fechaEmision).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  const formattedExpiry = new Date(fechaVencimiento).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización ${numero}</title>
    <style>
        :root {
            --primary: #10b981;
            --secondary: #064e3b;
            --text: #1f2937;
            --text-light: #6b7280;
            --bg: #ffffff;
            --bg-alt: #f9fafb;
            --border: #e5e7eb;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            color: var(--text);
            line-height: 1.6;
            background: #f3f4f6;
            padding: 40px 20px;
        }

        .page {
            max-width: 800px;
            margin: 0 auto;
            background: var(--bg);
            padding: 60px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border-radius: 8px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid var(--primary);
            padding-bottom: 30px;
            margin-bottom: 40px;
        }

        .logo-section h1 {
            color: var(--primary);
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -1px;
        }

        .quote-info {
            text-align: right;
        }

        .quote-info h2 {
            font-size: 14px;
            color: var(--text-light);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .quote-info .number {
            font-size: 24px;
            font-weight: 700;
            color: var(--secondary);
        }

        .details-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 40px;
            margin-bottom: 50px;
        }

        .detail-box h3 {
            font-size: 12px;
            color: var(--primary);
            text-transform: uppercase;
            margin-bottom: 10px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 5px;
        }

        .detail-box p {
            font-size: 14px;
            margin-bottom: 4px;
        }

        .hero-section {
            background: var(--secondary);
            color: white;
            padding: 30px;
            border-radius: 6px;
            margin-bottom: 40px;
            text-align: center;
        }

        .hero-section h2 {
            font-size: 20px;
            margin-bottom: 5px;
        }

        .hero-section p {
            font-size: 14px;
            opacity: 0.8;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        th {
            background: var(--bg-alt);
            text-align: left;
            padding: 12px 15px;
            font-size: 12px;
            text-transform: uppercase;
            color: var(--text-light);
            border-bottom: 2px solid var(--border);
        }

        td {
            padding: 15px;
            border-bottom: 1px solid var(--border);
            font-size: 14px;
        }

        .total-section {
            margin-left: auto;
            width: 300px;
            background: var(--bg-alt);
            padding: 20px;
            border-radius: 6px;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }

        .total-row.grand-total {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid var(--primary);
            font-weight: 800;
            font-size: 20px;
            color: var(--secondary);
        }

        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid var(--border);
            font-size: 12px;
            color: var(--text-light);
            text-align: center;
        }

        @media print {
            body { background: white; padding: 0; }
            .page { box-shadow: none; width: 100%; max-width: 100%; }
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <div class="logo-section">
                <h1>${empresaProveedor || 'NovaSuite'}</h1>
                <p style="font-size: 12px; color: var(--text-light)">${ubicacionProveedor || ''}</p>
            </div>
            <div class="quote-info">
                <h2>Cotización</h2>
                <div class="number">${numero}</div>
                <p style="font-size: 12px; color: var(--text-light)">Emitida el ${formattedDate}</p>
            </div>
        </div>

        <div class="details-grid">
            <div class="detail-box">
                <h3>Cliente</h3>
                <p><strong>${empresa}</strong></p>
                <p>Válida hasta: ${formattedExpiry}</p>
            </div>
            <div class="detail-box">
                <h3>Contacto Comercial</h3>
                <p>${profesional || 'Asesor Comercial'}</p>
                <p>${emailProveedor || ''}</p>
                <p>${whatsappProveedor || ''}</p>
            </div>
        </div>

        <div class="hero-section">
            <h2>${heroTituloMain}</h2>
            <p>${heroTituloSub}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Descripción del Servicio</th>
                    <th style="text-align: right">Inversión</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Servicios Base y Configuración Inicial</td>
                    <td style="text-align: right">${moneda} ${presupuesto}</td>
                </tr>
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">
                <span>Subtotal</span>
                <span>${moneda} ${presupuesto}</span>
            </div>
            <div class="total-row">
                <span>Impuestos (IVA 0%)</span>
                <span>${moneda} 0.00</span>
            </div>
            <div class="total-row grand-total">
                <span>Total</span>
                <span>${moneda} ${presupuesto}</span>
            </div>
        </div>

        <div style="margin-top: 40px">
            <h3 style="font-size: 14px; color: var(--primary); text-transform: uppercase; margin-bottom: 10px">Términos y Condiciones</h3>
            <p style="font-size: 13px; color: var(--text-light)">${notasPago || 'El pago se realizará según lo acordado en las opciones de pago seleccionadas.'}</p>
        </div>

        <div class="footer">
            <p>Esta cotización es un documento oficial generado por ${empresaProveedor || 'NovaSuite'}.</p>
            <p>Gracias por confiar en nuestros servicios profesionales.</p>
        </div>
    </div>
</body>
</html>
  `
}
