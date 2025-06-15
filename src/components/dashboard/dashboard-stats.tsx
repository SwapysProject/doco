"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Activity,
  AlertTriangle,
  Heart,
  Clock,
  CheckCircle,
} from "lucide-react";

interface Patient {
  _id: string;
  name: string;
  status?: string;
  condition?: string;
}

interface Appointment {
  _id: string;
  date?: string;
  appointmentDate?: string | Date;
}

interface StatsData {
  totalPatients: number;
  todayAppointments: number;
  totalAppointments: number;
  criticalCases: number;
  stablePatients: number;
  monitoringPatients: number;
  activePatients: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalPatients: 0,
    todayAppointments: 0,
    totalAppointments: 0,
    criticalCases: 0,
    stablePatients: 0,
    monitoringPatients: 0,
    activePatients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null); // Fetch patients data using the same endpoint as the patients page
        const patientsResponse = await fetch("/api/my-patients", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!patientsResponse.ok) {
          if (patientsResponse.status === 401) {
            throw new Error("Please log in to view dashboard stats");
          }
          throw new Error(
            `Failed to fetch patients: ${patientsResponse.status}`
          );
        }

        const patientsData = await patientsResponse.json();

        if (!patientsData.success) {
          throw new Error(patientsData.message || "Failed to fetch patients");
        }

        const patients: Patient[] = patientsData.patients || [];

        // Calculate stats from patient data
        const totalPatients = patients.length;
        const criticalCases = patients.filter(
          (p: Patient) =>
            p.status === "critical" ||
            p.condition?.toLowerCase().includes("critical")
        ).length;
        const stablePatients = patients.filter(
          (p: Patient) =>
            p.status === "stable" ||
            p.condition?.toLowerCase().includes("stable")
        ).length;
        const monitoringPatients = patients.filter(
          (p: Patient) =>
            p.status === "monitoring" ||
            p.condition?.toLowerCase().includes("monitoring")
        ).length;
        const activePatients = patients.filter(
          (p: Patient) => p.status === "active" || !p.status
        ).length;

        // Fetch appointments using the same endpoint as the appointments page
        let todayAppointments = 0;
        let totalAppointments = 0;
        try {
          const appointmentsResponse = await fetch(
            "/api/upcoming-appointments",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (appointmentsResponse.ok) {
            const appointmentsData = await appointmentsResponse.json();
            if (appointmentsData.success && appointmentsData.data) {
              const appointments: Appointment[] = appointmentsData.data;
              totalAppointments = appointments.length;

              // Count today's appointments
              const today = new Date().toISOString().split("T")[0];
              todayAppointments = appointments.filter((apt: Appointment) => {
                const aptDate = apt.date || apt.appointmentDate;
                if (aptDate) {
                  // Handle both string dates and Date objects
                  const dateStr =
                    typeof aptDate === "string"
                      ? aptDate
                      : new Date(aptDate).toISOString().split("T")[0];
                  return dateStr === today;
                }
                return false;
              }).length;
            }
          }
        } catch (appointmentErr) {
          console.log(
            "Appointments API not available, using fallback",
            appointmentErr
          );
        }

        setStats({
          totalPatients,
          todayAppointments,
          totalAppointments,
          criticalCases,
          stablePatients,
          monitoringPatients,
          activePatients,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600 text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Patients */}
        <Card className="hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 group cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-blue-600">
              Total Patients
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 transition-all duration-300 ease-out group-hover:bg-blue-100 group-hover:scale-110 group-hover:rotate-6">
              <Users className="h-4 w-4 text-blue-600 transition-all duration-300 ease-out group-hover:scale-110" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground transition-all duration-300 ease-out group-hover:text-blue-700 group-hover:scale-105">
              {loading ? "..." : stats.totalPatients}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className="transition-all duration-300 ease-out transform group-hover:scale-110 bg-gray-500/10 text-gray-700 hover:bg-gray-500/20 group-hover:shadow-md"
              >
                Active
              </Badge>
              <p className="text-xs text-muted-foreground transition-colors duration-300 group-hover:text-gray-600">
                Assigned to you
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 group cursor-pointer border-l-4 border-l-transparent hover:border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-green-600">
              Today&apos;s Appointments
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-50 transition-all duration-300 ease-out group-hover:bg-green-100 group-hover:scale-110 group-hover:rotate-6">
              <Calendar className="h-4 w-4 text-green-600 transition-all duration-300 ease-out group-hover:scale-110" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground transition-all duration-300 ease-out group-hover:text-green-700 group-hover:scale-105">
              {loading ? "..." : stats.todayAppointments}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="default"
                className="transition-all duration-300 ease-out transform group-hover:scale-110 bg-green-500/10 text-green-700 hover:bg-green-500/20 group-hover:shadow-md"
              >
                Today
              </Badge>
              <p className="text-xs text-muted-foreground transition-colors duration-300 group-hover:text-gray-600">
                Scheduled for today
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Critical Cases */}
        <Card className="hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 group cursor-pointer border-l-4 border-l-transparent hover:border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-red-600">
              Critical Cases
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-50 transition-all duration-300 ease-out group-hover:bg-red-100 group-hover:scale-110 group-hover:rotate-6">
              <AlertTriangle className="h-4 w-4 text-red-600 transition-all duration-300 ease-out group-hover:scale-110" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground transition-all duration-300 ease-out group-hover:text-red-700 group-hover:scale-105">
              {loading ? "..." : stats.criticalCases}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="destructive"
                className="transition-all duration-300 ease-out transform group-hover:scale-110 bg-red-500/10 text-red-700 hover:bg-red-500/20 group-hover:shadow-md"
              >
                Urgent
              </Badge>
              <p className="text-xs text-muted-foreground transition-colors duration-300 group-hover:text-gray-600">
                Require attention
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Appointments */}
        <Card className="hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 group cursor-pointer border-l-4 border-l-transparent hover:border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-purple-600">
              Total Appointments
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-50 transition-all duration-300 ease-out group-hover:bg-purple-100 group-hover:scale-110 group-hover:rotate-6">
              <Activity className="h-4 w-4 text-purple-600 transition-all duration-300 ease-out group-hover:scale-110" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground transition-all duration-300 ease-out group-hover:text-purple-700 group-hover:scale-105">
              {loading ? "..." : stats.totalAppointments}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className="transition-all duration-300 ease-out transform group-hover:scale-110 bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 group-hover:shadow-md"
              >
                All time
              </Badge>
              <p className="text-xs text-muted-foreground transition-colors duration-300 group-hover:text-gray-600">
                Total scheduled
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Status Overview */}
      <Card className="transition-all duration-300 ease-out hover:shadow-lg transform hover:scale-[1.01] group">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 transition-colors duration-300 group-hover:text-blue-700">
            <div className="p-2 rounded-lg bg-blue-50 transition-all duration-300 ease-out group-hover:bg-blue-100 group-hover:scale-110 group-hover:rotate-6">
              <Activity className="h-5 w-5 text-blue-600 transition-all duration-300 ease-out group-hover:scale-110" />
            </div>
            Patient Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Stable */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 transition-all duration-300 ease-out hover:bg-muted hover:shadow-md transform hover:scale-105 hover:-translate-y-1 group/item cursor-pointer">
              <div className="p-2 rounded-full bg-green-500 text-white transition-all duration-300 ease-out group-hover/item:scale-110 group-hover/item:rotate-12 group-hover/item:shadow-lg">
                <CheckCircle className="h-4 w-4 transition-transform duration-300 ease-out group-hover/item:scale-110" />
              </div>
              <div className="transition-all duration-300 ease-out group-hover/item:translate-x-1">
                <p className="text-sm font-medium text-foreground transition-colors duration-300 group-hover/item:text-blue-700">
                  Stable
                </p>
                <p className="text-lg font-bold text-foreground transition-all duration-300 ease-out group-hover/item:text-blue-600 group-hover/item:scale-110">
                  {loading ? "..." : stats.stablePatients}
                </p>
              </div>
            </div>

            {/* Monitoring */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 transition-all duration-300 ease-out hover:bg-muted hover:shadow-md transform hover:scale-105 hover:-translate-y-1 group/item cursor-pointer">
              <div className="p-2 rounded-full bg-yellow-500 text-white transition-all duration-300 ease-out group-hover/item:scale-110 group-hover/item:rotate-12 group-hover/item:shadow-lg">
                <Clock className="h-4 w-4 transition-transform duration-300 ease-out group-hover/item:scale-110" />
              </div>
              <div className="transition-all duration-300 ease-out group-hover/item:translate-x-1">
                <p className="text-sm font-medium text-foreground transition-colors duration-300 group-hover/item:text-blue-700">
                  Monitoring
                </p>
                <p className="text-lg font-bold text-foreground transition-all duration-300 ease-out group-hover/item:text-blue-600 group-hover/item:scale-110">
                  {loading ? "..." : stats.monitoringPatients}
                </p>
              </div>
            </div>

            {/* Critical */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 transition-all duration-300 ease-out hover:bg-muted hover:shadow-md transform hover:scale-105 hover:-translate-y-1 group/item cursor-pointer">
              <div className="p-2 rounded-full bg-red-500 text-white transition-all duration-300 ease-out group-hover/item:scale-110 group-hover/item:rotate-12 group-hover/item:shadow-lg">
                <Heart className="h-4 w-4 transition-transform duration-300 ease-out group-hover/item:scale-110" />
              </div>
              <div className="transition-all duration-300 ease-out group-hover/item:translate-x-1">
                <p className="text-sm font-medium text-foreground transition-colors duration-300 group-hover/item:text-blue-700">
                  Critical
                </p>
                <p className="text-lg font-bold text-foreground transition-all duration-300 ease-out group-hover/item:text-blue-600 group-hover/item:scale-110">
                  {loading ? "..." : stats.criticalCases}
                </p>
              </div>
            </div>

            {/* Active */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 transition-all duration-300 ease-out hover:bg-muted hover:shadow-md transform hover:scale-105 hover:-translate-y-1 group/item cursor-pointer">
              <div className="p-2 rounded-full bg-blue-500 text-white transition-all duration-300 ease-out group-hover/item:scale-110 group-hover/item:rotate-12 group-hover/item:shadow-lg">
                <Activity className="h-4 w-4 transition-transform duration-300 ease-out group-hover/item:scale-110" />
              </div>
              <div className="transition-all duration-300 ease-out group-hover/item:translate-x-1">
                <p className="text-sm font-medium text-foreground transition-colors duration-300 group-hover/item:text-blue-700">
                  Active
                </p>
                <p className="text-lg font-bold text-foreground transition-all duration-300 ease-out group-hover/item:text-blue-600 group-hover/item:scale-110">
                  {loading ? "..." : stats.activePatients}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
