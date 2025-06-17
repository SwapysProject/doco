import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createNotification } from "@/lib/notifications-server";

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Type definitions
interface Medication {
  id?: string;
  name: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  quantity?: number;
  refills?: number;
}

interface SafetyConflict {
  medication: string;
  allergy: string;
  severity: string;
}

interface DrugInteraction {
  newMedication: string;
  existingMedication: string;
  severity: string;
  recommendation: string;
  effect?: string;
  action?: string;
}

interface Improvement {
  recommendation: string;
  reason?: string;
  successfulMedications?: string[];
}

// Direct MCP implementation without spawning external processes
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tool, args, action, ...params } = body; // Support both old format (action) and new format (tool)
    const toolName = tool || action;
    const toolArgs = args || params;

    // Handle undefined tool name
    if (!toolName) {
      console.log(`❌ No tool/action specified in request`);
      console.log(`📋 Request body:`, body);
      return NextResponse.json(
        {
          success: false,
          error: "No tool or action specified",
          requestBody: body,
          availableTools: [
            "list_patients",
            "search_prescriptions",
            "get_enhanced_patient_context",
            "create_prescription_with_gemini",
            "validate_prescription_safety",
            "save_prescription",
            "check_prescription_status",
          ],
        },
        { status: 400 }
      );
    }

    console.log(`🚀 === MCP API REQUEST STARTED ===`);
    console.log(`🔧 MCP Tool Called: ${toolName}`);
    console.log(`📋 Tool Arguments:`, JSON.stringify(toolArgs, null, 2));
    console.log(
      `🌐 Request Headers:`,
      Object.fromEntries(req.headers.entries())
    );

    // Add MongoDB connection test
    console.log(`🗃️  Testing MongoDB connection...`);
    const client = await clientPromise;
    const db = client.db("Patient");
    console.log(
      `✅ MongoDB connected successfully to database: ${db.databaseName}`
    );
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    let result;

    switch (toolName) {
      case "list_patients": {
        console.log(`👥 === LIST PATIENTS TOOL STARTED ===`);
        const { doctorId } = toolArgs;
        console.log(`🩺 Doctor ID: ${doctorId}`);

        if (doctorId) {
          console.log(`🔍 Loading patients assigned to doctor: ${doctorId}`);

          // Get patients assigned to this doctor
          const assignmentsCollection = db.collection(
            "doctor_patient_assignments"
          );
          const patientsCollection = db.collection("patients");

          const assignments = await assignmentsCollection
            .find({ doctorId: doctorId })
            .toArray();

          console.log(
            `📋 Found ${assignments.length} assignments for doctor ${doctorId}`
          );

          const patientIds = assignments.map(
            (assignment) => assignment.patientId
          );
          console.log(`🆔 Patient IDs:`, patientIds);

          if (patientIds.length === 0) {
            console.log(`⚠️  No patients assigned to doctor ${doctorId}`);
            return NextResponse.json({
              success: true,
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      patients: [],
                      count: 0,
                      doctorId: doctorId,
                      message: "No patients assigned to this doctor",
                    },
                    null,
                    2
                  ),
                },
              ],
            });
          }

          // Get patient details for assigned patients
          const patients = await patientsCollection
            .find({
              $or: [
                { id: { $in: patientIds } },
                {
                  _id: {
                    $in: patientIds.map((id) => {
                      try {
                        return new ObjectId(id);
                      } catch {
                        return id;
                      }
                    }),
                  },
                },
              ],
            })
            .toArray();

          console.log(`👥 Found ${patients.length} patient records in MongoDB`);

          const transformedPatients = patients.map((patient) => ({
            id: patient.id || patient._id?.toString() || "",
            name: patient.name || "",
            age: patient.age || 0,
            gender: patient.gender || "other",
            allergies: patient.allergies || [],
            currentMedications: patient.currentMedications || [],
            medicalHistory: patient.medicalHistory || [],
          }));

          console.log(`✅ Transformed patients:`, transformedPatients);
          console.log(`🏁 === LIST PATIENTS TOOL FINISHED ===`);

          return NextResponse.json({
            success: true,
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    patients: transformedPatients,
                    count: transformedPatients.length,
                    doctorId: doctorId,
                  },
                  null,
                  2
                ),
              },
            ],
          });
        } else {
          // No doctor ID provided, return all patients
          console.log(`🌐 Loading ALL patients (no doctor filter)`);
          const patientsCollection = db.collection("patients");
          const patients = await patientsCollection.find({}).toArray();

          console.log(`👥 Found ${patients.length} total patients in MongoDB`);

          const transformedPatients = patients.map((patient) => ({
            id: patient.id || patient._id?.toString() || "",
            name: patient.name || "",
            age: patient.age || 0,
            gender: patient.gender || "other",
            allergies: patient.allergies || [],
            currentMedications: patient.currentMedications || [],
            medicalHistory: patient.medicalHistory || [],
          }));

          console.log(`🏁 === LIST PATIENTS TOOL FINISHED ===`);

          return NextResponse.json({
            success: true,
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    patients: transformedPatients,
                    count: transformedPatients.length,
                    doctorId: "all",
                  },
                  null,
                  2
                ),
              },
            ],
          });
        }
      }

      case "search_prescriptions": {
        console.log(`💊 === SEARCH PRESCRIPTIONS TOOL STARTED ===`);
        const { patientId, doctorId, status, dateFrom, dateTo } = toolArgs;
        console.log(`🔍 Search criteria:`, {
          patientId,
          doctorId,
          status,
          dateFrom,
          dateTo,
        });
        const prescriptionsCollection = db.collection("prescriptions");
        const query: Record<string, any> = {};

        // Build query based on filters
        if (patientId) {
          query.patientId = patientId;
          console.log(`👤 Filtering by patient ID: ${patientId}`);
        }
        if (doctorId) {
          query.doctorId = doctorId;
          console.log(`🩺 Filtering by doctor ID: ${doctorId}`);
        }
        if (status) {
          query.status = status;
          console.log(`📋 Filtering by status: ${status}`);
        }
        if (dateFrom) {
          query.date = { ...query.date, $gte: dateFrom };
          console.log(`📅 Filtering from date: ${dateFrom}`);
        }
        if (dateTo) {
          query.date = { ...query.date, $lte: dateTo };
          console.log(`📅 Filtering to date: ${dateTo}`);
        }

        console.log(`🔍 MongoDB query:`, query);

        const prescriptions = await prescriptionsCollection
          .find(query)
          .toArray();
        console.log(
          `💊 Found ${prescriptions.length} prescriptions in MongoDB`
        );

        const transformedPrescriptions = prescriptions.map((prescription) => ({
          id: prescription.id || prescription._id?.toString() || "",
          patientId: prescription.patientId || "",
          patientName: prescription.patientName || "",
          doctorId: prescription.doctorId || "",
          doctorName: prescription.doctorName || "",
          date: prescription.date || new Date().toISOString().split("T")[0],
          diagnosis: prescription.diagnosis || "",
          symptoms: prescription.symptoms || [],
          medications: prescription.medications || [],
          notes: prescription.notes || "",
          status: prescription.status || "active",
          createdAt: prescription.createdAt || new Date().toISOString(),
          updatedAt: prescription.updatedAt || new Date().toISOString(),
          expiresAt:
            prescription.expiresAt ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isAiGenerated: prescription.isAiGenerated || false,
          aiConfidence: prescription.aiConfidence || 0,
        }));

        console.log(`🏁 === SEARCH PRESCRIPTIONS TOOL FINISHED ===`);

        return NextResponse.json({
          success: true,
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  prescriptions: transformedPrescriptions,
                  count: transformedPrescriptions.length,
                  filters: { patientId, doctorId, status, dateFrom, dateTo },
                },
                null,
                2
              ),
            },
          ],
        });
      }

      case "get_enhanced_patient_context":
        console.log(
          `🔍 MCP: Getting enhanced context for patient ${toolArgs.patientId}`
        );
        result = await getEnhancedPatientContext(toolArgs.patientId);
        console.log(`✅ MCP: Enhanced context generated successfully`);
        break;
      case "create_prescription_with_gemini":
        console.log(
          `🧠 MCP: Creating AI prescription with Gemini for patient ${toolArgs.patientId}`
        );
        console.log(`📝 Symptoms: ${toolArgs.symptoms?.join(", ")}`);
        console.log(`🩺 Diagnosis: ${toolArgs.diagnosis || "Not specified"}`);
        console.log(`👨‍⚕️ Doctor: ${toolArgs.doctorName} (${toolArgs.doctorId})`);
        result = await createPrescriptionWithGemini(
          toolArgs.patientId,
          toolArgs.symptoms,
          toolArgs.diagnosis,
          toolArgs.doctorId,
          toolArgs.doctorName,
          toolArgs.notes
        );
        console.log(`✅ MCP: Gemini prescription created successfully`);
        break;

      case "validate_prescription_safety":
        console.log(
          `🛡️ MCP: Validating prescription safety for patient ${params.patientId}`
        );
        console.log(
          `💊 Medications to check: ${params.medications?.length} items`
        );
        result = await validatePrescriptionSafety(
          params.patientId,
          params.medications
        );
        console.log(`✅ MCP: Safety validation completed`);
        break;

      case "check_drug_interactions":
        console.log(
          `⚠️ MCP: Checking drug interactions for patient ${params.patientId}`
        );
        console.log(`💊 New medications: ${params.newMedications?.join(", ")}`);
        result = await checkDrugInteractions(
          params.patientId,
          params.newMedications
        );
        console.log(`✅ MCP: Drug interaction check completed`);
        break;

      case "suggest_prescription_improvements":
        console.log(
          `💡 MCP: Suggesting prescription improvements for patient ${params.patientId}`
        );
        result = await suggestPrescriptionImprovements(
          params.patientId,
          params.currentPrescription,
          params.symptoms
        );
        console.log(`✅ MCP: Improvement suggestions generated`);
        break;

      case "get_doctor_preferences":
        console.log(
          `⭐ MCP: Getting doctor preferences for ${params.doctorId}`
        );
        result = await getDoctorPreferences(
          params.doctorId,
          params.symptoms,
          params.diagnosis
        );
        console.log(`✅ MCP: Doctor preferences retrieved`);
        break;

      case "get_patient_history":
        console.log(`📋 MCP: Getting patient history for ${params.patientId}`);
        result = await getPatientHistory(params.patientId);
        console.log(`✅ MCP: Patient history retrieved`);
        break;
      case "search_prescriptions":
        console.log(`🔍 MCP: Searching prescriptions with filters`);
        console.log(
          `🔍 Filters: Patient=${params.patientId}, Status=${params.status}, Doctor=${params.doctorId}`
        );
        result = await searchPrescriptions(
          params.patientId,
          params.status,
          params.doctorId
        );
        console.log(`✅ MCP: Prescription search completed`);
        break;

      case "save_prescription":
        console.log(
          `💾 MCP: Saving edited prescription for patient ${params.patientId}`
        );
        result = await saveEditedPrescription(
          params.patientId,
          params.medications,
          params.diagnosis,
          params.symptoms,
          params.doctorId,
          params.doctorName,
          params.notes,
          params.isAiGenerated,
          params.aiConfidence
        );
        console.log(`✅ MCP: Edited prescription saved successfully`);
        break;

      default:
        console.log(`❌ MCP: Unknown action attempted: ${action}`);
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    console.log(`🎉 MCP: Action ${action} completed successfully`);
    console.log(
      `📊 Response size: ${JSON.stringify(result).length} characters`
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ MCP API error:", error);
    console.error("🔍 Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Enhanced Patient Context
async function getEnhancedPatientContext(patientId: string) {
  console.log(`🔍 ENHANCED CONTEXT: Analyzing patient ${patientId}`);

  const client = await clientPromise;
  const db = client.db("Patient");

  // Get patient
  const patient = await db
    .collection("patients")
    .findOne(
      ObjectId.isValid(patientId)
        ? { _id: new ObjectId(patientId) }
        : { id: patientId }
    );

  if (!patient) {
    console.log(`❌ ENHANCED CONTEXT: Patient ${patientId} not found`);
    throw new Error(`Patient ${patientId} not found`);
  }

  console.log(`✅ ENHANCED CONTEXT: Patient found - ${patient.name}`);
  console.log(
    `🚨 ENHANCED CONTEXT: Allergies: ${patient.allergies?.length || 0} items`
  );
  console.log(
    `💊 ENHANCED CONTEXT: Current medications: ${patient.currentMedications?.length || 0} items`
  );

  // Get prescriptions
  const prescriptions = await db
    .collection("prescriptions")
    .find({ patientId })
    .sort({ createdAt: -1 })
    .toArray();

  console.log(
    `📋 ENHANCED CONTEXT: Found ${prescriptions.length} prescriptions`
  );

  // Analyze risk factors
  const riskFactors = [];
  if (patient.allergies?.length > 0) {
    riskFactors.push(`Allergies: ${patient.allergies.join(", ")}`);
  }
  if (patient.currentMedications?.length > 0) {
    riskFactors.push(
      `Current medications: ${patient.currentMedications.join(", ")}`
    );
  }

  const riskLevel =
    patient.allergies?.length > 2
      ? "HIGH"
      : patient.allergies?.length > 0
        ? "MEDIUM"
        : "LOW";
  console.log(`🎯 ENHANCED CONTEXT: Risk level assessed as: ${riskLevel}`);
  console.log(
    `⚠️ ENHANCED CONTEXT: Risk factors: ${riskFactors.length} identified`
  );

  const enhancedContext = {
    riskLevel,
    keyRiskFactors: riskFactors,
    treatmentHistory: {
      totalPrescriptions: prescriptions.length,
      recentTreatments: prescriptions.slice(0, 5).map((p) => ({
        diagnosis: p.diagnosis,
        medications: p.medications?.map((m: Medication) => m.name) || [],
        date: p.date,
        status: p.status,
      })),
    },
    recommendations: [
      "Review current medications for interactions",
      "Check allergy status before prescribing",
      "Consider patient's treatment history for effectiveness",
    ],
  };

  console.log(`✅ ENHANCED CONTEXT: Analysis complete for ${patient.name}`);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            patient,
            enhancedContext,
            lastUpdated: new Date().toISOString(),
          },
          null,
          2
        ),
      },
    ],
  };
}

