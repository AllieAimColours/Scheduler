"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { ServiceList } from "./service-list";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  color: string;
  duration_minutes: number;
  price_cents: number;
  deposit_cents: number;
}

export function ServicesView({ slug, services }: { slug: string; services: Service[] }) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      <Link
        href={`/book/${slug}`}
        className="inline-flex items-center text-sm opacity-60 hover:opacity-100 mb-8 transition-opacity"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Link>

      <div className="text-center mb-12">
        <h1 className={cn(template.classes.heading, "text-5xl md:text-6xl mb-4")}>
          Choose your service
        </h1>
        <p className={cn(template.classes.body, "max-w-md mx-auto text-lg")}>
          Select what you&apos;re looking for and we&apos;ll find the perfect time
        </p>
        <div className={cn(template.classes.accentBar, "mx-auto mt-6")} />
      </div>

      <ServiceList services={services} slug={slug} />
    </div>
  );
}
