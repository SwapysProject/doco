"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Lightbulb,
  Activity,
  Heart,
  Clock,
  Star,
  Loader2,
  Zap,
  Target,
  Award,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: number;
  allergies?: string[];
  currentMedications?: string[];
  medicalHistory?: string[];
}

interface Medication {
  name: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface McpAssistantProps {
  patient: Patient | null;
  currentPrescription?: {
    medications: Medication[];
    diagnosis?: string;
    symptoms?: string[];
  };
  onMcpRecommendation?: (recommendation: any) => void;
}

interface McpResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export function McpAssistant({
  patient,
  currentPrescription,
  onMcpRecommendation,
}: McpAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeInsight, setActiveInsight] = useState<string>("context");
  const [mcpData, setMcpData] = useState<{
    patientContext?: any;
    safetyCheck?: any;
    improvements?: any;
    interactions?: any;
    preferences?: any;
  }>({});
  // Call MCP API helper
  const callMcp = async (action: string, params: any): Promise<McpResponse> => {
    console.log(`🚀 UI: Starting MCP call for action: ${action}`);
    console.log(`📋 UI: Parameters:`, params);
    console.log(`👤 UI: Patient: ${patient?.name} (${patient?.id})`);
    console.log(`⏰ UI: Timestamp: ${new Date().toISOString()}`);

    try {
      console.log(`📡 UI: Sending MCP request to /api/mcp-prescription`);
      const startTime = performance.now();

      const response = await fetch("/api/mcp-prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...params }),
      });

      const endTime = performance.now();
      console.log(`⏱️ UI: MCP call took ${Math.round(endTime - startTime)}ms`);

      const data = await response.json();
      console.log(`✅ UI: MCP call completed for action: ${action}`);
      console.log(`📊 UI: Response data:`, data);
      console.log(`🎯 UI: MCP Success: ${data.success}`);

      if (!data.success) {
        console.error(`❌ UI: MCP returned error:`, data.error);
      }

      return data;
    } catch (error) {
      console.error(`❌ UI: MCP API Error for action ${action}:`, error);
      return { success: false, error: "Failed to connect to MCP server" };
    }
  };

  // Load enhanced patient context when patient changes
  useEffect(() => {
    if (patient?.id) {
      loadPatientContext();
    }
  }, [patient?.id]);

  // Validate prescription safety when prescription changes
  useEffect(() => {
    if (patient?.id && currentPrescription?.medications?.length) {
      validatePrescriptionSafety();
      checkDrugInteractions();
      suggestImprovements();
    }
  }, [patient?.id, currentPrescription]);
  const loadPatientContext = async () => {
    if (!patient?.id) return;

    console.log(`🔍 UI: Loading enhanced patient context for ${patient.name}`);
    setIsLoading(true);
    const result = await callMcp("get_enhanced_patient_context", {
      patientId: patient.id,
    });

    if (result.success && result.data?.content?.[0]?.text) {
      try {
        const contextData = JSON.parse(result.data.content[0].text);
        console.log(
          `✅ UI: Patient context loaded successfully:`,
          contextData.enhancedContext
        );
        setMcpData((prev) => ({
          ...prev,
          patientContext: contextData.enhancedContext,
        }));
      } catch (error) {
        console.error("❌ UI: Error parsing patient context:", error);
      }
    }
    setIsLoading(false);
  };

  const validatePrescriptionSafety = async () => {
    if (!patient?.id || !currentPrescription?.medications) return;

    console.log(`🛡️ UI: Validating prescription safety for ${patient.name}`);
    console.log(
      `💊 UI: Checking ${currentPrescription.medications.length} medications`
    );

    const result = await callMcp("validate_prescription_safety", {
      patientId: patient.id,
      medications: currentPrescription.medications,
    });

    if (result.success && result.data?.content?.[0]?.text) {
      try {
        const safetyData = JSON.parse(result.data.content[0].text);
        console.log(
          `✅ UI: Safety validation complete:`,
          safetyData.safetyAssessment
        );
        setMcpData((prev) => ({
          ...prev,
          safetyCheck: safetyData.safetyAssessment,
        }));
      } catch (error) {
        console.error("❌ UI: Error parsing safety data:", error);
      }
    }
  };

  const checkDrugInteractions = async () => {
    if (!patient?.id || !currentPrescription?.medications) return;

    const medicationNames = currentPrescription.medications.map((m) => m.name);
    console.log(
      `⚠️ UI: Checking drug interactions for medications: ${medicationNames.join(", ")}`
    );

    const result = await callMcp("check_drug_interactions", {
      patientId: patient.id,
      newMedications: medicationNames,
    });

    if (result.success && result.data?.content?.[0]?.text) {
      try {
        const interactionData = JSON.parse(result.data.content[0].text);
        setMcpData((prev) => ({
          ...prev,
          interactions: interactionData.drugInteractionAnalysis,
        }));
      } catch (error) {
        console.error("Error parsing interaction data:", error);
      }
    }
  };

  const suggestImprovements = async () => {
    if (!patient?.id || !currentPrescription) return;

    const result = await callMcp("suggest_prescription_improvements", {
      patientId: patient.id,
      currentPrescription,
      symptoms: currentPrescription.symptoms || [],
    });

    if (result.success && result.data?.content?.[0]?.text) {
      try {
        const improvementData = JSON.parse(result.data.content[0].text);
        setMcpData((prev) => ({
          ...prev,
          improvements: improvementData.prescriptionImprovements,
        }));
      } catch (error) {
        console.error("Error parsing improvement data:", error);
      }
    }
  };

  const loadDoctorPreferences = async () => {
    const result = await callMcp("get_doctor_preferences", {
      doctorId: "DOC001", // Should be from auth context
      symptoms: currentPrescription?.symptoms || [],
      diagnosis: currentPrescription?.diagnosis,
    });

    if (result.success && result.data?.content?.[0]?.text) {
      try {
        const preferenceData = JSON.parse(result.data.content[0].text);
        setMcpData((prev) => ({
          ...prev,
          preferences: preferenceData.doctorPreferences,
        }));
      } catch (error) {
        console.error("Error parsing preference data:", error);
      }
    }
  };

  if (!patient) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            MCP Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Select a patient to activate MCP assistance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          MCP Assistant
          <Badge variant="outline" className="ml-auto">
            <Zap className="h-3 w-3 mr-1" />
            AI Enhanced
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeInsight}
          onValueChange={setActiveInsight}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="context" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Context
            </TabsTrigger>
            <TabsTrigger value="safety" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Safety
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">
              <Lightbulb className="h-3 w-3 mr-1" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="prefs" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Prefs
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 h-96 overflow-y-auto">
            <TabsContent value="context" className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Enhanced Patient Context
              </h4>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {mcpData.patientContext && (
                    <>
                      <Alert
                        className={`border-l-4 ${
                          mcpData.patientContext.riskLevel === "HIGH"
                            ? "border-l-red-500"
                            : mcpData.patientContext.riskLevel === "MEDIUM"
                              ? "border-l-yellow-500"
                              : "border-l-green-500"
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>
                          Risk Level: {mcpData.patientContext.riskLevel}
                        </AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc list-inside text-sm">
                            {mcpData.patientContext.keyRiskFactors?.map(
                              (factor: string, idx: number) => (
                                <li key={idx}>{factor}</li>
                              )
                            )}
                          </ul>
                        </AlertDescription>
                      </Alert>

                      {mcpData.patientContext.treatmentHistory && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">
                              Treatment History
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                Total Prescriptions:{" "}
                                {
                                  mcpData.patientContext.treatmentHistory
                                    .totalPrescriptions
                                }
                              </div>
                              <div>
                                Recent Treatments:{" "}
                                {mcpData.patientContext.treatmentHistory
                                  .recentTreatments?.length || 0}
                              </div>
                            </div>

                            {mcpData.patientContext.treatmentHistory
                              .commonMedications?.length > 0 && (
                              <div>
                                <p className="font-medium text-sm mb-1">
                                  Common Medications:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {mcpData.patientContext.treatmentHistory.commonMedications
                                    .slice(0, 3)
                                    .map((med: any, idx: number) => (
                                      <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {med.medication} ({med.frequency}x)
                                      </Badge>
                                    ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="safety" className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Safety Assessment
              </h4>

              {mcpData.safetyCheck && (
                <div className="space-y-3">
                  <Alert
                    className={`border-l-4 ${
                      mcpData.safetyCheck.overallSafety === "UNSAFE"
                        ? "border-l-red-500"
                        : mcpData.safetyCheck.overallSafety === "CAUTION"
                          ? "border-l-yellow-500"
                          : "border-l-green-500"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <AlertTitle>
                      Overall Safety: {mcpData.safetyCheck.overallSafety}
                    </AlertTitle>
                  </Alert>

                  {mcpData.safetyCheck.allergyConflicts?.length > 0 && (
                    <Card className="border-red-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-red-600">
                          Allergy Conflicts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {mcpData.safetyCheck.allergyConflicts.map(
                          (conflict: any, idx: number) => (
                            <div
                              key={idx}
                              className="text-sm p-2 bg-red-50 rounded"
                            >
                              <strong>{conflict.medication}</strong> conflicts
                              with allergy: {conflict.allergy}
                            </div>
                          )
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {mcpData.safetyCheck.drugInteractions?.length > 0 && (
                    <Card className="border-yellow-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-yellow-600">
                          Drug Interactions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {mcpData.safetyCheck.drugInteractions.map(
                          (interaction: any, idx: number) => (
                            <div
                              key={idx}
                              className="text-sm p-2 bg-yellow-50 rounded mb-2"
                            >
                              <div>
                                <strong>{interaction.newMedication}</strong> +{" "}
                                {interaction.existingMedication}
                              </div>
                              <div className="text-gray-600">
                                {interaction.recommendation}
                              </div>
                            </div>
                          )
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {mcpData.interactions && (
                <div className="space-y-2">
                  {mcpData.interactions.major?.length > 0 && (
                    <Alert className="border-l-4 border-l-red-500">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>
                        Major Interactions ({mcpData.interactions.major.length})
                      </AlertTitle>
                      <AlertDescription className="text-sm">
                        {mcpData.interactions.major
                          .slice(0, 2)
                          .map((interaction: any, idx: number) => (
                            <div key={idx}>
                              {interaction.newMedication} +{" "}
                              {interaction.existingMedication}
                            </div>
                          ))}
                      </AlertDescription>
                    </Alert>
                  )}

                  {mcpData.interactions.recommendations?.length > 0 && (
                    <div className="text-sm space-y-1">
                      {mcpData.interactions.recommendations.map(
                        (rec: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 mt-0.5 text-green-500" />
                            <span>{rec}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                AI Insights & Improvements
              </h4>

              {mcpData.improvements && (
                <div className="space-y-3">
                  {mcpData.improvements.dosageOptimization?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Dosage Optimization
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {mcpData.improvements.dosageOptimization.map(
                          (opt: any, idx: number) => (
                            <div
                              key={idx}
                              className="text-sm p-2 bg-blue-50 rounded mb-2"
                            >
                              <div className="font-medium">
                                {opt.recommendation}
                              </div>
                              <div className="text-gray-600">{opt.reason}</div>
                            </div>
                          )
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {mcpData.improvements.efficacyImprovements?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Efficacy Improvements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {mcpData.improvements.efficacyImprovements.map(
                          (imp: any, idx: number) => (
                            <div
                              key={idx}
                              className="text-sm p-2 bg-green-50 rounded mb-2"
                            >
                              <div className="font-medium">
                                {imp.recommendation}
                              </div>
                              {imp.successfulMedications && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {imp.successfulMedications
                                    .slice(0, 3)
                                    .map((med: string, medIdx: number) => (
                                      <Badge
                                        key={medIdx}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {med}
                                      </Badge>
                                    ))}
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {mcpData.improvements.costOptimization?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Cost Optimization
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {mcpData.improvements.costOptimization.map(
                          (cost: any, idx: number) => (
                            <div
                              key={idx}
                              className="text-sm p-2 bg-purple-50 rounded"
                            >
                              <div className="font-medium">
                                {cost.recommendation}
                              </div>
                              <div className="text-gray-600">{cost.reason}</div>
                            </div>
                          )
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="prefs" className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Doctor Preferences
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadDoctorPreferences}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Load
                </Button>
              </div>

              {mcpData.preferences && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      Total Prescriptions:{" "}
                      {mcpData.preferences.totalPrescriptions}
                    </div>
                    <div>
                      Avg Meds/Rx:{" "}
                      {mcpData.preferences.prescribingStyle?.averageMedicationsPerPrescription?.toFixed(
                        1
                      ) || 0}
                    </div>
                  </div>

                  {mcpData.preferences.preferredMedications?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Your Preferred Medications
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {mcpData.preferences.preferredMedications
                            .slice(0, 5)
                            .map((med: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex justify-between text-sm"
                              >
                                <span>{med.medication}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {med.frequency}x
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {mcpData.preferences.prescribingStyle?.commonDiagnoses
                    ?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Common Diagnoses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {mcpData.preferences.prescribingStyle.commonDiagnoses
                            .slice(0, 4)
                            .map((diagnosis: string, idx: number) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {diagnosis}
                              </Badge>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default McpAssistant;
