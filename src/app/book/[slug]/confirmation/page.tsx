import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-6 space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            You&apos;ll receive a confirmation email shortly with all the
            details. We look forward to seeing you!
          </p>
          <div className="pt-4">
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
