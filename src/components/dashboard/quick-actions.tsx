"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

import {
  Plus,
  Calendar,
  FileText,
  Stethoscope,
  Users,
  MessageSquare,
  Bell,
  Clock,
  AlertTriangle,
  Search,
  Download,
  Upload,
} from "lucide-react";

/**
 * Quick action button interface
 */
interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  variant: "default" | "secondary" | "outline";
  badge?: string;
  href?: string;
  onClick?: () => void;
}




/**
 * Mock quick actions data
 */
const primaryActions: QuickAction[] = [
  {
    id: "new-patient",
    title: "Add New Patient",
    description: "Register a new patient",
    icon: Plus,
    variant: "outline",
    href: "/dashboard/patients/new",
  },
  {
    id: "schedule-appointment",
    title: "Schedule Appointment",
    description: "Book patient appointment",
    icon: Calendar,
    variant: "outline",
    href: "/dashboard/appointments/new",
  },
  {
    id: "create-prescription",
    title: "New Prescription",
    description: "Generate prescription",
    icon: Stethoscope,
    variant: "outline",
    badge: "AI",
    href: "/dashboard/prescriptions/new-d",
  },
  {
    id: "medical-records",
    title: "Medical Records",
    description: "Access patient files",
    icon: FileText,
    variant: "outline",
    href: "/dashboard/records",
  },
];

const secondaryActions: QuickAction[] = [
  {
    id: "patient-search",
    title: "Search Patients",
    description: "Find patient records",
    icon: Search,
    variant: "outline",
    href: "/dashboard/patients/search",
  },
  {
    id: "emergency-alerts",
    title: "Emergency Alerts",
    description: "Critical notifications",
    icon: AlertTriangle,
    variant: "outline",
    badge: "3",
    href: "/dashboard/alerts",
  },
  {
    id: "messages",
    title: "Messages",
    description: "Staff communications",
    icon: MessageSquare,
    variant: "outline",
    badge: "12",
    href: "/dashboard/messages",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "System updates",
    icon: Bell,
    variant: "outline",
    badge: "5",
    href: "/dashboard/notifications",
  },
];

const utilityActions: QuickAction[] = [
  {
    id: "export-data",
    title: "Export Reports",
    description: "Download patient data",
    icon: Download,
    variant: "outline",
    onClick: () => console.log("Export initiated"),
  },
  {
    id: "import-data",
    title: "Import Records",
    description: "Upload medical files",
    icon: Upload,
    variant: "outline",
    onClick: () => console.log("Import initiated"),
  },
  {
    id: "shift-handover",
    title: "Shift Handover",
    description: "Transfer responsibilities",
    icon: Clock,
    variant: "outline",
    href: "/dashboard/handover",
  },
  {
    id: "team-schedule",
    title: "Team Schedule",
    description: "View staff availability",
    icon: Users,
    variant: "outline",
    href: "/dashboard/schedule",
  },
];

/**
 * Quick Actions Component
 *
 * Provides easy access to frequently used functions including:
 * - Primary actions (new patient, appointments, prescriptions)
 * - Secondary actions (search, alerts, communications)
 * - Utility actions (import/export, scheduling, handover)
 * - Badge indicators for pending items
 */
