import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

async function getProvider() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  return provider ? { supabase, providerId: provider.id } : null;
}

/**
 * List all calendar connections for the current provider.
 * Excludes sensitive fields like tokens and CalDAV passwords.
 */
export async function GET() {
  const ctx = await getProvider();
  if (!ctx) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await ctx.supabase
    .from("calendar_connections")
    .select(
      "id, calendar_type, calendar_name, account_email, is_primary, is_read_enabled, is_write_enabled, sync_error, last_synced_at, created_at"
    )
    .eq("provider_id", ctx.providerId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connections: data || [] });
}

const patchSchema = z.object({
  id: z.string().uuid(),
  is_primary: z.boolean().optional(),
  is_read_enabled: z.boolean().optional(),
  is_write_enabled: z.boolean().optional(),
});

/**
 * Update a connection. Handles the "exactly one primary per provider"
 * constraint by clearing the old primary before setting the new one.
 */
export async function PATCH(request: NextRequest) {
  const ctx = await getProvider();
  if (!ctx) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { id, is_primary, is_read_enabled, is_write_enabled } = parsed.data;

  // Verify the connection belongs to this provider
  const { data: owned } = await ctx.supabase
    .from("calendar_connections")
    .select("id")
    .eq("id", id)
    .eq("provider_id", ctx.providerId)
    .maybeSingle();

  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If setting as primary, clear the existing primary first
  if (is_primary === true) {
    await ctx.supabase
      .from("calendar_connections")
      .update({ is_primary: false })
      .eq("provider_id", ctx.providerId)
      .eq("is_primary", true);
  }

  const updates: {
    is_primary?: boolean;
    is_read_enabled?: boolean;
    is_write_enabled?: boolean;
  } = {};
  if (is_primary !== undefined) updates.is_primary = is_primary;
  if (is_read_enabled !== undefined) updates.is_read_enabled = is_read_enabled;
  if (is_write_enabled !== undefined) updates.is_write_enabled = is_write_enabled;

  const { error } = await ctx.supabase
    .from("calendar_connections")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/**
 * Delete a connection.
 */
export async function DELETE(request: NextRequest) {
  const ctx = await getProvider();
  if (!ctx) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await ctx.supabase
    .from("calendar_connections")
    .delete()
    .eq("id", id)
    .eq("provider_id", ctx.providerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
