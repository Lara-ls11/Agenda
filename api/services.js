import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    // OBTER SERVIÇOS
    if (req.method === "GET") {
      const services = await sql`
        SELECT *
        FROM services
        WHERE active = true
        ORDER BY category, name
      `;

      return res.status(200).json(services);
    }

    // CRIAR SERVIÇO
    if (req.method === "POST") {
      const { name, category, duration, active = true } = req.body;

      const [service] = await sql`
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

      return res.status(201).json(service);
    }

    // EDITAR SERVIÇO
    if (req.method === "PUT") {
      const { id, name, category, duration, active = true } = req.body;

      const [service] = await sql`
        UPDATE services
        SET
          name = ${name},
          category = ${category},
          duration = ${duration},
          active = ${active}
        WHERE id = ${id}
        RETURNING *
      `;

      if (!service) {
        return res.status(404).json({
          message: "Serviço não encontrado.",
        });
      }

      return res.status(200).json(service);
    }

    // APAGAR SERVIÇO
    if (req.method === "DELETE") {
      const { id } = req.body;

      await sql`
        DELETE FROM services
        WHERE id = ${id}
      `;

      return res.status(200).json({
        success: true,
      });
    }

    return res.status(405).json({
      message: "Método não permitido.",
    });
  } catch (error) {
    console.error("SERVICES API ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
}