// Create Prescription with Gemini
async function createPrescriptionWithGemini(
  patientId: string,
  symptoms: string[],
  diagnosis?: string,
  doctorId?: string,
  doctorName?: string,
  notes?: string
) {
  console.log(`🧠 GEMINI: Starting AI prescription generation`);
  console.log(`👤 Patient ID: ${patientId}`);
  console.log(`🩺 Doctor ID: ${doctorId || "Not specified"}`);
  console.log(`👨‍⚕️ Doctor Name: ${doctorName || "Not specified"}`);
  console.log(`💊 Symptoms type: ${typeof symptoms}, value:`, symptoms);
  console.log(`🩺 Diagnosis: ${diagnosis || "Not specified"}`);

  // Ensure symptoms is an array
  const symptomsArray = Array.isArray(symptoms)
    ? symptoms
    : typeof symptoms === "string"
      ? [symptoms]
      : [];
  console.log(`💊 Processed symptoms: ${symptomsArray.join(", ")}`);
  console.log(
    `🎯 FOCUS: AI will prescribe ONLY for these current symptoms, not entire medical history`
  );

  const client = await clientPromise;
  const db = client.db("Patient");

  // Get patient
  const patient = await db
    .collection("patients")
    .findOne(
      ObjectId.isValid(patientId)
        ? { _id: new ObjectId(patientId) }
        : { id: patientId }
    );

  if (!patient) {
    console.log(`❌ GEMINI: Patient ${patientId} not found`);
    throw new Error(`Patient ${patientId} not found`);
  }

  console.log(
    `✅ GEMINI: Patient found - ${patient.name}, Age: ${patient.age}`
  );
  console.log(`🚨 GEMINI: Patient allergies:`, patient.allergies);
  console.log(`💊 GEMINI: Current medications:`, patient.currentMedications);

  // Get prescription history
  const prescriptions = await db
    .collection("prescriptions")
    .find({ patientId })
    .sort({ createdAt: -1 })
    .toArray();
  console.log(
    `📋 GEMINI: Found ${prescriptions.length} previous prescriptions`
  );
  console.log(
    `🚫 AI instructed to IGNORE prescription history and focus on current symptoms only`
  );
  console.log(`🎯 CURRENT SYMPTOMS FOCUS: ${symptomsArray.join(", ")}`);
  let geminiResponse = null;
  let medications = [];

  // Try Gemini AI if available
  if (genAI && process.env.GEMINI_API_KEY) {
    console.log(
      `🚀 GEMINI: API key found (${process.env.GEMINI_API_KEY.substring(0, 10)}...), generating AI prescription...`
    );
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `As an experienced medical AI assistant, analyze the following patient case and provide targeted medication recommendations ONLY for the current symptoms presented. Focus specifically on treating the NEW symptoms, not the entire medical history:

PATIENT INFORMATION:
- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Known Allergies: ${patient.allergies && Array.isArray(patient.allergies) ? patient.allergies.join(", ") : "None reported"}
- Medical History: ${patient.medicalHistory && Array.isArray(patient.medicalHistory) ? patient.medicalHistory.join(", ") : "None reported"}

🎯 CURRENT CONSULTATION (FOCUS ON THESE SYMPTOMS ONLY):
- Current Symptoms: ${symptomsArray.join(", ")}
- Working Diagnosis: ${diagnosis || "To be determined based on symptoms"}

⚠️ CURRENT ACTIVE MEDICATIONS (for drug interaction checking only):
${
  prescriptions
    .filter((p) => p.status === "active")
    .slice(0, 2)
    .map(
      (p) =>
        `- ${p.medications && Array.isArray(p.medications) ? p.medications.map((m) => `${m.name || "Unknown"} ${m.strength || ""}`).join(", ") : "No active medications"}`
    )
    .join("\n") || "None currently active"
}

🎯 CRITICAL INSTRUCTIONS - TREAT CURRENT SYMPTOMS ONLY:
1. ⚠️ FOCUS ONLY: Prescribe medications ONLY for the current symptoms: ${symptomsArray.join(", ")}
2. ⚠️ NEW TREATMENT: Do NOT repeat or suggest medications from patient's prescription history unless specifically needed for current symptoms
3. ⚠️ TARGETED THERAPY: Address each current symptom with appropriate, specific medication(s)
4. ⚠️ FRESH APPROACH: Treat this as a new consultation for new symptoms, not a continuation of previous treatments
5. Check for drug interactions with current active medications only
6. Consider allergies for safety
7. Use standard dosing for age/weight
8. Provide clear, symptom-specific instructions

Please provide your analysis in the following JSON format only. Do not include any other text before or after the JSON:

{
  "final_diagnosis": "Your diagnosis based ONLY on current symptoms",
  "confidence": 0.85,
  "reasoning": "Detailed explanation focusing on current symptoms and why specific medications are chosen for them",  "medications": [
    {
      "name": "Medication Name",
      "strength": "Dosage",
      "dosage": "Amount per dose",
      "frequency": "How often",
      "duration": "How long",
      "instructions": "Special instructions for current symptoms",
      "priority": "critical|high|medium|low"
    }
  ],
  "warnings": ["Any warnings about drug interactions with current active medications"],
  "recommendations": ["Clinical recommendations for current symptoms only"],
  "notes": "Additional clinical notes for current symptom management"
}

🎯 CRITICAL FOCUS INSTRUCTIONS: 
- Respond with ONLY the JSON object above, no additional text
- ⚠️ TREAT CURRENT SYMPTOMS ONLY: Prescribe medications specifically for: ${symptomsArray.join(", ")}
- ⚠️ DO NOT include medications from prescription history unless they directly treat current symptoms
- ⚠️ NEW CONSULTATION APPROACH: Treat this as a fresh evaluation of current symptoms
- ⚠️ SYMPTOM-SPECIFIC: Each medication must directly address one of the current symptoms
- ⚠️ PRIORITY LEVELS: Assign priority to each medication:
  • "critical" - Life-threatening conditions, emergency medications
  • "high" - Primary treatment for main symptoms, essential medications
  • "medium" - Supportive treatment, symptom relief medications
  • "low" - Optional medications, preventive or comfort measures
- ⚠️ PRIORITIZATION RULES:
  • Pain relief for severe pain = "high"
  • Antibiotics for infections = "high" 
  • Fever reducers = "medium"
  • Cough suppressants = "medium"
  • Vitamins/supplements = "low"
  • Emergency medications (epinephrine, etc.) = "critical"
- Focus on targeted, evidence-based treatment for the presenting complaints
- Avoid unnecessary medications that don't address current symptoms

🎯 TREATMENT FOCUS for CURRENT SYMPTOMS ONLY:
1. PRIMARY TREATMENT: Main medication for the current chief complaint
2. SYMPTOM-SPECIFIC RELIEF: Medications targeting each current symptom specifically
3. SAFETY CONSIDERATIONS: Check interactions with active medications only
4. APPROPRIATE DURATION: Treatment length appropriate for current symptoms
5. CLEAR RATIONALE: Each medication must have clear connection to current symptoms

⚠️ REMEMBER: Focus ONLY on treating the current symptoms (${symptomsArray.join(", ")}). Do not prescribe medications for conditions not currently presenting or from patient's medical history unless directly relevant to current symptoms.`;

      console.log(`🧠 GEMINI: Sending enhanced prompt to AI model...`);
      const result = await model.generateContent(prompt);
      const response = result.response;
      geminiResponse = response.text();

      console.log(
        `✅ GEMINI: Received AI response (${geminiResponse.length} characters)`
      );
      console.log(`🔍 GEMINI: Full raw response:`, geminiResponse);

      // Clean up the response - remove markdown if present
      let cleanResponse = geminiResponse;
      if (cleanResponse.includes("```json")) {
        cleanResponse = cleanResponse
          .replace(/```json\n?/g, "")
          .replace(/\n?```/g, "");
      }
      if (cleanResponse.includes("```")) {
        cleanResponse = cleanResponse
          .replace(/```\n?/g, "")
          .replace(/\n?```/g, "");
      }

      console.log(`🧹 GEMINI: Cleaned response:`, cleanResponse);

      // Extract JSON from response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log(`📄 GEMINI: JSON extracted from response`);
        try {
          const geminiData = JSON.parse(jsonMatch[0]);
          console.log(`🩺 GEMINI: AI Diagnosis: ${geminiData.final_diagnosis}`);
          console.log(`🎯 GEMINI: AI Confidence: ${geminiData.confidence}`);
          console.log(
            `💊 GEMINI: AI recommended ${geminiData.medications?.length || 0} medications`
          );
          console.log(
            `⚠️  GEMINI: Warnings: ${geminiData.warnings?.join("; ") || "None"}`
          );
          console.log(
            `📝 GEMINI: Recommendations: ${geminiData.recommendations?.join("; ") || "None"}`
          );
          medications =
            geminiData.medications?.map((med: any, index: number) => {
              console.log(
                `  💊 Medication ${index + 1}: ${med.name} ${med.strength} - ${med.frequency} [Priority: ${med.priority || "medium"}]`
              );
              return {
                id: `M${Date.now()}_${index}`,
                name: med.name,
                strength: med.strength,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration,
                instructions: med.instructions,
                priority: med.priority || "medium", // Default to medium if not specified
                quantity: 30,
                refills: 0,
              };
            }) || [];

          // If AI didn't provide medications but gave recommendations, provide symptomatic relief
          if (medications.length === 0 && symptomsArray.length > 0) {
            console.log(
              `🔄 GEMINI: AI provided no medications but symptoms exist, providing symptomatic relief`
            );

            // Provide basic symptomatic relief based on symptoms
            const symptomStr = symptomsArray.join(" ").toLowerCase();
            if (
              symptomStr.includes("headache") ||
              symptomStr.includes("pain") ||
              symptomStr.includes("ache")
            ) {
              medications.push({
                id: `M${Date.now()}_fallback1`,
                name: "Ibuprofen",
                strength: "400mg",
                dosage: "1 tablet",
                frequency: "Every 8 hours as needed",
                duration: "Up to 3 days",
                instructions:
                  "Take with food to reduce stomach irritation. Do not exceed 3 tablets in 24 hours.",
                priority: "high", // Pain relief is high priority
                quantity: 9,
                refills: 0,
              });
            }
            if (
              symptomStr.includes("fever") ||
              symptomStr.includes("temperature")
            ) {
              medications.push({
                id: `M${Date.now()}_fallback2`,
                name: "Paracetamol",
                strength: "500mg",
                dosage: "1-2 tablets",
                frequency: "Every 6 hours as needed",
                duration: "Until fever subsides",
                instructions:
                  "Do not exceed 8 tablets in 24 hours. Maintain adequate hydration.",
                priority: "medium", // Fever reduction is medium priority
                quantity: 16,
                refills: 0,
              });
            }

            if (symptomStr.includes("cough") || symptomStr.includes("throat")) {
              medications.push({
                id: `M${Date.now()}_fallback3`,
                name: "Dextromethorphan",
                strength: "15mg",
                dosage: "1 tablet",
                frequency: "Every 4 hours as needed",
                duration: "Up to 7 days",
                instructions:
                  "Take with plenty of fluids. Avoid if taking other cough medications.",
                priority: "medium", // Cough suppressant is medium priority
                quantity: 20,
                refills: 0,
              });
            }

            // Default fallback if no specific symptoms matched
            if (medications.length === 0) {
              medications.push({
                id: `M${Date.now()}_default`,
                name: "Paracetamol",
                strength: "500mg",
                dosage: "1 tablet",
                frequency: "Every 6 hours as needed",
                duration: "As needed",
                instructions:
                  "For general pain relief. Take with food if stomach upset.",
                priority: "medium", // General relief is medium priority
                quantity: 10,
                refills: 0,
              });
            }

            console.log(
              `✅ GEMINI: Provided ${medications.length} symptomatic relief medications`
            );
          }

          // Store the AI analysis for the reasoning
          diagnosis = geminiData.final_diagnosis || diagnosis;
        } catch (parseError) {
          console.error(`❌ GEMINI: JSON parsing error:`, parseError);
          console.log(`📄 GEMINI: Failed to parse:`, jsonMatch[0]);
          throw parseError;
        }
      } else {
        console.log(`⚠️ GEMINI: No valid JSON found in response`);
        throw new Error("No valid JSON found in Gemini response");
      }
    } catch (error) {
      console.error("❌ GEMINI: API error occurred:", error);
      console.error("❌ GEMINI: Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      console.log(`🔄 GEMINI: Falling back to default medication`); // Fallback to basic medication
      medications = [
        {
          id: `M${Date.now()}`,
          name: "Paracetamol",
          strength: "500mg",
          dosage: "1 tablet",
          frequency: "Every 6 hours",
          duration: "3 days",
          instructions: "Take with food if stomach upset",
          priority: "medium", // Default fallback is medium priority
          quantity: 12,
          refills: 0,
        },
      ];
    }
  } else {
    console.log(`❌ GEMINI: API setup issue`);
    console.log(`❌ GEMINI: genAI exists: ${!!genAI}`);
    console.log(`❌ GEMINI: API key exists: ${!!process.env.GEMINI_API_KEY}`);
    console.log(
      `❌ GEMINI: API key preview: ${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + "..." : "NOT FOUND"}`
    ); // Fallback medications
    medications = [
      {
        id: `M${Date.now()}`,
        name: "Paracetamol",
        strength: "500mg",
        dosage: "1 tablet",
        frequency: "Every 6 hours",
        duration: "3 days",
        instructions: "Take with food if stomach upset",
        priority: "medium", // API fallback is medium priority
        quantity: 12,
        refills: 0,
      },
    ];
  }

  // Create prescription
  const newPrescription = {
    id: `RX${Date.now()}`,
    patientId,
    patientName: patient.name,
    doctorId,
    doctorName,
    date: new Date().toISOString().split("T")[0],
    diagnosis: diagnosis || "Symptomatic treatment",
    symptoms,
    medications,
    notes,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAiGenerated: true,
    geminiResponse,
  };
  console.log(`💾 GEMINI: Saving prescription to database...`);
  // Save to database
  await db.collection("prescriptions").insertOne(newPrescription);
  console.log(`✅ GEMINI: Prescription saved with ID: ${newPrescription.id}`);
  console.log(
    `🧠 GEMINI: AI Generation ${geminiResponse ? "SUCCESS" : "FALLBACK"}`
  );
  // Create notification for prescription creation
  console.log(`🔔 GEMINI: Creating notification for prescription...`);
  try {
    // Determine notification type based on how prescription was created
    const notificationType = geminiResponse
      ? "prescription_ai_generated"
      : "prescription_manual_created";
    const notificationTitle = geminiResponse
      ? "AI Prescription Generated"
      : "Manual Prescription Created";

    await createNotification({
      doctorId,
      type: notificationType,
      title: notificationTitle,
      message: `${geminiResponse ? "AI-generated" : "Manual"} prescription created for ${patient.name} with ${medications.length} medication(s). Diagnosis: ${diagnosis || "Symptomatic treatment"}`,
      patientId,
      prescriptionId: newPrescription.id,
    });
    console.log(`✅ GEMINI: Notification created successfully`);
  } catch (notificationError) {
    console.error(
      `❌ GEMINI: Failed to create notification:`,
      notificationError
    );
    // Don't fail the entire operation if notification fails
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            prescription: newPrescription,
            geminiUsed: !!geminiResponse,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
      },
    ],
  };
}

