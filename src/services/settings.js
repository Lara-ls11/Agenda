const DAY_NAMES = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Ocorreu um erro."
    );
  }

  return data;
}

/* ===========================
   HORÁRIOS
=========================== */

export async function getWorkingHours() {
  const response = await fetch(
    "/api/settings?action=working-hours"
  );

  const data = await handleResponse(response);

  return (data || []).map((day) => ({
    id: day.weekday,

    weekday: day.weekday,

    day: DAY_NAMES[day.weekday],

    open: day.is_open,

    start:
      day.start_time?.slice(0, 5) || "09:00",

    end:
      day.end_time?.slice(0, 5) || "19:00",
  }));
}

export async function saveWorkingHours(schedule) {
  const response = await fetch(
    "/api/settings",
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        action: "working-hours",
        schedule,
      }),
    }
  );

  return handleResponse(response);
}

/* ===========================
   DEFINIÇÕES DO NEGÓCIO
=========================== */

export async function getBusinessSettings() {
  const response = await fetch(
    "/api/settings?action=business"
  );

  const data = await handleResponse(response);

  return {
    hasLunchBreak:
      data.has_lunch_break,

    lunchStart:
      data.lunch_start?.slice(0, 5) || "13:00",

    lunchEnd:
      data.lunch_end?.slice(0, 5) || "14:00",

    breakWeekdays:
      Array.isArray(data.break_weekdays)
        ? data.break_weekdays.map(Number)
        : [],
  };
}

export async function saveBusinessSettings({
  hasLunchBreak,
  lunchStart,
  lunchEnd,
  breakWeekdays,
}) {
  const response = await fetch(
    "/api/settings",
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        action: "business",

        hasLunchBreak,
        lunchStart,
        lunchEnd,

        breakWeekdays:
          Array.isArray(breakWeekdays)
            ? breakWeekdays.map(Number)
            : [],
      }),
    }
  );

  return handleResponse(response);
}

/* ===========================
   DIAS BLOQUEADOS
=========================== */

export async function getBlockedDates() {
  const response = await fetch(
    "/api/settings?action=blocked-dates"
  );

  return handleResponse(response);
}

export async function createBlockedPeriod({
  startDate,
  endDate,
  reason,
}) {
  const response = await fetch(
    "/api/settings",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        action: "blocked-date",

        startDate,
        endDate,
        reason,
      }),
    }
  );

  return handleResponse(response);
}

export async function deleteBlockedPeriod(id) {
  const response = await fetch(
    "/api/settings",
    {
      method: "DELETE",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        id: Number(id),
      }),
    }
  );

  return handleResponse(response);
}