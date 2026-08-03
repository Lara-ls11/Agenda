import { supabase } from "../lib/supabase";

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    mins
  ).padStart(2, "0")}`;
}

export async function getAvailableTimes(date, services) {
  // Domingo = 0
  const weekday = new Date(`${date}T12:00:00`).getDay();

  // Buscar horário desse dia
  const { data: workingDay, error: workingError } =
    await supabase
      .from("working_hours")
      .select("*")
      .eq("weekday", weekday)
      .single();

  if (workingError) throw workingError;

  // Fechado
  if (!workingDay.is_open) {
    return [];
  }

  // Definições do negócio
  const { data: settings, error: settingsError } =
    await supabase
      .from("business_settings")
      .select("*")
      .eq("id", 1)
      .single();

  if (settingsError) throw settingsError;

  // Dia bloqueado?
  const { data: blocked } = await supabase
    .from("blocked_dates")
    .select("*")
    .lte("start_date", date)
    .gte("end_date", date);

  if (blocked.length > 0) {
    return [];
  }

  // Marcações aceites nesse dia
  const { data: bookings, error: bookingsError } =
    await supabase
      .from("bookings")
      .select(`
        booking_time,
        total_duration
      `)
      .eq("status", "accepted")
      .eq("booking_date", date);

  if (bookingsError) throw bookingsError;

  const opening = timeToMinutes(
    workingDay.start_time.slice(0, 5)
  );

  const closing = timeToMinutes(
    workingDay.end_time.slice(0, 5)
  );

  const lunchStart =
    settings.has_lunch_break &&
    settings.lunch_start
      ? timeToMinutes(settings.lunch_start.slice(0, 5))
      : null;

  const lunchEnd =
    settings.has_lunch_break &&
    settings.lunch_end
      ? timeToMinutes(settings.lunch_end.slice(0, 5))
      : null;

  const totalDuration = services.reduce(
    (total, service) => total + Number(service.duration),
    0
  );

  const available = [];

  for (
    let current = opening;
    current + totalDuration <= closing;
    current += 30
  ) {
    const end = current + totalDuration;

    // Pausa almoço
    if (
      lunchStart !== null &&
      current < lunchEnd &&
      end > lunchStart
    ) {
      continue;
    }

    // Marcações existentes
    const overlaps = bookings.some((booking) => {
      const bookingStart = timeToMinutes(
        booking.booking_time.slice(0, 5)
      );

      const bookingEnd =
        bookingStart +
        Number(booking.total_duration);

      return (
        current < bookingEnd &&
        end > bookingStart
      );
    });

    if (!overlaps) {
      available.push(minutesToTime(current));
    }
  }

  return available;
}