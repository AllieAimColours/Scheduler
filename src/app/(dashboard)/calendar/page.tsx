import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          View your bookings and personal events in a calendar view
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Calendar View Coming in Phase 2
          </h3>
          <p className="text-muted-foreground max-w-sm">
            A beautiful week/day calendar view with color-coded appointments and
            personal events is on the way. For now, use the Bookings page to
            manage appointments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
