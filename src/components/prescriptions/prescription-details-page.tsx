"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  ArrowLeft,
  Calendar,
  User,
  Stethoscope,
  Printer,
  Edit,
  FileText,
  Bot,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import { Prescription } from "@/types/prescription";
import Link from "next/link";

interface PrescriptionDetailsPageProps {
  prescriptionId: string;
}

/**
 * Mock prescription data - in a real app, this would be fetched from an API
 */
const mockPrescription: Prescription = {
  id: "RX002",
  patientId: "P002",
  patientName: "Michael Chen",
  doctorId: "D001", 
  doctorName: "Dr. John Smith",
  date: "2025-06-12",
  diagnosis: "Type 2 Diabetes with Neuropathy",
  symptoms: ["elevated blood sugar", "frequent urination", "tingling in feet", "fatigue"],
  medications: [
    {
      id: "M002",
      name: "Metformin",
      genericName: "Metformin Hydrochloride",
      strength: "500mg",
      form: "tablet",
      quantity: 60,
      dosage: "1 tablet",
      frequency: "twice daily with meals",
      duration: "30 days",
      instructions: "Take with breakfast and dinner to reduce stomach upset. Monitor blood glucose levels regularly.",
      refills: 3,
      cost: 15.50,
      sideEffects: ["nausea", "diarrhea", "stomach upset"],
      contraindications: ["kidney disease", "liver disease"],
    },
    {
      id: "M004",
      name: "Gabapentin",
      genericName: "Gabapentin",
      strength: "300mg",
      form: "capsule",
      quantity: 90,
      dosage: "1 capsule",
      frequency: "three times daily",
      duration: "30 days",
      instructions: "Start with one capsule daily, increase gradually as tolerated. May cause drowsiness.",
      refills: 2,
      cost: 22.75,
      sideEffects: ["drowsiness", "dizziness", "fatigue"],
      contraindications: ["kidney impairment"],
    },
  ],
  notes: "Patient education provided on diabetes management and foot care. Follow-up appointment scheduled in 2 weeks to monitor medication response.",
  status: "active",
  createdAt: "2025-06-12T14:30:00Z",
  updatedAt: "2025-06-12T14:30:00Z", 
  expiresAt: "2025-12-12T14:30:00Z",
  isAiGenerated: true,
  aiConfidence: 0.92,
};

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
 * Format date and time for display
 */
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

/**
 * Get status color styling
 */
function getStatusColor(status: string) {
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
 * Prescription Details Page Component
 *
 * Comprehensive view of individual prescription details including:
 * - Patient and doctor information
 * - Detailed medication information with dosing
 * - AI generation details and confidence scores
 * - Cost breakdown and insurance information
 * - Edit and print capabilities
 */
export function PrescriptionDetailsPage({ prescriptionId }: PrescriptionDetailsPageProps) {
  const [prescription] = useState<Prescription>(mockPrescription);

  const totalCost = prescription.medications.reduce((sum, med) => sum + (med.cost || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/prescriptions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Prescriptions
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Prescription {prescription.id}
            </h1>
            <p className="text-muted-foreground">
              Detailed prescription information and medications
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Prescription
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prescription Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Prescription Overview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(prescription.status)}>
                    {prescription.status}
                  </Badge>
                  {prescription.isAiGenerated && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      AI Generated ({Math.round(prescription.aiConfidence! * 100)}%)
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Prescription ID
                  </label>
                  <p className="font-medium">{prescription.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Date Prescribed
                  </label>
                  <p className="font-medium">{formatDate(prescription.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Diagnosis
                  </label>
                  <p className="font-medium">{prescription.diagnosis}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Expires On
                  </label>
                  <p className="font-medium">{formatDate(prescription.expiresAt)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Reported Symptoms
                </label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {prescription.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="outline">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>

              {prescription.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Additional Notes
                  </label>
                  <p className="mt-1 text-sm">{prescription.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Prescribed Medications ({prescription.medications.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {prescription.medications.map((medication, index) => (
                <div key={medication.id}>
                  {index > 0 && <Separator />}
                  
                  <div className="space-y-4">
                    {/* Medication Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{medication.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {medication.genericName} - {medication.strength} {medication.form}
                        </p>
                      </div>
                      {medication.cost && (
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-lg font-semibold">
                            <DollarSign className="h-4 w-4" />
                            {medication.cost.toFixed(2)}
                          </div>
                          <p className="text-xs text-muted-foreground">Estimated cost</p>
                        </div>
                      )}
                    </div>

                    {/* Dosing Information */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Dosage
                        </label>
                        <p className="font-medium">{medication.dosage}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Frequency
                        </label>
                        <p className="font-medium">{medication.frequency}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Duration
                        </label>
                        <p className="font-medium">{medication.duration}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Quantity
                        </label>
                        <p className="font-medium">{medication.quantity}</p>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Instructions
                      </label>
                      <p className="mt-1 text-sm">{medication.instructions}</p>
                    </div>

                    {/* Refills */}
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Refills Remaining
                        </label>
                        <p className="font-medium">{medication.refills}</p>
                      </div>
                    </div>

                    {/* Side Effects and Contraindications */}
                    {(medication.sideEffects || medication.contraindications) && (
                      <div className="space-y-3">
                        {medication.sideEffects && medication.sideEffects.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Possible Side Effects
                            </label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {medication.sideEffects.map((effect, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {effect}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {medication.contraindications && medication.contraindications.length > 0 && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Contraindications</AlertTitle>
                            <AlertDescription>
                              Do not use if patient has: {medication.contraindications.join(", ")}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/api/placeholder/48/48" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {prescription.patientName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{prescription.patientName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Patient ID: {prescription.patientId}
                  </p>
                </div>
              </div>
              
              <div className="text-sm">
                <p className="text-muted-foreground">Prescribed by</p>
                <p className="font-medium">{prescription.doctorName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Cost Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {prescription.medications.map((med) => (
                med.cost && (
                  <div key={med.id} className="flex justify-between text-sm">
                    <span>{med.name}</span>
                    <span>${med.cost.toFixed(2)}</span>
                  </div>
                )
              ))}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Estimated Cost</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                *Actual cost may vary based on insurance coverage and pharmacy
              </p>
            </CardContent>
          </Card>

          {/* Prescription Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Prescription Created</p>
                  <p className="text-muted-foreground">
                    {formatDateTime(prescription.createdAt)}
                  </p>
                </div>
              </div>
              
              {prescription.isAiGenerated && (
                <div className="flex items-start gap-2">
                  <Bot className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">AI Generated</p>
                    <p className="text-muted-foreground">
                      Confidence: {Math.round(prescription.aiConfidence! * 100)}%
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-orange-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Expires</p>
                  <p className="text-muted-foreground">
                    {formatDate(prescription.expiresAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                View Patient Records
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Stethoscope className="h-4 w-4 mr-2" />
                Create New Prescription
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
