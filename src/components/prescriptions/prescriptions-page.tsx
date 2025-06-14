"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Plus,
  Search,
  Filter,
  Stethoscope,
  Calendar,
  User,
  MoreHorizontal,
  Eye,
  Edit,
  Printer,
  Bot,
} from "lucide-react";
import { Prescription } from "@/types/prescription";
import Link from "next/link";

/**
 * Mock prescription data
 */
const mockPrescriptions: Prescription[] = [
  {
    id: "RX001",
    patientId: "P001",
    patientName: "Sarah Johnson",
    doctorId: "D001",
    doctorName: "Dr. John Smith",
    date: "2025-06-13",
    diagnosis: "Hypertension",
    symptoms: ["high blood pressure", "headache"],
    medications: [
      {
        id: "M001",
        name: "Lisinopril",
        strength: "10mg",
        form: "tablet",
        quantity: 30,
        dosage: "1 tablet",
        frequency: "once daily",
        duration: "30 days",
        instructions: "Take with or without food",
        refills: 5,
      },
    ],
    status: "active",
    createdAt: "2025-06-13T09:00:00Z",
    updatedAt: "2025-06-13T09:00:00Z",
    expiresAt: "2025-12-13T09:00:00Z",
    isAiGenerated: false,
  },
  {
    id: "RX002",
    patientId: "P002",
    patientName: "Michael Chen",
    doctorId: "D001",
    doctorName: "Dr. John Smith",
    date: "2025-06-12",
    diagnosis: "Type 2 Diabetes",
    symptoms: ["elevated blood sugar", "frequent urination"],
    medications: [
      {
        id: "M002",
        name: "Metformin",
        strength: "500mg",
        form: "tablet",
        quantity: 60,
        dosage: "1 tablet",
        frequency: "twice daily",
        duration: "30 days",
        instructions: "Take with meals",
        refills: 3,
      },
    ],
    status: "active",
    createdAt: "2025-06-12T14:30:00Z",
    updatedAt: "2025-06-12T14:30:00Z",
    expiresAt: "2025-12-12T14:30:00Z",
    isAiGenerated: true,
    aiConfidence: 0.92,
  },
  {
    id: "RX003",
    patientId: "P003",
    patientName: "Emily Davis",
    doctorId: "D001",
    doctorName: "Dr. John Smith",
    date: "2025-06-11",
    diagnosis: "Asthma",
    symptoms: ["shortness of breath", "wheezing"],
    medications: [
      {
        id: "M003",
        name: "Albuterol",
        strength: "90mcg",
        form: "inhaler",
        quantity: 1,
        dosage: "2 puffs",
        frequency: "as needed",
        duration: "as needed",
        instructions: "Use for acute symptoms",
        refills: 2,
      },
    ],
    status: "active",
    createdAt: "2025-06-11T11:15:00Z",
    updatedAt: "2025-06-11T11:15:00Z",
    expiresAt: "2025-12-11T11:15:00Z",
    isAiGenerated: true,
    aiConfidence: 0.88,
  },
];

/**
 * Format date consistently for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Get status color styling
 */
function getStatusColor(status: string | undefined | null) {
  if (!status) return "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20";

  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-500/10 text-green-700 hover:bg-green-500/20";
    case "completed":
      return "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-700 hover:bg-red-500/20";
    case "expired":
      return "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20";
    default:
      return "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20";
  }
}

/**
 * Prescriptions Page Component
 *
 * Main prescriptions management interface featuring:
 * - List of all prescriptions with search and filtering
 * - Quick actions for viewing, editing, and printing
 * - AI-generated prescription indicators
 * - Status tracking and management
 */
export function PrescriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load prescriptions from API
  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/prescriptions");
        const result = await response.json();

        if (result.success && result.data) {
          setPrescriptions(result.data);
        } else {
          console.log("No prescriptions found or API error, using mock data");
          setPrescriptions(mockPrescriptions);
        }
      } catch (error) {
        console.error("Failed to load prescriptions:", error);
        setError("Failed to load prescriptions");
        // Fallback to mock data
        setPrescriptions(mockPrescriptions);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrescriptions();
  }, []);

  // Refresh prescriptions (can be called when needed)
  const refreshPrescriptions = async () => {
    try {
      const response = await fetch("/api/prescriptions");
      const result = await response.json();

      if (result.success && result.data) {
        setPrescriptions(result.data);
      }
    } catch (error) {
      console.error("Failed to refresh prescriptions:", error);
    }
  };
  // Filter prescriptions based on search query
  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      (prescription.patientName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (prescription.diagnosis || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (prescription.id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground">
            Manage and generate patient prescriptions
          </p>
        </div>{" "}
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshPrescriptions}>
            Refresh
          </Button>
          <Button asChild>
            <Link href="/dashboard/prescriptions/new">
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Prescriptions
            </CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prescriptions.length}</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Prescriptions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prescriptions.filter((p) => p.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently prescribed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prescriptions.filter((p) => p.isAiGenerated).length}
            </div>
            <p className="text-xs text-muted-foreground">
              AI-powered prescriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Patients Treated
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(prescriptions.map((p) => p.patientId)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique patients</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Prescriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Prescriptions List
          </CardTitle>
        </CardHeader>{" "}
        <CardContent>
          {error && (
            <div className="flex items-center justify-center p-6 text-red-600">
              <p>Error: {error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPrescriptions}
                className="ml-4"
              >
                Retry
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Loading prescriptions...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prescription ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Medications</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{prescription.id}</span>
                        {prescription.isAiGenerated && (
                          <Badge variant="secondary" className="text-xs">
                            <Bot className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {" "}
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/api/placeholder/32/32" />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(prescription.patientName || "Unknown")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>{" "}
                        <div>
                          <p className="font-medium text-foreground">
                            {prescription.patientName || "Unknown Patient"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID: {prescription.patientId || "N/A"}
                          </p>
                        </div>
                      </div>
                    </TableCell>{" "}
                    <TableCell>
                      <span className="text-sm">
                        {prescription.diagnosis || "N/A"}
                      </span>
                    </TableCell>{" "}
                    <TableCell>
                      <div className="space-y-1">
                        {(prescription.medications || [])
                          .slice(0, 2)
                          .map((med, index) => (
                            <div
                              key={med.id || `med-${index}`}
                              className="text-sm"
                            >
                              <span className="font-medium">
                                {med.name || "Unknown"}
                              </span>
                              <span className="text-muted-foreground ml-1">
                                {med.strength || ""}
                              </span>
                            </div>
                          ))}
                        {(prescription.medications || []).length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{(prescription.medications || []).length - 2} more
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(prescription.date)}
                      </span>
                    </TableCell>{" "}
                    <TableCell>
                      <Badge className={getStatusColor(prescription.status)}>
                        {prescription.status || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/prescriptions/${prescription.id}`}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Prescription
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Prescription
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>{" "}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
