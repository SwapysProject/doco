"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Activity,
  Loader2,
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
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
  dateOfBirth?: string;
  dob?: string;
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".patient-search-container")) {
        setShowPatientDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
  // Filter patients based on search term
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug log for filtered patients
  console.log("Current search term:", searchTerm);
  console.log("Total patients:", patients.length);
  console.log("Filtered patients count:", filteredPatients.length);
  const handlePatientSelect = (patientId: string) => {
    console.log("Patient selected:", patientId);
    const patient = patients.find((p) => p.id === patientId);
    console.log("Found patient:", patient);
    if (patient) {
      setFormData((prev) => ({
        ...prev,
        patientId,
        patientName: patient.name,
        patientPhone: patient.phone,
        patientEmail: patient.email,
      }));
      setSearchTerm(patient.name);
      setShowPatientDropdown(false);
      console.log("Patient details set:", patient.name);
    }
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
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="bg-card border border-border rounded-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/25"
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
          type: "spring",
          damping: 25,
          stiffness: 300,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.h2
          className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          New Appointment
        </motion.h2>{" "}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Patient Selection with Search */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <label className="text-sm font-semibold text-foreground">
              Search Patient
            </label>
            <div className="relative patient-search-container">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-blue-500" />
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowPatientDropdown(searchTerm.length > 0)}
                  className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
                />
              </div>
              {/* Patient Search Results */}
              {showPatientDropdown && filteredPatients.length > 0 && (
                <motion.div
                  className="absolute z-10 w-full mt-2 bg-card border border-border rounded-xl shadow-2xl shadow-black/20 max-h-60 overflow-y-auto backdrop-blur-sm"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {filteredPatients.map((patient, index) => (
                    <motion.div
                      key={patient.id}
                      className="px-4 py-3 hover:bg-muted/60 cursor-pointer border-b border-border/50 last:border-b-0 transition-all duration-200 hover:shadow-sm"
                      onClick={() => handlePatientSelect(patient.id)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium text-foreground">
                        {patient.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {patient.phone} • {patient.email}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}{" "}
              {/* No results found */}
              {showPatientDropdown &&
                searchTerm.length > 0 &&
                filteredPatients.length === 0 && (
                  <motion.div
                    className="absolute z-10 w-full mt-2 bg-card border border-border rounded-xl shadow-2xl shadow-black/20 backdrop-blur-sm"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="px-4 py-6 text-muted-foreground text-center">
                      <div className="text-sm font-medium">
                        {patients.length === 0
                          ? "Loading patients..."
                          : `No patients found matching "${searchTerm}"`}
                      </div>
                    </div>{" "}
                  </motion.div>
                )}
            </div>
          </motion.div>

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
            {" "}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>{" "}
            <Button type="submit" disabled={loading || !formData.patientId}>
              {loading ? "Creating..." : "Create Appointment"}
            </Button>
          </div>
        </motion.form>
      </motion.div>
    </motion.div>
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
  }; // Fetch patients assigned to current doctor
  const fetchPatients = async () => {
    try {
      console.log("Fetching patients assigned to current doctor...");
      const response = await fetch("/api/my-patients", {
        credentials: "include",
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Raw API response:", data);
      if (data.success && data.patients) {
        console.log("Raw patient data from API:", data.patients);
        const transformedPatients = data.patients.map((patient: ApiPatient) => {
          console.log("Processing patient:", patient);
          // Handle different possible field names for patient data
          const firstName =
            patient.firstName ||
            patient.first_name ||
            patient.name?.split(" ")[0] ||
            "";
          const lastName =
            patient.lastName ||
            patient.last_name ||
            patient.name?.split(" ").slice(1).join(" ") ||
            "";
          const fullName =
            patient.name ||
            `${firstName} ${lastName}`.trim() ||
            "Unknown Patient";
          // Calculate age more safely with debugging
          let age = 0;
          const dateOfBirth = patient.dateOfBirth || patient.dob;
          console.log("Date of birth for patient:", dateOfBirth);

          if (dateOfBirth) {
            try {
              const birthDate = new Date(dateOfBirth);
              console.log("Parsed birth date:", birthDate);

              // Check if date is valid
              if (!isNaN(birthDate.getTime())) {
                const currentDate = new Date();
                age = currentDate.getFullYear() - birthDate.getFullYear();
                const monthDiff = currentDate.getMonth() - birthDate.getMonth();
                if (
                  monthDiff < 0 ||
                  (monthDiff === 0 &&
                    currentDate.getDate() < birthDate.getDate())
                ) {
                  age--;
                }
                console.log("Calculated age:", age);
              } else {
                console.warn("Invalid date format:", dateOfBirth);
                // Try alternative date parsing for different formats
                const dateParts = dateOfBirth.toString().split(/[-/]/);
                if (dateParts.length >= 3) {
                  // Try different date formats: YYYY-MM-DD, DD-MM-YYYY, MM-DD-YYYY
                  const year =
                    parseInt(dateParts[0]) > 31
                      ? parseInt(dateParts[0])
                      : parseInt(dateParts[2]);
                  if (year && year > 1900 && year < 2100) {
                    const currentYear = new Date().getFullYear();
                    age = currentYear - year;
                    console.log("Alternative age calculation:", age);
                  }
                }
              }
            } catch (error) {
              console.error("Error parsing date:", error);
            }
          } else {
            console.log("No date of birth found for patient");
          }

          const transformedPatient = {
            id: patient._id,
            name: fullName,
            firstName: firstName,
            lastName: lastName,
            age: age || 0,
            phone: patient.phone || patient.phoneNumber || "",
            email: patient.email || "",
            dateOfBirth: patient.dateOfBirth || patient.dob || "",
          };

          console.log("Final transformed patient:", transformedPatient);
          return transformedPatient;
        });
        console.log("Transformed patients:", transformedPatients);
        setPatients(transformedPatients);
      } else {
        console.warn("No patients found or API call failed:", data);
        setPatients([]);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
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
      {/* Enhanced Header with Animation */}
      <motion.div
        className="group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground transition-all duration-300 ease-out group-hover:text-blue-700 group-hover:scale-105">
              Appointments
            </h1>
            <p className="text-muted-foreground transition-all duration-300 ease-out group-hover:text-blue-600 group-hover:translate-x-2">
              Manage your patient appointments efficiently
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>New Appointment</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>{" "}
      {/* Enhanced Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card className="hover:shadow-xl transition-all duration-300 ease-out transform group cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-transparent hover:shadow-blue-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground group-hover:text-blue-700 transition-colors">
                Today&apos;s Appointments
              </CardTitle>
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <CalendarDays className="h-5 w-5 text-blue-600 group-hover:text-blue-700 transition-colors" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                {todayAppointments.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {confirmedToday} confirmed, {completedToday} completed
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card className="hover:shadow-xl transition-all duration-300 ease-out transform group cursor-pointer border-l-4 border-l-transparent hover:border-l-green-500 bg-gradient-to-br from-green-50/50 to-transparent hover:shadow-green-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground group-hover:text-green-700 transition-colors">
                Confirmed
              </CardTitle>
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <CheckCircle className="h-5 w-5 text-green-600 group-hover:text-green-700 transition-colors" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 group-hover:text-green-700 transition-colors">
                {confirmedToday}
              </div>
              <p className="text-xs text-muted-foreground">Ready for today</p>
            </CardContent>
          </Card>
        </motion.div>{" "}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card className="hover:shadow-xl transition-all duration-300 ease-out transform group cursor-pointer border-l-4 border-l-transparent hover:border-l-emerald-500 bg-gradient-to-br from-emerald-50/50 to-transparent hover:shadow-emerald-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground group-hover:text-emerald-700 transition-colors">
                Completed
              </CardTitle>
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Activity className="h-5 w-5 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                {completedToday}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Finished today
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card className="hover:shadow-xl transition-all duration-300 ease-out transform group cursor-pointer border-l-4 border-l-transparent hover:border-l-red-500 bg-gradient-to-br from-red-50/50 to-transparent hover:shadow-red-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground group-hover:text-red-700 transition-colors">
                Cancelled
              </CardTitle>
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <XCircle className="h-5 w-5 text-red-600 group-hover:text-red-700 transition-colors" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 group-hover:text-red-700 transition-colors">
                {cancelledToday}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Cancelled today
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>{" "}
      {/* Enhanced Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 border-l-4 border-l-transparent hover:border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-blue-500" />
                  <Input
                    placeholder="Search appointments by patient or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
                  />
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="md:w-48"
              >
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="transition-all duration-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>{" "}
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48 transition-all duration-300 hover:border-blue-400">
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
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full md:w-48 transition-all duration-300 hover:border-blue-400">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>{" "}
      {/* Enhanced Appointments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Card className="transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 border-l-4 border-l-transparent hover:border-l-blue-500 bg-gradient-to-br from-blue-50/30 to-transparent">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-border/50">
            <CardTitle className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Calendar className="w-6 h-6 text-blue-600" />
              </motion.div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                Appointments ({filteredAppointments.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <motion.div
                className="flex items-center justify-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                <span className="ml-2 text-muted-foreground">
                  Loading appointments...
                </span>
              </motion.div>
            ) : filteredAppointments.length === 0 ? (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No appointments found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Schedule your first appointment"}
                </p>{" "}
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </motion.div>
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
                    </TableRow>{" "}
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((appointment, index) => (
                      <TableRow
                        key={appointment.id}
                        className="hover:bg-muted/50 transition-all duration-200 hover:scale-[1.01]"
                        style={{
                          animation: `slideInUp 0.4s ease-out ${index * 0.05}s both`,
                        }}
                      >
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
                                {new Date(
                                  appointment.date
                                ).toLocaleDateString()}
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
                            <Badge
                              className={getStatusColor(appointment.status)}
                            >
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
                                onClick={() =>
                                  handleEditAppointment(appointment)
                                }
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
                    ))}{" "}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      {/* Add Appointment Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddAppointmentModal
            patients={patients}
            onClose={() => setShowAddModal(false)}
            onAppointmentCreated={fetchAppointments}
          />
        )}
      </AnimatePresence>
      {/* Edit Appointment Modal */}
      <AnimatePresence>
        {showEditModal && selectedAppointment && (
          <EditAppointmentModal
            appointment={selectedAppointment}
            patients={patients}
            onClose={() => setShowEditModal(false)}
            onAppointmentUpdated={fetchAppointments}
          />
        )}
      </AnimatePresence>
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
  const [searchTerm, setSearchTerm] = useState(formData.patientName);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Filter patients based on search
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle patient selection from dropdown
  const handlePatientSelectFromDropdown = (patient: Patient) => {
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
    console.log("Search value changed:", value);
    setSearchTerm(value);
    setShowPatientDropdown(value.length > 0);
    console.log("Filtered patients:", filteredPatients.length);
  };

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
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="bg-card border border-border rounded-lg max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.h2
          className="text-lg font-semibold mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Edit Appointment
        </motion.h2>

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
                      onClick={() => handlePatientSelectFromDropdown(patient)}
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
                      No patients found matching &ldquo;{searchTerm}&rdquo;
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
          {/* Action Buttons */}{" "}
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
      </motion.div>
    </motion.div>
  );
}
