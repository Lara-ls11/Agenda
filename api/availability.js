import { neon } from "@neondatabase/serverless";

function timeToMinutes(time) {
  const [hours, minutes] = String(time)
    .slice(0, 5)
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    mins
  ).padStart(2, "0")}`;
}

export default {
  async fetch(request) {
    try {
      const sql = neon(
        process.env.DATABASE_URL
      );

      if (request.method !== "GET") {
        return Response.json(
          {
            message: "Método não permitido.",
          },
          {
            status: 405,
          }
        );
      }

      const url = new URL(request.url);

      const date =
        url.searchParams.get("date");

      const totalDuration = Number(
        url.searchParams.get("duration")
      );

      if (
        !date ||
        !totalDuration ||
        totalDuration <= 0
      ) {
        return Response.json(
          {
            message:
              "Data ou duração inválida.",
          },
          {
            status: 400,
          }
        );
      }

      /* ===========================
         DIA DA SEMANA
      =========================== */

      const weekday = new Date(
        `${date}T12:00:00`
      ).getDay();

      /* ===========================
         HORÁRIO DE TRABALHO
      =========================== */

      const workingDays = await sql`
        SELECT
          weekday,
          is_open,
          start_time::text AS start_time,
          end_time::text AS end_time
        FROM working_hours
        WHERE weekday = ${weekday}
        LIMIT 1
      `;

      if (
        workingDays.length === 0 ||
        !workingDays[0].is_open
      ) {
        return Response.json([]);
      }

      const workingDay =
        workingDays[0];

      /* ===========================
         DEFINIÇÕES
      =========================== */

      const settingsRows = await sql`
        SELECT
          has_lunch_break,
          lunch_start::text AS lunch_start,
          lunch_end::text AS lunch_end,
          break_weekdays
        FROM business_settings
        WHERE id = 1
        LIMIT 1
      `;

      const settings =
        settingsRows[0] || {
          has_lunch_break: false,
          lunch_start: null,
          lunch_end: null,
          break_weekdays: [],
        };

      /* ===========================
         VERIFICAR SE ESTE DIA
         TEM PAUSA
      =========================== */

      const breakWeekdays =
        Array.isArray(
          settings.break_weekdays
        )
          ? settings.break_weekdays.map(
              Number
            )
          : [];

      const hasBreakToday =
        settings.has_lunch_break &&
        breakWeekdays.includes(
          weekday
        );

      /* ===========================
         DIA BLOQUEADO?
      =========================== */

      const blocked = await sql`
        SELECT id
        FROM blocked_dates
        WHERE
          start_date <= ${date}
          AND
          end_date >= ${date}
        LIMIT 1
      `;

      if (blocked.length > 0) {
        return Response.json([]);
      }

      /* ===========================
         MARCAÇÕES EXISTENTES
      =========================== */

      const bookings = await sql`
        SELECT
          booking_time::text AS booking_time,
          total_duration
        FROM bookings
        WHERE
          status = 'accepted'
          AND
          booking_date = ${date}
        ORDER BY booking_time
      `;

      /* ===========================
         CALCULAR HORÁRIOS
      =========================== */

      const opening =
        timeToMinutes(
          workingDay.start_time
        );

      const closing =
        timeToMinutes(
          workingDay.end_time
        );

      /*
        A pausa só é considerada
        se ESTE dia estiver selecionado.
      */

      const lunchStart =
        hasBreakToday &&
        settings.lunch_start
          ? timeToMinutes(
              settings.lunch_start
            )
          : null;

      const lunchEnd =
        hasBreakToday &&
        settings.lunch_end
          ? timeToMinutes(
              settings.lunch_end
            )
          : null;

      const available = [];

      for (
        let current = opening;
        current + totalDuration <=
        closing;
        current += 30
      ) {
        const end =
          current + totalDuration;

        /* ===========================
           PAUSA PARA ALMOÇO
        =========================== */

        if (
          lunchStart !== null &&
          lunchEnd !== null &&
          current < lunchEnd &&
          end > lunchStart
        ) {
          continue;
        }

        /* ===========================
           MARCAÇÕES EXISTENTES
        =========================== */

        const overlaps =
          bookings.some(
            (booking) => {
              const bookingStart =
                timeToMinutes(
                  booking.booking_time
                );

              const bookingEnd =
                bookingStart +
                Number(
                  booking.total_duration
                );

              return (
                current <
                  bookingEnd &&
                end >
                  bookingStart
              );
            }
          );

        if (!overlaps) {
          available.push(
            minutesToTime(current)
          );
        }
      }

      return Response.json(
        available
      );
    } catch (error) {
      console.error(
        "AVAILABILITY API ERROR:",
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