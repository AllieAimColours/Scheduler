import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link2, Calendar } from "lucide-react";

const CALENDARS = [
  {
    name: "Google Calendar",
    icon: "📅",
    description: "Sync your Google Calendar to show accurate availability",
    status: "coming-soon",
  },
  {
    name: "Microsoft Outlook",
    icon: "📧",
    description: "Connect your Outlook calendar for two-way sync",
    status: "coming-soon",
  },
  {
    name: "Apple Calendar",
    icon: "🍎",
    description: "Sync via CalDAV with your iCloud calendar",
    status: "coming-soon",
  },
  {
    name: "Proton Calendar",
    icon: "🔒",
    description: "Connect your encrypted Proton calendar via CalDAV",
    status: "coming-soon",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your calendars for automatic availability sync
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CALENDARS.map((cal) => (
          <Card key={cal.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{cal.icon}</span>
                  {cal.name}
                </CardTitle>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              <CardDescription>{cal.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled variant="outline" className="w-full">
                <Link2 className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
