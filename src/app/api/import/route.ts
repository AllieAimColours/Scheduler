import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Shape of a single service row inside a Bloom JSON export.
// We're permissive here — older/newer exports may omit fields — and
// only require the bare minimum to create a new service.
const importedServiceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).default(""),
  duration_minutes: z.coerce.number().int().min(5).max(480),
  price_cents: z.coerce.number().int().min(0),
  deposit_cents: z.coerce.number().int().min(0).default(0),
  category: z.string().max(50).default("general"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#6366f1"),
  emoji: z.string().max(4).default(""),
  sort_order: z.coerce.number().int().default(0),
  buffer_before_minutes: z.coerce.number().int().min(0).max(120).nullish(),
  buffer_after_minutes: z.coerce.number().int().min(0).max(120).nullish(),
});

const bloomExportSchema = z.object({
  export_metadata: z
    .object({
      exported_at: z.string().optional(),
      provider: z
        .object({
          business_name: z.string().optional(),
          slug: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  services: z.array(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!provider) {
    return NextResponse.json({ error: "No provider profile" }, { status: 404 });
  }

  // Read the uploaded file
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // 5 MB cap — a JSON export should never come close
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large (max 5 MB)" },
      { status: 413 }
    );
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    return NextResponse.json({ error: "Could not read file" }, { status: 400 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "File is not valid JSON" },
      { status: 400 }
    );
  }

  const parsed = bloomExportSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "This doesn't look like a Bloom export file" },
      { status: 400 }
    );
  }

  // Validate each service row individually — skip malformed rows rather
  // than aborting the whole import. Report counts back to the user.
  const validServices: Array<z.infer<typeof importedServiceSchema>> = [];
  const skipped: Array<{ index: number; reason: string }> = [];

  const rawServices = parsed.data.services ?? [];
  for (let i = 0; i < rawServices.length; i++) {
    const result = importedServiceSchema.safeParse(rawServices[i]);
    if (result.success) {
      validServices.push(result.data);
    } else {
      skipped.push({
        index: i,
        reason: result.error.issues[0]?.message ?? "invalid",
      });
    }
  }

  if (validServices.length === 0) {
    return NextResponse.json({
      imported: 0,
      skipped: skipped.length,
      message: "No valid services found in the file",
    });
  }

  // Insert all valid services. Note: we do NOT try to preserve the
  // original service_id — Supabase generates a new uuid. Bookings that
  // referenced the old ids won't re-link, which is why bookings import
  // is deferred to a later version.
  const { error: insertError, data: inserted } = await supabase
    .from("services")
    .insert(
      validServices.map((s) => ({
        provider_id: provider.id,
        name: s.name,
        description: s.description,
        duration_minutes: s.duration_minutes,
        price_cents: s.price_cents,
        deposit_cents: s.deposit_cents,
        category: s.category,
        color: s.color,
        emoji: s.emoji,
        sort_order: s.sort_order,
        buffer_before_minutes: s.buffer_before_minutes ?? null,
        buffer_after_minutes: s.buffer_after_minutes ?? null,
      }))
    )
    .select("id");

  if (insertError) {
    return NextResponse.json(
      { error: `Import failed: ${insertError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    imported: inserted?.length ?? 0,
    skipped: skipped.length,
    message: `Imported ${inserted?.length ?? 0} service${
      (inserted?.length ?? 0) === 1 ? "" : "s"
    }.`,
  });
}