// Validate Prescription Safety
async function validatePrescriptionSafety(
  patientId: string,
  medications: Medication[]
) {
  console.log(
    `🛡️ SAFETY CHECK: Validating prescription safety for patient ${patientId}`
  );
  console.log(`💊 SAFETY CHECK: Checking ${medications.length} medications`);

  const client = await clientPromise;
  const db = client.db("Patient");

  const patient = await db
    .collection("patients")
    .findOne(
      ObjectId.isValid(patientId)
        ? { _id: new ObjectId(patientId) }
        : { id: patientId }
    );

  if (!patient) {
    console.log(`❌ SAFETY CHECK: Patient ${patientId} not found`);
    throw new Error(`Patient ${patientId} not found`);
  }

  console.log(`✅ SAFETY CHECK: Patient found - ${patient.name}`);
  console.log(
    `🚨 SAFETY CHECK: Patient allergies: ${patient.allergies?.join(", ") || "None"}`
  );

  const safetyChecks = {
    allergyConflicts: [] as SafetyConflict[],
    drugInteractions: [] as DrugInteraction[],
    overallSafety: "SAFE",
  };

  // Check allergies
  if (patient.allergies) {
    console.log(
      `🔍 SAFETY CHECK: Checking medications against ${patient.allergies.length} known allergies`
    );
    for (const med of medications) {
      for (const allergy of patient.allergies) {
        if (
          med.name.toLowerCase().includes(allergy.toLowerCase()) ||
          allergy.toLowerCase().includes(med.name.toLowerCase())
        ) {
          console.log(
            `⚠️ SAFETY CHECK: ALLERGY CONFLICT - ${med.name} conflicts with allergy: ${allergy}`
          );
          safetyChecks.allergyConflicts.push({
            medication: med.name,
            allergy: allergy,
            severity: "HIGH",
          });
          safetyChecks.overallSafety = "UNSAFE";
        }
      }
    }
  }
  // Basic drug interaction check
  const knownInteractions = [
    ["warfarin", "aspirin"],
    ["metformin", "contrast"],
    ["lithium", "ibuprofen"],
  ];

  console.log(
    `🔍 SAFETY CHECK: Checking for drug interactions with current medications`
  );
  for (const med of medications) {
    if (patient.currentMedications) {
      for (const currentMed of patient.currentMedications) {
        for (const [drug1, drug2] of knownInteractions) {
          if (
            (med.name.toLowerCase().includes(drug1) &&
              currentMed.toLowerCase().includes(drug2)) ||
            (med.name.toLowerCase().includes(drug2) &&
              currentMed.toLowerCase().includes(drug1))
          ) {
            console.log(
              `⚠️ SAFETY CHECK: DRUG INTERACTION - ${med.name} + ${currentMed}`
            );
            safetyChecks.drugInteractions.push({
              newMedication: med.name,
              existingMedication: currentMed,
              severity: "MODERATE",
              recommendation: "Monitor closely",
            });
            if (safetyChecks.overallSafety === "SAFE") {
              safetyChecks.overallSafety = "CAUTION";
            }
          }
        }
      }
    }
  }

  console.log(`✅ SAFETY CHECK: Safety assessment complete`);
  console.log(
    `🎯 SAFETY CHECK: Overall safety level: ${safetyChecks.overallSafety}`
  );
  console.log(
    `⚠️ SAFETY CHECK: Found ${safetyChecks.allergyConflicts.length} allergy conflicts`
  );
  console.log(
    `💊 SAFETY CHECK: Found ${safetyChecks.drugInteractions.length} drug interactions`
  );

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            safetyAssessment: safetyChecks,
            patientId,
            checkedMedications: medications,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
      },
    ],
  };
}

