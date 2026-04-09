"use client";

import { useState } from "react";
import { BookOpen, ShoppingBag, X } from "lucide-react";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { ThemedCard } from "../themed-card";
import { cn } from "@/lib/utils";
import type { DigitalProduct } from "@/types/database";

interface Props {
  product: DigitalProduct;
  index: number;
}

function formatPrice(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function DigitalProductBlockView({ product, index }: Props) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState("");

  async function handleBuy() {
    if (!buyerEmail) return;
    setBuying(true);
    try {
      const res = await fetch("/api/digital-products/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, buyerEmail }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
        setBuying(false);
      }
    } catch (e) {
      alert("Network error");
      setBuying(false);
    }
  }

  return (
    <>
      <section
        className="max-w-3xl mx-auto px-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
        style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
      >
        <ThemedCard className="p-6 md:p-8">
          <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
            {product.cover_image_url ? (
              <img
                src={product.cover_image_url}
                alt={product.title}
                className="w-full max-w-[200px] aspect-[3/4] object-cover rounded-2xl shadow-xl"
              />
            ) : (
              <div
                className="w-full max-w-[200px] aspect-[3/4] rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "var(--template-accent)", opacity: 0.1 }}
              >
                <BookOpen className="h-16 w-16" style={{ color: "var(--template-accent)" }} />
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 text-xs uppercase tracking-wider"
                   style={{ backgroundColor: "var(--template-accent)", color: "white", opacity: 0.9 }}>
                <BookOpen className="h-3 w-3" />
                Digital Product
              </div>
              <h3 className={cn(template.classes.heading, "text-3xl md:text-4xl mb-3")}>
                {product.title}
              </h3>
              {product.description && (
                <p className={cn(template.classes.body, "text-base mb-6")}>
                  {product.description}
                </p>
              )}
              <div className="flex items-center gap-4">
                <div className={cn(template.classes.heading, "text-3xl")}>
                  {formatPrice(product.price_cents, product.currency)}
                </div>
                <button
                  onClick={() => setPreviewOpen(true)}
                  className={cn(
                    template.classes.button,
                    template.animations.buttonHover,
                    "inline-flex items-center gap-2"
                  )}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Get it now
                </button>
              </div>
            </div>
          </div>
        </ThemedCard>
      </section>

      {/* Buy modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">{product.title}</h3>
            <p className="text-gray-500 mb-6 text-sm">{formatPrice(product.price_cents, product.currency)}</p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Where should we send your download link?
            </label>
            <input
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 mb-4 text-gray-900"
              required
            />
            <button
              onClick={handleBuy}
              disabled={!buyerEmail || buying}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {buying ? "Loading..." : `Continue to checkout · ${formatPrice(product.price_cents, product.currency)}`}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              Secure checkout via Stripe. You&apos;ll get an instant download link after purchase.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
