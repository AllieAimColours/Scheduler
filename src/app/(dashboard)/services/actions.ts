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
});

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
