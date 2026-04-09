"use client";

import type { PageBlock } from "@/lib/page-builder/types";
import { HeroBlockView } from "./hero-block";
import { AboutBlockView } from "./about-block";
import { GalleryBlockView } from "./gallery-block";
import { ServicesBlockView } from "./services-block";
import { QuoteBlockView } from "./quote-block";
import { LinkBlockView } from "./link-block";
import { ContactBlockView } from "./contact-block";
import { DigitalProductBlockView } from "./digital-product-block";
import type { Service, DigitalProduct } from "@/types/database";

interface BlockRendererProps {
  blocks: PageBlock[];
  provider: {
    business_name: string;
    description: string;
    logo_url: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    slug: string;
  };
  services: Service[];
  digitalProducts: DigitalProduct[];
}

export function BlockRenderer({ blocks, provider, services, digitalProducts }: BlockRendererProps) {
  return (
    <div className="space-y-16 md:space-y-24">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "hero":
            return <HeroBlockView key={block.id} block={block} provider={provider} index={i} />;
          case "about":
            return <AboutBlockView key={block.id} block={block} index={i} />;
          case "gallery":
            return <GalleryBlockView key={block.id} block={block} index={i} />;
          case "services":
            return <ServicesBlockView key={block.id} block={block} services={services} slug={provider.slug} index={i} />;
          case "quote":
            return <QuoteBlockView key={block.id} block={block} index={i} />;
          case "link":
            return <LinkBlockView key={block.id} block={block} index={i} />;
          case "contact":
            return <ContactBlockView key={block.id} block={block} provider={provider} index={i} />;
          case "digital_product": {
            const product = digitalProducts.find((p) => p.id === block.config.product_id);
            if (!product) return null;
            return <DigitalProductBlockView key={block.id} product={product} index={i} />;
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
