"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  User,
  MoreHorizontal,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Appointment type definition
 */
type AppointmentType =
  | "consultation"
  | "follow-up"
  | "surgery"
  | "emergency"
  | "checkup";

type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled";

/**
 * Appointment data interface
 */
interface Appointment {
  _id: string;
  appointmentId?: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  duration?: number; // in minutes
  type: AppointmentType;
  status: AppointmentStatus;
  location?: string;
  isVirtual?: boolean;
  notes?: string;
  avatar?: string;
  doctorId: string;
}

/**
 * Returns the appropriate appointment type badge styling
 */
function getAppointmentTypeBadge(type: AppointmentType) {
  const typeConfig = {
    consultation: {
      className: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20",
      label: "Consultation",
    },
    "follow-up": {
      className: "bg-green-500/10 text-green-700 hover:bg-green-500/20",
      label: "Follow-up",
    },
    surgery: {
      className: "bg-red-500/10 text-red-700 hover:bg-red-500/20",
      label: "Surgery",
    },
    emergency: {
      className: "bg-orange-500/10 text-orange-700 hover:bg-orange-500/20",
      label: "Emergency",
    },
    checkup: {
      className: "bg-purple-500/10 text-purple-700 hover:bg-purple-500/20",
      label: "Checkup",
    },
  };

  const config = typeConfig[type] || {
    className: "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20",
    label: type ? type.charAt(0).toUpperCase() + type.slice(1) : "General",
  };

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}

/**
 * Returns the appropriate status badge styling
 */
function getStatusBadge(status: AppointmentStatus) {
  const statusConfig = {
    scheduled: {
      className: "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20",
      label: "Scheduled",
    },
    confirmed: {
      className: "bg-green-500/10 text-green-700 hover:bg-green-500/20",
      label: "Confirmed",
    },
    "in-progress": {
      className: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20",
      label: "In Progress",
    },
    completed: {
      className: "bg-purple-500/10 text-purple-700 hover:bg-purple-500/20",
      label: "Completed",
    },
    cancelled: {
      className: "bg-red-500/10 text-red-700 hover:bg-red-500/20",
      label: "Cancelled",
    },
  };

  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

/**
 * Upcoming Appointments Component
 */
export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentTime = new Date();
  const todayString = currentTime.toDateString();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/appointments", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok)
          throw new Error(`Failed to fetch: ${response.status}`);

        const data = await response.json();

        if (data.success) {
          const today = new Date().toISOString().split("T")[0];

          const transformed = data.appointments.map((apt: any) => ({
            _id: apt._id,
            appointmentId: apt._id,
            patientName: apt.patientName,
            patientId: apt.patientId,
            date: new Date(apt.appointmentDate).toISOString().split("T")[0],
            time: apt.appointmentTime,
            duration: apt.duration || 30,
            type: apt.type,
            status: apt.status,
            location: apt.isVirtual ? "Virtual" : "Clinic",
            isVirtual: apt.isVirtual || false,
            notes: apt.notes || "",
            avatar: "",
            doctorId: "",
          }));

          // MODIFIED: Filter out 'completed' AND 'cancelled' appointments.
          const activeUpcoming = transformed
            .filter((a: Appointment) => a.date === today)
            .filter(
              (a: Appointment) =>
                a.status !== "completed" && a.status !== "cancelled"
            )
            .sort((a: Appointment, b: Appointment) =>
              a.time.localeCompare(b.time)
            );

          setAppointments(activeUpcoming.slice(0, 3));
        } else {
          throw new Error(data.message || "Failed to load appointments");
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (
    appointmentId: string,
    newStatus: AppointmentStatus
  ) => {
    if (newStatus === 'cancelled' && !confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }
    
    try {
      const response = await fetch("/api/appointments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          appointmentId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // MODIFIED: Remove the item if it becomes 'completed' or 'cancelled'.
        setAppointments((prev) =>
          prev.filter((apt) => apt._id !== appointmentId)
        );
      } else {
        alert(data.message || `Failed to update status to ${newStatus}`);
      }
    } catch (error) {
      console.error(`Error updating status to ${newStatus}:`, error);
      alert(`Failed to update status to ${newStatus}`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading appointments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-destructive mb-2">Error loading appointments</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Next 3 Active Appointments
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {todayString} • Showing next {appointments.length} active appointment{appointments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/dashboard/appointments">
        <Button variant="outline" size="sm">
          View All
        </Button>
        </Link>
      </CardHeader>

      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active upcoming appointments for today</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-muted/25 hover:bg-muted/50 transition-colors"
              >
                {/* Time Column */}
                <div className="flex flex-col items-center min-w-[80px] text-center">
                  <div className="text-lg font-semibold text-foreground">
                    {appointment.time}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {appointment.duration || 30}min
                  </div>
                </div>

                {/* Patient Info */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={appointment.avatar || `/api/placeholder/40/40`}
                      alt={appointment.patientName}
                    />
                    <AvatarFallback className="text-sm">
                      {appointment.patientName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground truncate">
                        {appointment.patientName}
                      </h4>
                      {getAppointmentTypeBadge(appointment.type)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {appointment.patientId}
                      </span>

                      <span className="flex items-center gap-1">
                        {appointment.isVirtual ? (
                          <>
                            <Video className="h-3 w-3" />
                            Virtual Meeting
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3" />
                            {appointment.location || "Office"}
                          </>
                        )}
                      </span>
                    </div>

                    {appointment.notes && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {appointment.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center gap-3">
                  {getStatusBadge(appointment.status)}

                  <div className="flex gap-1">
                    

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(appointment._id, "completed")
                          }
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            handleUpdateStatus(appointment._id, "cancelled")
                          }
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Appointment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}