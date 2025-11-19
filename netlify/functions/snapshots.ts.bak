import { Handler, HandlerContext } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const handler: Handler = async (
  event: any,
  context: HandlerContext
) => {
  const method = event.httpMethod;
  const queryParams = event.queryStringParameters || {};
  const id = queryParams.id;

  try {
    // GET /snapshots - Obtener todos los snapshots
    if (method === "GET") {
      const snapshots = await prisma.packageSnapshot.findMany({
        where: { activo: true },
        orderBy: { createdAt: "desc" },
      });

      return {
        statusCode: 200,
        body: JSON.stringify(snapshots),
      };
    }

    // POST /snapshots - Crear nuevo snapshot
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");

      const snapshot = await prisma.packageSnapshot.create({
        data: {
          nombre: body.nombre || "Sin nombre",
          serviciosBase: body.serviciosBase || [],
          gestionPrecio: body.gestionPrecio || 0,
          gestionMesesGratis: body.gestionMesesGratis || 0,
          gestionMesesPago: body.gestionMesesPago || 0,
          desarrollo: body.desarrollo || 0,
          descuento: body.descuento || 0,
          otrosServicios: body.otrosServicios || [],
          costoInicial: body.costoInicial || 0,
          costoAño1: body.costoAño1 || 0,
          costoAño2: body.costoAño2 || 0,
          activo: true,
        },
      });

      return {
        statusCode: 201,
        body: JSON.stringify(snapshot),
      };
    }

    // PUT /snapshots - Actualizar snapshot
    if (method === "PUT") {
      if (!id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "ID is required" }),
        };
      }

      const body = JSON.parse(event.body || "{}");

      const snapshot = await prisma.packageSnapshot.update({
        where: { id },
        data: {
          nombre: body.nombre,
          serviciosBase: body.serviciosBase,
          gestionPrecio: body.gestionPrecio,
          gestionMesesGratis: body.gestionMesesGratis,
          gestionMesesPago: body.gestionMesesPago,
          desarrollo: body.desarrollo,
          descuento: body.descuento,
          otrosServicios: body.otrosServicios,
          costoInicial: body.costoInicial,
          costoAño1: body.costoAño1,
          costoAño2: body.costoAño2,
        },
      });

      return {
        statusCode: 200,
        body: JSON.stringify(snapshot),
      };
    }

    // DELETE /snapshots - Eliminar (soft delete)
    if (method === "DELETE") {
      if (!id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "ID is required" }),
        };
      }

      const snapshot = await prisma.packageSnapshot.update({
        where: { id },
        data: { activo: false },
      });

      return {
        statusCode: 200,
        body: JSON.stringify(snapshot),
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  } catch (error: any) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Internal server error",
      }),
    };
  }
};
