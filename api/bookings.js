import { neon } from "@neondatabase/serverless";

function timeToMinutes(time) {
  const [hours, minutes] = String(time)
    .slice(0, 5)
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

function normalizeBooking(booking, services = []) {
  return {
    ...booking,

    booking_date: booking.booking_date
      ? String(booking.booking_date).slice(0, 10)
      : null,

    booking_time: booking.booking_time
      ? String(booking.booking_time).slice(0, 8)
      : null,

    booking_services: services.filter(
      (service) =>
        String(service.booking_id) === String(booking.id)
    ),
  };
}

export default {
  async fetch(request) {
    try {
      const sql = neon(process.env.DATABASE_URL);

      const url = new URL(request.url);

      /* ===========================
         GET
      =========================== */

      if (request.method === "GET") {
        const action =
          url.searchParams.get("action") || "all";

        /* ===========================
           UMA MARCAÇÃO
        =========================== */

        if (action === "one") {
          const id = Number(
            url.searchParams.get("id")
          );

          const bookings = await sql`
            SELECT
              id,
              client_name,
              phone,
              email,
              notes,
              booking_date::text AS booking_date,
              booking_time::text AS booking_time,
              total_duration,
              status,
              created_at,
              updated_at
            FROM bookings
            WHERE id = ${id}
            LIMIT 1
          `;

          if (bookings.length === 0) {
            return Response.json(
              {
                message: "Marcação não encontrada.",
              },
              {
                status: 404,
              }
            );
          }

          const bookingServices = await sql`
            SELECT
              id,
              booking_id,
              service_id,
              service_name,
              duration
            FROM booking_services
            WHERE booking_id = ${id}
            ORDER BY id
          `;

          return Response.json(
            normalizeBooking(
              bookings[0],
              bookingServices
            )
          );
        }

        /* ===========================
           CONFLITOS
        =========================== */

        if (action === "conflicts") {
          const bookingId = Number(
            url.searchParams.get("bookingId")
          );

          const bookingDate =
            url.searchParams.get("bookingDate");

          const bookingTime =
            url.searchParams.get("bookingTime");

          const totalDuration = Number(
            url.searchParams.get("totalDuration")
          );

          const bookings = await sql`
            SELECT
              id,
              client_name,
              booking_date::text AS booking_date,
              booking_time::text AS booking_time,
              total_duration,
              status
            FROM bookings
            WHERE booking_date = ${bookingDate}
              AND status = 'accepted'
              AND id <> ${bookingId}
            ORDER BY booking_time
          `;

          const newStart =
            timeToMinutes(bookingTime);

          const newEnd =
            newStart + totalDuration;

          const conflicts = bookings.filter(
            (booking) => {
              const existingStart =
                timeToMinutes(
                  booking.booking_time
                );

              const existingEnd =
                existingStart +
                Number(
                  booking.total_duration
                );

              return (
                newStart < existingEnd &&
                newEnd > existingStart
              );
            }
          );

          return Response.json(conflicts);
        }

        /* ===========================
           LISTAS
        =========================== */

        let bookings;

        if (action === "pending") {
          bookings = await sql`
            SELECT
              id,
              client_name,
              phone,
              email,
              notes,
              booking_date::text AS booking_date,
              booking_time::text AS booking_time,
              total_duration,
              status,
              created_at,
              updated_at
            FROM bookings
            WHERE status = 'pending'
            ORDER BY created_at ASC
          `;
        } else if (action === "accepted") {
          bookings = await sql`
            SELECT
              id,
              client_name,
              phone,
              email,
              notes,
              booking_date::text AS booking_date,
              booking_time::text AS booking_time,
              total_duration,
              status,
              created_at,
              updated_at
            FROM bookings
            WHERE status = 'accepted'
            ORDER BY booking_date ASC,
                     booking_time ASC
          `;
        } else {
          bookings = await sql`
            SELECT
              id,
              client_name,
              phone,
              email,
              notes,
              booking_date::text AS booking_date,
              booking_time::text AS booking_time,
              total_duration,
              status,
              created_at,
              updated_at
            FROM bookings
            ORDER BY booking_date ASC,
                     booking_time ASC
          `;
        }

        const bookingServices = await sql`
          SELECT
            id,
            booking_id,
            service_id,
            service_name,
            duration
          FROM booking_services
          ORDER BY id
        `;

        return Response.json(
          bookings.map((booking) =>
            normalizeBooking(
              booking,
              bookingServices
            )
          )
        );
      }

      /* ===========================
         POST - CRIAR
      =========================== */

      if (request.method === "POST") {
        const body = await request.json();

        const {
          booking,
          serviceIds,
        } = body;

        if (
          !booking?.client_name ||
          !booking?.phone ||
          !booking?.booking_date ||
          !booking?.booking_time
        ) {
          return Response.json(
            {
              message:
                "Faltam dados obrigatórios da marcação.",
            },
            {
              status: 400,
            }
          );
        }

        if (
          !Array.isArray(serviceIds) ||
          serviceIds.length === 0
        ) {
          return Response.json(
            {
              message:
                "É necessário selecionar pelo menos um serviço.",
            },
            {
              status: 400,
            }
          );
        }

        const numericServiceIds =
          serviceIds.map(Number);

        const services = await sql`
          SELECT
            id,
            name,
            duration,
            active
          FROM services
          WHERE active = true
          ORDER BY id
        `;

        const selectedServices =
          services.filter((service) =>
            numericServiceIds.includes(
              Number(service.id)
            )
          );

        if (
          selectedServices.length !==
          numericServiceIds.length
        ) {
          return Response.json(
            {
              message:
                "Um ou mais serviços selecionados não são válidos.",
            },
            {
              status: 400,
            }
          );
        }

        const totalDuration =
          selectedServices.reduce(
            (total, service) =>
              total +
              Number(service.duration),
            0
          );

        const createdBookings = await sql`
          INSERT INTO bookings (
            client_name,
            phone,
            email,
            notes,
            booking_date,
            booking_time,
            total_duration,
            status
          )
          VALUES (
            ${booking.client_name},
            ${booking.phone},
            ${booking.email || null},
            ${booking.notes || null},
            ${booking.booking_date},
            ${booking.booking_time},
            ${totalDuration},
            'pending'
          )
          RETURNING id
        `;

        const bookingId =
          createdBookings[0].id;

        for (const service of selectedServices) {
          await sql`
            INSERT INTO booking_services (
              booking_id,
              service_id,
              service_name,
              duration
            )
            VALUES (
              ${bookingId},
              ${service.id},
              ${service.name},
              ${service.duration}
            )
          `;
        }

        const createdBooking = await sql`
          SELECT
            id,
            client_name,
            phone,
            email,
            notes,
            booking_date::text AS booking_date,
            booking_time::text AS booking_time,
            total_duration,
            status,
            created_at,
            updated_at
          FROM bookings
          WHERE id = ${bookingId}
          LIMIT 1
        `;

        const bookingServices = await sql`
          SELECT
            id,
            booking_id,
            service_id,
            service_name,
            duration
          FROM booking_services
          WHERE booking_id = ${bookingId}
          ORDER BY id
        `;

        return Response.json(
          normalizeBooking(
            createdBooking[0],
            bookingServices
          ),
          {
            status: 201,
          }
        );
      }

      /* ===========================
         PUT
      =========================== */

      if (request.method === "PUT") {
        const body = await request.json();

        /* ALTERAR SÓ ESTADO */

        if (body.action === "status") {
          const id = Number(body.id);
          const status = body.status;

          const allowedStatuses = [
            "pending",
            "accepted",
            "rejected",
          ];

          if (
            !allowedStatuses.includes(
              status
            )
          ) {
            return Response.json(
              {
                message: "Estado inválido.",
              },
              {
                status: 400,
              }
            );
          }

          const updated = await sql`
            UPDATE bookings
            SET status = ${status}
            WHERE id = ${id}
            RETURNING id
          `;

          if (updated.length === 0) {
            return Response.json(
              {
                message:
                  "Marcação não encontrada.",
              },
              {
                status: 404,
              }
            );
          }

          return Response.json({
            success: true,
          });
        }

        /* ALTERAR MARCAÇÃO COMPLETA */

        const id = Number(body.id);

        const booking = body.booking;

        const services =
          body.services || [];

        if (
          !booking ||
          services.length === 0
        ) {
          return Response.json(
            {
              message:
                "Dados da marcação incompletos.",
            },
            {
              status: 400,
            }
          );
        }

        const updated = await sql`
          UPDATE bookings
          SET
            client_name =
              ${booking.client_name},
            phone =
              ${booking.phone},
            email =
              ${booking.email || null},
            notes =
              ${booking.notes || null},
            booking_date =
              ${booking.booking_date},
            booking_time =
              ${booking.booking_time},
            total_duration =
              ${Number(
                booking.total_duration
              )},
            status =
              ${booking.status}
          WHERE id = ${id}
          RETURNING id
        `;

        if (updated.length === 0) {
          return Response.json(
            {
              message:
                "Marcação não encontrada.",
            },
            {
              status: 404,
            }
          );
        }

        await sql`
          DELETE FROM booking_services
          WHERE booking_id = ${id}
        `;

        for (const service of services) {
          const serviceId =
            Number(service.id);

          const serviceName =
            service.name ||
            service.service_name;

          const duration =
            Number(service.duration);

          await sql`
            INSERT INTO booking_services (
              booking_id,
              service_id,
              service_name,
              duration
            )
            VALUES (
              ${id},
              ${serviceId},
              ${serviceName},
              ${duration}
            )
          `;
        }

        const updatedBooking = await sql`
          SELECT
            id,
            client_name,
            phone,
            email,
            notes,
            booking_date::text AS booking_date,
            booking_time::text AS booking_time,
            total_duration,
            status,
            created_at,
            updated_at
          FROM bookings
          WHERE id = ${id}
          LIMIT 1
        `;

        const bookingServices = await sql`
          SELECT
            id,
            booking_id,
            service_id,
            service_name,
            duration
          FROM booking_services
          WHERE booking_id = ${id}
          ORDER BY id
        `;

        return Response.json(
          normalizeBooking(
            updatedBooking[0],
            bookingServices
          )
        );
      }

      /* ===========================
         DELETE
      =========================== */

      if (request.method === "DELETE") {
        const body = await request.json();

        const id = Number(body.id);

        await sql`
          DELETE FROM booking_services
          WHERE booking_id = ${id}
        `;

        const deleted = await sql`
          DELETE FROM bookings
          WHERE id = ${id}
          RETURNING id
        `;

        if (deleted.length === 0) {
          return Response.json(
            {
              message:
                "Marcação não encontrada.",
            },
            {
              status: 404,
            }
          );
        }

        return Response.json({
          success: true,
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
        "BOOKINGS API ERROR:",
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