export function QuickActions() {
  const router = useRouter();
  const handleActionClick = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      router.push(action.href); // ✅ Navigate to route
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Actions with Motion */}
      <Card className="transition-all duration-300 ease-out hover:shadow-lg group">
        <CardHeader>
          <CardTitle className="text-lg font-semibold transition-colors duration-300 group-hover:text-blue-700">
            Quick Actions
          </CardTitle>
          <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-blue-600">
            Frequently used functions and shortcuts
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {primaryActions.map((action, index) => {
              const IconComponent = action.icon;

              return (
                <Button
                  key={action.id}
                  variant={action.variant}
                  className="h-auto p-4 flex items-center justify-start gap-3 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-md group/btn"
                  onClick={() => handleActionClick(action)}
                  style={{
                    animation: `slideInLeft 0.6s ease-out ${index * 100 + 200}ms both`,
                  }}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 transition-all duration-300 ease-out group-hover/btn:bg-primary/20 group-hover/btn:scale-110 group-hover/btn:rotate-6">
                    <IconComponent className="h-4 w-4 transition-transform duration-300 ease-out group-hover/btn:scale-110" />
                  </div>

                  <div className="flex-1 text-left transition-all duration-300 ease-out group-hover/btn:translate-x-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm transition-colors duration-300 group-hover/btn:text-blue-700">
                        {action.title}
                      </span>
                      {action.badge && (
                        <Badge
                          variant="secondary"
                          className="text-xs transition-all duration-300 ease-out group-hover/btn:scale-110 group-hover/btn:bg-blue-100 group-hover/btn:text-blue-700 animate-pulse"
                        >
                          {action.badge}{" "}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground transition-colors duration-300 group-hover/btn:text-blue-600">
                      {action.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      {/* Secondary Actions with Motion */}
      <Card className="transition-all duration-300 ease-out hover:shadow-lg group">
        <CardHeader>
          <CardTitle className="text-lg font-semibold transition-colors duration-300 group-hover:text-blue-700">
            Communications
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {secondaryActions.map((action, index) => {
              const IconComponent = action.icon;

              return (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  className="h-auto p-3 flex flex-col items-center gap-2 relative transition-all duration-300 ease-out hover:scale-105 hover:shadow-md group/btn"
                  onClick={() => handleActionClick(action)}
                  style={{
                    animation: `scaleIn 0.6s ease-out ${index * 100 + 600}ms both`,
                  }}
                >
                  {action.badge && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center transition-all duration-300 ease-out group-hover/btn:scale-125 group-hover/btn:animate-bounce"
                    >
                      {action.badge}
                    </Badge>
                  )}

                  <IconComponent className="h-5 w-5 transition-all duration-300 ease-out group-hover/btn:scale-110 group-hover/btn:rotate-12" />
                  <span className="text-xs font-medium text-center transition-colors duration-300 group-hover/btn:text-blue-700">
                    {action.title}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>{" "}
      {/* Utility Actions with Motion */}
      <Card className="transition-all duration-300 ease-out hover:shadow-lg group">
        <CardHeader>
          <CardTitle className="text-lg font-semibold transition-colors duration-300 group-hover:text-blue-700">
            Utilities
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            {utilityActions.map((action, index) => {
              const IconComponent = action.icon;

              return (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  className="w-full justify-start gap-2 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-md group/btn"
                  onClick={() => handleActionClick(action)}
                  style={{
                    animation: `slideInRight 0.6s ease-out ${index * 100 + 1000}ms both`,
                  }}
                >
                  <IconComponent className="h-4 w-4 transition-all duration-300 ease-out group-hover/btn:scale-110 group-hover/btn:rotate-6" />
                  <span className="text-sm transition-all duration-300 ease-out group-hover/btn:translate-x-1 group-hover/btn:text-blue-700">
                    {action.title}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      {/* Emergency Contact with Motion */}
      <Card
        className="border-red-200 bg-red-50/50 transition-all duration-300 ease-out hover:shadow-lg hover:scale-[1.02] group"
        style={{ animation: "scaleIn 0.6s ease-out 1.4s both" }}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 transition-all duration-300 ease-out group-hover:bg-red-200 group-hover:scale-110 group-hover:rotate-12">
              <AlertTriangle className="h-5 w-5 text-red-600 transition-all duration-300 ease-out group-hover:scale-110 animate-pulse" />
            </div>
            <div className="flex-1 transition-all duration-300 ease-out group-hover:translate-x-1">
              <div className="text-sm font-medium text-red-800 transition-colors duration-300 group-hover:text-red-900">
                Emergency Contact
              </div>
              <div className="text-xs text-red-600 transition-colors duration-300 group-hover:text-red-700">
                Call 911 or use hospital hotline
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg group/emergency"
            >
              <span className="transition-transform duration-300 ease-out group-hover/emergency:scale-105">
                Call
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
