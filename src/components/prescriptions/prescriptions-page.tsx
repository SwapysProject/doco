"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  RefreshCw,
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
 * - List of prescriptions for assigned patients with search and filtering
 * - Quick actions for viewing, editing, and printing
 * - AI-generated prescription indicators
 * - Status tracking and management
 */
export function PrescriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Load prescriptions from API - only for current doctor and assigned patients
  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use the new my-prescriptions endpoint that filters by doctor and assigned patients
        const response = await fetch("/api/my-prescriptions");
        const result = await response.json();

        if (result.success && result.data) {
          setPrescriptions(result.data);
        } else if (result.success && result.data?.length === 0) {
          setPrescriptions([]);
          console.log("No prescriptions found for this doctor");
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
      const response = await fetch("/api/my-prescriptions");
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
      {/* Enhanced Page Header */}
      <motion.div
        className="flex items-center justify-between group"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Stethoscope className="w-6 h-6" />
            </motion.div>
            <div>
              {" "}
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                My Prescriptions
              </h1>
              <p className="text-muted-foreground transition-all duration-300 ease-out group-hover:text-purple-600 group-hover:translate-x-2">
                Manage prescriptions for your assigned patients
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              onClick={refreshPrescriptions}
              className="shadow-sm hover:shadow-md transition-all duration-200 border-border hover:bg-accent/50 group"
            >
              <motion.div
                animate={{ rotate: 0 }}
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
              </motion.div>
              Refresh
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              asChild
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <Link href="/dashboard/prescriptions/new">
                <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                New Prescription
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>{" "}
      {/* Enhanced Stats Cards */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 border border-purple-200/50 dark:border-purple-800/50 shadow-sm hover:shadow-lg transition-all duration-300 group backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Total Prescriptions
              </CardTitle>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg flex items-center justify-center"
              >
                <Stethoscope className="h-4 w-4" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-2xl font-bold text-purple-700 dark:text-purple-300"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                {prescriptions.length}
              </motion.div>
              <p className="text-xs text-purple-600/80 dark:text-purple-400/80 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                +2 from yesterday
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 border border-green-200/50 dark:border-green-800/50 shadow-sm hover:shadow-lg transition-all duration-300 group backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Active Prescriptions
              </CardTitle>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg flex items-center justify-center"
              >
                <Calendar className="h-4 w-4" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-2xl font-bold text-green-700 dark:text-green-300"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                {prescriptions.filter((p) => p.status === "active").length}
              </motion.div>
              <p className="text-xs text-green-600/80 dark:text-green-400/80 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                Currently prescribed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border border-blue-200/50 dark:border-blue-800/50 shadow-sm hover:shadow-lg transition-all duration-300 group backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                AI Generated
              </CardTitle>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center"
              >
                <Bot className="h-4 w-4" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-2xl font-bold text-blue-700 dark:text-blue-300"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                {prescriptions.filter((p) => p.isAiGenerated).length}
              </motion.div>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                AI-powered prescriptions
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/50 dark:to-indigo-900/30 border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm hover:shadow-lg transition-all duration-300 group backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                Patients Treated
              </CardTitle>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg flex items-center justify-center"
              >
                <User className="h-4 w-4" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-2xl font-bold text-indigo-700 dark:text-indigo-300"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                {new Set(prescriptions.map((p) => p.patientId)).size}
              </motion.div>
              <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors duration-300">
                Unique patients
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>{" "}
      {/* Enhanced Search and Filters */}
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <motion.div
          className="relative flex-1 max-w-sm group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
          <Input
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 hover:shadow-sm focus:shadow-md backdrop-blur-sm"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 1.0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            className="shadow-sm hover:shadow-md transition-all duration-200 border-border hover:bg-accent/50 group"
          >
            <Filter className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
            Filters
          </Button>
        </motion.div>
      </motion.div>{" "}
      {/* Enhanced Prescriptions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.1 }}
      >
        <Card className="bg-card/50 border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-background/50 to-muted/20 border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Stethoscope className="h-5 w-5 text-primary" />
              </motion.div>
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Prescriptions List
              </span>
            </CardTitle>
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
                </TableHeader>{" "}
                <TableBody>
                  {filteredPrescriptions.map((prescription, index) => (
                    <motion.tr
                      key={prescription.id || `prescription-${index}`}
                      className="hover:bg-muted/50 group transition-all duration-200 hover:shadow-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 1.3 + index * 0.05 }}
                      whileHover={{ x: 4 }}
                    >
                      {" "}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium group-hover:text-primary transition-colors duration-200">
                            {prescription.id}
                          </span>
                          {prescription.isAiGenerated && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                duration: 0.2,
                                delay: 1.4 + index * 0.05,
                              }}
                            >
                              <Badge
                                variant="secondary"
                                className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200/50 hover:from-blue-200 hover:to-purple-200 transition-all duration-200"
                              >
                                <Bot className="h-3 w-3 mr-1" />
                                AI
                              </Badge>
                            </motion.div>
                          )}
                        </div>
                      </TableCell>{" "}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Avatar className="h-8 w-8 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all duration-200">
                              <AvatarImage src="/api/placeholder/32/32" />
                              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-medium">
                                {(prescription.patientName || "Unknown")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          </motion.div>
                          <div>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                              {prescription.patientName || "Unknown Patient"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {prescription.patientId || "N/A"}
                            </p>
                          </div>
                        </div>
                      </TableCell>{" "}
                      <TableCell>
                        <span className="text-sm group-hover:text-primary transition-colors duration-200 font-medium">
                          {prescription.diagnosis || "N/A"}
                        </span>
                      </TableCell>{" "}
                      <TableCell>
                        <motion.div
                          className="space-y-1"
                          initial={{ opacity: 0.8 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {(prescription.medications || [])
                            .slice(0, 2)
                            .map((med, medIndex) => (
                              <motion.div
                                key={
                                  med.id || `${prescription.id}-med-${medIndex}`
                                }
                                className="text-sm group-hover:translate-x-1 transition-transform duration-200"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: 1.5 + index * 0.05 + medIndex * 0.1,
                                }}
                              >
                                <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                                  {med.name || "Unknown"}
                                </span>
                                <span className="text-muted-foreground ml-1">
                                  {med.strength || ""}
                                </span>
                              </motion.div>
                            ))}
                          {(prescription.medications || []).length > 2 && (
                            <motion.div
                              className="text-xs text-muted-foreground group-hover:text-primary/60 transition-colors duration-200"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{
                                duration: 0.3,
                                delay: 1.7 + index * 0.05,
                              }}
                            >
                              +{(prescription.medications || []).length - 2}{" "}
                              more
                            </motion.div>
                          )}
                        </motion.div>
                      </TableCell>{" "}
                      <TableCell>
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                          {formatDate(prescription.date)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge
                            className={`${getStatusColor(prescription.status)} transition-all duration-200 hover:shadow-sm`}
                          >
                            {prescription.status || "Unknown"}
                          </Badge>
                        </motion.div>
                      </TableCell>{" "}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ duration: 0.1 }}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-accent/50 group-hover:bg-accent transition-all duration-200"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </motion.div>
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
                            </DropdownMenuItem>{" "}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
