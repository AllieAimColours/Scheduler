"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { ThemedCard } from "./themed-card";
import { ThemedButton } from "./themed-button";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";

export function ConfirmationContent() {
  const templateId = useTemplate();
  const template = getTemplate(templateId);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ThemedCard className="w-full max-w-md text-center">
        <div className="space-y-4">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto"
            style={{
              background: `linear-gradient(135deg, var(--template-accent, #10b981), var(--primary, #10b981))`,
              opacity: 0.15,
            }}
          >
            <CheckCircle
              className="h-16 w-16"
              style={{ color: "var(--template-accent, #10b981)" }}
            />
          </div>
          <h1 className={`text-2xl font-bold ${template.classes.heading}`}>
            Booking Confirmed!
          </h1>
          <p className={template.classes.body}>
            You&apos;ll receive a confirmation email shortly with all the
            details. We look forward to seeing you!
          </p>
          <div className="pt-4">
            <Link href="/">
              <ThemedButton variant="outline">Back to Home</ThemedButton>
            </Link>
          </div>
        </div>
      </ThemedCard>
    </div>
  );
}
