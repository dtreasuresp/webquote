import { NextResponse } from 'next/server'

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'NovaSuite CRM API',
      description: 'API para la gestión de clientes, oportunidades, cotizaciones y automatización de NovaSuite.',
      version: '1.0.0',
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor principal',
      },
    ],
    paths: {
      '/crm/accounts': {
        get: {
          summary: 'Listar cuentas/clientes',
          responses: {
            '200': { description: 'Lista de cuentas' },
          },
        },
        post: {
          summary: 'Crear nueva cuenta',
          responses: {
            '201': { description: 'Cuenta creada' },
          },
        },
      },
      '/quotations': {
        get: {
          summary: 'Listar cotizaciones',
          responses: {
            '200': { description: 'Lista de cotizaciones' },
          },
        },
        post: {
          summary: 'Crear o actualizar cotización',
          responses: {
            '200': { description: 'Cotización guardada' },
          },
        },
      },
      '/crm/rules': {
        get: {
          summary: 'Listar reglas de automatización',
          responses: {
            '200': { description: 'Lista de reglas' },
          },
        },
      },
      '/quotations/{id}/pdf': {
        get: {
          summary: 'Generar PDF de cotización',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Documento HTML/PDF generado' },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  }

  return NextResponse.json(openApiSpec)
}
