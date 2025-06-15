"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  MapPin,
  Video,
  MoreHorizontal,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Appointment interfaces
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
  | "cancelled"
  | "no-show";

interface Patient {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  age: number;
  phone: string;
  email: string;
  dateOfBirth: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: AppointmentType;
  status: AppointmentStatus;
  location: string;
  isVirtual: boolean;
  notes?: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

// API response interfaces
interface ApiAppointment {
  _id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  appointmentDate: string;
  appointmentTime: string;
  duration?: number;
  type: AppointmentType;
  status: AppointmentStatus;
  isVirtual?: boolean;
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiPatient {
  _id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  dateOfBirth: string;
}

interface AddAppointmentModalProps {
  patients: Patient[];
  onClose: () => void;
  onAppointmentCreated: () => void;
}

function AddAppointmentModal({
  patients,
  onClose,
  onAppointmentCreated,
}: AddAppointmentModalProps) {
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    appointmentDate: "",
    appointmentTime: "",
    type: "consultation" as AppointmentType,
    reason: "",
    notes: "",
    duration: 30,
    isVirtual: false,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Filter patients based on search term
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientSelect = (patient: Patient) => {
    setFormData((prev) => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      patientEmail: patient.email,
    }));
    setSearchTerm(patient.name);
    setShowPatientDropdown(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowPatientDropdown(value.length > 0);

    // Clear selected patient if search is cleared
    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        patientId: "",
        patientName: "",
        patientPhone: "",
        patientEmail: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          patientId: formData.patientId,
          patientName: formData.patientName,
          patientPhone: formData.patientPhone,
          patientEmail: formData.patientEmail,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          type: formData.type,
          reason: formData.reason,
          notes: formData.notes,
          duration: formData.duration,
          status: "scheduled",
        }),
      });

      const data = await response.json();

      if (data.success) {
        onAppointmentCreated();
        onClose();
      } else {
        alert(data.message || "Failed to create appointment");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">New Appointment</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Patient</label>
            <Select
              value={formData.patientId}
              onValueChange={handlePatientSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} - {patient.phone}
                  </SelectItem>
                ))}
              </SelectContent>{" "}
            </Select>
          </div>

          {/* Auto-filled Patient Details */}
          {formData.patientId && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Patient Phone</label>
                <Input
                  value={formData.patientPhone}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Patient Email</label>
                <Input
                  value={formData.patientEmail}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    appointmentDate: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Input
                type="time"
                value={formData.appointmentTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    appointmentTime: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          {/* Type and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value: AppointmentType) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="checkup">Checkup</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value),
                  }))
                }
                min="15"
                max="180"
                step="15"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <Input
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="e.g., Annual checkup, Follow-up consultation"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <textarea
              className="w-full p-2 border border-border rounded-md"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Virtual Meeting Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isVirtual"
              checked={formData.isVirtual}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isVirtual: e.target.checked,
                }))
              }
            />
            <label htmlFor="isVirtual" className="text-sm font-medium">
              Virtual Appointment
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.patientId}>
              {loading ? "Creating..." : "Create Appointment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        // Transform API data to match our interface
        const transformedAppointments = data.appointments.map(
          (apt: ApiAppointment) => ({
            id: apt._id,
            patientId: apt.patientId,
            patientName: apt.patientName,
            patientPhone: apt.patientPhone || "",
            date: new Date(apt.appointmentDate).toISOString().split("T")[0],
            time: apt.appointmentTime,
            duration: apt.duration || 30,
            type: apt.type,
            status: apt.status,
            location: apt.isVirtual ? "Virtual" : "Clinic",
            isVirtual: apt.isVirtual || false,
            reason: apt.reason || "",
            notes: apt.notes || "",
            createdAt: apt.createdAt,
            updatedAt: apt.updatedAt,
          })
        );
        setAppointments(transformedAppointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };
  // Fetch patients assigned to current doctor
  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/patients-data", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.patients) {
        const transformedPatients = data.patients.map(
          (patient: ApiPatient) => ({
            id: patient._id,
            name: `${patient.firstName} ${patient.lastName}`,
            firstName: patient.firstName,
            lastName: patient.lastName,
            age:
              new Date().getFullYear() -
              new Date(patient.dateOfBirth).getFullYear(),
            phone: patient.phone || "",
            email: patient.email || "",
            dateOfBirth: patient.dateOfBirth,
          })
        );
        setPatients(transformedPatients);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };
  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  // Handle appointment actions
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    try {
      const response = await fetch("/api/appointments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ appointmentId }),
      });

      const data = await response.json();

      if (data.success) {
        fetchAppointments(); // Refresh the list
      } else {
        alert(data.message || "Failed to delete appointment");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Failed to delete appointment");
    }
  };

  const handleUpdateStatus = async (
    appointmentId: string,
    newStatus: AppointmentStatus
  ) => {
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
        fetchAppointments(); // Refresh the list
      } else {
        alert(data.message || "Failed to update appointment status");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert("Failed to update appointment status");
    }
  };

  // Delete appointment
  const deleteAppointment = async (appointmentId: string) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        const response = await fetch("/api/appointments", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            appointmentId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          await fetchAppointments(); // Refresh the list
        } else {
          alert(data.message || "Failed to delete appointment");
        }
      } catch (error) {
        console.error("Error deleting appointment:", error);
        alert("Failed to delete appointment");
      }
    }
  };

  // Helper functions
  const getStatusColor = (status: AppointmentStatus) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      "no-show": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeColor = (type: AppointmentType) => {
    const colors = {
      consultation: "bg-blue-100 text-blue-800",
      "follow-up": "bg-green-100 text-green-800",
      surgery: "bg-red-100 text-red-800",
      emergency: "bg-red-100 text-red-800",
      checkup: "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
      case "no-show":
        return <XCircle className="w-4 h-4" />;
      case "in-progress":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || appointment.status === statusFilter;
    const matchesType = typeFilter === "all" || appointment.type === typeFilter;

    const today = new Date().toISOString().split("T")[0];
    const appointmentDate = appointment.date;

    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = appointmentDate === today;
    } else if (dateFilter === "upcoming") {
      matchesDate = appointmentDate >= today;
    } else if (dateFilter === "past") {
      matchesDate = appointmentDate < today;
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  // Stats calculation
  const todayAppointments = appointments.filter(
    (apt) => apt.date === new Date().toISOString().split("T")[0]
  );
  const confirmedToday = todayAppointments.filter(
    (apt) => apt.status === "confirmed"
  ).length;
  const completedToday = todayAppointments.filter(
    (apt) => apt.status === "completed"
  ).length;
  const cancelledToday = todayAppointments.filter(
    (apt) => apt.status === "cancelled"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your patient appointments
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </Button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Appointments
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {confirmedToday} confirmed, {completedToday} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {confirmedToday}
            </div>
            <p className="text-xs text-muted-foreground">Ready for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {completedToday}
            </div>
            <p className="text-xs text-muted-foreground">Finished today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {cancelledToday}
            </div>
            <p className="text-xs text-muted-foreground">Cancelled today</p>
          </CardContent>
        </Card>
      </div>
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="surgery">Surgery</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="checkup">Checkup</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Appointments ({filteredAppointments.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading appointments...</span>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No appointments found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Schedule your first appointment"}
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {appointment.patientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {appointment.patientName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.patientPhone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {new Date(appointment.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {appointment.time} ({appointment.duration}min)
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(appointment.type)}>
                          {appointment.type.charAt(0).toUpperCase() +
                            appointment.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(appointment.status)}
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {appointment.isVirtual ? (
                            <Video className="w-4 h-4 text-blue-600" />
                          ) : (
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">
                            {appointment.location}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-xs truncate"
                          title={appointment.reason}
                        >
                          {appointment.reason}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>{" "}
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditAppointment(appointment)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Appointment
                            </DropdownMenuItem>
                            {appointment.status !== "completed" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(
                                    appointment.id,
                                    "completed"
                                  )
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Completed
                              </DropdownMenuItem>
                            )}
                            {appointment.status !== "confirmed" &&
                              appointment.status !== "completed" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(
                                      appointment.id,
                                      "confirmed"
                                    )
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Confirm Appointment
                                </DropdownMenuItem>
                              )}
                            {appointment.status !== "cancelled" &&
                              appointment.status !== "completed" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(
                                      appointment.id,
                                      "cancelled"
                                    )
                                  }
                                  className="text-orange-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel Appointment
                                </DropdownMenuItem>
                              )}
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteAppointment(appointment.id)
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Appointment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>{" "}
      {/* Add Appointment Modal */}
      {showAddModal && (
        <AddAppointmentModal
          patients={patients}
          onClose={() => setShowAddModal(false)}
          onAppointmentCreated={fetchAppointments}
        />
      )}
      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <EditAppointmentModal
          appointment={selectedAppointment}
          patients={patients}
          onClose={() => setShowEditModal(false)}
          onAppointmentUpdated={fetchAppointments}
        />
      )}
    </div>
  );
}

