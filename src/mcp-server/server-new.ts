import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { MongoClient } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Types
interface Patient {
  _id?: string;
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  allergies: string[];
  currentMedications: string[];
  medicalHistory: string[];
  phoneNumber?: string;
  email?: string;
}

interface Prescription {
  _id?: string;
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  symptoms: string[];
  medications: Medication[];
  notes?: string;
  status: "active" | "completed" | "cancelled" | "expired";
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  isAiGenerated?: boolean;
  aiConfidence?: number;
  geminiResponse?: string;
}

interface Medication {
  id: string;
  name: string;
  genericName?: string;
  strength: string;
  form: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  refills: number;
  cost?: number;
  sideEffects?: string[];
  contraindications?: string[];
}

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/doctor-care-system";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let mongoClient: MongoClient;
let genAI: GoogleGenerativeAI;

async function connectToMongoDB() {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    console.error("Connected to MongoDB");
  }
  return mongoClient.db("doctor-care-system");
}

function initializeGemini() {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI.getGenerativeModel({ model: "gemini-pro" });
}

// Helper functions
async function getPatientHistory(patientId: string) {
  const db = await connectToMongoDB();

  const patient = (await db
    .collection("patients")
    .findOne({ id: patientId })) as Patient | null;
  if (!patient) {
    throw new Error(`Patient with ID ${patientId} not found`);
  }
  const prescriptions = (await db
    .collection("prescriptions")
    .find({ patientId })
    .sort({ createdAt: -1 })
    .toArray()) as unknown as Prescription[];

  return { patient, prescriptions };
}

