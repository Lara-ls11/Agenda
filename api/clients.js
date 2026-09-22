import { neon } from "@neondatabase/serverless";

export default {
  async fetch(request) {
    try {
      const sql = neon(process.env.DATABASE_URL);

      /* ===========================
         GET - DADOS DAS CLIENTES
      =========================== */

      if (request.method === "GET") {
        const bookings = await sql`
          SELECT
            b.id,
            b.client_name,
            b.phone,
            b.email,
            b.booking_date::text AS booking_date,
            b.booking_time::text AS booking_time,
            b.status
          FROM bookings b
          ORDER BY b.booking_date DESC,
                   b.booking_time DESC
        `;

        const bookingServices = await sql`
          SELECT
            id,
            booking_id,
            service_name
          FROM booking_services
          ORDER BY id
        `;

        const result = bookings.map((booking) => ({
          ...booking,

          booking_services:
            bookingServices.filter(
              (service) =>
                String(service.booking_id) ===
                String(booking.id)
            ),
        }));

        return Response.json(result);
      }

      /* ===========================
         PUT - EDITAR CLIENTE
      =========================== */

      if (request.method === "PUT") {
        const body = await request.json();

        const {
          originalPhone,
          originalEmail,
          name,
          phone,
          email,
        } = body;

        if (!name?.trim()) {
          return Response.json(
            {
              message:
                "O nome da cliente é obrigatório.",
            },
            {
              status: 400,
            }
          );
        }

        if (!phone?.trim()) {
          return Response.json(
            {
              message:
                "O telemóvel da cliente é obrigatório.",
            },
            {
              status: 400,
            }
          );
        }

        let updated;

        if (originalPhone) {
          updated = await sql`
            UPDATE bookings
            SET
              client_name = ${name.trim()},
              phone = ${phone.trim()},
              email = ${
                email?.trim() || null
              }
            WHERE phone = ${originalPhone}
            RETURNING id
          `;
        } else if (originalEmail) {
          updated = await sql`
            UPDATE bookings
            SET
              client_name = ${name.trim()},
              phone = ${phone.trim()},
              email = ${
                email?.trim() || null
              }
            WHERE email = ${originalEmail}
            RETURNING id
          `;
        } else {
          return Response.json(
            {
              message:
                "Não foi possível identificar a cliente.",
            },
            {
              status: 400,
            }
          );
        }

        return Response.json({
          success: true,
          updatedBookings: updated.length,
        });
      }

      /* ===========================
         DELETE - ELIMINAR CLIENTE
         + TODAS AS MARCAÇÕES
      =========================== */

      if (request.method === "DELETE") {
        const body = await request.json();

        const {
          originalPhone,
          originalEmail,
        } = body;

        let bookings;

        if (originalPhone) {
          bookings = await sql`
            SELECT id
            FROM bookings
            WHERE phone = ${originalPhone}
          `;
        } else if (originalEmail) {
          bookings = await sql`
            SELECT id
            FROM bookings
            WHERE email = ${originalEmail}
          `;
        } else {
          return Response.json(
            {
              message:
                "Não foi possível identificar a cliente.",
            },
            {
              status: 400,
            }
          );
        }

        const bookingIds =
          bookings.map((booking) =>
            Number(booking.id)
          );

        for (const bookingId of bookingIds) {
          await sql`
            DELETE FROM booking_services
            WHERE booking_id = ${bookingId}
          `;

          await sql`
            DELETE FROM bookings
            WHERE id = ${bookingId}
          `;
        }

        return Response.json({
          success: true,
          deletedBookings:
            bookingIds.length,
        });
      }

      return Response.json(
        {
          message:
            "Método não permitido.",
        },
        {
          status: 405,
        }
      );
    } catch (error) {
      console.error(
        "CLIENTS API ERROR:",
        error
      );

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