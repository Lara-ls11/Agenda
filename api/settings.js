import { neon } from "@neondatabase/serverless";

export default {
  async fetch(request) {
    try {
      const sql = neon(process.env.DATABASE_URL);

      const url = new URL(request.url);

      const action =
        url.searchParams.get("action");

      /* =================================
         GET
      ================================= */

      if (request.method === "GET") {
        /* -------------------------
           HORÁRIOS
        ------------------------- */

        if (action === "working-hours") {
          const data = await sql`
            SELECT
              weekday,
              is_open,
              start_time::text AS start_time,
              end_time::text AS end_time
            FROM working_hours
            ORDER BY weekday ASC
          `;

          return Response.json(data);
        }

        /* -------------------------
           DEFINIÇÕES DO NEGÓCIO
        ------------------------- */

        if (action === "business") {
          const data = await sql`
            SELECT
              id,
              has_lunch_break,
              lunch_start::text AS lunch_start,
              lunch_end::text AS lunch_end,
              break_weekdays
            FROM business_settings
            WHERE id = 1
            LIMIT 1
          `;

          if (data.length === 0) {
            return Response.json({
              id: 1,
              has_lunch_break: false,
              lunch_start: null,
              lunch_end: null,
              break_weekdays: [],
            });
          }

          return Response.json(data[0]);
        }

        /* -------------------------
           DIAS / PERÍODOS BLOQUEADOS
        ------------------------- */

        if (action === "blocked-dates") {
          const data = await sql`
            SELECT
              id,
              start_date::text AS start_date,
              end_date::text AS end_date,
              reason
            FROM blocked_dates
            ORDER BY start_date ASC
          `;

          return Response.json(data);
        }

        return Response.json(
          {
            message: "Ação inválida.",
          },
          {
            status: 400,
          }
        );
      }

      /* =================================
         PUT
      ================================= */

      if (request.method === "PUT") {
        const body = await request.json();

        /* -------------------------
           GUARDAR HORÁRIOS
        ------------------------- */

        if (body.action === "working-hours") {
          const schedule = body.schedule;

          if (!Array.isArray(schedule)) {
            return Response.json(
              {
                message: "Horário inválido.",
              },
              {
                status: 400,
              }
            );
          }

          for (const day of schedule) {
            const weekday =
              Number(day.weekday);

            const isOpen =
              Boolean(day.open);

            const startTime =
              isOpen
                ? day.start
                : null;

            const endTime =
              isOpen
                ? day.end
                : null;

            await sql`
              INSERT INTO working_hours (
                weekday,
                is_open,
                start_time,
                end_time
              )
              VALUES (
                ${weekday},
                ${isOpen},
                ${startTime},
                ${endTime}
              )
              ON CONFLICT (weekday)
              DO UPDATE SET
                is_open =
                  EXCLUDED.is_open,
                start_time =
                  EXCLUDED.start_time,
                end_time =
                  EXCLUDED.end_time
            `;
          }

          return Response.json({
            success: true,
          });
        }

        /* -------------------------
           DEFINIÇÕES DO NEGÓCIO
        ------------------------- */

        if (body.action === "business") {
          const {
            hasLunchBreak,
            lunchStart,
            lunchEnd,
            breakWeekdays,
          } = body;

          const normalizedBreakWeekdays =
            Array.isArray(breakWeekdays)
              ? breakWeekdays
                  .map(Number)
                  .filter(
                    (day) =>
                      Number.isInteger(day) &&
                      day >= 0 &&
                      day <= 6
                  )
              : [];

          await sql`
            INSERT INTO business_settings (
              id,
              has_lunch_break,
              lunch_start,
              lunch_end,
              break_weekdays
            )
            VALUES (
              1,
              ${Boolean(hasLunchBreak)},
              ${
                hasLunchBreak
                  ? lunchStart
                  : null
              },
              ${
                hasLunchBreak
                  ? lunchEnd
                  : null
              },
              ${normalizedBreakWeekdays}
            )
            ON CONFLICT (id)
            DO UPDATE SET
              has_lunch_break =
                EXCLUDED.has_lunch_break,
              lunch_start =
                EXCLUDED.lunch_start,
              lunch_end =
                EXCLUDED.lunch_end,
              break_weekdays =
                EXCLUDED.break_weekdays
          `;

          return Response.json({
            success: true,
          });
        }

        return Response.json(
          {
            message: "Ação inválida.",
          },
          {
            status: 400,
          }
        );
      }

      /* =================================
         POST
         CRIAR PERÍODO BLOQUEADO
      ================================= */

      if (request.method === "POST") {
        const body = await request.json();

        if (
          body.action !== "blocked-date"
        ) {
          return Response.json(
            {
              message: "Ação inválida.",
            },
            {
              status: 400,
            }
          );
        }

        const startDate =
          body.startDate;

        const endDate =
          body.endDate ||
          body.startDate;

        const reason =
          body.reason?.trim() ||
          "Indisponível";

        if (!startDate) {
          return Response.json(
            {
              message:
                "A data inicial é obrigatória.",
            },
            {
              status: 400,
            }
          );
        }

        const created = await sql`
          INSERT INTO blocked_dates (
            start_date,
            end_date,
            reason
          )
          VALUES (
            ${startDate},
            ${endDate},
            ${reason}
          )
          RETURNING
            id,
            start_date::text AS start_date,
            end_date::text AS end_date,
            reason
        `;

        return Response.json(
          created[0],
          {
            status: 201,
          }
        );
      }

      /* =================================
         DELETE
         APAGAR PERÍODO BLOQUEADO
      ================================= */

      if (request.method === "DELETE") {
        const body = await request.json();

        const id =
          Number(body.id);

        if (!id) {
          return Response.json(
            {
              message: "Período inválido.",
            },
            {
              status: 400,
            }
          );
        }

        const deleted = await sql`
          DELETE FROM blocked_dates
          WHERE id = ${id}
          RETURNING id
        `;

        if (deleted.length === 0) {
          return Response.json(
            {
              message:
                "Período não encontrado.",
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
        "SETTINGS API ERROR:",
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