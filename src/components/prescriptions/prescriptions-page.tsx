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
  Download,
  FileText,
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
  }; // Download prescription as PDF
  const downloadPrescription = async (prescription: Prescription) => {
    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import("jspdf")).default;

      // Create new PDF document
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Colors
      const primaryColor = "#2563eb";
      const grayColor = "#6b7280";
      const lightGrayColor = "#f3f4f6";

      // Header Section
      pdf.setFillColor(primaryColor);
      pdf.rect(0, 0, pageWidth, 30, "F");

      // Logo/Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.text("MEDICAL PRESCRIPTION", pageWidth / 2, 20, { align: "center" });

      // Reset text color
      pdf.setTextColor(0, 0, 0);

      // Prescription ID Section
      pdf.setFillColor(lightGrayColor);
      pdf.rect(15, 35, pageWidth - 30, 15, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text(`Prescription ID: ${prescription.id}`, 20, 45);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text(
        `Date: ${new Date(prescription.date).toLocaleDateString()}`,
        pageWidth - 20,
        45,
        { align: "right" }
      );

      // Patient Information Section
      let yPos = 65;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(primaryColor);
      pdf.text("PATIENT INFORMATION", 20, yPos);

      yPos += 10;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      const patientInfo = [
        `Name: ${prescription.patientName || "N/A"}`,
        `Patient ID: ${prescription.patientId || "N/A"}`,
      ];

      patientInfo.forEach((info) => {
        pdf.text(info, 20, yPos);
        yPos += 6;
      });

      // Doctor Information Section
      yPos += 10;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(primaryColor);
      pdf.text("DOCTOR INFORMATION", 20, yPos);

      yPos += 10;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);

      pdf.text(`Doctor: ${prescription.doctorName || "N/A"}`, 20, yPos);
      yPos += 6;
      pdf.text(`Diagnosis: ${prescription.diagnosis || "N/A"}`, 20, yPos);
      yPos += 6;

      if (prescription.symptoms && prescription.symptoms.length > 0) {
        pdf.text(`Symptoms: ${prescription.symptoms.join(", ")}`, 20, yPos);
        yPos += 6;
      }

      // Medications Section
      yPos += 10;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(primaryColor);
      pdf.text("PRESCRIBED MEDICATIONS", 20, yPos);

      yPos += 10;

      if (prescription.medications && prescription.medications.length > 0) {
        prescription.medications.forEach((med, index) => {
          // Check if we need a new page
          if (yPos > pageHeight - 60) {
            pdf.addPage();
            yPos = 30;
          }

          // Medication box
          pdf.setFillColor(250, 250, 250);
          pdf.rect(15, yPos - 5, pageWidth - 30, 35, "F");
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(15, yPos - 5, pageWidth - 30, 35, "S");

          // Medication details
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          pdf.text(
            `${index + 1}. ${med.name || "Unknown Medicine"}`,
            20,
            yPos + 3
          );

          if (med.strength) {
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.text(`Strength: ${med.strength}`, 20, yPos + 10);
          }

          pdf.text(
            `Dosage: ${med.dosage || "N/A"} ${med.frequency || ""}`,
            20,
            yPos + 15
          );
          pdf.text(`Duration: ${med.duration || "N/A"}`, 20, yPos + 20);

          if (med.instructions) {
            pdf.text(`Instructions: ${med.instructions}`, 20, yPos + 25);
          }

          // Right side info
          pdf.text(`Qty: ${med.quantity || "N/A"}`, pageWidth - 60, yPos + 10);
          pdf.text(`Refills: ${med.refills || "0"}`, pageWidth - 60, yPos + 20);

          yPos += 45;
        });
      }

      // Footer Section
      yPos = Math.max(yPos + 20, pageHeight - 40);

      // Status and AI indicator
      pdf.setFillColor(lightGrayColor);
      pdf.rect(15, yPos - 5, pageWidth - 30, 25, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(`Status: ${prescription.status || "Active"}`, 20, yPos + 5);

      if (prescription.isAiGenerated) {
        pdf.setTextColor(primaryColor);
        pdf.text("✓ AI-Generated Prescription", 20, yPos + 12);
        pdf.setTextColor(0, 0, 0);
      }

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(grayColor);
      pdf.text(
        `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        pageWidth - 20,
        yPos + 15,
        { align: "right" }
      );

      // Digital signature area
      pdf.setTextColor(0, 0, 0);
      pdf.text(
        "Digital Signature: ____________________",
        pageWidth - 80,
        yPos + 5,
        { align: "right" }
      );

      // Save the PDF
      pdf.save(
        `prescription-${prescription.id}-${prescription.patientName?.replace(
          /\s+/g,
          "_"
        )}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // Preview prescription before download
  const previewPrescription = (prescription: Prescription) => {
    // Create a preview window with the prescription content
    const previewWindow = window.open(
      "",
      "_blank",
      "width=800,height=1000,scrollbars=yes"
    );

    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Prescription Preview - ${prescription.id}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              background: #f5f5f5;
            }
            .prescription-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: #2563eb;
              color: white;
              padding: 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .prescription-id {
              background: #f3f4f6;
              padding: 15px 20px;
              border-bottom: 1px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .prescription-id strong {
              font-size: 14px;
              color: #374151;
            }
            .section {
              padding: 20px;
              border-bottom: 1px solid #e5e7eb;
            }
            .section:last-child {
              border-bottom: none;
            }
            .section-title {
              color: #2563eb;
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-row {
              margin-bottom: 6px;
              font-size: 11px;
              color: #374151;
            }
            .medication-box {
              background: #fafafa;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 15px;
              margin-bottom: 15px;
            }
            .medication-header {
              font-weight: bold;
              font-size: 12px;
              color: #111827;
              margin-bottom: 8px;
            }
            .medication-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              font-size: 10px;
              color: #6b7280;
            }
            .footer {
              background: #f3f4f6;
              padding: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-active {
              background: #dcfce7;
              color: #166534;
            }
            .ai-badge {
              background: #dbeafe;
              color: #1d4ed8;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: bold;
            }
            .download-actions {
              text-align: center;
              padding: 20px;
              background: #f9fafb;
            }
            .download-btn {
              background: #2563eb;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: bold;
              cursor: pointer;
              margin: 0 10px;
            }
            .download-btn:hover {
              background: #1d4ed8;
            }
            .download-btn.secondary {
              background: #6b7280;
            }
            .download-btn.secondary:hover {
              background: #4b5563;
            }
          </style>
        </head>
        <body>
          <div class="prescription-container">
            <div class="header">
              <h1>MEDICAL PRESCRIPTION</h1>
            </div>
            
            <div class="prescription-id">
              <strong>Prescription ID: ${prescription.id}</strong>
              <strong>Date: ${new Date(
                prescription.date
              ).toLocaleDateString()}</strong>
            </div>
            
            <div class="section">
              <div class="section-title">Patient Information</div>
              <div class="info-row">Name: ${
                prescription.patientName || "N/A"
              }</div>
              <div class="info-row">Patient ID: ${
                prescription.patientId || "N/A"
              }</div>
            </div>
            
            <div class="section">
              <div class="section-title">Doctor Information</div>
              <div class="info-row">Doctor: ${
                prescription.doctorName || "N/A"
              }</div>
              <div class="info-row">Diagnosis: ${
                prescription.diagnosis || "N/A"
              }</div>
              ${
                prescription.symptoms && prescription.symptoms.length > 0
                  ? `<div class="info-row">Symptoms: ${prescription.symptoms.join(
                      ", "
                    )}</div>`
                  : ""
              }
            </div>
            
            <div class="section">
              <div class="section-title">Prescribed Medications</div>
              ${
                prescription.medications
                  ?.map(
                    (med, index) => `
                <div class="medication-box">
                  <div class="medication-header">
                    ${index + 1}. ${med.name || "Unknown Medicine"}
                    ${med.strength ? ` - ${med.strength}` : ""}
                  </div>
                  <div class="medication-details">
                    <div>Dosage: ${med.dosage || "N/A"} ${
                      med.frequency || ""
                    }</div>
                    <div>Quantity: ${med.quantity || "N/A"}</div>
                    <div>Duration: ${med.duration || "N/A"}</div>
                    <div>Refills: ${med.refills || "0"}</div>
                    ${
                      med.instructions
                        ? `<div style="grid-column: 1 / -1;">Instructions: ${med.instructions}</div>`
                        : ""
                    }
                  </div>
                </div>
              `
                  )
                  .join("") || "<p>No medications prescribed</p>"
              }
            </div>
            
            <div class="footer">
              <div>
                <span class="status-badge status-active">Status: ${
                  prescription.status || "Active"
                }</span>
                ${
                  prescription.isAiGenerated
                    ? '<span class="ai-badge">✓ AI-Generated</span>'
                    : ""
                }
              </div>
              <div style="font-size: 9px; color: #6b7280;">
                Generated: ${new Date().toLocaleString()}
              </div>
            </div>
            
            <div class="download-actions">
              <button class="download-btn" onclick="window.print()">Print Preview</button>
              <button class="download-btn secondary" onclick="window.close()">Close Preview</button>
            </div>
          </div>
        </body>
        </html>
      `);
      previewWindow.document.close();
    }
  }; // Display prescription details
  const displayPrescription = async (prescription: Prescription) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/prescription-display", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prescriptionId: prescription._id || prescription.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const { prescriptionData } = data;

        // Create a detailed prescription display window
        const displayWindow = window.open("", "_blank", "width=800,height=600");
        if (displayWindow) {
          displayWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Prescription - ${prescriptionData.patientName}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  line-height: 1.6; 
                  margin: 0; 
                  padding: 20px; 
                  color: #333; 
                }
                .header { 
                  text-align: center; 
                  border-bottom: 2px solid #2563eb; 
                  padding-bottom: 20px; 
                  margin-bottom: 30px; 
                }
                .header h1 { 
                  color: #2563eb; 
                  margin: 0; 
                }
                .prescription-info { 
                  background-color: #f8f9fa; 
                  padding: 15px; 
                  border-radius: 5px; 
                  margin-bottom: 20px; 
                }
                .medication { 
                  background-color: #fff; 
                  border: 1px solid #dee2e6; 
                  padding: 15px; 
                  margin: 10px 0; 
                  border-radius: 5px; 
                }
                .medication h4 { 
                  margin-top: 0; 
                  color: #2563eb; 
                }
                .notes { 
                  background-color: #fff3cd; 
                  padding: 15px; 
                  border-left: 4px solid #ffc107; 
                  border-radius: 5px; 
                }
                .actions { 
                  text-align: center; 
                  margin-top: 30px; 
                  border-top: 1px solid #dee2e6; 
                  padding-top: 20px; 
                }
                .btn { 
                  background-color: #2563eb; 
                  color: white; 
                  border: none; 
                  padding: 10px 20px; 
                  margin: 0 10px; 
                  border-radius: 5px; 
                  cursor: pointer; 
                }
                @media print {
                  .actions { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Medical Prescription</h1>
                <p><strong>Dr. ${prescriptionData.doctorName}</strong></p>
                <p>${prescriptionData.doctorSpecialization}</p>
              </div>
              
              <div class="prescription-info">
                <p><strong>Patient:</strong> ${prescriptionData.patientName}</p>
                <p><strong>Prescription ID:</strong> ${prescriptionData.prescriptionId}</p>
                <p><strong>Date Issued:</strong> ${prescriptionData.dateIssued}</p>
                <p><strong>Diagnosis:</strong> ${prescriptionData.diagnosis}</p>
              </div>
              
              <div class="section">
                <h3>Prescribed Medications</h3>
                ${prescriptionData.medications
                  .map(
                    (
                      med: {
                        name: string;
                        strength: string;
                        dosage: string;
                        frequency: string;
                        duration: string;
                        instructions: string;
                      },
                      index: number
                    ) => `
                  <div class="medication">
                    <h4>${index + 1}. ${med.name} (${med.strength})</h4>
                    <p><strong>Dosage:</strong> ${med.dosage}</p>
                    <p><strong>Frequency:</strong> ${med.frequency}</p>
                    <p><strong>Duration:</strong> ${med.duration}</p>
                    <p><strong>Instructions:</strong> ${med.instructions}</p>
                  </div>
                `
                  )
                  .join("")}
              </div>
              
              <div class="notes">
                <h3>Important Notes</h3>
                <ul>
                  ${prescriptionData.notes.map((note: string) => `<li>${note}</li>`).join("")}
                </ul>
              </div>
              
              <div class="actions">
                <button class="btn" onclick="window.print()">Print Prescription</button>
                <button class="btn secondary" onclick="window.close()">Close</button>
              </div>
            </body>
            </html>
          `);
          displayWindow.document.close();
        }

        alert("Prescription displayed successfully!");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error displaying prescription:", error);
      alert("Failed to display prescription. Please try again.");
    } finally {
      setIsLoading(false);
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
          </p>{" "}
        </div>
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
          </CardTitle>{" "}
        </CardHeader>
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
                {filteredPrescriptions.map((prescription, index) => (
                  <TableRow
                    key={prescription.id || `prescription-${index}`}
                    className="hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{prescription.id}</span>
                        {prescription.isAiGenerated && (
                          <Badge variant="secondary" className="text-xs">
                            <Bot className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>{" "}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/api/placeholder/32/32" />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(prescription.patientName || "Unknown")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {prescription.patientName || "Unknown Patient"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID: {prescription.patientId || "N/A"}
                          </p>{" "}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {prescription.diagnosis || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {(prescription.medications || [])
                          .slice(0, 2)
                          .map((med, index) => (
                            <div
                              key={med.id || `${prescription.id}-med-${index}`}
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
                      </div>{" "}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(prescription.date)}
                      </span>
                    </TableCell>
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
                          {" "}
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/prescriptions/${prescription.id}`}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => previewPrescription(prescription)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Preview PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Prescription
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Prescription
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => downloadPrescription(prescription)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>{" "}
                          <DropdownMenuItem
                            onClick={() => displayPrescription(prescription)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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
