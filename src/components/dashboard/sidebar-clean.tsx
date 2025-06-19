"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  Home,
  LogOut,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function DashboardSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  // Check if current path matches the menu item
  const isActiveRoute = (url: string) => {
    if (!pathname) return false;
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  // Close mobile sidebar when navigating
  const handleNavigation = () => {
    setOpenMobile(false);
  };

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Patients",
      url: "/dashboard/patients",
      icon: Users,
    },
    {
      title: "Appointments",
      url: "/dashboard/appointments",
      icon: Calendar,
    },
    {
      title: "Prescriptions",
      url: "/dashboard/prescriptions",
      icon: FileText,
    },
    {
      title: "Messages",
      url: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border">
        <motion.div
          className="flex items-center gap-3 px-2 py-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="p-2 bg-blue-600 dark:bg-blue-700 rounded-lg shadow-md"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Stethoscope className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              DoctorCare
            </h2>
            <p className="text-sm text-muted-foreground">
              Medical System
            </p>
          </div>
        </motion.div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.url);

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="w-full justify-start gap-3 px-3 py-2.5 transition-all duration-200"
                      >
                        <Link href={item.url} onClick={handleNavigation}>
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>      <SidebarFooter className="border-t border-border">
        <motion.div
          className="p-4 space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          {/* User Profile */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "DR"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Dr. {user?.name?.split(" ")[0] || "Doctor"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || "doctor@example.com"}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
}
