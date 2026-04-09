"use client";

import type { PageBlock } from "@/lib/page-builder/types";
import type { Provider } from "@/types/database";
import { HeroEditor } from "./editors/hero-editor";
import { AboutEditor } from "./editors/about-editor";
import { GalleryEditor } from "./editors/gallery-editor";
import { ServicesEditor } from "./editors/services-editor";
import { QuoteEditor } from "./editors/quote-editor";
import { LinkEditor } from "./editors/link-editor";
import { ContactEditor } from "./editors/contact-editor";
import { DigitalProductEditor } from "./editors/digital-product-editor";

interface Props {
  block: PageBlock;
  provider: Provider;
  onUpdate: (config: Record<string, unknown>) => void;
}

export function BlockEditor({ block, provider, onUpdate }: Props) {
  switch (block.type) {
    case "hero":
      return <HeroEditor block={block} onUpdate={onUpdate} />;
    case "about":
      return <AboutEditor block={block} onUpdate={onUpdate} />;
    case "gallery":
      return <GalleryEditor block={block} onUpdate={onUpdate} />;
    case "services":
      return <ServicesEditor block={block} onUpdate={onUpdate} />;
    case "quote":
      return <QuoteEditor block={block} onUpdate={onUpdate} />;
    case "link":
      return <LinkEditor block={block} onUpdate={onUpdate} />;
    case "contact":
      return <ContactEditor block={block} onUpdate={onUpdate} />;
    case "digital_product":
      return <DigitalProductEditor block={block} provider={provider} onUpdate={onUpdate} />;
    default:
      return null;
  }
}
