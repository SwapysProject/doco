"use client";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  Users,
  ChevronRight,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Edit,
  Activity,
  Pill,
  User,
  MessageSquare,
  Loader2,
} from "lucide-react";

// Patient interface to match your MongoDB structure
interface Patient {
  _id: string;
  id?: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  condition: string;
  status?: string; // Made optional since some patients might not have a status
  lastVisit: string;
  nextAppointment: string;
  bloodType: string;
  allergies: string[];
  medications: string[];
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
    height: string;
  };
  medicalHistory: Array<{
    date: string;
    condition: string;
    notes: string;
  }>;
}

export default function PatientsPage() {
  const [view, setView] = useState("list"); // 'list' or 'detail'
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingPatient, setAddingPatient] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(false);

  // Patient assignment state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availablePatients, setAvailablePatients] = useState<Patient[]>([]);
  const [assigningPatient, setAssigningPatient] = useState(false);
  const [assignSearchTerm, setAssignSearchTerm] = useState("");

  // Form state for new patient
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    condition: "",
    status: "stable",
    lastVisit: "",
    nextAppointment: "",
    bloodType: "",
    allergies: "",
    medications: "",
    vitals: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
      height: "",
    },
  });

  // Form state for editing patient
  const [editPatient, setEditPatient] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    condition: "",
    status: "stable",
    lastVisit: "",
    nextAppointment: "",
    bloodType: "",
    allergies: "",
    medications: "",
    vitals: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
      height: "",
    },
  });

  // Fetch only patients assigned to the current doctor
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/my-patients", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please log in to view your patients.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch patients");
      }

      // Transform MongoDB data to match frontend expectations
      const transformedPatients = data.patients.map((patient: Patient) => ({
        ...patient,
        id: patient._id, // Add id field for compatibility
      }));

      setPatients(transformedPatients.reverse()); // Reverse to show recent first
    } catch (error) {
      console.error("Error fetching assigned patients:", error);
      setError("Failed to load your assigned patients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available patients for assignment
  const fetchAvailablePatients = async () => {
    try {
      const response = await fetch("/api/available-patients");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailablePatients(data.patients);
        }
      }
    } catch (error) {
      console.error("Error fetching available patients:", error);
    }
  };

  // Load patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm);

    const matchesStatus =
      filterStatus === "all" ||
      (patient.status
        ? patient.status.toLowerCase() === filterStatus.toLowerCase()
        : filterStatus === "unknown");

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string | undefined | null) => {
    if (!status)
      return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";

    switch (status.toLowerCase()) {
      case "stable":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
      case "monitoring":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "critical":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
      case "active":
        return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const getStatusIcon = (status: string | undefined | null) => {
    if (!status) return <Heart className="w-4 h-4" />;

    switch (status.toLowerCase()) {
      case "stable":
        return <CheckCircle className="w-4 h-4" />;
      case "monitoring":
        return <Clock className="w-4 h-4" />;
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      case "active":
        return <Activity className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setView("detail");
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedPatient(null);
  };

  const handleRefresh = () => {
    fetchPatients();
  };

  const handleAddPatient = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    // Reset form
    setNewPatient({
      name: "",
      age: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      condition: "",
      status: "stable",
      lastVisit: "",
      nextAppointment: "",
      bloodType: "",
      allergies: "",
      medications: "",
      vitals: {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        weight: "",
        height: "",
      },
    });
  };

  const handleSubmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingPatient(true);

    try {
      const patientData = {
        ...newPatient,
        age: parseInt(newPatient.age),
        allergies: newPatient.allergies
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item),
        medications: newPatient.medications
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item),
        medicalHistory: [],
      };

      const response = await fetch("/api/patients-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          // Handle conflict error (duplicate email/phone)
          setError(
            errorData.message ||
              "Patient with this email or phone number already exists"
          );
        } else {
          setError(
            `Failed to add patient: ${errorData.message || `HTTP error! status: ${response.status}`}`
          );
        }
        return;
      }

      const result = await response.json();
      console.log("Patient added successfully:", result);

      // Refresh the patients list
      await fetchPatients();

      // Close modal and reset form
      handleCloseAddModal();
    } catch (error) {
      console.error("Error adding patient:", error);
      setError("Failed to add patient. Please try again.");
    } finally {
      setAddingPatient(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("vitals.")) {
      const vitalField = field.replace("vitals.", "");
      setNewPatient((prev) => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          [vitalField]: value,
        },
      }));
    } else {
      setNewPatient((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Handle assign patient modal
  const handleAssignPatient = async () => {
    setShowAssignModal(true);
    await fetchAvailablePatients();
  };

  // Assign a patient to current doctor
  const assignPatientToDoctor = async (patientId: string) => {
    try {
      setAssigningPatient(true);

      const response = await fetch("/api/my-patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Patient assigned successfully!");
        setShowAssignModal(false);
        await fetchPatients(); // Refresh the patients list
        await fetchAvailablePatients(); // Refresh available patients
      } else {
        alert(data.message || "Failed to assign patient");
      }
    } catch (error) {
      console.error("Error assigning patient:", error);
      alert("Failed to assign patient. Please try again.");
    } finally {
      setAssigningPatient(false);
    }
  };

  const handleEditPatient = () => {
    if (selectedPatient) {
      // Populate edit form with current patient data
      setEditPatient({
        name: selectedPatient.name || "",
        age: selectedPatient.age?.toString() || "",
        gender: selectedPatient.gender || "",
        phone: selectedPatient.phone || "",
        email: selectedPatient.email || "",
        address: selectedPatient.address || "",
        condition: selectedPatient.condition || "",
        status: selectedPatient.status || "stable",
        lastVisit: selectedPatient.lastVisit || "",
        nextAppointment: selectedPatient.nextAppointment || "",
        bloodType: selectedPatient.bloodType || "",
        allergies: selectedPatient.allergies?.join(", ") || "",
        medications: selectedPatient.medications?.join(", ") || "",
        vitals: {
          bloodPressure: selectedPatient.vitals?.bloodPressure || "",
          heartRate: selectedPatient.vitals?.heartRate || "",
          temperature: selectedPatient.vitals?.temperature || "",
          weight: selectedPatient.vitals?.weight || "",
          height: selectedPatient.vitals?.height || "",
        },
      });
      setShowEditModal(true);
    }
  };

  const handleMessagePatient = () => {
    if (selectedPatient) {
      // Redirect to doctor-to-doctor messaging system
      window.location.href = `/dashboard/messages`;
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditPatient({
      name: "",
      age: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      condition: "",
      status: "stable",
      lastVisit: "",
      nextAppointment: "",
      bloodType: "",
      allergies: "",
      medications: "",
      vitals: {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        weight: "",
        height: "",
      },
    });
  };

  const handleEditInputChange = (field: string, value: string) => {
    if (field.startsWith("vitals.")) {
      const vitalField = field.replace("vitals.", "");
      setEditPatient((prev) => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          [vitalField]: value,
        },
      }));
    } else {
      setEditPatient((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      setEditingPatient(true);

      // Prepare patient data
      const patientData = {
        ...editPatient,
        age: parseInt(editPatient.age) || 0,
        allergies: editPatient.allergies
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item),
        medications: editPatient.medications
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item),
      };

      const response = await fetch(`/api/patients/${selectedPatient._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });

      if (response.ok) {
        const updatedPatient = await response.json();

        // Update the patients list and selected patient
        setPatients((prev) =>
          prev.map((p) => (p._id === selectedPatient._id ? updatedPatient : p))
        );
        setSelectedPatient(updatedPatient);

        alert("Patient information updated successfully!");
        handleCloseEditModal();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update patient");
      }
    } catch (error) {
      console.error("Error updating patient:", error);
      alert("Failed to update patient information. Please try again.");
    } finally {
      setEditingPatient(false);
    }
  };

  // Filter available patients for assignment
  const filteredAvailablePatients = availablePatients.filter((patient) =>
    patient.name.toLowerCase().includes(assignSearchTerm.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading patients...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Error Loading Patients
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {view === "list" ? (
        // =================== LIST VIEW ===================
        <div className="min-h-screen bg-background">
          {/* Enhanced Header - Mobile Responsive */}
          <motion.div
            className="border-b border-border bg-card/80 backdrop-blur-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div
                  className="flex items-center space-x-3 sm:space-x-4 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <motion.div
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white rounded-xl flex items-center justify-center shadow-lg dark:shadow-xl dark:shadow-blue-500/20"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.div>
                    <div>
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold transition-all duration-300 ease-out group-hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                        My Patients
                      </h1>
                      <p className="text-sm sm:text-base text-muted-foreground transition-all duration-300 ease-out group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-2">
                        Manage and track your assigned patients
                      </p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <motion.button
                    onClick={handleRefresh}
                    className="px-3 sm:px-4 py-2 bg-secondary/80 dark:bg-secondary/90 text-secondary-foreground rounded-lg border border-border shadow-sm hover:shadow-md hover:bg-secondary dark:hover:bg-secondary/100 transition-all duration-200 flex items-center justify-center space-x-2 group min-h-[44px]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      animate={{ rotate: 0 }}
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Activity className="w-4 h-4" />
                    </motion.div>
                    <span className="text-sm sm:text-base">Refresh</span>
                  </motion.button>
                  <motion.button
                    onClick={handleAssignPatient}
                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg shadow-sm hover:shadow-md hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 group min-h-[44px]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Users className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Assign Patients</span>
                  </motion.button>
                  <motion.button
                    onClick={handleAddPatient}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-lg shadow-sm hover:shadow-md hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 transition-all duration-200 flex items-center space-x-2 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Add Patient</span>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Search and Filter Bar - Mobile Responsive */}
          <motion.div
            className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-card/50 dark:bg-card/80 backdrop-blur-sm border-b border-border"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <motion.div
                className="flex-1 relative group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background/50 dark:bg-background/80 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:border-primary/60 text-foreground placeholder:text-muted-foreground transition-all duration-200 hover:shadow-sm focus:shadow-md backdrop-blur-sm text-sm sm:text-base"
                />
              </motion.div>
              <motion.div
                className="flex items-center space-x-2 group"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <Filter className="w-4 h-4 text-muted-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2.5 bg-background/50 dark:bg-background/80 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:border-primary/60 text-foreground transition-all duration-200 hover:shadow-sm focus:shadow-md backdrop-blur-sm text-sm sm:text-base min-w-[120px]"
                >
                  <option value="all">All Status</option>
                  <option value="stable">Stable</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="critical">Critical</option>
                  <option value="active">Active</option>
                </select>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Stats Cards - Mobile Responsive */}
          <motion.div
            className="px-3 sm:px-4 md:px-6 py-4 sm:py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 group cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/40 dark:to-blue-900/20 hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20 hover:from-blue-100/60 hover:to-blue-200/40 dark:hover:from-blue-900/60 dark:hover:to-blue-800/40">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-muted-foreground transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      Total Patients
                    </CardTitle>
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 transition-all duration-300 ease-out group-hover:bg-blue-100 dark:group-hover:bg-blue-900/80 group-hover:scale-110 group-hover:rotate-6">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400 transition-all duration-300 ease-out group-hover:scale-110" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground transition-all duration-300 ease-out group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:scale-105">
                      {patients.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 transition-colors duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-400">
                      Currently assigned to you
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 group cursor-pointer border-l-4 border-l-transparent hover:border-l-green-500 bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-950/40 dark:to-green-900/20 hover:shadow-green-500/10 dark:hover:shadow-green-400/20 hover:from-green-100/60 hover:to-green-200/40 dark:hover:from-green-900/60 dark:hover:to-green-800/40">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-muted-foreground transition-colors duration-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                      Stable Patients
                    </CardTitle>
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/60 transition-all duration-300 ease-out group-hover:bg-green-100 dark:group-hover:bg-green-900/80 group-hover:scale-110 group-hover:rotate-6">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 transition-all duration-300 ease-out group-hover:scale-110" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground transition-all duration-300 ease-out group-hover:text-green-700 dark:group-hover:text-green-300 group-hover:scale-105">
                      {
                        patients.filter(
                          (p) => p.status && p.status.toLowerCase() === "stable"
                        ).length
                      }
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 transition-colors duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-400">
                      In stable condition
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 group cursor-pointer border-l-4 border-l-transparent hover:border-l-yellow-500 bg-gradient-to-br from-yellow-50/50 to-yellow-100/30 dark:from-yellow-950/40 dark:to-yellow-900/20 hover:shadow-yellow-500/10 dark:hover:shadow-yellow-400/20 hover:from-yellow-100/60 hover:to-yellow-200/40 dark:hover:from-yellow-900/60 dark:hover:to-yellow-800/40">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-muted-foreground transition-colors duration-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-400">
                      Monitoring
                    </CardTitle>
                    <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/60 transition-all duration-300 ease-out group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/80 group-hover:scale-110 group-hover:rotate-6">
                      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 transition-all duration-300 ease-out group-hover:scale-110" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground transition-all duration-300 ease-out group-hover:text-yellow-700 dark:group-hover:text-yellow-300 group-hover:scale-105">
                      {
                        patients.filter(
                          (p) =>
                            p.status && p.status.toLowerCase() === "monitoring"
                        ).length
                      }
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 transition-colors duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-400">
                      Under close monitoring
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 group cursor-pointer border-l-4 border-l-transparent hover:border-l-red-500 bg-gradient-to-br from-red-50/50 to-red-100/30 dark:from-red-950/40 dark:to-red-900/20 hover:shadow-red-500/10 dark:hover:shadow-red-400/20 hover:from-red-100/60 hover:to-red-200/40 dark:hover:from-red-900/60 dark:hover:to-red-800/40">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-muted-foreground transition-colors duration-300 group-hover:text-red-600 dark:group-hover:text-red-400">
                      Critical Patients
                    </CardTitle>
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/60 transition-all duration-300 ease-out group-hover:bg-red-100 dark:group-hover:bg-red-900/80 group-hover:scale-110 group-hover:rotate-6">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 transition-all duration-300 ease-out group-hover:scale-110" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground transition-all duration-300 ease-out group-hover:text-red-700 dark:group-hover:text-red-300 group-hover:scale-105">
                      {
                        patients.filter(
                          (p) => p.status && p.status.toLowerCase() === "critical"
                        ).length
                      }
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 transition-colors duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-400">
                      Require immediate attention
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Enhanced Patients List */}
            <motion.div
              className="bg-card/50 border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-background/50 to-muted/20">
                <h2 className="text-lg font-semibold text-foreground">
                  Patient List
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredPatients.length} of {patients.length} patients
                </p>
              </div>
              <div className="divide-y divide-border">
                {filteredPatients.map((patient, index) => (
                  <motion.div
                    key={patient._id}
                    onClick={() => handlePatientClick(patient)}
                    className="px-6 py-4 hover:bg-accent/50 cursor-pointer transition-all duration-200 group hover:shadow-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.2 + index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                        >
                          <User className="w-5 h-5" />
                        </motion.div>
                        <div>
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                            {patient.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {patient.age} years • {patient.gender}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {patient.condition}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last visit: {patient.lastVisit}
                          </p>
                        </div>
                        <div
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            patient.status
                          )}`}
                        >
                          {getStatusIcon(patient.status)}
                          <span>{patient.status || "Unknown"}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              Next appointment
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              {patient.nextAppointment}
                            </p>
                          </div>
                          <motion.div
                            animate={{ x: 0 }}
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {filteredPatients.length === 0 && patients.length > 0 && (
              <motion.div
                className="bg-card border border-border rounded-xl p-12 text-center shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              >
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No patients found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </motion.div>
            )}

            {patients.length === 0 && !loading && (
              <motion.div
                className="bg-card border border-border rounded-xl p-12 text-center shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              >
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No patients in database
                </h3>
                <p className="text-muted-foreground">
                  Add your first patient to get started
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      ) : (
        // =================== DETAIL VIEW ===================
        selectedPatient && (
          <motion.div
            className="min-h-screen bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Enhanced Header */}
            <motion.div
              className="border-b border-border bg-card/80 backdrop-blur-sm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.button
                      onClick={handleBackToList}
                      className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors group"
                      whileHover={{ x: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-sm">Back to Patients</span>
                    </motion.button>
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-primary/80 to-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <User className="w-5 h-5" />
                      </motion.div>
                      <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {selectedPatient.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          Patient Details
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <motion.button
                      onClick={handleEditPatient}
                      className="px-4 py-2 bg-gradient-to-r from-secondary/80 to-secondary text-secondary-foreground rounded-xl hover:from-secondary hover:to-secondary/90 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </motion.button>

                    <Link href="prescriptions/new-p">
                      <motion.button
                        className="px-4 py-2 bg-gradient-to-r from-secondary/80 to-secondary text-secondary-foreground rounded-xl hover:from-secondary hover:to-secondary/90 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus className="w-4 h-4" />
                        <span>New Prescription</span>
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Patient Detail Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Patient Info */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Basic Info Card */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Patient Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Age
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {selectedPatient.age} years
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Gender
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {selectedPatient.gender}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Blood Type
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {selectedPatient.bloodType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Status
                        </span>
                        <div
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            selectedPatient.status
                          )}`}
                        >
                          {getStatusIcon(selectedPatient.status)}
                          <span>{selectedPatient.status || "Unknown"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info Card */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {selectedPatient.phone}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {selectedPatient.email}
                        </span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm text-foreground">
                          {selectedPatient.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vitals Card */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Latest Vitals
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Blood Pressure
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {selectedPatient.vitals.bloodPressure}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Heart Rate
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {selectedPatient.vitals.heartRate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Temperature
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {selectedPatient.vitals.temperature}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Weight
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {selectedPatient.vitals.weight}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Height
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {selectedPatient.vitals.height}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Medical Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Appointments Card */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Appointments
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            Last Visit
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.lastVisit}
                        </p>
                      </div>
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            Next Appointment
                          </span>
                        </div>
                        <p className="text-sm text-primary font-medium">
                          {selectedPatient.nextAppointment}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Current Medications */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Current Medications
                    </h3>
                    <div className="space-y-3">
                      {selectedPatient.medications &&
                      selectedPatient.medications.length > 0 ? (
                        selectedPatient.medications.map(
                          (medication, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                            >
                              <Pill className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">
                                {medication}
                              </span>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No medications recorded
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Allergies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.allergies &&
                      selectedPatient.allergies.length > 0 ? (
                        selectedPatient.allergies.map((allergy, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-medium"
                          >
                            {allergy}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No known allergies
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Medical History
                    </h3>
                    <div className="space-y-4">
                      {selectedPatient.medicalHistory &&
                      selectedPatient.medicalHistory.length > 0 ? (
                        selectedPatient.medicalHistory.map((record, index) => (
                          <div
                            key={index}
                            className="border-l-2 border-primary/20 pl-4 pb-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-foreground">
                                {record.condition}
                              </h4>
                              <span className="text-xs text-muted-foreground">
                                {record.date}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {record.notes}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No medical history recorded
                        </p>
                      )}
                    </div>{" "}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )
      )}

      {/* =================== MODALS (NOW AVAILABLE ON ALL VIEWS) =================== */}

      {/* Enhanced Assign Patients Modal */}
      {showAssignModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) =>
            e.target === e.currentTarget && setShowAssignModal(false)
          }
        >
          <motion.div
            className="bg-card/95 backdrop-blur-sm rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-border"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 20 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Assign Patients to Yourself
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select patients to assign to your care
                </p>
              </div>
              <motion.button
                onClick={() => setShowAssignModal(false)}
                className="text-muted-foreground hover:text-foreground p-2 hover:bg-accent rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            </div>

            <div className="p-6">
              {/* Enhanced Search */}
              <motion.div
                className="relative mb-4 group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Search available patients..."
                  value={assignSearchTerm}
                  onChange={(e) => setAssignSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm transition-all duration-200 hover:shadow-sm focus:shadow-md"
                />
              </motion.div>

              {/* Available Patients List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredAvailablePatients.length === 0 ? (
                  <motion.div
                    className="text-center py-8 text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Users className="w-12 h-12 mx-auto mb-2" />
                    <p>No available patients to assign</p>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {filteredAvailablePatients.map((patient, index) => (
                      <motion.div
                        key={patient._id || patient.id}
                        className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-accent/50 group transition-all duration-200 hover:shadow-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.3 + index * 0.05,
                        }}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center space-x-3">
                          <motion.div
                            className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                          >
                            <User className="w-5 h-5 text-primary" />
                          </motion.div>
                          <div>
                            <p className="font-medium text-card-foreground group-hover:text-primary transition-colors duration-200">
                              {patient.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {patient.condition} • {patient.age} years old
                            </p>
                          </div>
                        </div>
                        <motion.button
                          onClick={() =>
                            assignPatientToDoctor(
                              (patient._id || patient.id) as string
                            )
                          }
                          disabled={assigningPatient}
                          className="px-4 py-2 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground rounded-xl hover:from-primary hover:to-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {assigningPatient ? "Assigning..." : "Assign"}
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Enhanced Add Patient Modal */}
      {showAddModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-card/95 backdrop-blur-sm border border-border rounded-xl max-w-md sm:max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{ maxWidth: "36rem" }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 20 }}
          >
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Add New Patient
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Enter patient information
                  </p>
                </div>
                <motion.button
                  onClick={handleCloseAddModal}
                  className="text-muted-foreground hover:text-foreground p-2 hover:bg-accent rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
            </div>
            <form onSubmit={handleSubmitPatient} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-foreground">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPatient.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      required
                      value={newPatient.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Gender *
                    </label>
                    <select
                      required
                      value={newPatient.gender}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Blood Type
                    </label>
                    <select
                      value={newPatient.bloodType}
                      onChange={(e) =>
                        handleInputChange("bloodType", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-foreground">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newPatient.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newPatient.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Address
                  </label>
                  <textarea
                    value={newPatient.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-foreground">
                  Medical Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Condition *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPatient.condition}
                      onChange={(e) =>
                        handleInputChange("condition", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Status
                    </label>
                    <select
                      value={newPatient.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="stable">Stable</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="critical">Critical</option>
                      <option value="active">Active</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Visit
                    </label>
                    <input
                      type="date"
                      value={newPatient.lastVisit}
                      onChange={(e) =>
                        handleInputChange("lastVisit", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Next Appointment
                    </label>
                    <input
                      type="date"
                      value={newPatient.nextAppointment}
                      onChange={(e) =>
                        handleInputChange("nextAppointment", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Allergies (comma-separated)
                    </label>
                    <textarea
                      value={newPatient.allergies}
                      onChange={(e) =>
                        handleInputChange("allergies", e.target.value)
                      }
                      placeholder="e.g., Penicillin, Nuts, Shellfish"
                      rows={2}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Current Medications (comma-separated)
                    </label>
                    <textarea
                      value={newPatient.medications}
                      onChange={(e) =>
                        handleInputChange("medications", e.target.value)
                      }
                      placeholder="e.g., Aspirin 81mg, Lisinopril 10mg"
                      rows={2}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Vitals */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-foreground">
                  Vital Signs
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Blood Pressure
                    </label>
                    <input
                      type="text"
                      value={newPatient.vitals.bloodPressure}
                      onChange={(e) =>
                        handleInputChange(
                          "vitals.bloodPressure",
                          e.target.value
                        )
                      }
                      placeholder="120/80"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Heart Rate
                    </label>
                    <input
                      type="text"
                      value={newPatient.vitals.heartRate}
                      onChange={(e) =>
                        handleInputChange("vitals.heartRate", e.target.value)
                      }
                      placeholder="72 bpm"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Temperature
                    </label>
                    <input
                      type="text"
                      value={newPatient.vitals.temperature}
                      onChange={(e) =>
                        handleInputChange("vitals.temperature", e.target.value)
                      }
                      placeholder="98.6°F"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Weight
                    </label>
                    <input
                      type="text"
                      value={newPatient.vitals.weight}
                      onChange={(e) =>
                        handleInputChange("vitals.weight", e.target.value)
                      }
                      placeholder="150 lbs"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Height
                    </label>
                    <input
                      type="text"
                      value={newPatient.vitals.height}
                      onChange={(e) =>
                        handleInputChange("vitals.height", e.target.value)
                      }
                      placeholder={`5'8"`}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <motion.button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="px-4 py-2 border border-border rounded-xl text-foreground hover:bg-accent transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={addingPatient}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {addingPatient && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Loader2 className="w-4 h-4" />
                    </motion.div>
                  )}
                  <span>{addingPatient ? "Adding..." : "Add Patient"}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Enhanced Edit Patient Modal */}
      {showEditModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-card/95 backdrop-blur-sm border border-border rounded-xl max-w-md sm:max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{ maxWidth: "28rem" }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 20 }}
          >
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Edit Patient
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Update patient information
                  </p>
                </div>
                <motion.button
                  onClick={handleCloseEditModal}
                  className="text-muted-foreground hover:text-foreground p-2 hover:bg-accent rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
            </div>
            <form onSubmit={handleUpdatePatient} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-foreground">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editPatient.name}
                      onChange={(e) =>
                        handleEditInputChange("name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      required
                      value={editPatient.age}
                      onChange={(e) =>
                        handleEditInputChange("age", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Gender *
                    </label>
                    <select
                      required
                      value={editPatient.gender}
                      onChange={(e) =>
                        handleEditInputChange("gender", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Blood Type
                    </label>
                    <select
                      value={editPatient.bloodType}
                      onChange={(e) =>
                        handleEditInputChange("bloodType", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-foreground">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={editPatient.phone}
                      onChange={(e) =>
                        handleEditInputChange("phone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editPatient.email}
                      onChange={(e) =>
                        handleEditInputChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Address
                  </label>
                  <textarea
                    value={editPatient.address}
                    onChange={(e) =>
                      handleEditInputChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-foreground">
                  Medical Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Condition *
                    </label>
                    <input
                      type="text"
                      required
                      value={editPatient.condition}
                      onChange={(e) =>
                        handleEditInputChange("condition", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Status
                    </label>
                    <select
                      value={editPatient.status}
                      onChange={(e) =>
                        handleEditInputChange("status", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="stable">Stable</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="critical">Critical</option>
                      <option value="active">Active</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Visit
                    </label>
                    <input
                      type="date"
                      value={editPatient.lastVisit}
                      onChange={(e) =>
                        handleEditInputChange("lastVisit", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Next Appointment
                    </label>
                    <input
                      type="date"
                      value={editPatient.nextAppointment}
                      onChange={(e) =>
                        handleEditInputChange("nextAppointment", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Allergies (comma-separated)
                    </label>
                    <textarea
                      value={editPatient.allergies}
                      onChange={(e) =>
                        handleEditInputChange("allergies", e.target.value)
                      }
                      placeholder="e.g., Penicillin, Nuts, Shellfish"
                      rows={2}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Current Medications (comma-separated)
                    </label>
                    <textarea
                      value={editPatient.medications}
                      onChange={(e) =>
                        handleEditInputChange("medications", e.target.value)
                      }
                      placeholder="e.g., Aspirin 81mg, Lisinopril 10mg"
                      rows={2}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Vitals */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-foreground">
                  Vital Signs
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Blood Pressure
                    </label>
                    <input
                      type="text"
                      value={editPatient.vitals.bloodPressure}
                      onChange={(e) =>
                        handleEditInputChange(
                          "vitals.bloodPressure",
                          e.target.value
                        )
                      }
                      placeholder="120/80"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Heart Rate
                    </label>
                    <input
                      type="text"
                      value={editPatient.vitals.heartRate}
                      onChange={(e) =>
                        handleEditInputChange(
                          "vitals.heartRate",
                          e.target.value
                        )
                      }
                      placeholder="72 bpm"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Temperature
                    </label>
                    <input
                      type="text"
                      value={editPatient.vitals.temperature}
                      onChange={(e) =>
                        handleEditInputChange(
                          "vitals.temperature",
                          e.target.value
                        )
                      }
                      placeholder="98.6°F"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Weight
                    </label>
                    <input
                      type="text"
                      value={editPatient.vitals.weight}
                      onChange={(e) =>
                        handleEditInputChange("vitals.weight", e.target.value)
                      }
                      placeholder="150 lbs"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Height
                    </label>
                    <input
                      type="text"
                      value={editPatient.vitals.height}
                      onChange={(e) =>
                        handleEditInputChange("vitals.height", e.target.value)
                      }
                      placeholder={`5'8"`}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <motion.button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 border border-border rounded-xl text-foreground hover:bg-accent transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={editingPatient}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {editingPatient && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Loader2 className="w-4 h-4" />
                    </motion.div>
                  )}
                  <span>
                    {editingPatient ? "Updating..." : "Update Patient"}
                  </span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}