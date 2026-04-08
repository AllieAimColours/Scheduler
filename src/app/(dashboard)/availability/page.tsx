import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AvailabilityEditor } from "./availability-editor";

export default async function AvailabilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: provider } = await supabase
    .from("providers")
    .select("id, timezone")
    .eq("user_id", user.id)
    .single();
  if (!provider) redirect("/onboarding");

  const { data: rules } = await supabase
    .from("availability_rules")
    .select("*")
    .eq("provider_id", provider.id)
    .order("day_of_week");

  const { data: overrides } = await supabase
    .from("availability_overrides")
    .select("*")
    .eq("provider_id", provider.id)
    .order("date");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
        <p className="text-muted-foreground">
          Set your weekly hours and block off specific dates
        </p>
      </div>
      <AvailabilityEditor
        rules={rules || []}
        overrides={overrides || []}
        timezone={provider.timezone}
      />
    </div>
  );
}
