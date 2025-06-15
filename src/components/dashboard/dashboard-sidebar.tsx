"use client";

import React, { useEffect, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Home,
  Users,
  Calendar,
  FileText,
  Stethoscope,
  Settings,
  LogOut,
  Bell,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardSidebar() {
  const { user, logout } = useAuth();

  const menuItems = [
    try {
      console.log("Fetching sidebar data from patients endpoint...");

      // Fetch from the same endpoint as the patients page
      const patientsResponse = await fetch("/api/patients-data", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Patients API response status:", patientsResponse.status);
      const patientsData = await patientsResponse.json();
      console.log("Patients API response data:", patientsData);

      // Calculate counts from real data
      const patientCount = patientsData.patients
        ? patientsData.patients.length
        : 0;

      // Fetch appointments data
      let appointmentCount = 0;
      try {
        const appointmentsResponse = await fetch("/api/upcoming-appointments", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const appointmentsData = await appointmentsResponse.json();
        appointmentCount = appointmentsData.appointments
          ? appointmentsData.appointments.length
          : 0;
      } catch (error) {
        console.log("Could not fetch appointments:", error);
      }

      // Fetch prescriptions data
      let prescriptionCount = 0;
      try {
        const prescriptionsResponse = await fetch("/api/prescriptions", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const prescriptionsData = await prescriptionsResponse.json();
        prescriptionCount = prescriptionsData.prescriptions
          ? prescriptionsData.prescriptions.length
          : 0;
      } catch (error) {
        console.log("Could not fetch prescriptions:", error);
      }

      const calculatedData = {
        patients: patientCount,
        appointments: appointmentCount,
        messages: 0, // Set to 0 for now as there's no messages endpoint
        notifications: 0, // Set to 0 for now as there's no notifications endpoint
        prescriptions: prescriptionCount,
      };

      console.log("Calculated sidebar data:", calculatedData);
      setSidebarData(calculatedData);
    } catch (error) {
      console.error("Error fetching sidebar data:", error);
      // Fallback to 0 values on error
      setSidebarData({
        patients: 0,
        appointments: 0,
        messages: 0,
        notifications: 0,
        prescriptions: 0,
      });
    } finally {
      setLoading(false);
    }
  }; // Fetch sidebar data
  useEffect(() => {
    fetchSidebarData();

    // Refresh every 2 minutes
    const interval = setInterval(fetchSidebarData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  // Dynamic menu items without badges
  const mainMenuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      title: "Patients",
      icon: Users,
      href: "/dashboard/patients",
    },
    {
      title: "Appointments",
      icon: Calendar,
      href: "/dashboard/appointments",
    },
    {
      title: "Medical Records",
      icon: FileText,
      href: "/dashboard/records",
    },
    {
      title: "Prescriptions",
      icon: Stethoscope,
      href: "/dashboard/prescriptions",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/dashboard/analytics",
    },
  ];
  const quickAccessItems = [
    {
      title: "Messages",
      icon: MessageSquare,
      href: "/dashboard/messages",
    },
    {
      title: "Notifications",
      icon: Bell,
      href: "/dashboard/notifications",
    },
  ];

  // Add debug logging for menu items
  console.log("Current mainMenuItems:", mainMenuItems);
  console.log("Current quickAccessItems:", quickAccessItems);

  const settingsItems = [
    {
      title: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      badge: null,
    },
  ];

  const handleLogout = async () => {
    await logout();
  };
  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      {" "}
      <SidebarHeader className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 group">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg transition-all duration-300 ease-out group-hover:shadow-xl group-hover:scale-110 group-hover:bg-blue-700">
            <Stethoscope className="h-7 w-7 text-white transition-transform duration-300 ease-out group-hover:rotate-12" />
          </div>
          <div className="transition-all duration-300 ease-out group-hover:translate-x-1">
            <h2 className="text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">
              DoctorCare
            </h2>
            <p className="text-sm text-gray-500 transition-colors duration-300 group-hover:text-blue-600">
              Medical System
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4 py-4">
        {" "}
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3 transition-colors duration-300 hover:text-blue-600">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {" "}
                  <SidebarMenuButton
                    asChild
                    className="w-full text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-sm"
                  >
                    {" "}
                    <Link href={item.href}>
                      <div className="flex items-center gap-3 px-3 py-2.5 group">
                        <item.icon className="h-5 w-5 transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-3" />
                        <span className="flex-1 font-medium transition-all duration-300 ease-out group-hover:translate-x-1">
                          {item.title}
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>{" "}
        {/* Quick Access */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3 transition-colors duration-300 hover:text-blue-600">
            Quick Access
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {quickAccessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {" "}
                  <SidebarMenuButton
                    asChild
                    className="w-full text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-sm"
                  >
                    {" "}
                    <Link href={item.href}>
                      <div className="flex items-center gap-3 px-3 py-2.5 group">
                        <item.icon className="h-5 w-5 transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-3" />
                        <span className="flex-1 font-medium transition-all duration-300 ease-out group-hover:translate-x-1">
                          {item.title}
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>{" "}
        {/* Settings */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3 transition-colors duration-300 hover:text-blue-600">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {" "}
                  <SidebarMenuButton
                    asChild
                    className="w-full text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-sm"
                  >
                    <Link href={item.href}>
                      <div className="flex items-center gap-3 px-3 py-2.5 group">
                        <item.icon className="h-5 w-5 transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-3" />
                        <span className="flex-1 font-medium transition-all duration-300 ease-out group-hover:translate-x-1">
                          {item.title}
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}{" "}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-sm"
                >
                  <div className="flex items-center gap-3 px-3 py-2.5 group">
                    <LogOut className="h-5 w-5 transition-all duration-300 ease-out group-hover:scale-110 group-hover:-rotate-12" />
                    <span className="flex-1 font-medium transition-all duration-300 ease-out group-hover:translate-x-1">
                      Logout
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 group transition-all duration-300 ease-out hover:bg-blue-50 hover:shadow-md transform hover:scale-[1.02]">
          <Avatar className="h-10 w-10 ring-2 ring-gray-200 transition-all duration-300 ease-out group-hover:ring-blue-300 group-hover:shadow-lg group-hover:scale-110">
            <AvatarImage
              src="/api/placeholder/40/40"
              alt={user?.name || "Doctor"}
              className="transition-all duration-300 ease-out group-hover:scale-105"
            />
            <AvatarFallback className="bg-blue-600 text-white font-semibold transition-all duration-300 ease-out group-hover:bg-blue-700 group-hover:rotate-6">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "DR"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 transition-all duration-300 ease-out group-hover:translate-x-1">
            <p className="text-sm font-semibold text-gray-900 truncate transition-colors duration-300 group-hover:text-blue-700">
              {user?.name || "Dr. John Smith"}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse transition-all duration-300 ease-out group-hover:scale-125"></div>
              <p className="text-xs text-gray-500 truncate transition-colors duration-300 group-hover:text-blue-600">
                Online • {user?.role || "doctor"}
              </p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
