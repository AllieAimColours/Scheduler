"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Phoenix",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/Mexico_City",
  "America/Bogota",
  "America/Sao_Paulo",
  "Australia/Sydney",
  "Asia/Tokyo",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [phone, setPhone] = useState("");

  function handleBusinessNameChange(value: string) {
    setBusinessName(value);
    setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("providers").insert({
      user_id: user.id,
      business_name: businessName.trim(),
      slug: slug.trim(),
      description: description.trim(),
      timezone,
      phone: phone.trim() || null,
      email: user.email,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        setError("This URL slug is already taken. Try a different one.");
      } else {
        setError(insertError.message);
      }
      setLoading(false);
      return;
    }

    router.push("/services");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome! Let&apos;s set up your business
          </CardTitle>
          <CardDescription>
            Tell us about your business so clients can find and book with you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Gorgeous Cuts Studio"
                value={businessName}
                onChange={(e) => handleBusinessNameChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Booking URL</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  scheduler.app/book/
                </span>
                <Input
                  id="slug"
                  placeholder="gorgeous-cuts"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  required
                  pattern="[a-z0-9-]+"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This is your public booking link. Letters, numbers, and hyphens only.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About Your Business</Label>
              <Textarea
                id="description"
                placeholder="We specialize in balayage, precision cuts, and transformative color..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={(val) => val && setTimezone(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Setting up..." : "Continue to Services"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
