"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PatientOverview } from "@/components/dashboard/patient-overview";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentPatients } from "@/components/dashboard/recent-patients";
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Enhanced Page Header with Motion */}
        <div className="group" style={{ animation: "slideInUp 0.6s ease-out" }}>
          <h1 className=" pl-2 text-3xl font-bold text-foreground transition-all duration-300 ease-out group-hover:text-blue-700 group-hover:scale-105">
            Doctor Dashboard
          </h1>
          <p className=" pl-2 text-muted-foreground transition-all duration-300 ease-out group-hover:text-blue-600 group-hover:translate-x-2">
            Welcome back, Dr. {user?.name?.split(" ")[0] || "Smith"}. Here's your patient overview for today.
          </p>

        </div>

        {/* Dashboard Stats with Stagger Animation */}
        <div style={{ animation: "slideInUp 0.6s ease-out 0.2s both" }}>
          <DashboardStats />
        </div>

        {/* Main Dashboard Grid with Enhanced Motion */}
        <div
          className="grid gap-6 lg:grid-cols-3"
          style={{ animation: "slideInUp 0.6s ease-out 0.4s both" }}
        >
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className="transition-all duration-300 ease-out hover:scale-[1.01]"
              style={{ animation: "slideInLeft 0.6s ease-out 0.8s both" }}
            >
              <UpcomingAppointments />
            </div>

            <div
              className="transition-all duration-300 ease-out hover:scale-[1.01]"
              style={{ animation: "slideInLeft 0.6s ease-out 0.6s both" }}
            >
              <RecentPatients />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <div
              className="transition-all duration-300 ease-out hover:scale-[1.02]"
              style={{ animation: "slideInRight 0.6s ease-out 1.0s both" }}
            >
              <QuickActions />
            </div>
            <div
              className="transition-all duration-300 ease-out hover:scale-[1.02]"
              style={{ animation: "slideInRight 0.6s ease-out 1.2s both" }}
            >
              <PatientOverview />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
