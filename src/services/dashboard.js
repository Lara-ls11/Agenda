import { supabase } from "../lib/supabase";

function getTodayISO() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function getDashboardData() {
  const today = getTodayISO();

  const [
    pendingResult,
    todayResult,
    clientsResult,
    servicesResult,
    upcomingResult,
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "pending"),

    supabase
      .from("bookings")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "accepted")
      .eq("booking_date", today),

    supabase
      .from("bookings")
      .select("phone"),

    supabase
      .from("services")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("active", true),

    supabase
      .from("bookings")
      .select(`
        id,
        client_name,
        phone,
        booking_date,
        booking_time,
        total_duration,
        booking_services (
          id,
          service_name,
          duration
        )
      `)
      .eq("status", "accepted")
      .gte("booking_date", today)
      .order("booking_date", {
        ascending: true,
      })
      .order("booking_time", {
        ascending: true,
      })
      .limit(5),
  ]);

  const results = [
    pendingResult,
    todayResult,
    clientsResult,
    servicesResult,
    upcomingResult,
  ];

  const failedResult = results.find(
    (result) => result.error
  );

  if (failedResult) {
    throw failedResult.error;
  }

  const uniqueClients = new Set(
    (clientsResult.data || [])
      .map((booking) => booking.phone)
      .filter(Boolean)
  );

  return {
    stats: {
      pending: pendingResult.count || 0,
      today: todayResult.count || 0,
      clients: uniqueClients.size,
      services: servicesResult.count || 0,
    },

    upcoming: upcomingResult.data || [],
  };
}