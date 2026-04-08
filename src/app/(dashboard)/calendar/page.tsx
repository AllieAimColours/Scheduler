import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Calendar
        </h1>
        <p className="text-gray-400">
          View your bookings and personal events in a calendar view
        </p>
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-6">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600">Coming in Phase 2</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            A beautiful calendar is on its way
          </h3>
          <p className="text-gray-400 max-w-md mb-6">
            Color-coded week and day views, drag-to-reschedule, and personal event blocking
            are all coming soon. It&apos;s going to be gorgeous.
          </p>
          <Link
            href="/bookings"
            className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-600 transition-all"
          >
            View bookings in the meantime →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
