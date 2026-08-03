import { supabase } from "../lib/supabase";

const BOOKING_SELECT = `
  *,
  booking_services (
    id,
    service_id,
    service_name,
    duration
  )
`;

/* ===========================
   LISTAR TODAS AS MARCAÇÕES
=========================== */

export async function getBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .order("booking_date")
    .order("booking_time");

  if (error) {
    throw error;
  }

  return data || [];
}

/* ===========================
   MARCAÇÕES PENDENTES
=========================== */

export async function getPendingBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("status", "pending")
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

/* ===========================
   MARCAÇÕES ACEITES
=========================== */

export async function getAcceptedBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("status", "accepted")
    .order("booking_date")
    .order("booking_time");

  if (error) {
    throw error;
  }

  return data || [];
}

/* ===========================
   OBTER UMA MARCAÇÃO
=========================== */

export async function getBooking(id) {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("id", Number(id))
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/* ===========================
   CRIAR MARCAÇÃO
=========================== */

export async function createBooking(booking, services) {
  const serviceIds = services.map((service) =>
    Number(service.id)
  );

  const { data, error } = await supabase.rpc(
    "create_booking_request",
    {
      p_client_name: booking.client_name,
      p_phone: booking.phone,
      p_email: booking.email || "",
      p_notes: booking.notes || "",
      p_booking_date: booking.booking_date,
      p_booking_time: booking.booking_time,
      p_service_ids: serviceIds,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}

/* ===========================
   VERIFICAR CONFLITOS
=========================== */

function timeToMinutes(time) {
  const [hours, minutes] = time
    .slice(0, 5)
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

export async function getBookingConflicts({
  bookingId,
  bookingDate,
  bookingTime,
  totalDuration,
}) {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      client_name,
      booking_date,
      booking_time,
      total_duration,
      status
    `)
    .eq("booking_date", bookingDate)
    .eq("status", "accepted")
    .neq("id", Number(bookingId));

  if (error) {
    throw error;
  }

  const newStart = timeToMinutes(bookingTime);
  const newEnd =
    newStart + Number(totalDuration);

  return (data || []).filter((booking) => {
    const existingStart = timeToMinutes(
      booking.booking_time
    );

    const existingEnd =
      existingStart +
      Number(booking.total_duration);

    return (
      newStart < existingEnd &&
      newEnd > existingStart
    );
  });
}

/* ===========================
   ATUALIZAR MARCAÇÃO COMPLETA
=========================== */

export async function updateBooking(
  id,
  booking,
  services
) {
  const bookingId = Number(id);

  const { error: bookingError } = await supabase
    .from("bookings")
    .update({
      client_name: booking.client_name,
      phone: booking.phone,
      email: booking.email || null,
      notes: booking.notes || null,
      booking_date: booking.booking_date,
      booking_time: booking.booking_time,
      total_duration: booking.total_duration,
      status: booking.status,
    })
    .eq("id", bookingId);

  if (bookingError) {
    throw bookingError;
  }

  const { error: deleteServicesError } =
    await supabase
      .from("booking_services")
      .delete()
      .eq("booking_id", bookingId);

  if (deleteServicesError) {
    throw deleteServicesError;
  }

  const bookingServices = services.map(
    (service) => ({
      booking_id: bookingId,
      service_id: Number(service.id),
      service_name: service.name,
      duration: Number(service.duration),
    })
  );

  const { error: insertServicesError } =
    await supabase
      .from("booking_services")
      .insert(bookingServices);

  if (insertServicesError) {
    throw insertServicesError;
  }

  return getBooking(bookingId);
}

/* ===========================
   ALTERAR APENAS O ESTADO
=========================== */

export async function updateBookingStatus(
  id,
  status
) {
  const { error } = await supabase
    .from("bookings")
    .update({
      status,
    })
    .eq("id", Number(id));

  if (error) {
    throw error;
  }
}

/* ===========================
   ELIMINAR MARCAÇÃO
=========================== */

export async function deleteBooking(id) {
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", Number(id));

  if (error) {
    throw error;
  }
}