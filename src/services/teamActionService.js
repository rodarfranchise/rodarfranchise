import { supabase } from "./supabase";

const TABLE = "team_action_images";

export async function fetchTeamActionImages() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, image_url, image_data, heading, description, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createTeamActionImage({ image_url = null, image_data = null, heading = null, description = null, sort_order = null }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ image_url, image_data, heading, description, sort_order }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTeamActionImage(id, { image_url, image_data, heading, description, sort_order }) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ image_url, image_data, heading, description, sort_order })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTeamActionImage(id) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
  return true;
}
