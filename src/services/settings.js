import { supabase } from "../lib/supabase";

const DAY_NAMES = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

export async function getWorkingHours() {
  const { data, error } = await supabase
    .from("working_hours")
    .select("*")
    .order("weekday", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data || []).map((day) => ({
    id: day.weekday,
    weekday: day.weekday,
    day: DAY_NAMES[day.weekday],
    open: day.is_open,
    start: day.start_time?.slice(0, 5) || "09:00",
    end: day.end_time?.slice(0, 5) || "19:00",
  }));
}

export async function saveWorkingHours(schedule) {
  const rows = schedule.map((day) => ({
    weekday: day.weekday,
    is_open: day.open,
    start_time: day.open ? day.start : null,
    end_time: day.open ? day.end : null,
  }));

  const { error } = await supabase
    .from("working_hours")
    .upsert(rows, {
      onConflict: "weekday",
    });

  if (error) {
    throw error;
  }
}

export async function getBusinessSettings() {
  const { data, error } = await supabase
    .from("business_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    throw error;
  }

  return {
    hasLunchBreak: data.has_lunch_break,
    lunchStart: data.lunch_start?.slice(0, 5) || "13:00",
    lunchEnd: data.lunch_end?.slice(0, 5) || "14:00",
  };
}

export async function saveBusinessSettings({
  hasLunchBreak,
  lunchStart,
  lunchEnd,
}) {
  const { error } = await supabase
    .from("business_settings")
    .upsert(
      {
        id: 1,
        has_lunch_break: hasLunchBreak,
        lunch_start: hasLunchBreak
          ? lunchStart
          : null,
        lunch_end: hasLunchBreak
          ? lunchEnd
          : null,
      },
      {
        onConflict: "id",
      }
    );

  if (error) {
    throw error;
  }
}

export async function getBlockedDates() {
  const { data, error } = await supabase
    .from("blocked_dates")
    .select("*")
    .order("start_date", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createBlockedPeriod({
  startDate,
  endDate,
  reason,
}) {
  const { data, error } = await supabase
    .from("blocked_dates")
    .insert({
      start_date: startDate,
      end_date: endDate || startDate,
      reason: reason?.trim() || "Indisponível",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteBlockedPeriod(id) {
  const { error } = await supabase
    .from("blocked_dates")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}