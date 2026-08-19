import { neon } from "@neondatabase/serverless";

export default async function handler(request, response) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const services = await sql`
      SELECT id, name, category, duration
      FROM services
      ORDER BY id
      LIMIT 5
    `;

    return response.status(200).json({
      success: true,
      message: "Ligação ao Neon está a funcionar!",
      services: services,
    });
  } catch (error) {
    console.error("NEON TEST ERROR:", error);

    return response.status(500).json({
      success: false,
      message: error.message,
    });
  }
}