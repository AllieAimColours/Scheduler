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
export interface GalleryBlock extends BaseBlock {
  type: "gallery";
  config: {
    title?: string;
    images: Array<{
      url: string;
      caption?: string;
    }>;
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
