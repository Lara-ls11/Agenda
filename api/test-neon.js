import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const services = await sql`
      SELECT id, name, category, duration
      FROM services
      ORDER BY id
      LIMIT 5
    `;

    return Response.json({
      success: true,
      services,
    });
  } catch (error) {
    console.error("NEON TEST ERROR:", error);

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
}