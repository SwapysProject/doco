"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bot,
  Brain,
  User,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Save,
  ChevronRight,
  Search,
  Plus,
  Trash2,
  Edit3,
} from "lucide-react";
import {
  AiPrescriptionRequest,
  AiPrescriptionResponse,
} from "@/types/prescription";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Mock patients data for selection
 */
const mockPatients = [
  {
    id: "P001",
    name: "Sarah Johnson",
    age: 34,
    gender: "female" as const,
    allergies: ["Penicillin"],
    currentMedications: ["Lisinopril 10mg"],
    medicalHistory: ["Hypertension"],
  },
  {
    id: "P002",
    name: "Michael Chen",
    age: 45,
    gender: "male" as const,
    allergies: [],
    currentMedications: ["Metformin 500mg"],
    medicalHistory: ["Type 2 Diabetes"],
  },
  {
    id: "P003",
    name: "Emily Davis",
    age: 28,
    gender: "female" as const,
    allergies: ["Sulfa drugs"],
    currentMedications: [],
    medicalHistory: ["Asthma"],
  },
];

/**
 * Mock AI service for prescription generation (for fallback)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateAiPrescription(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  request: AiPrescriptionRequest
): Promise<AiPrescriptionResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock AI response based on symptoms
  const mockResponse: AiPrescriptionResponse = {
    medications: [
      {
        id: "M001",
        name: "Ibuprofen",
        genericName: "Ibuprofen",
        strength: "400mg",
        form: "tablet",
        quantity: 20,
        dosage: "1 tablet",
        frequency: "every 6-8 hours as needed",
        duration: "7 days",
        instructions: "Take with food to reduce stomach upset",
        refills: 0,
        cost: 12.5,
        sideEffects: ["stomach upset", "dizziness"],
      },
      {
        id: "M002",
        name: "Acetaminophen",
        genericName: "Acetaminophen",
        strength: "500mg",
        form: "tablet",
        quantity: 24,
        dosage: "1-2 tablets",
        frequency: "every 4-6 hours as needed",
        duration: "as needed",
        instructions: "Do not exceed 3000mg in 24 hours",
        refills: 1,
        cost: 8.75,
        sideEffects: ["rare allergic reactions"],
      },
    ],
    reasoning:
      "Based on the reported symptoms of headache and muscle pain, I recommend a combination approach with both anti-inflammatory (Ibuprofen) and analgesic (Acetaminophen) medications. This provides comprehensive pain relief while minimizing individual drug dosages.",
    confidence: 0.87,
    warnings: [
      "Monitor for stomach upset with Ibuprofen",
      "Ensure adequate hydration",
      "Follow up if symptoms persist beyond 7 days",
    ],
    alternatives: [
      {
        id: "M003",
        name: "Naproxen",
        strength: "220mg",
        form: "tablet",
        quantity: 14,
        dosage: "1 tablet",
        frequency: "every 8-12 hours",
        duration: "7 days",
        instructions: "Take with food",
        refills: 0,
      },
    ],
  };

  return mockResponse;
}

// Patient type for better type safety
interface Patient {
  id?: string;
  _id?: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  allergies?: string[];
  currentMedications?: string[];
  medications?: string[];
  medicalHistory?: string[];
  condition?: string;
  phone?: string;
}

/**
 * New Prescription Page Component
 *
 * AI-powered prescription generator featuring:
 * - Patient selection and information display
 * - Symptom and diagnosis input
 * - AI-generated prescription recommendations
 * - Manual review and modification capabilities
 * - Safety warnings and drug interaction checks
 */
