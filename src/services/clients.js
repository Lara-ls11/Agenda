import { supabase } from "../lib/supabase";

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