// Check Drug Interactions
async function checkDrugInteractions(
  patientId: string,
  newMedications: string[]
) {
  const client = await clientPromise;
  const db = client.db("Patient");

  const patient = await db
    .collection("patients")
    .findOne(
      ObjectId.isValid(patientId)
        ? { _id: new ObjectId(patientId) }
        : { id: patientId }
    );

  if (!patient) {
    throw new Error(`Patient ${patientId} not found`);
  }

  const interactions = {
    major: [] as DrugInteraction[],
    moderate: [] as DrugInteraction[],
    minor: [] as DrugInteraction[],
    recommendations: [] as string[],
  };

  const knownInteractions = new Map([
    [
      "warfarin-aspirin",
      { severity: "major", effect: "Increased bleeding risk" },
    ],
    [
      "metformin-contrast",
      { severity: "major", effect: "Risk of lactic acidosis" },
    ],
    [
      "lithium-ibuprofen",
      { severity: "moderate", effect: "Increased lithium levels" },
    ],
  ]);

  if (patient.currentMedications) {
    for (const newMed of newMedications) {
      for (const currentMed of patient.currentMedications) {
        const key1 = `${newMed.toLowerCase()}-${currentMed.toLowerCase()}`;
        const key2 = `${currentMed.toLowerCase()}-${newMed.toLowerCase()}`;

        const interaction =
          knownInteractions.get(key1) || knownInteractions.get(key2);

        if (interaction) {
          const data: DrugInteraction = {
            newMedication: newMed,
            existingMedication: currentMed,
            effect: interaction.effect,
            action: "Monitor closely",
            severity: interaction.severity,
            recommendation: "Monitor closely",
          };

          if (interaction.severity === "major") {
            interactions.major.push(data);
          } else if (interaction.severity === "moderate") {
            interactions.moderate.push(data);
          } else {
            interactions.minor.push(data);
          }
        }
      }
    }
  }

  if (interactions.major.length > 0) {
    interactions.recommendations.push("URGENT: Major interactions detected");
  } else if (interactions.moderate.length > 0) {
    interactions.recommendations.push("Monitor patient closely");
  } else {
    interactions.recommendations.push("No significant interactions detected");
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            drugInteractionAnalysis: interactions,
            checkedMedications: newMedications,
            patientCurrentMedications: patient.currentMedications || [],
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
      },
    ],
  };
}

