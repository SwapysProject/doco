"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PatientOverview } from "@/components/dashboard/patient-overview";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentPatients } from "@/components/dashboard/recent-patients";
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Doctor Dashboard
          </h1>          <p className="text-muted-foreground">
            Welcome back, Dr. Smith. Here&apos;s your patient overview for today.
          </p>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Main Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <RecentPatients />
            <UpcomingAppointments />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <QuickActions />
            <PatientOverview />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
