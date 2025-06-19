// components/dashboard/dashboard-layout.tsx

"use client";

import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./sidebar-clean"; // Your main fixed sidebar
import { DashboardHeader } from "./dashboard-header"; // Your main fixed header

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      {/* CRITICAL CHANGE HERE: `h-screen overflow-hidden`
          This div now explicitly takes 100% of the viewport height and hides any
          overflow, forcing the scrolling to be handled internally by the `main` tag. */}
      <div className="h-screen flex w-full bg-background overflow-hidden">
        {/*
          DashboardSidebar:
          It's fixed (from its own component), so it doesn't take up space in the flex flow here.
          It simply overlays the left side.
        */}
        <DashboardSidebar />

        {/*
          This div holds the DashboardHeader (which is fixed) AND the main scrollable content.
          - `flex-1`: Takes up all remaining horizontal space after the sidebar.
          - `flex flex-col`: Stacks its children (DashboardHeader and main content) vertically.
          - `ml-64`: Pushes this entire right-side container to the right, clearing space for the fixed sidebar.
        */}
        <div className="flex-1 flex flex-col ml-64">
          {/*
            DashboardHeader:
            It's fixed (from its own component), so it doesn't take up space in the flex-col flow.
            It simply overlays the top of this container.
          */}
          <DashboardHeader />

          {/*
            Main Content Area:
            - `flex-1`: Makes it take up all remaining *vertical* space after the fixed header.
            - `p-6`: Standard padding.
            - `overflow-y-auto`: CRITICAL. This makes *only this `main` element* scroll vertically.
            - `pt-16`: CRITICAL. Adds padding to the top, creating space for the `h-16` fixed DashboardHeader,
                       so content doesn't get hidden underneath it.
            - `overflow-x-hidden max-w-full`: Prevents unwanted horizontal scrolling.
          */}
          <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden max-w-full pt-16">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}