"use client";

import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./sidebar-clean";
import { DashboardHeader } from "./dashboard-header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar - Hidden on mobile, overlay on tablet */}
        <DashboardSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <DashboardHeader />

          {/* Page Content - Responsive padding */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden max-w-full">
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