// Edit Appointment Modal Component
function EditAppointmentModal({
  appointment,
  patients,
  onClose,
  onAppointmentUpdated,
}: {
  appointment: Appointment;
  patients: Patient[];
  onClose: () => void;
  onAppointmentUpdated: () => void;
}) {
  const [formData, setFormData] = useState({
    patientId: appointment.patientId,
    patientName: appointment.patientName,
    patientPhone: appointment.patientPhone,
    patientEmail: "",
    appointmentDate: appointment.date,
    appointmentTime: appointment.time,
    type: appointment.type,
    reason: appointment.reason,
    notes: appointment.notes || "",
    duration: appointment.duration,
    status: appointment.status,
    isVirtual: appointment.isVirtual,
  });
  const [loading, setLoading] = useState(false);

  // Auto-fill patient details when patient is selected
  useEffect(() => {
    const patient = patients.find((p) => p.id === formData.patientId);
    if (patient) {
      setFormData((prev) => ({
        ...prev,
        patientName: patient.name,
        patientPhone: patient.phone,
        patientEmail: patient.email,
      }));
    }
  }, [formData.patientId, patients]);

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      setFormData((prev) => ({
        ...prev,
        patientId,
        patientName: patient.name,
        patientPhone: patient.phone,
        patientEmail: patient.email,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          appointmentId: appointment.id,
          patientId: formData.patientId,
          patientName: formData.patientName,
          patientPhone: formData.patientPhone,
          patientEmail: formData.patientEmail,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          type: formData.type,
          reason: formData.reason,
          notes: formData.notes,
          duration: formData.duration,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onAppointmentUpdated();
        onClose();
      } else {
        alert(data.message || "Failed to update appointment");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Failed to update appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Edit Appointment</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {" "}
          {/* Patient Selection with Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Patient</label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowPatientDropdown(searchTerm.length > 0)}
                  className="pl-10"
                />
              </div>

              {/* Patient Search Results */}
              {showPatientDropdown && filteredPatients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-gray-600">
                        {patient.phone} • {patient.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        Age: {patient.age}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results found */}
              {showPatientDropdown &&
                searchTerm.length > 0 &&
                filteredPatients.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="px-4 py-2 text-gray-500 text-center">
                      No patients found matching "{searchTerm}"
                    </div>
                  </div>
                )}
            </div>
          </div>
          {/* Auto-filled Patient Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient Phone</label>
              <Input
                value={formData.patientPhone}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient Email</label>
              <Input
                value={formData.patientEmail}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    appointmentDate: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Input
                type="time"
                value={formData.appointmentTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    appointmentTime: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>
          {/* Type, Duration, and Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value: AppointmentType) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="checkup">Checkup</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (min)</label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value),
                  }))
                }
                min="15"
                max="180"
                step="15"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value: AppointmentStatus) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <Input
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="e.g., Annual checkup, Follow-up consultation"
              required
            />
          </div>
          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              className="w-full p-2 border border-border rounded-md"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
          {/* Virtual Meeting Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isVirtualEdit"
              checked={formData.isVirtual}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isVirtual: e.target.checked,
                }))
              }
            />
            <label htmlFor="isVirtualEdit" className="text-sm font-medium">
              Virtual Appointment
            </label>
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Appointment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
