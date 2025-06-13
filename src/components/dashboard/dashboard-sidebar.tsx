"use client"

import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter 
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Stethoscope, 
  Activity, 
  Settings, 
  LogOut,
  Bell,
  MessageSquare,
  BarChart3
} from "lucide-react"
import Link from "next/link"

const mainMenuItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
    badge: null
  },
  {
    title: "Patients",
    icon: Users,
    href: "/dashboard/patients",
    badge: "24"
  },
  {
    title: "Appointments",
    icon: Calendar,
    href: "/dashboard/appointments",
    badge: "12"
  },
  {
    title: "Medical Records",
    icon: FileText,
    href: "/dashboard/records",
    badge: null
  },
  {
    title: "Prescriptions",
    icon: Stethoscope,
    href: "/dashboard/prescriptions",
    badge: "3"
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
    badge: null
  },
]

const quickAccessItems = [
  {
    title: "Health Monitor",
    icon: Activity,
    href: "/dashboard/monitor",
    badge: "Live"
  },
  {
    title: "Messages",
    icon: MessageSquare,
    href: "/dashboard/messages",
    badge: "5"
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/dashboard/notifications",
    badge: "8"
  },
]

const settingsItems = [
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    badge: null
  },
  {
    title: "Logout",
    icon: LogOut,
    href: "/logout",
    badge: null
  },
]

export function DashboardSidebar() {
  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">DoctorCare</h2>
            <p className="text-sm text-sidebar-foreground/60">Medical System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-medium">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className="ml-auto bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Access */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-medium">
            Quick Access
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickAccessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge 
                          variant={item.badge === "Live" ? "default" : "secondary"}
                          className={
                            item.badge === "Live" 
                              ? "ml-auto bg-green-500 text-white hover:bg-green-600" 
                              : "ml-auto bg-primary/10 text-primary hover:bg-primary/20"
                          }
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-medium">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/api/placeholder/40/40" alt="Dr. Smith" />
            <AvatarFallback className="bg-primary text-primary-foreground">DS</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
              Dr. John Smith
            </p>
            <p className="text-xs text-sidebar-accent-foreground/60 truncate">
              Cardiologist
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