// Suggest Prescription Improvements
async function suggestPrescriptionImprovements(
  patientId: string,
  _currentPrescription?: any,
  _symptoms?: string[]
) {
  const client = await clientPromise;
  const db = client.db("Patient");

  const patient = await db
    .collection("patients")
    .findOne(
      ObjectId.isValid(patientId)
        ? { _id: new ObjectId(patientId) }
        : { id: patientId }
    );

  if (!patient) {
    throw new Error(`Patient ${patientId} not found`);
  }

  const improvements = {
    dosageOptimization: [] as Improvement[],
    costOptimization: [] as Improvement[],
    efficacyImprovements: [] as Improvement[],
  };

  // Age-based recommendations
  if (patient.age > 65) {
    improvements.dosageOptimization.push({
      recommendation: "Consider reduced dosage for elderly patient",
      reason: "Elderly patients may require lower doses",
    });
  }

  // Generic alternatives
  improvements.costOptimization.push({
    recommendation: "Consider generic alternatives where available",
    reason: "Reduce patient cost burden",
  });

  // Based on history
  const prescriptions = await db
    .collection("prescriptions")
    .find({ patientId, status: "completed" })
    .toArray();

  if (prescriptions.length > 0) {
    improvements.efficacyImprovements.push({
      recommendation: "Consider medications that worked well previously",
      successfulMedications: prescriptions
        .flatMap((p) => p.medications?.map((m: Medication) => m.name) || [])
        .slice(0, 3),
    });
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            prescriptionImprovements: improvements,
            analysisDate: new Date().toISOString(),
            patientContext: {
              age: patient.age,
              allergies: patient.allergies,
              treatmentHistory: prescriptions.length,
            },
          },
          null,
          2
        ),
      },
    ],
  };
}

