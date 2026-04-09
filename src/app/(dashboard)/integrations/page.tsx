import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link2, Calendar, Sparkles } from "lucide-react";

const CALENDARS = [
  {
    name: "Google Calendar",
    icon: "📅",
    description: "Sync your Google Calendar to show accurate availability",
    status: "coming-soon",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    name: "Microsoft Outlook",
    icon: "📧",
    description: "Connect your Outlook calendar for two-way sync",
    status: "coming-soon",
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    name: "Apple Calendar",
    icon: "🍎",
    description: "Sync via CalDAV with your iCloud calendar",
    status: "coming-soon",
    gradient: "from-gray-600 to-gray-800",
  },
  {
    name: "Proton Calendar",
    icon: "🔒",
    description: "Connect your encrypted Proton calendar via CalDAV",
    status: "coming-soon",
    gradient: "from-purple-600 to-violet-700",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Integrations
        </h1>
        <p className="text-gray-400">
          Connect your calendars for automatic availability sync
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CALENDARS.map((cal) => (
          <Card key={cal.name} className="rounded-2xl border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${cal.gradient} shadow-lg text-2xl`}>
                    {cal.icon}
                  </div>
                  {cal.name}
                </CardTitle>
                <Badge className="rounded-full bg-amber-50 text-amber-600 border-0 font-medium">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Soon
                </Badge>
              </div>
              <CardDescription className="text-gray-400 mt-2">{cal.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />
              <Button disabled variant="outline" className="w-full border-gray-200 text-gray-400">
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
