async function handleResponse(
  response
) {
  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Ocorreu um erro."
    );
  }

  return data;
}

/* ===========================
   LISTAR TODAS AS MARCAÇÕES
=========================== */

export async function getBookings() {
  const response = await fetch(
    "/api/bookings?action=all"
  );

  return handleResponse(response);
}

/* ===========================
   MARCAÇÕES PENDENTES
=========================== */

export async function getPendingBookings() {
  const response = await fetch(
    "/api/bookings?action=pending"
  );

  return handleResponse(response);
}

/* ===========================
   MARCAÇÕES ACEITES
=========================== */

export async function getAcceptedBookings() {
  const response = await fetch(
    "/api/bookings?action=accepted"
  );

  return handleResponse(response);
}

/* ===========================
   OBTER UMA MARCAÇÃO
=========================== */

export async function getBooking(
  id
) {
  const response = await fetch(
    `/api/bookings?action=one&id=${encodeURIComponent(
      id
    )}`
  );

  return handleResponse(response);
}

/* ===========================
   CRIAR MARCAÇÃO
=========================== */

export async function createBooking(
  booking,
  services
) {
  const serviceIds =
    services.map(
      (service) =>
        Number(service.id)
    );

  const response = await fetch(
    "/api/bookings",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        booking,
        serviceIds,
      }),
    }
  );

  return handleResponse(response);
}

/* ===========================
   VERIFICAR CONFLITOS
=========================== */

export async function getBookingConflicts({
  bookingId,
  bookingDate,
  bookingTime,
  totalDuration,
}) {
  const params =
    new URLSearchParams({
      action: "conflicts",

      bookingId: String(
        bookingId
      ),

      bookingDate,

      bookingTime,

      totalDuration: String(
        totalDuration
      ),
    });

  const response = await fetch(
    `/api/bookings?${params.toString()}`
  );

  return handleResponse(response);
}

/* ===========================
   ATUALIZAR MARCAÇÃO COMPLETA
=========================== */

export async function updateBooking(
  id,
  booking,
  services
) {
  const response = await fetch(
    "/api/bookings",
    {
      method: "PUT",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        id: Number(id),
        booking,
        services,
      }),
    }
  );

  return handleResponse(response);
}

/* ===========================
   ALTERAR APENAS O ESTADO
=========================== */

export async function updateBookingStatus(
  id,
  status
) {
  const response = await fetch(
    "/api/bookings",
    {
      method: "PUT",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        action: "status",
        id: Number(id),
        status,
      }),
    }
  );

  return handleResponse(response);
}

/* ===========================
   ELIMINAR MARCAÇÃO
=========================== */

export async function deleteBooking(
  id
) {
  const response = await fetch(
    "/api/bookings",
    {
      method: "DELETE",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        id: Number(id),
      }),
    }
  );

  return handleResponse(response);
}