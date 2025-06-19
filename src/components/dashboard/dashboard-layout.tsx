// components/dashboard/dashboard-layout.tsx

"use client";

import { ReactNode, useState } from "react"; // Import useState
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./sidebar-clean"; // Your main fixed sidebar
import { DashboardHeader } from "./dashboard-header"; // Your main fixed header

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <SidebarProvider>
      {/* Overall app container: h-screen overflow-hidden to control global scroll */}
      <div className="h-screen flex w-full bg-background overflow-hidden">

        {/* DashboardSidebar - Conditionally visible and positioned for mobile */}
        {/* The sidebar will be fixed on all screens, but its `transform` will control visibility on mobile */}
        <DashboardSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

        {/* Mobile Overlay for Sidebar */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Main Content Wrapper (Header + Page Content) */}
        {/* On mobile, this will be full width. On md screens and up, it shifts right by ml-64 */}
        <div className="flex-1 flex flex-col md:ml-64">

          {/* DashboardHeader - Conditionally positioned for mobile */}
          <DashboardHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />

          {/* Page Content Area - Primary scrollable area */}
          <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden max-w-full pt-16">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}