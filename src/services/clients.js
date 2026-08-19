import { supabase } from "../lib/supabase";

/* ===========================
   LISTAR CLIENTES / MARCAÇÕES
=========================== */

export async function getClients() {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      client_name,
      phone,
      email,
      booking_date,
      booking_time,
      status,
      booking_services (
        id,
        service_name
      )
    `)
    .order("booking_date", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

/* ===========================
   OBTER IDS DAS MARCAÇÕES
   DA CLIENTE
=========================== */

async function getClientBookingIds({
  originalPhone,
  originalEmail,
}) {
  let query = supabase
    .from("bookings")
    .select("id");

  if (originalPhone) {
    query = query.eq(
      "phone",
      originalPhone
    );
  } else if (originalEmail) {
    query = query.eq(
      "email",
      originalEmail
    );
  } else {
    return [];
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []).map(
    (booking) => booking.id
  );
}

/* ===========================
   EDITAR CLIENTE
=========================== */

export async function updateClient({
  originalPhone,
  originalEmail,
  name,
  phone,
  email,
}) {
  let query = supabase
    .from("bookings")
    .update({
      client_name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
    });

  if (originalPhone) {
    query = query.eq(
      "phone",
      originalPhone
    );
  } else if (originalEmail) {
    query = query.eq(
      "email",
      originalEmail
    );
  } else {
    throw new Error(
      "Não foi possível identificar a cliente."
    );
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}

/* ===========================
   ELIMINAR CLIENTE
   E HISTÓRICO
=========================== */

export async function deleteClient({
  originalPhone,
  originalEmail,
}) {
  const bookingIds =
    await getClientBookingIds({
      originalPhone,
      originalEmail,
    });

  if (bookingIds.length === 0) {
    return;
  }

  /*
    Primeiro eliminamos os serviços
    associados às marcações.

    Isto evita problemas caso a foreign
    key não esteja configurada com CASCADE.
  */

  const {
    error: servicesError,
  } = await supabase
    .from("booking_services")
    .delete()
    .in("booking_id", bookingIds);

  if (servicesError) {
    throw servicesError;
  }

  /*
    Depois eliminamos todas as marcações
    associadas à cliente.
  */

  const { error: bookingsError } =
    await supabase
      .from("bookings")
      .delete()
      .in("id", bookingIds);

  if (bookingsError) {
    throw bookingsError;
  }
}