"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
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
  Printer,
} from "lucide-react";
import { AiPrescriptionRequest, AiPrescriptionResponse } from "@/types/prescription";
import Link from "next/link";

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
 * Mock AI service for prescription generation
 */
async function generateAiPrescription(request: AiPrescriptionRequest): Promise<AiPrescriptionResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
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
        cost: 12.50,
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
      }
    ],
    reasoning: "Based on the reported symptoms of headache and muscle pain, I recommend a combination approach with both anti-inflammatory (Ibuprofen) and analgesic (Acetaminophen) medications. This provides comprehensive pain relief while minimizing individual drug dosages.",
    confidence: 0.87,
    warnings: [
      "Monitor for stomach upset with Ibuprofen",
      "Ensure adequate hydration",
      "Follow up if symptoms persist beyond 7 days"
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
      }
    ]
  };
  
  return mockResponse;
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
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0] | null>(null);
  const [symptoms, setSymptoms] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<AiPrescriptionResponse | null>(null);
  const [customNotes, setCustomNotes] = useState<string>("");

  const handleGeneratePrescription = async () => {
    if (!selectedPatient || !symptoms) return;

    setIsGenerating(true);
    
    try {
      const request: AiPrescriptionRequest = {
        patientId: selectedPatient.id,
        symptoms: symptoms.split(",").map(s => s.trim()),
        diagnosis: diagnosis || undefined,
        allergies: selectedPatient.allergies,
        currentMedications: selectedPatient.currentMedications,
        medicalHistory: selectedPatient.medicalHistory,
        age: selectedPatient.age,
        gender: selectedPatient.gender,
      };

      const response = await generateAiPrescription(request);
      setAiResponse(response);
    } catch (error) {
      console.error("Failed to generate prescription:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePrescription = () => {
    // In a real app, this would save to the database
    console.log("Saving prescription...");
    alert("Prescription saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/prescriptions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Prescriptions
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">New Prescription</h1>
          <p className="text-muted-foreground">
            Generate AI-powered prescriptions based on symptoms and diagnosis
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Select Patient</Label>
                <Select onValueChange={(value) => {
                  const patient = mockPatients.find(p => p.id === value);
                  setSelectedPatient(patient || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} - {patient.age}y, {patient.gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPatient && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/api/placeholder/40/40" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedPatient.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{selectedPatient.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedPatient.age} years old, {selectedPatient.gender}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        Allergies
                      </Label>
                      <div className="mt-1">
                        {selectedPatient.allergies.length > 0 ? (
                          selectedPatient.allergies.map((allergy, index) => (
                            <Badge key={index} variant="destructive" className="mr-1 mb-1">
                              {allergy}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">None reported</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        Current Medications
                      </Label>
                      <div className="mt-1">
                        {selectedPatient.currentMedications.length > 0 ? (
                          selectedPatient.currentMedications.map((med, index) => (
                            <div key={index} className="text-sm">{med}</div>
                          ))
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        Medical History
                      </Label>
                      <div className="mt-1">
                        {selectedPatient.medicalHistory.length > 0 ? (
                          selectedPatient.medicalHistory.map((condition, index) => (
                            <div key={index} className="text-sm">{condition}</div>
                          ))
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Symptoms and Diagnosis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Clinical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms *</Label>
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
              </div>

              <Button 
                onClick={handleGeneratePrescription}
                disabled={!selectedPatient || !symptoms || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating AI Prescription...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Generate AI Prescription
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* AI Generated Prescription */}
          {aiResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Generated Prescription
                  <Badge variant="secondary" className="ml-2">
                    {Math.round(aiResponse.confidence * 100)}% Confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AI Reasoning */}
                <Alert>
                  <Bot className="h-4 w-4" />
                  <AlertTitle>AI Reasoning</AlertTitle>
                  <AlertDescription>{aiResponse.reasoning}</AlertDescription>
                </Alert>

                {/* Medications */}
                <div className="space-y-4">
                  <h4 className="font-medium">Recommended Medications</h4>
                  {aiResponse.medications.map((med, index) => (
                    <div key={med.id} className="p-4 border rounded-lg space-y-2">
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
                          <Label className="text-xs text-muted-foreground">Dosage</Label>
                          <p>{med.dosage}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Frequency</Label>
                          <p>{med.frequency}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Duration</Label>
                          <p>{med.duration}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Quantity</Label>
                          <p>{med.quantity}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Instructions</Label>
                        <p className="text-sm">{med.instructions}</p>
                      </div>

                      {med.sideEffects && med.sideEffects.length > 0 && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Side Effects</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {med.sideEffects.map((effect, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {effect}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Warnings */}
                {aiResponse.warnings.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Important Warnings</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {aiResponse.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes or modifications..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button onClick={handleSavePrescription} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Prescription
                  </Button>
                  <Button variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Alternatives and Tips */}
        <div className="space-y-6">
          {/* AI Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
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
                <p>Always review AI suggestions before prescribing</p>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Medications */}
          {aiResponse?.alternatives && aiResponse.alternatives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Alternative Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiResponse.alternatives.map((alt, index) => (
                  <div key={alt.id || index} className="p-3 border rounded-lg">
                    <h5 className="font-medium">{alt.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      {alt.strength} {alt.form}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alt.frequency}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
