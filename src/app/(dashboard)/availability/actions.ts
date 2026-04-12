"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ruleSchema = z.object({
  day_of_week: z.coerce.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
});

const overrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  end_time: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  is_blocked: z.boolean(),
  reason: z.string().max(200).default(""),
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

  return { supabase, providerId: provider.id };
}

export async function saveAvailabilityRules(
  rules: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
  }>
) {
  const { supabase, providerId } = await getProviderId();

  // Delete existing rules and re-insert
  await supabase
    .from("availability_rules")
    .delete()
    .eq("provider_id", providerId);

  if (rules.length > 0) {
    const { error } = await supabase.from("availability_rules").insert(
      rules.map((r) => ({
        provider_id: providerId,
        ...r,
      }))
    );
    if (error) throw new Error(error.message);
  }

  revalidatePath("/availability");
}

/**
 * Add a date override. Accepts a single date OR a start+end range.
 *
 * If `end_date` is omitted or equal to `date`, we insert a single row.
 * Otherwise we expand the inclusive range into one row per day so each
 * day stays independently editable later (e.g. "I came back a day
 * early, delete just Oct 14").
 */
export async function addOverride(formData: FormData) {
  const { supabase, providerId } = await getProviderId();

  const isBlocked = formData.get("is_blocked") === "true";
  const startTime = formData.get("start_time") as string | null;
  const endTime = formData.get("end_time") as string | null;

  const startDate = formData.get("date") as string;
  const endDateRaw = formData.get("end_date") as string | null;

  // Default end date = start date (single-day)
  const endDate = endDateRaw && endDateRaw.length > 0 ? endDateRaw : startDate;

  // Guard: end must not be before start
  if (endDate < startDate) {
    throw new Error("End date cannot be before start date");
  }

  // Guard: prevent huge accidental ranges (1 year max)
  const msDiff = new Date(endDate).getTime() - new Date(startDate).getTime();
  const daysDiff = msDiff / (1000 * 60 * 60 * 24);
  if (daysDiff > 366) {
    throw new Error("Range is too long. Maximum 1 year at a time.");
  }

  // Build the list of dates to insert
  const dates: string[] = [];
  const cursor = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");
  while (cursor <= end) {
    const y = cursor.getUTCFullYear();
    const m = String(cursor.getUTCMonth() + 1).padStart(2, "0");
    const d = String(cursor.getUTCDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  // Validate each row against the same schema
  const rows = dates.map((date) =>
    overrideSchema.parse({
      date,
      start_time: isBlocked && !startTime ? null : startTime,
      end_time: isBlocked && !endTime ? null : endTime,
      is_blocked: isBlocked,
      reason: formData.get("reason") || "",
    })
  );

  const { error } = await supabase.from("availability_overrides").insert(
    rows.map((r) => ({
      provider_id: providerId,
      ...r,
    }))
  );

  if (error) throw new Error(error.message);
  revalidatePath("/availability");
}

export async function deleteOverride(id: string) {
  const { supabase } = await getProviderId();
  const { error } = await supabase
    .from("availability_overrides")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/availability");
}
