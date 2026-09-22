import { neon } from "@neondatabase/serverless";

function getTodayISO() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default {
  async fetch() {
    try {
      const sql = neon(
        process.env.DATABASE_URL
      );

      const today = getTodayISO();

      const pendingRows = await sql`
        SELECT COUNT(*)::int AS count
        FROM bookings
        WHERE status = 'pending'
      `;

      const todayRows = await sql`
        SELECT COUNT(*)::int AS count
        FROM bookings
        WHERE status = 'accepted'
          AND booking_date = ${today}
      `;

      const clientsRows = await sql`
        SELECT COUNT(
          DISTINCT phone
        )::int AS count
        FROM bookings
        WHERE phone IS NOT NULL
          AND phone <> ''
      `;

      const servicesRows = await sql`
        SELECT COUNT(*)::int AS count
        FROM services
        WHERE active = true
      `;

      const upcoming = await sql`
        SELECT
          id,
          client_name,
          phone,
          booking_date::text
            AS booking_date,
          booking_time::text
            AS booking_time,
          total_duration
        FROM bookings
        WHERE status = 'accepted'
          AND booking_date >= ${today}
        ORDER BY
          booking_date ASC,
          booking_time ASC
        LIMIT 5
      `;

      const upcomingIds =
        upcoming.map(
          (booking) =>
            Number(booking.id)
        );

      let bookingServices = [];

      if (
        upcomingIds.length > 0
      ) {
        bookingServices =
          await sql`
            SELECT
              id,
              booking_id,
              service_name,
              duration
            FROM booking_services
            WHERE booking_id =
              ANY(${upcomingIds})
            ORDER BY id
          `;
      }

      const upcomingWithServices =
        upcoming.map(
          (booking) => ({
            ...booking,

            booking_services:
              bookingServices.filter(
                (service) =>
                  String(
                    service.booking_id
                  ) ===
                  String(
                    booking.id
                  )
              ),
          })
        );

      return Response.json({
        stats: {
          pending:
            pendingRows[0]
              ?.count || 0,

          today:
            todayRows[0]
              ?.count || 0,

          clients:
            clientsRows[0]
              ?.count || 0,

          services:
            servicesRows[0]
              ?.count || 0,
        },

        upcoming:
          upcomingWithServices,
      });
    } catch (error) {
      console.error(
        "DASHBOARD API ERROR:",
        error
      );

      return Response.json(
        {
          success: false,
          message:
            error.message,
        },
        {
          status: 500,
        }
      );
    }
  },
};