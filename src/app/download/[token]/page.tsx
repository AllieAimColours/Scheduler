import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { Download, BookOpen, Mail, Clock } from "lucide-react";
import type { DigitalProductSale, DigitalProduct } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: saleData } = await supabase
    .from("digital_product_sales")
    .select("*")
    .eq("download_token", token)
    .single();

  if (!saleData) notFound();
  const sale = saleData as unknown as DigitalProductSale;

  const expiresAt = new Date(sale.download_expires_at);
  const expired = expiresAt.getTime() < Date.now();

  const { data: productData } = await supabase
    .from("digital_products")
    .select("*")
    .eq("id", sale.product_id)
    .single();

  if (!productData) notFound();
  const product = productData as unknown as DigitalProduct;

  let signedUrl: string | null = null;
  if (!expired && product.file_path) {
    const { data: signed } = await supabase.storage
      .from("digital-products")
      .createSignedUrl(product.file_path, 60 * 60 * 24); // 24 hours
    signedUrl = signed?.signedUrl || null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 mb-6">
            <BookOpen className="h-10 w-10 text-purple-600" />
          </div>

          <h1 className="text-3xl font-display font-semibold text-gray-900 mb-2">
            Thank you!
          </h1>
          <p className="text-gray-500 mb-6">
            Your purchase of <strong>{product.title}</strong> is complete.
          </p>

          {expired ? (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 mb-6">
              <Clock className="h-6 w-6 text-amber-600 mx-auto mb-2" />
              <p className="text-sm text-amber-800 font-medium">This download link has expired</p>
              <p className="text-xs text-amber-600 mt-1">
                Contact the seller for a fresh link
              </p>
            </div>
          ) : signedUrl ? (
            <a
              href={signedUrl}
              download
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <Download className="h-5 w-5" />
              Download {product.title}
            </a>
          ) : (
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5 mb-6">
              <p className="text-sm text-gray-600">
                Your download is being prepared. Check your email — we&apos;ve sent the link
                to <strong>{sale.buyer_email}</strong>.
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mt-8 text-xs text-gray-400">
            <Mail className="h-3 w-3" />
            A backup link was sent to {sale.buyer_email}
          </div>
          <div className="text-[11px] text-gray-300 mt-1">
            Link expires {expiresAt.toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
