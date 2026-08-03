import { supabase } from "../lib/supabase";

export async function getServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("category")
    .order("name");

  if (error) throw error;

  return data;
}

export async function createService(service) {
  const { error } = await supabase
    .from("services")
    .insert(service);

  if (error) throw error;
}

export async function updateService(id, service) {
  const { error } = await supabase
    .from("services")
    .update(service)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteService(id) {
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id);

  if (error) throw error;
}