export function NewPrescriptionPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState<string>("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [symptoms, setSymptoms] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<AiPrescriptionResponse | null>(
    null
  );
  const [customNotes, setCustomNotes] = useState<string>("");
  const [prescriptionStatus, setPrescriptionStatus] = useState<{
    hasActivePrescriptions: boolean;
    hasRecentPrescriptions: boolean;
    activePrescriptions: Array<{
      id: string;
      date: string;
      diagnosis: string;
      medications: Array<{
        id: string;
        name: string;
        dosage: string;
        frequency: string;
      }>;
      doctorName: string;
      status: string;
    }>;
    recentPrescriptions: Array<{
      id: string;
      date: string;
      diagnosis: string;
      medications: Array<{
        id: string;
        name: string;
        dosage: string;
        frequency: string;
      }>;
      doctorName: string;
      status: string;
    }>;
    warnings: string[];
    recommendations: string[];
  } | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [pastPrescriptions, setPastPrescriptions] = useState<
    Array<{
      id: string;
      date: string;
      diagnosis: string;
      doctorName: string;
      status: string;
      medications?: Array<{
        name: string;
        strength?: string;
        frequency?: string;
        duration?: string;
      }>;
      notes?: string;
    }>
  >([]);
  const [isLoadingPastPrescriptions, setIsLoadingPastPrescriptions] =
    useState(false);
  const [showPastPrescriptions, setShowPastPrescriptions] = useState(false);
  const [manualMedications, setManualMedications] = useState<
    Array<{
      name: string;
      strength: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>
  >([]);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false); // Load patients from API
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setIsLoadingPatients(true);
        const response = await fetch("/api/my-patients");
        const result = await response.json();
        console.log("Patients API response:", result); // Debug log
        if (result.patients) {
          setPatients(result.patients);
          setFilteredPatients(result.patients);
          console.log("Loaded patients:", result.patients.length); // Debug log
        } else {
          console.log("No patients in response, using mock data");
          setPatients(mockPatients);
          setFilteredPatients(mockPatients);
        }
      } catch (error) {
        console.error("Failed to load patients:", error);
        // Fallback to mock data
        setPatients(mockPatients);
        setFilteredPatients(mockPatients);
      } finally {
        setIsLoadingPatients(false);
      }
    };
    loadPatients();
  }, []);
  // Filter patients based on search query with improved matching
  useEffect(() => {
    if (!patientSearchQuery.trim()) {
      setFilteredPatients(patients);
      setShowPatientDropdown(false);
      setSelectedIndex(-1);
    } else {
      const query = patientSearchQuery.toLowerCase();
      const filtered = patients.filter((patient) => {
        const name = patient.name?.toLowerCase() || "";
        const id = (patient.id || patient._id || "").toLowerCase();
        const condition = patient.condition?.toLowerCase() || "";
        const phone = patient.phone?.toLowerCase() || "";

        // Score-based matching for better relevance
        return (
          name.includes(query) ||
          name.split(" ").some((part: string) => part.startsWith(query)) || // Match word starts
          id.includes(query) ||
          condition.includes(query) ||
          phone.includes(query)
        );
      });

      // Sort by relevance (name matches first, then ID, then others)
      filtered.sort((a, b) => {
        const aName = a.name?.toLowerCase() || "";
        const bName = b.name?.toLowerCase() || "";
        const aStartsWithQuery = aName.startsWith(query);
        const bStartsWithQuery = bName.startsWith(query);

        if (aStartsWithQuery && !bStartsWithQuery) return -1;
        if (!aStartsWithQuery && bStartsWithQuery) return 1;

        // Then sort alphabetically
        return aName.localeCompare(bName);
      });

      setFilteredPatients(filtered);
      setShowPatientDropdown(true);
      setSelectedIndex(-1);
    }
  }, [patientSearchQuery, patients]);
  const handlePatientSearch = (query: string) => {
    setPatientSearchQuery(query);
    if (!query.trim()) {
      setSelectedPatient(null);
      setPrescriptionStatus(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowPatientDropdown(false);
    };

    if (showPatientDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showPatientDropdown]);
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearchQuery(patient.name);
    setShowPatientDropdown(false);
    setSelectedIndex(-1);
    setPrescriptionStatus(null);
    const patientId = patient.id || patient._id;
    if (patientId) {
      checkPrescriptionStatus(patientId);
      loadPastPrescriptions(patientId);
    }
  };

  // Load past prescriptions for the selected patient
  const loadPastPrescriptions = async (patientId: string) => {
    setIsLoadingPastPrescriptions(true);
    try {
      const response = await fetch(`/api/prescriptions?patientId=${patientId}`);
      const result = await response.json();
      if (result.success) {
        setPastPrescriptions(result.data || []);
        setShowPastPrescriptions(result.data && result.data.length > 0);
      }
    } catch (error) {
      console.error("Failed to load past prescriptions:", error);
    } finally {
      setIsLoadingPastPrescriptions(false);
    }
  };

  // Add manual medication
  const addManualMedication = () => {
    setManualMedications([
      ...manualMedications,
      {
        name: "",
        strength: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  };

  // Remove manual medication
  const removeManualMedication = (index: number) => {
    setManualMedications(manualMedications.filter((_, i) => i !== index));
  };

  // Update manual medication
  const updateManualMedication = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...manualMedications];
    updated[index] = { ...updated[index], [field]: value };
    setManualMedications(updated);
  };

  // Save manual prescription
  const saveManualPrescription = async () => {
    if (!selectedPatient || manualMedications.length === 0) return;

    try {
      const response = await fetch("/api/ai-prescription-enhanced", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "save_prescription",
          prescription: {
            patientId: selectedPatient.id || selectedPatient._id,
            patientName: selectedPatient.name,
            doctorId: user?.id || "unknown",
            doctorName: user?.name || "Dr. Unknown",
            date: new Date().toISOString().split("T")[0],
            diagnosis: diagnosis || "Manual prescription",
            symptoms: symptoms.split(",").map((s: string) => s.trim()),
            medications: manualMedications,
            notes: customNotes || "Manual prescription created by doctor",
            status: "active",
            isAiGenerated: false,
            aiConfidence: 0,
            aiWarnings: [],
          },
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert("✅ Manual prescription saved successfully!");
        // Reset form
        setManualMedications([]);
        setSymptoms("");
        setDiagnosis("");
        setCustomNotes("");
        setShowPrescriptionModal(false);

        // Refresh prescription status and past prescriptions
        const patientId = selectedPatient.id || selectedPatient._id;
        if (patientId) {
          checkPrescriptionStatus(patientId);
          loadPastPrescriptions(patientId);
        }
      } else {
        throw new Error(result.error || "Failed to save prescription");
      }
    } catch (error) {
      console.error("Failed to save manual prescription:", error);
      alert("Failed to save prescription. Please try again.");
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showPatientDropdown || filteredPatients.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredPatients.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredPatients.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredPatients.length) {
          handlePatientSelect(filteredPatients[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowPatientDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Check prescription status when patient is selected
  const checkPrescriptionStatus = async (patientId: string) => {
    setIsCheckingStatus(true);
    try {
      const response = await fetch(
        `/api/prescription-status?patientId=${patientId}`
      );
      const result = await response.json();
      if (result.success) {
        setPrescriptionStatus(result.data);
      }
    } catch (error) {
      console.error("Failed to check prescription status:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };
  const handleGeneratePrescription = async () => {
    if (!selectedPatient || !symptoms) return;

    const patientId = selectedPatient.id || selectedPatient._id;
    if (!patientId) {
      console.error("Patient ID is missing");
      return;
    }

    // Just show informational note about past prescriptions, but don't block
    if (prescriptionStatus?.hasActivePrescriptions) {
      console.log(
        `Info: Patient has ${prescriptionStatus.activePrescriptions.length} active prescription(s). AI will consider these for context.`
      );
    }

    setIsGenerating(true);

    try {
      // Use the new enhanced AI prescription service with Gemini integration
      const response = await fetch("/api/ai-prescription-enhanced", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "analyze_and_generate",
          patientId: patientId,
          symptoms: symptoms.split(",").map((s) => s.trim()),
          diagnosis: diagnosis || undefined,
          doctorId: user?.id || "unknown",
          doctorName: user?.name || "Dr. Unknown",
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Transform the AI response to match the expected format
        const aiResponse: AiPrescriptionResponse = {
          medications: result.prescription.medications || [],
          reasoning:
            result.aiInsights?.reasoning ||
            result.prescription.aiAnalysis?.reasoning ||
            "AI analysis completed",
          confidence:
            result.aiInsights?.confidence ||
            result.prescription.aiConfidence ||
            0.7,
          warnings: [
            ...(result.aiInsights?.conflictWarnings || []),
            ...(result.historyAnalysis?.warnings || []),
          ],
          alternatives: [], // Can be enhanced later
        };

        setAiResponse(aiResponse);
        setIsManualMode(false);
        setShowPrescriptionModal(true);
      } else {
        console.error("AI prescription generation failed:", result.error);
        // Show manual prescription option when AI fails
        setIsManualMode(true);
        setShowPrescriptionModal(true);
      }
    } catch (error) {
      console.error("Error generating prescription:", error);
      // Show manual prescription option when AI fails
      setIsManualMode(true);
      setShowPrescriptionModal(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!selectedPatient || !aiResponse) return;

    try {
      // Use the enhanced AI prescription API to save
      const response = await fetch("/api/ai-prescription-enhanced", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "save_prescription",
          prescription: {
            patientId: selectedPatient.id || selectedPatient._id,
            patientName: selectedPatient.name,
            doctorId: user?.id || "unknown",
            doctorName: user?.name || "Dr. Unknown",
            date: new Date().toISOString().split("T")[0],
            diagnosis: diagnosis || "AI-generated from symptoms",
            symptoms: symptoms.split(",").map((s) => s.trim()),
            medications: aiResponse.medications,
            notes: `${customNotes ? customNotes + "\n\n" : ""}AI Analysis:\n${
              aiResponse.reasoning
            }`,
            status: "active",
            isAiGenerated: true,
            aiConfidence: aiResponse.confidence,
            aiWarnings: aiResponse.warnings || [],
          },
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(
          "✅ Prescription saved successfully! The AI analyzed patient history and provided safe recommendations."
        );

        // Reset form
        setAiResponse(null);
        setSymptoms("");
        setDiagnosis("");
        setCustomNotes("");

        // Refresh prescription status and past prescriptions
        const patientId = selectedPatient.id || selectedPatient._id;
        if (patientId) {
          checkPrescriptionStatus(patientId);
          loadPastPrescriptions(patientId);
        }
      } else {
        throw new Error(result.error || "Failed to save prescription");
      }
    } catch (error) {
      console.error("Failed to save prescription:", error);
      alert("Failed to save prescription. Please try again.");
    }
  };
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Page Header */}
      <motion.div
        className="flex items-center gap-4 pb-6 border-b border-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }}>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hover:shadow-md transition-all duration-200"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </motion.div>
        <div className="flex-1 group">
          <motion.h1
            className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            New Prescription
          </motion.h1>
          <motion.p
            className="text-muted-foreground transition-all duration-300 ease-out group-hover:text-green-600 group-hover:translate-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {" "}
            Generate AI-powered prescriptions based on symptoms and diagnosis
          </motion.p>
        </div>
      </motion.div>
      <div className="grid gap-6 lg:grid-cols-3">
        {" "}
        {/* Left Column - Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <User className="h-5 w-5 text-blue-600" />
                  </motion.div>
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {" "}
                <div className="space-y-2 relative">
                  <Label htmlFor="patient" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Patient
                  </Label>{" "}
                  <Input
                    id="patient"
                    type="text"
                    placeholder={
                      isLoadingPatients
                        ? "Loading patients..."
                        : "Type patient name, ID, or condition to search..."
                    }
                    value={patientSearchQuery}
                    onChange={(e) => handlePatientSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoadingPatients}
                    className="w-full"
                    autoComplete="off"
                  />
                  {/* Search Results Dropdown */}
                  {showPatientDropdown && filteredPatients.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredPatients.map((patient, index) => {
                        const isSelected = index === selectedIndex;
                        const searchTerm = patientSearchQuery.toLowerCase();

                        // Highlight matching text
                        const highlightText = (text: string) => {
                          if (!searchTerm) return text;
                          const regex = new RegExp(`(${searchTerm})`, "gi");
                          const parts = text.split(regex);
                          return parts.map((part, i) =>
                            regex.test(part) ? (
                              <mark
                                key={`highlight-${i}`}
                                className="bg-yellow-200 dark:bg-yellow-800 text-inherit px-0"
                              >
                                {part}
                              </mark>
                            ) : (
                              <span key={`text-${i}`}>{part}</span>
                            )
                          );
                        };

                        return (
                          <div
                            key={patient.id || patient._id}
                            onClick={() => handlePatientSelect(patient)}
                            className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors ${
                              isSelected
                                ? "bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {highlightText(patient.name)}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  ID:{" "}
                                  {highlightText(
                                    patient.id || patient._id || ""
                                  )}{" "}
                                  • {patient.age}y, {patient.gender}
                                </div>
                                {patient.condition && (
                                  <div className="text-xs text-blue-600 dark:text-blue-400">
                                    {highlightText(patient.condition)}
                                  </div>
                                )}
                                {patient.phone && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    📞 {highlightText(patient.phone)}
                                  </div>
                                )}
                              </div>
                              <ChevronRight
                                className={`h-4 w-4 ${
                                  isSelected ? "text-blue-500" : "text-gray-400"
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {showPatientDropdown &&
                    filteredPatients.length === 0 &&
                    patientSearchQuery.trim() && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-4">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          No patients found matching &quot;{patientSearchQuery}
                          &quot;
                        </div>
                        <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
                          Try searching by name, ID, condition, or phone number
                        </div>
                      </div>
                    )}
                  {/* Keyboard navigation help */}
                  {showPatientDropdown && filteredPatients.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-4">
                      <span>↑↓ Navigate</span>
                      <span>↵ Select</span>
                      <span>Esc Close</span>
                    </div>
                  )}
                </div>
                {selectedPatient && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/api/placeholder/40/40" />{" "}
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {selectedPatient.name
                            ? selectedPatient.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                            : "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{selectedPatient.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.age} years old,{" "}
                          {selectedPatient.gender}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          Allergies
                        </Label>{" "}
                        <div className="mt-1">
                          {selectedPatient.allergies &&
                          selectedPatient.allergies.length > 0 ? (
                            selectedPatient.allergies.map(
                              (allergy: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="destructive"
                                  className="mr-1 mb-1"
                                >
                                  {allergy}
                                </Badge>
                              )
                            )
                          ) : (
                            <span className="text-muted-foreground">
                              None reported
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          Current Medications
                        </Label>{" "}
                        <div className="mt-1">
                          {(
                            selectedPatient.currentMedications ||
                            selectedPatient.medications ||
                            []
                          ).length > 0 ? (
                            (
                              selectedPatient.currentMedications ||
                              selectedPatient.medications ||
                              []
                            ).map((med: string, index: number) => (
                              <div key={index} className="text-sm">
                                {med}
                              </div>
                            ))
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          Medical History
                        </Label>{" "}
                        <div className="mt-1">
                          {(
                            selectedPatient.medicalHistory || [
                              selectedPatient.condition,
                            ] ||
                            []
                          ).filter(Boolean).length > 0 ? (
                            (
                              selectedPatient.medicalHistory || [
                                selectedPatient.condition,
                              ] ||
                              []
                            )
                              .filter(Boolean)
                              .map(
                                (
                                  condition: string | undefined,
                                  index: number
                                ) =>
                                  condition ? (
                                    <div key={index} className="text-sm">
                                      {condition}
                                    </div>
                                  ) : null
                              )
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </div>
                      </div>{" "}
                    </div>
                  </div>
                )}
                {/* Prescription Status Check */}
                {selectedPatient && (
                  <div className="space-y-3">
                    {isCheckingStatus && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          Checking prescription history...
                        </span>
                      </div>
                    )}{" "}
                    {prescriptionStatus &&
                      (prescriptionStatus.hasActivePrescriptions ||
                        prescriptionStatus.hasRecentPrescriptions) && (
                        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <AlertTitle className="text-blue-800 dark:text-blue-200">
                            Prescription History Available
                          </AlertTitle>
                          <AlertDescription className="text-blue-700 dark:text-blue-300">
                            <div className="space-y-2">
                              <div className="text-sm">
                                ℹ️ AI will analyze past prescriptions for better
                                recommendations.
                              </div>
                              {prescriptionStatus.recommendations.map(
                                (rec, index) => (
                                  <div key={index} className="text-sm">
                                    📋 {rec}
                                  </div>
                                )
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}{" "}
                    {prescriptionStatus &&
                      prescriptionStatus.activePrescriptions.length > 0 && (
                        <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Stethoscope className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              Current Prescriptions (
                              {prescriptionStatus.activePrescriptions.length})
                            </span>
                          </div>
                          <div className="space-y-2">
                            {prescriptionStatus.activePrescriptions
                              .slice(0, 2)
                              .map((prescription, index) => (
                                <div
                                  key={index}
                                  className="text-xs p-2 bg-white dark:bg-gray-800 rounded border"
                                >
                                  <div className="font-medium">
                                    {prescription.diagnosis}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {prescription.date} - Dr.{" "}
                                    {prescription.doctorName}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {prescription.medications?.length || 0}{" "}
                                    medication(s)
                                  </div>
                                </div>
                              ))}
                            {prescriptionStatus.activePrescriptions.length >
                              2 && (
                              <div className="text-xs text-muted-foreground">
                                +
                                {prescriptionStatus.activePrescriptions.length -
                                  2}{" "}
                                more active prescriptions
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    {prescriptionStatus &&
                      !prescriptionStatus.hasActivePrescriptions &&
                      !prescriptionStatus.hasRecentPrescriptions && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700 dark:text-green-300">
                            No active or recent prescriptions found. Safe to
                            prescribe.
                          </span>
                        </div>
                      )}{" "}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>{" "}
          {/* Past Prescriptions History */}
          {selectedPatient && showPastPrescriptions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Bot className="h-5 w-5 text-purple-600" />
                    </motion.div>
                    Past Prescriptions History
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900"
                      >
                        {pastPrescriptions.length} records
                      </Badge>
                    </motion.div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingPastPrescriptions ? (
                    <div className="flex items-center gap-2 p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Loading prescription history...
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                        <Brain className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800 dark:text-blue-200">
                          AI Analysis with Historical Context
                        </AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-300">
                          The AI will analyze these past prescriptions along
                          with current symptoms to provide safe, personalized
                          recommendations and detect potential drug
                          interactions.
                        </AlertDescription>
                      </Alert>

                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {pastPrescriptions
                          .slice(0, 5)
                          .map((prescription, index) => (
                            <div
                              key={index}
                              className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      prescription.status === "active"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {prescription.status}
                                  </Badge>
                                  <span className="text-sm font-medium">
                                    {prescription.diagnosis}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {prescription.date}
                                </span>
                              </div>

                              <div className="text-sm text-muted-foreground mb-2">
                                Dr. {prescription.doctorName}
                              </div>

                              {prescription.medications &&
                                prescription.medications.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="text-xs font-medium text-muted-foreground">
                                      Medications:
                                    </div>
                                    {prescription.medications.slice(0, 3).map(
                                      (
                                        med: {
                                          name: string;
                                          strength?: string;
                                          frequency?: string;
                                          duration?: string;
                                        },
                                        medIndex: number
                                      ) => (
                                        <div
                                          key={medIndex}
                                          className="text-xs p-2 bg-white dark:bg-gray-700 rounded border"
                                        >
                                          <span className="font-medium">
                                            {med.name}
                                          </span>
                                          {med.strength && (
                                            <span className="text-muted-foreground">
                                              {" "}
                                              • {med.strength}
                                            </span>
                                          )}
                                          {med.frequency && (
                                            <span className="text-muted-foreground">
                                              {" "}
                                              • {med.frequency}
                                            </span>
                                          )}
                                          {med.duration && (
                                            <span className="text-muted-foreground">
                                              {" "}
                                              • {med.duration}
                                            </span>
                                          )}
                                        </div>
                                      )
                                    )}
                                    {prescription.medications.length > 3 && (
                                      <div className="text-xs text-muted-foreground">
                                        +{prescription.medications.length - 3}{" "}
                                        more medications
                                      </div>
                                    )}
                                  </div>
                                )}

                              {prescription.notes && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  <div className="font-medium">Notes:</div>
                                  <div className="line-clamp-2">
                                    {prescription.notes}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                        {pastPrescriptions.length > 5 && (
                          <div className="text-center py-2">
                            <Badge variant="outline" className="text-xs">
                              +{pastPrescriptions.length - 5} more prescriptions
                              in history
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}{" "}
          {/* Symptoms and Diagnosis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Stethoscope className="h-5 w-5 text-green-600" />
                  </motion.div>
                  Clinical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms *</Label>{" "}
                  <Textarea
                    id="symptoms"
                    placeholder="Enter patient symptoms (comma-separated)"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: headache, fever, muscle aches, fatigue
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input
                    id="diagnosis"
                    placeholder="Enter preliminary diagnosis (optional)"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>{" "}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Button
                    onClick={handleGeneratePrescription}
                    disabled={!selectedPatient || !symptoms || isGenerating}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Patient History & Generating Smart
                        Prescription...
                      </>
                    ) : (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Brain className="h-4 w-4 mr-2" />
                        </motion.div>
                        Generate Intelligent Prescription
                      </>
                    )}
                  </Button>
                </motion.div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="text-sm text-muted-foreground px-2">or</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>{" "}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Button
                    onClick={() => {
                      setIsManualMode(true);
                      setShowPrescriptionModal(true);
                    }}
                    disabled={!selectedPatient}
                    variant="outline"
                    className="w-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-600 dark:hover:bg-blue-950/50 transition-all duration-300 shadow-md hover:shadow-lg"
                    size="lg"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                    </motion.div>
                    Create Manual Prescription
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>{" "}
        {/* Right Column - Alternatives and Tips */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* AI Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Bot className="h-5 w-5 text-indigo-600" />
                  </motion.div>
                  AI Assistant Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Be specific with symptoms for better recommendations</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Include symptom duration and severity when possible</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Review patient allergies and current medications</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Always review AI suggestions before prescribing</p>{" "}
                </div>
              </CardContent>
            </Card>
          </motion.div>{" "}
          {/* Alternative Medications */}
          {aiResponse?.alternatives && aiResponse.alternatives.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/30">
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Alternative Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {" "}
                  {aiResponse.alternatives.map((alt, index) => (
                    <motion.div
                      key={alt.id || `alt-${index}`}
                      className="p-3 border rounded-lg hover:shadow-md transition-all duration-200 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                    >
                      <h5 className="font-medium">{alt.name}</h5>
                      <p className="text-sm text-muted-foreground">
                        {alt.strength} {alt.form}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alt.frequency}
                      </p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>{" "}
      {/* Prescription Modal */}
      <Dialog
        open={showPrescriptionModal}
        onOpenChange={setShowPrescriptionModal}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/30 border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isManualMode ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Edit3 className="h-5 w-5 text-blue-600" />
                  </motion.div>
                  <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Manual Prescription Entry
                  </span>
                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Brain className="h-5 w-5 text-purple-600" />
                  </motion.div>
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    AI Generated Prescription
                  </span>
                  {aiResponse && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900"
                      >
                        {Math.round(aiResponse.confidence * 100)}% Confidence
                      </Badge>
                    </motion.div>
                  )}
                </>
              )}
            </DialogTitle>{" "}
            <DialogDescription>
              {isManualMode
                ? "Create a prescription manually. Fill in the medication details below."
                : "Review the AI-generated prescription and add any additional notes before saving."}
            </DialogDescription>
          </DialogHeader>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {" "}
            {/* AI Mode - Show AI Response */}
            {!isManualMode && aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {/* AI Reasoning */}
                <Alert>
                  <Bot className="h-4 w-4" />
                  <AlertTitle>Intelligent Analysis</AlertTitle>
                  <AlertDescription>{aiResponse.reasoning}</AlertDescription>
                </Alert>
                {/* Warnings if any */}
                {aiResponse.warnings && aiResponse.warnings.length > 0 && (
                  <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-orange-800 dark:text-orange-200">
                      AI Safety Warnings
                    </AlertTitle>
                    <AlertDescription className="text-orange-700 dark:text-orange-300">
                      <ul className="space-y-1">
                        {aiResponse.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-orange-600">•</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}{" "}
                {/* AI Medications */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h4 className="font-medium bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Recommended Medications
                  </h4>
                  {aiResponse.medications.map((med, medIndex) => (
                    <motion.div
                      key={med.id || `med-${medIndex}`}
                      className="p-4 border rounded-lg space-y-2 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50/50 to-green-50/50 dark:from-blue-950/50 dark:to-green-950/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: medIndex * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium">{med.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {med.genericName} - {med.strength} {med.form}
                          </p>
                        </div>
                        {med.cost && (
                          <Badge variant="outline">${med.cost}</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Dosage
                          </Label>
                          <p>{med.dosage}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Frequency
                          </Label>
                          <p>{med.frequency}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Duration
                          </Label>
                          <p>{med.duration}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Quantity
                          </Label>
                          <p>{med.quantity}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Instructions
                        </Label>
                        <p className="text-sm">{med.instructions}</p>
                      </div>

                      {med.sideEffects && med.sideEffects.length > 0 && (
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Side Effects
                          </Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {med.sideEffects.map((effect, idx) => (
                              <Badge
                                key={`side-effect-${medIndex}-${idx}`}
                                variant="outline"
                                className="text-xs"
                              >
                                {effect}
                              </Badge>
                            ))}
                          </div>{" "}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
            {/* Manual Mode - Show Manual Entry Form */}
            {isManualMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950 dark:to-indigo-950">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                  </motion.div>
                  <AlertTitle className="text-blue-800 dark:text-blue-200">
                    Manual Prescription Mode
                  </AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    AI analysis was not available. Please carefully review
                    patient history and allergies before prescribing manually.
                  </AlertDescription>
                </Alert>

                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Medications</h4>
                    <Button
                      onClick={addManualMedication}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Medication
                    </Button>
                  </div>

                  {manualMedications.length === 0 && (
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-muted-foreground">
                        No medications added yet
                      </p>
                      <Button
                        onClick={addManualMedication}
                        variant="outline"
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Medication
                      </Button>
                    </div>
                  )}

                  {manualMedications.map((med, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Medication {index + 1}</h5>
                        <Button
                          onClick={() => removeManualMedication(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Medication Name *</Label>
                          <Input
                            placeholder="e.g., Ibuprofen"
                            value={med.name}
                            onChange={(e) =>
                              updateManualMedication(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Strength *</Label>
                          <Input
                            placeholder="e.g., 400mg"
                            value={med.strength}
                            onChange={(e) =>
                              updateManualMedication(
                                index,
                                "strength",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Frequency *</Label>
                          <Input
                            placeholder="e.g., 3 times daily"
                            value={med.frequency}
                            onChange={(e) =>
                              updateManualMedication(
                                index,
                                "frequency",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration *</Label>
                          <Input
                            placeholder="e.g., 7 days"
                            value={med.duration}
                            onChange={(e) =>
                              updateManualMedication(
                                index,
                                "duration",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Instructions</Label>
                        <Textarea
                          placeholder="e.g., Take with food to reduce stomach upset"
                          value={med.instructions}
                          onChange={(e) =>
                            updateManualMedication(
                              index,
                              "instructions",
                              e.target.value
                            )
                          }
                          rows={2}
                        />{" "}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}{" "}
            {/* Additional Notes (for both modes) */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Label
                htmlFor="notes"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-medium"
              >
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or modifications..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={3}
                className="bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30 border-0 shadow-md focus:shadow-lg transition-all duration-300"
              />
            </motion.div>
            {/* Action Buttons */}
            <motion.div
              className="flex gap-3 pt-4 border-t"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {isManualMode ? (
                <>
                  <Button
                    onClick={saveManualPrescription}
                    className="flex-1"
                    disabled={
                      manualMedications.length === 0 ||
                      manualMedications.some(
                        (med) =>
                          !med.name ||
                          !med.strength ||
                          !med.frequency ||
                          !med.duration
                      )
                    }
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Manual Prescription
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsManualMode(false);
                      setShowPrescriptionModal(false);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleSavePrescription} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save AI Prescription
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsManualMode(true);
                      setManualMedications([]);
                    }}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Switch to Manual
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPrescriptionModal(false)}
                  >
                    Close
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
