// ─────────────────────────────────────────────────────────────
//  Page Builder — block type definitions
//  All blocks the public booking page can render.
// ─────────────────────────────────────────────────────────────

export type BlockType =
  | "hero"
  | "about"
  | "gallery"
  | "services"
  | "quote"
  | "link"
  | "contact"
  | "digital_product";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

// ───── Hero ─────
export interface HeroBlock extends BaseBlock {
  type: "hero";
  config: {
    image_url?: string;
    headline?: string;
    tagline?: string;
    welcome_message?: string;
    cta_label?: string;
    show_cta?: boolean;
  };
}

// ───── About ─────
export interface AboutBlock extends BaseBlock {
  type: "about";
  config: {
    photo_url?: string;
    title?: string;
    body?: string;
    credentials?: string[]; // bullet list of credentials/badges
  };
}

// ───── Image Gallery ─────
export type GalleryLayout = "grid" | "carousel" | "masonry" | "mosaic";

export interface GalleryBlock extends BaseBlock {
  type: "gallery";
  config: {
    title?: string;
    images: Array<{
      url: string;
      caption?: string;
    }>;
    layout?: GalleryLayout;
    columns?: 2 | 3 | 4;
  };
}

// ───── Services ─────
export interface ServicesBlock extends BaseBlock {
  type: "services";
  config: {
    title?: string;
    subtitle?: string;
  };
}

// ───── Quote / Testimonial ─────
export interface QuoteBlock extends BaseBlock {
  type: "quote";
  config: {
    quote: string;
    author_name?: string;
    author_role?: string;
    author_photo_url?: string;
  };
}

// ───── Link Card ─────
export interface LinkBlock extends BaseBlock {
  type: "link";
  config: {
    title: string;
    description?: string;
    url: string;
    thumbnail_url?: string;
  };
}

// ───── Contact ─────
export interface ContactBlock extends BaseBlock {
  type: "contact";
  config: {
    title?: string;
    show_phone?: boolean;
    show_email?: boolean;
    show_address?: boolean;
    address?: string;
  };
}

// ───── Digital Product ─────
export interface DigitalProductBlock extends BaseBlock {
  type: "digital_product";
  config: {
    product_id: string; // FK to digital_products table
  };
}

export type PageBlock =
  | HeroBlock
  | AboutBlock
  | GalleryBlock
  | ServicesBlock
  | QuoteBlock
  | LinkBlock
  | ContactBlock
  | DigitalProductBlock;

// ─────────────────────────────────────────────────────────────
//  Sections — group blocks into rows with layout, background, divider
// ─────────────────────────────────────────────────────────────

export type SectionLayout =
  | "single"        // 1 full-width column
  | "two-col"       // 50/50
  | "two-col-60-40" // 60/40
  | "two-col-40-60" // 40/60
  | "three-col"     // 33/33/33
  | "asymmetric";   // 60% main + 40% sidebar

export type SectionBackground =
  | { type: "none" }
  | { type: "solid"; color: string }
  | { type: "gradient"; from: string; to: string; angle?: number }
  | { type: "mesh"; colors: string[] }
  | { type: "image"; url: string; parallax?: boolean; overlay?: number };

export type SectionDivider =
  | "none"
  | "wave"
  | "wave-soft"
  | "zigzag"
  | "blob"
  | "dots"
  | "fade";

export type RevealAnimation =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-left"
  | "slide-right"
  | "zoom";

export interface PageSection {
  id: string;
  layout: SectionLayout;
  background?: SectionBackground;
  divider?: SectionDivider;
  reveal?: RevealAnimation;
  columns: PageBlock[][]; // length matches the layout's column count
  title?: string; // optional anchor name for top nav
}

export function columnCountFor(layout: SectionLayout): number {
  switch (layout) {
    case "single":
      return 1;
    case "two-col":
    case "two-col-60-40":
    case "two-col-40-60":
    case "asymmetric":
      return 2;
    case "three-col":
      return 3;
  }
}

/**
 * Migrate a flat blocks array (old format) into a single-column section
 * (new format). Used when reading branding.page_blocks from the DB.
 */
export function migrateBlocksToSections(blocks: PageBlock[]): PageSection[] {
  if (!blocks || blocks.length === 0) return [];
  // Each block becomes its own single-column section so the user can
  // immediately rearrange them into multi-column layouts
  return blocks.map((b) => ({
    id: `s-${b.id}`,
    layout: "single" as SectionLayout,
    columns: [[b]],
  }));
}

/**
 * Type guard: distinguish old (flat) and new (sections) formats so we can
 * read both from branding.page_blocks during the rollout.
 */
export function isSectionsFormat(value: unknown): value is PageSection[] {
  if (!Array.isArray(value)) return false;
  if (value.length === 0) return true;
  const first = value[0] as Record<string, unknown>;
  return typeof first === "object" && first !== null && "columns" in first && "layout" in first;
}

// ─────────────────────────────────────────────────────────────
//  Block metadata for the library UI
// ─────────────────────────────────────────────────────────────
export interface BlockMeta {
  type: BlockType;
  label: string;
  description: string;
  icon: string; // lucide icon name
  category: "essential" | "content" | "commerce";
}

export const BLOCK_LIBRARY: BlockMeta[] = [
  {
    type: "hero",
    label: "Hero",
    description: "Big intro with image, name, and CTA",
    icon: "Sparkles",
    category: "essential",
  },
  {
    type: "about",
    label: "About",
    description: "Bio with photo and credentials",
    icon: "User",
    category: "essential",
  },
  {
    type: "services",
    label: "Services",
    description: "Inline service cards",
    icon: "LayoutGrid",
    category: "essential",
  },
  {
    type: "gallery",
    label: "Gallery",
    description: "Photo grid for portfolio",
    icon: "Image",
    category: "content",
  },
  {
    type: "quote",
    label: "Testimonial",
    description: "Client review or pull quote",
    icon: "Quote",
    category: "content",
  },
  {
    type: "link",
    label: "Link Card",
    description: "External link with thumbnail",
    icon: "Link",
    category: "content",
  },
  {
    type: "contact",
    label: "Contact",
    description: "Phone, email, address",
    icon: "Phone",
    category: "essential",
  },
  {
    type: "digital_product",
    label: "Digital Product",
    description: "Sell e-books, guides, manuals",
    icon: "BookOpen",
    category: "commerce",
  },
];
