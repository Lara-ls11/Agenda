import { neon } from "@neondatabase/serverless";

export default {
  async fetch(request) {
    try {
      const sql = neon(process.env.DATABASE_URL);

      // GET - obter serviços
      if (request.method === "GET") {
        const services = await sql`
          SELECT *
          FROM services
          WHERE active = true
          ORDER BY category, name
        `;

        return Response.json(services);
      }

      // POST - criar serviço
      if (request.method === "POST") {
        const body = await request.json();

        const {
          name,
          category,
          duration,
          active = true,
        } = body;

        const services = await sql`
          INSERT INTO services (
            name,
            category,
            duration,
            active
          )
          VALUES (
            ${name},
            ${category},
            ${duration},
            ${active}
          )
          RETURNING *
        `;

        return Response.json(services[0], {
          status: 201,
        });
      }

      // PUT - editar serviço
      if (request.method === "PUT") {
        const body = await request.json();

        const {
          id,
          name,
          category,
          duration,
          active = true,
        } = body;

        const services = await sql`
          UPDATE services
          SET
            name = ${name},
            category = ${category},
            duration = ${duration},
            active = ${active}
          WHERE id = ${id}
          RETURNING *
        `;

        if (services.length === 0) {
          return Response.json(
            {
              message: "Serviço não encontrado.",
            },
            {
              status: 404,
            }
          );
        }

        return Response.json(services[0]);
      }

      // DELETE - eliminar serviço
      if (request.method === "DELETE") {
        const body = await request.json();

        await sql`
          DELETE FROM services
          WHERE id = ${body.id}
        `;

        return Response.json({
          success: true,
        });
      }

      return Response.json(
        {
          message: "Método não permitido.",
        },
        {
          status: 405,
        }
      );
    } catch (error) {
      console.error("SERVICES API ERROR:", error);

      return Response.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 500,
        }
      );
    }
  },
};