// Get Doctor Preferences
async function getDoctorPreferences(
  doctorId: string,
  _symptoms?: string[],
  _diagnosis?: string
) {
  const client = await clientPromise;
  const db = client.db("Patient");

  const doctorPrescriptions = await db
    .collection("prescriptions")
    .find({ doctorId })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const medicationFrequency = new Map();

  for (const prescription of doctorPrescriptions) {
    if (prescription.medications) {
      for (const med of prescription.medications) {
        const medName = med.name || "";
        medicationFrequency.set(
          medName,
          (medicationFrequency.get(medName) || 0) + 1
        );
      }
    }
  }

  const topMedications = Array.from(medicationFrequency.entries())
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([med, count]) => ({ medication: med, frequency: count }));

  const preferences = {
    totalPrescriptions: doctorPrescriptions.length,
    preferredMedications: topMedications,
    prescribingStyle: {
      averageMedicationsPerPrescription:
        doctorPrescriptions.length > 0
          ? doctorPrescriptions.reduce(
              (acc, p) => acc + (p.medications?.length || 0),
              0
            ) / doctorPrescriptions.length
          : 0,
    },
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            doctorPreferences: preferences,
            doctorId,
            analysisDate: new Date().toISOString(),
          },
          null,
          2
        ),
      },
    ],
  };
}

