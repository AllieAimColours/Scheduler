import { ConfirmationContent } from "@/components/booking/confirmation-content";

export default function ConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <ConfirmationContent />;
}
