import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import type { DigitalProduct, Provider } from "@/types/database";

const schema = z.object({
  productId: z.string().uuid(),
  buyerEmail: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, buyerEmail } = schema.parse(body);

    const supabase = createAdminClient();

    const { data: productData, error: productError } = await supabase
      .from("digital_products")
      .select("*")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError || !productData) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productData as unknown as DigitalProduct;

    const { data: providerData } = await supabase
      .from("providers")
      .select("*")
      .eq("id", product.provider_id)
      .single();

    const provider = providerData as unknown as Provider | null;
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    // Pre-create the sale row with a download token
    const downloadToken = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: saleData, error: saleError } = await supabase
      .from("digital_product_sales")
      .insert({
        product_id: product.id,
        provider_id: provider.id,
        buyer_email: buyerEmail,
        amount_cents: product.price_cents,
        currency: product.currency,
        download_token: downloadToken,
        download_expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (saleError || !saleData) {
      console.error("Sale insert error:", saleError);
      return NextResponse.json({ error: "Failed to start checkout" }, { status: 500 });
    }

    const sale = saleData as { id: string };

    // Create Stripe checkout session
    const sessionConfig: Record<string, unknown> = {
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: product.currency.toLowerCase(),
            product_data: {
              name: product.title,
              description: product.description.slice(0, 500) || undefined,
            },
            unit_amount: product.price_cents,
          },
          quantity: 1,
        },
      ],
      customer_email: buyerEmail,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/download/${downloadToken}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${provider.slug}`,
      metadata: {
        sale_id: sale.id,
        product_id: product.id,
        download_token: downloadToken,
        type: "digital_product",
      },
    };

    if (provider.stripe_account_id && provider.stripe_onboarding_complete) {
      sessionConfig.payment_intent_data = {
        transfer_data: {
          destination: provider.stripe_account_id,
        },
      };
    }

    const session = await getStripe().checkout.sessions.create(
      sessionConfig as Parameters<ReturnType<typeof getStripe>["checkout"]["sessions"]["create"]>[0]
    );

    // Update sale with stripe session id
    await supabase
      .from("digital_product_sales")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", sale.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.issues }, { status: 400 });
    }
    console.error("Digital checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