// Get Patient History
async function getPatientHistory(patientId: string) {
  const client = await clientPromise;
  const db = client.db("Patient");

  const patient = await db
    .collection("patients")
    .findOne(
      ObjectId.isValid(patientId)
        ? { _id: new ObjectId(patientId) }
        : { id: patientId }
    );

  if (!patient) {
    throw new Error(`Patient ${patientId} not found`);
  }

  const prescriptions = await db
    .collection("prescriptions")
    .find({ patientId })
    .sort({ createdAt: -1 })
    .toArray();

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            patient,
            prescriptionHistory: prescriptions,
            totalPrescriptions: prescriptions.length,
          },
          null,
          2
        ),
      },
    ],
  };
}

// Search Prescriptions
async function searchPrescriptions(
  patientId?: string,
  status?: string,
  doctorId?: string
) {
  const client = await clientPromise;
  const db = client.db("Patient");

  const query: Record<string, string> = {};
  if (patientId) query.patientId = patientId;
  if (status) query.status = status;
  if (doctorId) query.doctorId = doctorId;

  const prescriptions = await db
    .collection("prescriptions")
    .find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            prescriptions,
            count: prescriptions.length,
            query,
          },
          null,
          2
        ),
      },
    ],
  };
}

// Save Edited Prescription
async function saveEditedPrescription(
  patientId: string,
  medications: Medication[],
  diagnosis: string,
  symptoms: string[],
  doctorId: string,
  doctorName: string,
  notes: string,
  isAiGenerated: boolean,
  aiConfidence: number
) {
  console.log(
    `💾 SAVE_EDIT: Saving edited prescription for patient ${patientId}`
  );
  console.log(`👨‍⚕️ SAVE_EDIT: Doctor: ${doctorName} (${doctorId})`);
  console.log(`💊 SAVE_EDIT: ${medications.length} medications`);

  const client = await clientPromise;
  const db = client.db("Patient");

  // Get patient details
  const patient = await db
    .collection("patients")
    .findOne(
      ObjectId.isValid(patientId)
        ? { _id: new ObjectId(patientId) }
        : { id: patientId }
    );

  if (!patient) {
    throw new Error(`Patient ${patientId} not found`);
  }

  // Generate new prescription ID
  const prescriptionId = `RX${Date.now()}`;

  // Create new prescription object
  const newPrescription = {
    id: prescriptionId,
    patientId,
    patientName: patient.name,
    doctorId,
    doctorName,
    date: new Date().toISOString().split("T")[0],
    diagnosis,
    symptoms,
    medications,
    notes,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAiGenerated,
    aiConfidence,
    isEdited: true, // Mark as edited prescription
  };

  console.log(`💾 SAVE_EDIT: Saving edited prescription to database...`);
  await db.collection("prescriptions").insertOne(newPrescription);
  console.log(
    `✅ SAVE_EDIT: Prescription saved with ID: ${newPrescription.id}`
  );
  // Create notification for edited prescription
  console.log(`🔔 SAVE_EDIT: Creating notification for edited prescription...`);
  try {
    await createNotification({
      doctorId,
      type: "prescription_updated",
      title: "Prescription Updated",
      message: `Prescription for ${patient.name} has been updated with ${medications.length} medication(s). Diagnosis: ${diagnosis}`,
      patientId,
      prescriptionId: newPrescription.id,
    });
    console.log(`✅ SAVE_EDIT: Notification created successfully`);
  } catch (notificationError) {
    console.error(
      `❌ SAVE_EDIT: Failed to create notification:`,
      notificationError
    );
    // Don't fail the entire operation if notification fails
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            prescription: newPrescription,
            edited: true,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
      },
    ],
  };
}
