"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).default(""),
  duration_minutes: z.coerce.number().int().min(5).max(480),
  price_cents: z.coerce.number().int().min(0),
  deposit_cents: z.coerce.number().int().min(0).default(0),
  category: z.string().max(50).default("general"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
  emoji: z.string().max(4).default(""),
  buffer_before_minutes: z
    .union([z.coerce.number().int().min(0).max(120), z.null()])
    .default(null),
  buffer_after_minutes: z
    .union([z.coerce.number().int().min(0).max(120), z.null()])
    .default(null),
  min_notice_hours: z
    .union([z.coerce.number().int().min(0).max(720), z.null()])
    .default(null),
  max_per_day: z
    .union([z.coerce.number().int().min(1).max(100), z.null()])
    .default(null),
});

// Form fields come in as strings; "" means "inherit provider default /
// unlimited" depending on the field's meaning.
function parseOptionalNumber(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const s = String(v).trim();
  if (s === "") return null;
  return Number(s);
}

async function getProviderId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!provider) throw new Error("No provider profile");

  return provider.id;
}

export async function createService(formData: FormData) {
  const supabase = await createClient();
  const providerId = await getProviderId();

  const parsed = serviceSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    duration_minutes: formData.get("duration_minutes"),
    price_cents: Math.round(Number(formData.get("price")) * 100),
    deposit_cents: Math.round(Number(formData.get("deposit") || 0) * 100),
    category: formData.get("category"),
    color: formData.get("color"),
    emoji: formData.get("emoji"),
    buffer_before_minutes: parseOptionalNumber(formData.get("buffer_before_minutes")),
    buffer_after_minutes: parseOptionalNumber(formData.get("buffer_after_minutes")),
    min_notice_hours: parseOptionalNumber(formData.get("min_notice_hours")),
    max_per_day: parseOptionalNumber(formData.get("max_per_day")),
  });

  const { error } = await supabase.from("services").insert({
    provider_id: providerId,
    ...parsed,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/services");
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient();
  await getProviderId();

  const parsed = serviceSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    duration_minutes: formData.get("duration_minutes"),
    price_cents: Math.round(Number(formData.get("price")) * 100),
    deposit_cents: Math.round(Number(formData.get("deposit") || 0) * 100),
    category: formData.get("category"),
    color: formData.get("color"),
    emoji: formData.get("emoji"),
    buffer_before_minutes: parseOptionalNumber(formData.get("buffer_before_minutes")),
    buffer_after_minutes: parseOptionalNumber(formData.get("buffer_after_minutes")),
    min_notice_hours: parseOptionalNumber(formData.get("min_notice_hours")),
    max_per_day: parseOptionalNumber(formData.get("max_per_day")),
  });

  const { error } = await supabase
    .from("services")
    .update(parsed)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/services");
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  await getProviderId();

  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/services");
}

export async function toggleService(id: string, isActive: boolean) {
  const supabase = await createClient();
  await getProviderId();

  const { error } = await supabase
    .from("services")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/services");
}
