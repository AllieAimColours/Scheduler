"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ChevronDown,
  Copy,
  Trash2,
  Sparkles,
  User,
  Image as ImageIcon,
  LayoutGrid,
  Quote,
  Link as LinkIcon,
  Phone,
  BookOpen,
} from "lucide-react";
import type { PageBlock } from "@/lib/page-builder/types";
import type { Provider } from "@/types/database";
import { BlockEditor } from "./block-editor";
import { cn } from "@/lib/utils";

const ICONS = {
  hero: Sparkles,
  about: User,
  gallery: ImageIcon,
  services: LayoutGrid,
  quote: Quote,
  link: LinkIcon,
  contact: Phone,
  digital_product: BookOpen,
};

const LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About",
  gallery: "Image Gallery",
  services: "Services",
  quote: "Testimonial",
  link: "Link Card",
  contact: "Contact",
  digital_product: "Digital Product",
};

interface Props {
  block: PageBlock;
  provider: Provider;
  onUpdate: (config: Record<string, unknown>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function SortableBlock({ block, provider, onUpdate, onDelete, onDuplicate }: Props) {
  const [open, setOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = ICONS[block.type] || Sparkles;
  const label = LABELS[block.type] || block.type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl border bg-white transition-all duration-200",
        isDragging
          ? "border-purple-400 shadow-2xl scale-[1.02] z-10"
          : "border-gray-100 hover:border-purple-200 hover:shadow-md"
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 p-4">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing p-1"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div
          className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100"
        >
          <Icon className="h-4 w-4 text-purple-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-display text-lg text-gray-800">{label}</div>
          <div className="text-xs text-gray-400 truncate">
            {getBlockSummary(block)}
          </div>
        </div>

        <button
          onClick={onDuplicate}
          className="p-2 text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          aria-label="Duplicate"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all",
            open && "bg-purple-50 text-purple-600 rotate-180"
          )}
          aria-label="Toggle editor"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Editor body */}
      {open && (
        <div className="border-t border-gray-100 p-5 bg-gray-50/50 animate-in slide-in-from-top-2 duration-200">
          <BlockEditor block={block} provider={provider} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}

function getBlockSummary(block: PageBlock): string {
  switch (block.type) {
    case "hero":
      return block.config.headline || block.config.tagline || "Big intro section";
    case "about":
      return block.config.title || "About me";
    case "gallery":
      return `${block.config.images?.length || 0} images`;
    case "services":
      return block.config.title || "Inline services";
    case "quote":
      return block.config.quote ? `"${block.config.quote.slice(0, 60)}..."` : "Add a testimonial";
    case "link":
      return block.config.title || block.config.url || "External link";
    case "contact":
      return block.config.title || "Contact info";
    case "digital_product":
      return block.config.product_id ? "Linked product" : "Choose a product to sell";
    default:
      return "";
  }
}