async function generatePrescriptionWithGemini(
  patient: Patient,
  symptoms: string[],
  previousPrescriptions: Prescription[],
  diagnosis?: string
): Promise<{
  finalDiagnosis: string;
  medications: Medication[];
  confidence: number;
  warnings: string[];
  reasoning: string;
  geminiResponse: string;
}> {
  const model = initializeGemini();

  // Create detailed prompt for Gemini
  const prompt = `
You are an expert medical AI assistant helping doctors create prescriptions. Based on the following patient information, symptoms, and medical history, provide a detailed prescription recommendation.

PATIENT INFORMATION:
- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Allergies: ${patient.allergies.join(", ") || "None"}
- Current Medications: ${patient.currentMedications.join(", ") || "None"}
- Medical History: ${patient.medicalHistory.join(", ") || "None"}

CURRENT SYMPTOMS:
${symptoms.map((s) => `- ${s}`).join("\n")}

PRELIMINARY DIAGNOSIS (if provided):
${diagnosis || "Not provided - please determine based on symptoms"}

PREVIOUS PRESCRIPTIONS:
${
  previousPrescriptions.length > 0
    ? previousPrescriptions
        .slice(0, 3)
        .map(
          (p) => `
- Date: ${p.date}
- Diagnosis: ${p.diagnosis}
- Medications: ${p.medications.map((m) => `${m.name} ${m.strength}`).join(", ")}
- Status: ${p.status}
`
        )
        .join("\n")
    : "No previous prescriptions found"
}

Please provide a response in the following JSON format:
{
  "final_diagnosis": "Specific medical diagnosis",
  "confidence_score": 0.85,
  "medications": [
    {
      "name": "Medication Name",
      "strength": "dosage strength",
      "form": "tablet/capsule/liquid/etc",
      "quantity": number,
      "dosage": "amount per dose",
      "frequency": "how often to take",
      "duration": "how long to take",
      "instructions": "specific instructions",
      "refills": number
    }
  ],
  "warnings": [
    "Important warnings or contraindications"
  ],
  "reasoning": "Detailed explanation of the diagnosis and treatment plan",
  "drug_interactions": "Check for interactions with current medications",
  "follow_up": "Recommended follow-up care"
}

IMPORTANT CONSIDERATIONS:
1. Check for drug allergies and interactions with current medications
2. Consider patient's age and medical history
3. Reference previous prescriptions to avoid over-prescribing
4. Provide appropriate dosing for the patient's age and condition
5. Include necessary warnings and contraindications
6. Be conservative and safe in recommendations
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON response from Gemini");
    }

    const geminiData = JSON.parse(jsonMatch[0]);
    // Convert to our format
    const medications: Medication[] = geminiData.medications.map(
      (
        med: {
          name: string;
          strength: string;
          form?: string;
          quantity?: number;
          dosage: string;
          frequency: string;
          duration: string;
          instructions: string;
          refills?: number;
        },
        index: number
      ) => ({
        id: `M${Date.now()}_${index}`,
        name: med.name,
        genericName: med.name.split(" ")[0],
        strength: med.strength,
        form: med.form || "tablet",
        quantity: med.quantity || 30,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions,
        refills: med.refills || 0,
        cost: Math.floor(Math.random() * 50) + 10,
        sideEffects: [],
        contraindications: [],
      })
    );

    return {
      finalDiagnosis: geminiData.final_diagnosis,
      medications,
      confidence: geminiData.confidence_score || 0.8,
      warnings: geminiData.warnings || [],
      reasoning: geminiData.reasoning,
      geminiResponse: text,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(
      `Failed to generate prescription: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Create MCP Server
const server = new Server(
  {
    name: "prescription-gemini-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_patient_history",
        description:
          "Get patient information and prescription history from MongoDB",
        inputSchema: {
          type: "object",
          properties: {
            patientId: {
              type: "string",
              description: "Patient ID to lookup",
            },
          },
          required: ["patientId"],
        },
      },
      {
        name: "create_prescription_with_gemini",
        description:
          "Create a new prescription using Gemini AI with patient history analysis",
        inputSchema: {
          type: "object",
          properties: {
            patientId: {
              type: "string",
              description: "Patient ID",
            },
            symptoms: {
              type: "array",
              items: { type: "string" },
              description: "List of patient symptoms",
            },
            diagnosis: {
              type: "string",
              description: "Preliminary diagnosis (optional)",
            },
            doctorId: {
              type: "string",
              description: "Doctor ID creating the prescription",
            },
            doctorName: {
              type: "string",
              description: "Doctor name creating the prescription",
            },
            notes: {
              type: "string",
              description: "Additional notes (optional)",
            },
          },
          required: ["patientId", "symptoms", "doctorId", "doctorName"],
        },
      },
      {
        name: "update_prescription_feedback",
        description:
          "Update prescription and store doctor feedback for future learning",
        inputSchema: {
          type: "object",
          properties: {
            prescriptionId: {
              type: "string",
              description: "Prescription ID to update",
            },
            modifications: {
              type: "object",
              description: "Doctor modifications to the prescription",
            },
            doctorId: {
              type: "string",
              description: "Doctor ID making the modifications",
            },
            feedback: {
              type: "string",
              description: "Doctor feedback on AI recommendation",
            },
          },
          required: ["prescriptionId", "modifications", "doctorId"],
        },
      },
      {
        name: "search_prescriptions",
        description: "Search prescriptions in MongoDB by various criteria",
        inputSchema: {
          type: "object",
          properties: {
            patientId: {
              type: "string",
              description: "Filter by patient ID (optional)",
            },
            doctorId: {
              type: "string",
              description: "Filter by doctor ID (optional)",
            },
            status: {
              type: "string",
              description: "Filter by prescription status (optional)",
            },
            dateFrom: {
              type: "string",
              description: "Filter prescriptions from this date (optional)",
            },
            dateTo: {
              type: "string",
              description: "Filter prescriptions to this date (optional)",
            },
            limit: {
              type: "number",
              description: "Maximum number of results (default: 50)",
            },
          },
        },
      },
      {
        name: "get_enhanced_patient_context",
        description:
          "Get comprehensive patient context with risk assessment and insights for better prescription decisions",
        inputSchema: {
          type: "object",
          properties: {
            patientId: {
              type: "string",
              description: "Patient ID to analyze",
            },
          },
          required: ["patientId"],
        },
      },
      {
        name: "validate_prescription_safety",
        description:
          "Validate prescription for drug interactions, allergies, and safety concerns",
        inputSchema: {
          type: "object",
          properties: {
            medications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  strength: { type: "string" },
                  dosage: { type: "string" },
                },
              },
              description: "List of medications to validate",
            },
            patientId: {
              type: "string",
              description: "Patient ID for context",
            },
          },
          required: ["medications", "patientId"],
        },
      },
      {
        name: "suggest_prescription_improvements",
        description:
          "Analyze current prescription and suggest evidence-based improvements",
        inputSchema: {
          type: "object",
          properties: {
            currentPrescription: {
              type: "object",
              description: "Current prescription to analyze",
            },
            patientId: {
              type: "string",
              description: "Patient ID for context",
            },
            symptoms: {
              type: "array",
              items: { type: "string" },
              description: "Current symptoms",
            },
          },
          required: ["currentPrescription", "patientId"],
        },
      },
      {
        name: "check_drug_interactions",
        description:
          "Check for potential drug interactions with patient's current medications",
        inputSchema: {
          type: "object",
          properties: {
            newMedications: {
              type: "array",
              items: { type: "string" },
              description: "New medications to check",
            },
            patientId: {
              type: "string",
              description: "Patient ID to get current medications",
            },
          },
          required: ["newMedications", "patientId"],
        },
      },
      {
        name: "get_doctor_preferences",
        description:
          "Get doctor's prescription preferences based on historical patterns",
        inputSchema: {
          type: "object",
          properties: {
            doctorId: {
              type: "string",
              description: "Doctor ID to analyze",
            },
            symptoms: {
              type: "array",
              items: { type: "string" },
              description: "Symptoms to find similar cases",
            },
            diagnosis: {
              type: "string",
              description: "Diagnosis to match",
            },
          },
          required: ["doctorId"],
        },
      },
      {
        name: "get_patient_insights",
        description:
          "Get AI-generated insights and recommendations for patient management",
        inputSchema: {
          type: "object",
          properties: {
            patientId: {
              type: "string",
              description: "Patient ID to analyze",
            },
            doctorId: {
              type: "string",
              description: "Doctor ID for context",
            },
          },
          required: ["patientId", "doctorId"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_patient_history": {
        const { patientId } = args as { patientId: string };
        const { patient, prescriptions } = await getPatientHistory(patientId);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  patient,
                  prescriptionHistory: prescriptions,
                  totalPrescriptions: prescriptions.length,
                  activePrescriptions: prescriptions.filter(
                    (p: Prescription) => p.status === "active"
                  ).length,
                  recentPrescriptions: prescriptions.slice(0, 5),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "create_prescription_with_gemini": {
        const { patientId, symptoms, diagnosis, doctorId, doctorName, notes } =
          args as {
            patientId: string;
            symptoms: string[];
            diagnosis?: string;
            doctorId: string;
            doctorName: string;
            notes?: string;
          };

        // Get patient history
        const { patient, prescriptions } = await getPatientHistory(patientId);

        // Generate prescription with Gemini
        const geminiResult = await generatePrescriptionWithGemini(
          patient,
          symptoms,
          prescriptions,
          diagnosis
        );

        // Create new prescription
        const newPrescription: Prescription = {
          id: `RX${Date.now()}`,
          patientId,
          patientName: patient.name,
          doctorId,
          doctorName,
          date: new Date().toISOString().split("T")[0],
          diagnosis: geminiResult.finalDiagnosis,
          symptoms,
          medications: geminiResult.medications,
          notes,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isAiGenerated: true,
          aiConfidence: geminiResult.confidence,
          geminiResponse: geminiResult.geminiResponse,
        }; // Save to MongoDB
        const db = await connectToMongoDB();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...prescriptionToSave } = newPrescription;
        await db.collection("prescriptions").insertOne(prescriptionToSave);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  prescription: newPrescription,
                  geminiAnalysis: {
                    confidence: geminiResult.confidence,
                    reasoning: geminiResult.reasoning,
                    warnings: geminiResult.warnings,
                  },
                  patientContext: {
                    totalPreviousPrescriptions: prescriptions.length,
                    allergies: patient.allergies,
                    currentMedications: patient.currentMedications,
                    medicalHistory: patient.medicalHistory,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "update_prescription_feedback": {
        const { prescriptionId, modifications, doctorId, feedback } = args as {
          prescriptionId: string;
          modifications: Partial<Prescription>;
          doctorId: string;
          feedback?: string;
        };

        const db = await connectToMongoDB();

        // Update prescription
        const updateResult = await db.collection("prescriptions").updateOne(
          { id: prescriptionId },
          {
            $set: {
              ...modifications,
              updatedAt: new Date().toISOString(),
            },
          }
        );

        if (updateResult.matchedCount === 0) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Prescription with ID ${prescriptionId} not found`
          );
        }

        // Store feedback for future learning
        const feedbackData = {
          timestamp: new Date().toISOString(),
          prescriptionId,
          doctorId,
          modifications,
          feedback,
          type: "doctor_modification",
        };

        await db.collection("feedback").insertOne(feedbackData);

        const updatedPrescription = await db
          .collection("prescriptions")
          .findOne({ id: prescriptionId });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  updatedPrescription,
                  feedbackStored: true,
                  message:
                    "Prescription updated and feedback stored for future Gemini improvements",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "search_prescriptions": {
        const {
          patientId,
          doctorId,
          status,
          dateFrom,
          dateTo,
          limit = 50,
        } = args as {
          patientId?: string;
          doctorId?: string;
          status?: string;
          dateFrom?: string;
          dateTo?: string;
          limit?: number;
        };

        const db = await connectToMongoDB();
        const query: Record<string, unknown> = {};

        if (patientId) query.patientId = patientId;
        if (doctorId) query.doctorId = doctorId;
        if (status) query.status = status;
        if (dateFrom || dateTo) {
          query.date = {} as Record<string, string>;
          if (dateFrom) (query.date as Record<string, string>).$gte = dateFrom;
          if (dateTo) (query.date as Record<string, string>).$lte = dateTo;
        }

        const prescriptions = await db
          .collection("prescriptions")
          .find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
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
                  limit,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_enhanced_patient_context": {
        const { patientId } = args as { patientId: string };

        const { patient, prescriptions } = await getPatientHistory(patientId);

        // Analyze patient risk factors
        const riskFactors = [];
        if (patient.allergies && patient.allergies.length > 0) {
          riskFactors.push(`Allergies: ${patient.allergies.join(", ")}`);
        }
        if (
          patient.currentMedications &&
          patient.currentMedications.length > 0
        ) {
          riskFactors.push(
            `Current medications: ${patient.currentMedications.join(", ")}`
          );
        }

        // Analyze prescription history
        const recentPrescriptions = prescriptions.slice(0, 5);
        const commonMedications = prescriptions
          .flatMap((p) => p.medications?.map((m) => m.name) || [])
          .reduce((acc: Record<string, number>, med) => {
            acc[med] = (acc[med] || 0) + 1;
            return acc;
          }, {});

        const insights = {
          riskLevel:
            patient.allergies?.length > 2
              ? "HIGH"
              : patient.allergies?.length > 0
                ? "MEDIUM"
                : "LOW",
          keyRiskFactors: riskFactors,
          treatmentHistory: {
            totalPrescriptions: prescriptions.length,
            recentTreatments: recentPrescriptions.map((p) => ({
              diagnosis: p.diagnosis,
              medications: p.medications?.map((m) => m.name) || [],
              date: p.date,
              status: p.status,
            })),
            commonMedications: Object.entries(commonMedications)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 5)
              .map(([med, count]) => ({ medication: med, frequency: count })),
          },
          recommendations: [
            "Review current medications for interactions",
            "Check allergy status before prescribing",
            "Consider patient's treatment history for effectiveness",
          ],
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  patient,
                  enhancedContext: insights,
                  lastUpdated: new Date().toISOString(),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "validate_prescription_safety": {
        const { medications, patientId } = args as {
          medications: Array<{
            name: string;
            strength: string;
            dosage: string;
          }>;
          patientId: string;
        };

        const { patient } = await getPatientHistory(patientId);
        const safetyChecks = {
          allergyConflicts: [] as Array<{
            medication: string;
            allergy: string;
            severity: string;
          }>,
          drugInteractions: [] as Array<{
            newMedication: string;
            existingMedication: string;
            severity: string;
            recommendation: string;
          }>,
          dosageWarnings: [] as Array<{ medication: string; warning: string }>,
          overallSafety: "SAFE",
        };

        // Check for allergy conflicts
        if (patient.allergies) {
          for (const med of medications) {
            for (const allergy of patient.allergies) {
              if (
                med.name.toLowerCase().includes(allergy.toLowerCase()) ||
                allergy.toLowerCase().includes(med.name.toLowerCase())
              ) {
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

        // Check for common drug interactions
        const interactionPairs = [
          ["warfarin", "aspirin"],
          ["metformin", "iodine"],
          ["lithium", "ibuprofen"],
        ];

        for (const med of medications) {
          if (patient.currentMedications) {
            for (const currentMed of patient.currentMedications) {
              for (const [drug1, drug2] of interactionPairs) {
                if (
                  (med.name.toLowerCase().includes(drug1) &&
                    currentMed.toLowerCase().includes(drug2)) ||
                  (med.name.toLowerCase().includes(drug2) &&
                    currentMed.toLowerCase().includes(drug1))
                ) {
                  safetyChecks.drugInteractions.push({
                    newMedication: med.name,
                    existingMedication: currentMed,
                    severity: "MODERATE",
                    recommendation: "Monitor closely and consider alternatives",
                  });
                  if (safetyChecks.overallSafety === "SAFE") {
                    safetyChecks.overallSafety = "CAUTION";
                  }
                }
              }
            }
          }
        }

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

      case "suggest_prescription_improvements": {
        const { patientId } = args as {
          currentPrescription: Record<string, unknown>;
          patientId: string;
        };

        const { patient, prescriptions } = await getPatientHistory(patientId);
        const improvements = {
          dosageOptimization: [] as Array<{
            recommendation: string;
            reason: string;
          }>,
          alternativeMedications: [] as Array<{
            original: string;
            alternative: string;
            reason: string;
          }>,
          durationAdjustments: [] as Array<{
            medication: string;
            suggestion: string;
          }>,
          costOptimization: [] as Array<{
            recommendation: string;
            reason: string;
          }>,
          efficacyImprovements: [] as Array<{
            recommendation: string;
            successfulMedications?: string[];
          }>,
        };

        // Analyze based on patient age
        if (patient.age > 65) {
          improvements.dosageOptimization.push({
            recommendation: "Consider reduced dosage for elderly patient",
            reason:
              "Elderly patients may require lower doses due to slower metabolism",
          });
        }

        // Analyze based on prescription history
        const successfulTreatments = prescriptions.filter(
          (p) => p.status === "completed"
        );
        if (successfulTreatments.length > 0) {
          improvements.efficacyImprovements.push({
            recommendation: "Consider medications that worked well in the past",
            successfulMedications: successfulTreatments
              .flatMap((p) => p.medications?.map((m) => m.name) || [])
              .slice(0, 3),
          });
        }

        improvements.costOptimization.push({
          recommendation: "Consider generic alternatives where available",
          reason: "Generic medications can reduce patient cost burden",
        });

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

      case "check_drug_interactions": {
        const { newMedications, patientId } = args as {
          newMedications: string[];
          patientId: string;
        };

        const { patient } = await getPatientHistory(patientId);
        const interactions = {
          major: [] as Array<{
            newMedication: string;
            existingMedication: string;
            effect: string;
            action: string;
          }>,
          moderate: [] as Array<{
            newMedication: string;
            existingMedication: string;
            effect: string;
            action: string;
          }>,
          minor: [] as Array<{
            newMedication: string;
            existingMedication: string;
            effect: string;
            action: string;
          }>,
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
          [
            "digoxin-furosemide",
            { severity: "moderate", effect: "Electrolyte imbalance" },
          ],
        ]);

        if (patient.currentMedications) {
          for (const newMed of newMedications) {
            for (const currentMed of patient.currentMedications) {
              const interactionKey = `${newMed.toLowerCase()}-${currentMed.toLowerCase()}`;
              const reverseKey = `${currentMed.toLowerCase()}-${newMed.toLowerCase()}`;

              const interaction =
                knownInteractions.get(interactionKey) ||
                knownInteractions.get(reverseKey);

              if (interaction) {
                const interactionData = {
                  newMedication: newMed,
                  existingMedication: currentMed,
                  effect: interaction.effect,
                  action: "Monitor closely and consider alternatives",
                };

                if (interaction.severity === "major") {
                  interactions.major.push(interactionData);
                } else if (interaction.severity === "moderate") {
                  interactions.moderate.push(interactionData);
                } else {
                  interactions.minor.push(interactionData);
                }
              }
            }
          }
        }

        // Generate recommendations
        if (interactions.major.length > 0) {
          interactions.recommendations.push(
            "URGENT: Major drug interactions detected. Consider alternative medications."
          );
        }
        if (interactions.moderate.length > 0) {
          interactions.recommendations.push(
            "Monitor patient closely for side effects."
          );
        }
        if (
          interactions.major.length === 0 &&
          interactions.moderate.length === 0
        ) {
          interactions.recommendations.push(
            "No significant drug interactions detected."
          );
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

      case "get_doctor_preferences": {
        const { doctorId } = args as {
          doctorId: string;
        };

        const db = await connectToMongoDB();

        // Get doctor's prescription history
        const doctorPrescriptions = await db
          .collection("prescriptions")
          .find({ doctorId })
          .sort({ createdAt: -1 })
          .limit(100)
          .toArray();

        // Analyze preferences
        const medicationFrequency = new Map<string, number>();
        const diagnosisPatterns = new Map<string, string[]>();

        for (const prescription of doctorPrescriptions) {
          // Count medication frequency
          if (prescription.medications) {
            for (const med of prescription.medications) {
              const medName = med.name || "";
              medicationFrequency.set(
                medName,
                (medicationFrequency.get(medName) || 0) + 1
              );
            }
          }

          // Group medications by diagnosis
          const diagnosis = prescription.diagnosis || "Unknown";
          if (!diagnosisPatterns.has(diagnosis)) {
            diagnosisPatterns.set(diagnosis, []);
          }
          if (prescription.medications) {
            const meds = prescription.medications.map(
              (m: { name: string }) => m.name || ""
            );
            diagnosisPatterns.get(diagnosis)?.push(...meds);
          }
        }

        // Get top preferred medications
        const topMedications = Array.from(medicationFrequency.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([med, count]) => ({ medication: med, frequency: count }));

        const preferences = {
          totalPrescriptions: doctorPrescriptions.length,
          preferredMedications: topMedications,
          diagnosisPatterns: Object.fromEntries(diagnosisPatterns),
          prescribingStyle: {
            averageMedicationsPerPrescription:
              doctorPrescriptions.length > 0
                ? doctorPrescriptions.reduce(
                    (acc, p) => acc + (p.medications?.length || 0),
                    0
                  ) / doctorPrescriptions.length
                : 0,
            commonDiagnoses: Array.from(diagnosisPatterns.keys()).slice(0, 5),
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

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

async function main() {
  try {
    await connectToMongoDB();
    console.error("Connected to MongoDB successfully");

    // Test Gemini connection
    if (GEMINI_API_KEY) {
      initializeGemini();
      console.error("Gemini AI initialized successfully");
    } else {
      console.error("Warning: GEMINI_API_KEY not set");
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("Prescription Gemini MCP Server running on stdio");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.error("Shutting down...");
  if (mongoClient) {
    await mongoClient.close();
  }
  process.exit(0);
});

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
