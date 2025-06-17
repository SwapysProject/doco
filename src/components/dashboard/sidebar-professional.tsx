"use client";

import { useAuth } from "@/contexts/AuthContext";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Users,
  Calendar,
  FileText,
  BarChart3,
  MessageSquare,
  Bell,
  Settings,
  Stethoscope,
  Home,
  Heart,
  LogOut,
  Activity,
  User,
  Shield,
  ChevronRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function DashboardSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Helper function to get user initials
  const getUserInitials = (name: string): string => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Check if current path matches the menu item
  const isActiveRoute = (url: string) => {
    if (!pathname) return false;
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      description: "Overview & Analytics",
    },
    {
      title: "Patients",
      url: "/dashboard/patients",
      icon: Users,
      description: "Patient Management",
    },
    {
      title: "Appointments",
      url: "/dashboard/appointments",
      icon: Calendar,
      description: "Schedule & Bookings",
    },
    {
      title: "Medical Records",
      url: "/dashboard/medical-records",
      icon: FileText,
      description: "Patient Records",
    },
    {
      title: "Prescriptions",
      url: "/dashboard/prescriptions",
      icon: Heart,
      description: "Medication Management",
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
      description: "Reports & Insights",
    },
  ];

  const quickAccessItems = [
    {
      title: "Messages",
      url: "/dashboard/messages",
      icon: MessageSquare,
      badge: "3",
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: Bell,
      badge: "12",
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Sidebar className="border-r border-slate-200/60 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 dark:border-slate-800/60 shadow-xl">
      {/* Header */}
      <SidebarHeader className="border-b border-slate-200/60 dark:border-slate-800/60 p-6 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800">
        <motion.div
          className="flex items-center gap-4 group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Link href="/dashboard" className="flex items-center gap-4 w-full">
            <motion.div
              className="relative p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <Stethoscope className="h-8 w-8 text-white" />
              <motion.div
                className="absolute inset-0 rounded-2xl bg-white/5"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            <div className="flex-1">
              <motion.h1
                className="text-2xl font-bold text-white tracking-tight"
                initial={{ opacity: 0.9 }}
                whileHover={{ opacity: 1 }}
              >
                DoctorCare
              </motion.h1>
              <motion.p
                className="text-blue-100 text-sm font-medium"
                initial={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
              >
                Professional Medical System
              </motion.p>
            </div>
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.2 }}
            >
              <Zap className="h-5 w-5 text-yellow-300" />
            </motion.div>
          </Link>
        </motion.div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-4 py-6 space-y-8">
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 px-3 flex items-center gap-2">
            <Activity className="h-3 w-3" />
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item, index) => {
                const isActive = isActiveRoute(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onHoverStart={() => setHoveredItem(item.title)}
                      onHoverEnd={() => setHoveredItem(null)}
                    >
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <motion.div
                            className={`relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group overflow-hidden ${
                              isActive
                                ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-l-4 border-blue-500 shadow-lg shadow-blue-500/10"
                                : "hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/30 hover:shadow-md"
                            }`}
                            whileHover={{ x: 4, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                          >
                            {/* Active indicator */}
                            <AnimatePresence>
                              {isActive && (
                                <motion.div
                                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full"
                                  layoutId="activeIndicator"
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: 1 }}
                                  exit={{ scaleY: 0 }}
                                  transition={{ duration: 0.3 }}
                                />
                              )}
                            </AnimatePresence>

                            {/* Icon */}
                            <motion.div
                              className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                isActive
                                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white group-hover:shadow-lg"
                              }`}
                              whileHover={{ rotate: 5, scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              <item.icon className="h-6 w-6" />
                              {hoveredItem === item.title && (
                                <motion.div
                                  className="absolute inset-0 rounded-xl border-2 border-blue-400"
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                />
                              )}
                            </motion.div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <motion.h3
                                className={`font-semibold text-sm transition-colors duration-300 ${
                                  isActive
                                    ? "text-blue-900 dark:text-blue-100"
                                    : "text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300"
                                }`}
                                animate={{
                                  x: hoveredItem === item.title ? 4 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                {item.title}
                              </motion.h3>
                              <motion.p
                                className={`text-xs transition-colors duration-300 ${
                                  isActive
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-slate-500 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                }`}
                                animate={{
                                  opacity: hoveredItem === item.title ? 1 : 0.7,
                                }}
                              >
                                {item.description}
                              </motion.p>
                            </div>

                            {/* Arrow */}
                            <motion.div
                              className={`transition-all duration-300 ${
                                isActive
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-100"
                              }`}
                              animate={{
                                x: hoveredItem === item.title ? 4 : 0,
                              }}
                            >
                              <ChevronRight className="h-4 w-4 text-blue-500" />
                            </motion.div>

                            {/* Hover glow */}
                            <motion.div
                              className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              animate={{
                                scale: hoveredItem === item.title ? 1.02 : 1,
                              }}
                            />
                          </motion.div>
                        </Link>
                      </SidebarMenuButton>
                    </motion.div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Access */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 px-3 flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Quick Access
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {quickAccessItems.map((item, index) => {
                const isActive = isActiveRoute(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: (menuItems.length + index) * 0.1,
                      }}
                    >
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <motion.div
                            className={`relative flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group ${
                              isActive
                                ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-sm"
                            }`}
                            whileHover={{ x: 2, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <motion.div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                isActive
                                  ? "bg-blue-500 text-white"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 group-hover:bg-blue-500 group-hover:text-white"
                              }`}
                              whileHover={{ scale: 1.1, rotate: 3 }}
                            >
                              <item.icon className="h-5 w-5" />
                            </motion.div>
                            <span
                              className={`font-medium transition-colors duration-300 ${
                                isActive
                                  ? "text-blue-700 dark:text-blue-300"
                                  : "text-slate-700 dark:text-slate-300 group-hover:text-blue-700"
                              }`}
                            >
                              {item.title}
                            </span>
                            {item.badge && (
                              <motion.div
                                className="ml-auto px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              >
                                {item.badge}
                              </motion.div>
                            )}
                          </motion.div>
                        </Link>
                      </SidebarMenuButton>
                    </motion.div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-slate-200/60 dark:border-slate-800/60 p-4 space-y-4">
        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/settings">
                      <div className="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <motion.div
                          className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-slate-500 group-hover:text-white transition-all duration-300"
                          whileHover={{ rotate: 90, scale: 1.1 }}
                        >
                          <Settings className="h-4 w-4" />
                        </motion.div>
                        <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300">
                          Settings
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </motion.div>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                  <SidebarMenuButton onClick={handleLogout}>
                    <div className="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group hover:bg-red-50 dark:hover:bg-red-950/30">
                      <motion.div
                        className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all duration-300"
                        whileHover={{ rotate: -12, scale: 1.1 }}
                      >
                        <LogOut className="h-4 w-4" />
                      </motion.div>
                      <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                        Logout
                      </span>
                    </div>
                  </SidebarMenuButton>
                </motion.div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile */}
        <motion.div
          className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/30 dark:border-blue-800/30 shadow-lg backdrop-blur-sm"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ animationDelay: "1s" }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="relative h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-blue-200 dark:ring-blue-800"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-white font-bold text-lg">
                {user ? getUserInitials(user.name) : "U"}
              </span>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-300"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <motion.h4
                className="font-bold text-slate-900 dark:text-white truncate"
                whileHover={{ x: 2 }}
              >
                {user ? user.name : "Loading..."}
              </motion.h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {user?.specialization || "Medical Professional"}
              </p>
              <motion.div
                className="flex items-center gap-2 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                  Online
                </span>
              </motion.div>
            </div>
            <motion.div
              whileHover={{ scale: 1.2, rotate: 15 }}
              className="text-blue-500"
            >
              <Shield className="h-4 w-4" />
            </motion.div>
          </div>
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
}
