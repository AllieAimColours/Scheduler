import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAvailabilityCounts } from "@/lib/availability";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  providerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
});

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { providerId, serviceId, start, end } = parsed.data;

  // Cap the range at 93 days (3 months) to prevent abuse
  const startDate = new Date(start);
  const endDate = new Date(end);
  const msDiff = endDate.getTime() - startDate.getTime();
  const daysDiff = msDiff / (1000 * 60 * 60 * 24);
  if (daysDiff < 0 || daysDiff > 93) {
    return NextResponse.json(
      { error: "Range must be 0-93 days" },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    const counts = await getAvailabilityCounts(
      supabase,
      providerId,
      serviceId,
      start,
      end
    );
    return NextResponse.json(counts);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("Availability month error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
