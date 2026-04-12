"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DigitalProductBlock } from "@/lib/page-builder/types";
import type { Provider, DigitalProduct } from "@/types/database";
import { Field, TextInput, TextArea } from "./field";
import { ImageUpload } from "../image-upload";
import { Plus, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Props {
  block: DigitalProductBlock;
  provider: Provider;
  onUpdate: (config: Record<string, unknown>) => void;
}

export function DigitalProductEditor({ block, provider, onUpdate }: Props) {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    cover_image_url: "",
    file_path: "",
    price_cents: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const supabase = createClient();
    const { data } = await supabase
      .from("digital_products")
      .select("*")
      .eq("provider_id", provider.id)
      .order("created_at", { ascending: false });
    setProducts((data as unknown as DigitalProduct[]) || []);
  }

  async function createProduct() {
    if (!draft.title || draft.price_cents <= 0) {
      toast.error("Title and price are required");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("digital_products")
      .insert({
        provider_id: provider.id,
        title: draft.title,
        description: draft.description,
        cover_image_url: draft.cover_image_url || null,
        file_path: draft.file_path || null,
        price_cents: draft.price_cents,
        is_active: true,
      })
      .select()
      .single();

    if (error || !data) {
      toast.error(`Failed: ${error?.message || "unknown"}`);
      setSaving(false);
      return;
    }

    toast.success("Product created");
    const product = data as unknown as DigitalProduct;
    setProducts([product, ...products]);
    onUpdate({ product_id: product.id });
    setCreating(false);
    setDraft({ title: "", description: "", cover_image_url: "", file_path: "", price_cents: 0 });
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <Field label="Choose a product to feature">
        {products.length === 0 && !creating ? (
          <div className="text-center py-6 px-4 rounded-xl bg-white border-2 border-dashed border-gray-200">
            <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-3">No digital products yet</p>
            <button
              onClick={() => setCreating(true)}
              className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium shadow"
            >
              <Plus className="h-4 w-4 inline mr-1" />
              Create your first product
            </button>
          </div>
        ) : (
          <select
            value={block.config.product_id || ""}
            onChange={(e) => onUpdate({ product_id: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm text-gray-900"
          >
            <option value="">Select a product...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} · ${(p.price_cents / 100).toFixed(2)}
              </option>
            ))}
          </select>
        )}
      </Field>

      {!creating && products.length > 0 && (
        <button
          onClick={() => setCreating(true)}
          className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Create a new product
        </button>
      )}

      {creating && (
        <div className="space-y-3 p-4 rounded-xl bg-white border border-purple-200">
          <h4 className="font-display text-base text-gray-800">New digital product</h4>
          <Field label="Title">
            <TextInput
              value={draft.title}
              onChange={(v) => setDraft({ ...draft, title: v })}
              placeholder="The Color Care Guide"
            />
          </Field>
          <Field label="Description">
            <TextArea
              value={draft.description}
              onChange={(v) => setDraft({ ...draft, description: v })}
              placeholder="A 30-page guide on caring for your color..."
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <ImageUpload
              value={draft.cover_image_url}
              onChange={(v) => setDraft({ ...draft, cover_image_url: v })}
              label="Cover image"
              folder="products"
            />
            <Field label="Price (USD)">
              <TextInput
                type="number"
                value={String(draft.price_cents / 100 || "")}
                onChange={(v) => setDraft({ ...draft, price_cents: Math.round(Number(v) * 100) })}
                placeholder="9.99"
              />
            </Field>
          </div>
          <Field label="File path in storage" hint="Upload the file to Supabase Storage bucket 'digital-products' first, then paste the path here">
            <TextInput
              value={draft.file_path}
              onChange={(v) => setDraft({ ...draft, file_path: v })}
              placeholder="provider-id/guide.pdf"
            />
          </Field>
          <div className="flex gap-2">
            <button
              onClick={createProduct}
              disabled={saving}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium text-sm shadow disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create product"}
            </button>
            <button
              onClick={() => setCreating(false)}
              className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
