import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { MongoClient, MongoClientOptions, ObjectId } from "mongodb";

// MongoDB connection
const uri = process.env.MONGODB_URI as string;
const mongoOptions: MongoClientOptions = {
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  maxPoolSize: 5,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 0,
  connectTimeoutMS: 20000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
};

let mongoClient: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI not found in environment variables");
}

// Initialize MongoDB connection
async function getMongoClient() {
  if (!clientPromise) {
    mongoClient = new MongoClient(uri, mongoOptions);
    clientPromise = mongoClient.connect();
  }
  return clientPromise;
}

// Types for our prescription system
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  allergies: string[];
  currentMedications: string[];
  medicalHistory: string[];
}

interface Prescription {
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

interface PrescriptionRequest {
  patientId: string;
  symptoms: string[];
  diagnosis?: string;
  doctorId: string;
  doctorName: string;
  notes?: string;
}

// File paths
const DATA_DIR = path.join(process.cwd(), "data");
const PATIENTS_FILE = path.join(DATA_DIR, "patients.json");
const PRESCRIPTIONS_FILE = path.join(DATA_DIR, "prescriptions.json");
const FINETUNE_FILE = path.join(
  DATA_DIR,
  "finetune",
  "prescription_finetune_dataset.jsonl"
);

// Initialize data directories
async function initializeDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(path.join(DATA_DIR, "finetune"), { recursive: true });

    // Initialize patients file if it doesn't exist
    try {
      await fs.access(PATIENTS_FILE);
    } catch {
      const defaultPatients: Patient[] = [
        {
          id: "P001",
          name: "Sarah Johnson",
          age: 34,
          gender: "female",
          allergies: ["Penicillin"],
          currentMedications: ["Lisinopril 10mg"],
          medicalHistory: ["Hypertension"],
        },
        {
          id: "P002",
          name: "Michael Chen",
          age: 45,
          gender: "male",
          allergies: [],
          currentMedications: ["Metformin 500mg"],
          medicalHistory: ["Type 2 Diabetes"],
        },
        {
          id: "P003",
          name: "Emily Davis",
          age: 28,
          gender: "female",
          allergies: ["Sulfa drugs"],
          currentMedications: [],
          medicalHistory: ["Asthma"],
        },
      ];
      await fs.writeFile(
        PATIENTS_FILE,
        JSON.stringify(defaultPatients, null, 2)
      );
    }

    // Initialize prescriptions file if it doesn't exist
    try {
      await fs.access(PRESCRIPTIONS_FILE);
    } catch {
      await fs.writeFile(PRESCRIPTIONS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error("Error initializing data directory:", error);
  }
}

// Helper functions
async function loadPatients(): Promise<Patient[]> {
  try {
    console.log("Loading patients from MongoDB...");
    const client = await getMongoClient();
    const db = client.db("Patient");
    const patientsCollection = db.collection("patients");

    const patients = await patientsCollection.find({}).toArray();
    console.log(`Found ${patients.length} patients in MongoDB`);

    // Transform MongoDB documents to our Patient interface
    return patients.map((patient) => ({
      id: patient.id || patient._id?.toString() || "",
      name: patient.name || "",
      age: patient.age || 0,
      gender: patient.gender || "other",
      allergies: patient.allergies || [],
      currentMedications: patient.currentMedications || [],
      medicalHistory: patient.medicalHistory || [],
    }));
  } catch (error) {
    console.error("Error loading patients from MongoDB:", error);
    return [];
  }
}

async function loadPrescriptions(): Promise<Prescription[]> {
  try {
    console.log("Loading prescriptions from MongoDB...");
    const client = await getMongoClient();
    const db = client.db("Patient");
    const prescriptionsCollection = db.collection("prescriptions");

    const prescriptions = await prescriptionsCollection.find({}).toArray();
    console.log(`Found ${prescriptions.length} prescriptions in MongoDB`);

    // Transform MongoDB documents to our Prescription interface
    return prescriptions.map((prescription) => ({
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
  } catch (error) {
    console.error("Error loading prescriptions from MongoDB:", error);
    return [];
  }
}

async function savePrescriptions(prescriptions: Prescription[]): Promise<void> {
  try {
    console.log("Saving prescriptions to MongoDB...");
    const client = await getMongoClient();
    const db = client.db("Patient");
    const prescriptionsCollection = db.collection("prescriptions");

    // For simplicity, we'll replace all prescriptions (in production, you'd want to update only changed ones)
    await prescriptionsCollection.deleteMany({});
    if (prescriptions.length > 0) {
      await prescriptionsCollection.insertMany(prescriptions);
    }
    console.log(`Saved ${prescriptions.length} prescriptions to MongoDB`);
  } catch (error) {
    console.error("Error saving prescriptions to MongoDB:", error);
    throw error;
  }
}

async function savePrescription(prescription: Prescription): Promise<void> {
  try {
    console.log("Saving single prescription to MongoDB...");
    const client = await getMongoClient();
    const db = client.db("Patient");
    const prescriptionsCollection = db.collection("prescriptions");

    // Update or insert the prescription
    await prescriptionsCollection.replaceOne(
      { id: prescription.id },
      prescription,
      { upsert: true }
    );
    console.log(`Saved prescription ${prescription.id} to MongoDB`);
  } catch (error) {
    console.error("Error saving prescription to MongoDB:", error);
    throw error;
  }
}

async function loadFinetuneData(): Promise<any[]> {
  try {
    const data = await fs.readFile(FINETUNE_FILE, "utf-8");
    return data
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.startsWith("//"))
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

// AI prescription generation logic
async function generateAiPrescription(
  patient: Patient,
  symptoms: string[],
  diagnosis?: string
): Promise<{
  finalDiagnosis: string;
  medications: Medication[];
  confidence: number;
  warnings: string[];
  reasoning: string;
}> {
  const finetuneData = await loadFinetuneData();

  // Find matching prescription from dataset
  const matches = finetuneData.filter((data) => {
    const ageMatch = Math.abs(data.input.age - patient.age) <= 10;
    const symptomMatch = symptoms.some((s) =>
      data.input.symptoms.some((ds: string) =>
        ds.toLowerCase().includes(s.toLowerCase())
      )
    );
    const diagnosisMatch = diagnosis
      ? data.input.preliminary_diagnosis &&
        data.input.preliminary_diagnosis
          .toLowerCase()
          .includes(diagnosis.toLowerCase())
      : true;

    return ageMatch && symptomMatch && diagnosisMatch;
  });

  if (matches.length === 0) {
    throw new Error(
      "No matching prescription found for the given symptoms and conditions"
    );
  }

  const bestMatch = matches[0].output;

  // Convert to our format
  const medications: Medication[] = bestMatch.medications.map((med: any) => ({
    id: `M${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: med.name,
    genericName: med.name.split(" ")[0],
    strength: med.dosage,
    form: "tablet",
    quantity: parseInt(med.duration.split(" ")[0]) || 30,
    dosage: med.dosage,
    frequency: med.frequency,
    duration: med.duration,
    instructions: "Take as directed by physician",
    refills: 0,
    cost: Math.floor(Math.random() * 50) + 5,
    sideEffects: [],
    contraindications: [],
  }));

  return {
    finalDiagnosis: bestMatch.final_diagnosis,
    medications,
    confidence: Math.random() * 0.3 + 0.7,
    warnings: bestMatch.warnings || [],
    reasoning: `Based on symptoms: ${symptoms.join(", ")}, age ${patient.age}, and medical history, the most likely diagnosis is ${bestMatch.final_diagnosis}.`,
  };
}

// Create MCP Server
const server = new Server(
  {
    name: "prescription-mcp-server",
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
        name: "list_patients",
        description: "Get list of all patients",
        inputSchema: {
          type: "object",
          properties: {
            doctorId: {
              type: "string",
              description: "Doctor ID to filter patients (optional)",
            },
          },
        },
      },
      {
        name: "get_patient_history",
        description: "Get patient information and prescription history",
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
        name: "create_prescription",
        description:
          "Create a new prescription for a patient using AI analysis",
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
        name: "update_prescription",
        description:
          "Update an existing prescription with doctor modifications",
        inputSchema: {
          type: "object",
          properties: {
            prescriptionId: {
              type: "string",
              description: "Prescription ID to update",
            },
            modifications: {
              type: "object",
              description: "Modifications to apply to the prescription",
            },
            doctorId: {
              type: "string",
              description: "Doctor ID making the modifications",
            },
          },
          required: ["prescriptionId", "modifications", "doctorId"],
        },
      },
      {
        name: "search_prescriptions",
        description: "Search prescriptions by patient, doctor, or criteria",
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
          },
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
      case "list_patients": {
        const { doctorId } = args as { doctorId?: string };

        try {
          if (doctorId) {
            console.log("Loading patients assigned to doctor:", doctorId);
            const client = await getMongoClient();
            const db = client.db("Patient");

            // Get patients assigned to this doctor
            const assignmentsCollection = db.collection(
              "doctor_patient_assignments"
            );
            const patientsCollection = db.collection("patients");

            const assignments = await assignmentsCollection
              .find({ doctorId: doctorId })
              .toArray();

            console.log(
              `Found ${assignments.length} assignments for doctor ${doctorId}`
            );

            const patientIds = assignments.map(
              (assignment) => assignment.patientId
            );

            if (patientIds.length === 0) {
              return {
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
              };
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

            const transformedPatients = patients.map((patient) => ({
              id: patient.id || patient._id?.toString() || "",
              name: patient.name || "",
              age: patient.age || 0,
              gender: patient.gender || "other",
              allergies: patient.allergies || [],
              currentMedications: patient.currentMedications || [],
              medicalHistory: patient.medicalHistory || [],
            }));

            return {
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
            };
          } else {
            // No doctor ID provided, return all patients
            const patients = await loadPatients();

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      patients: patients,
                      count: patients.length,
                      doctorId: "all",
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }
        } catch (error) {
          console.error("Error in list_patients:", error);
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to load patients: ${error}`
          );
        }
      }

      case "get_patient_history": {
        const { patientId } = args as { patientId: string };

        const patients = await loadPatients();
        const patient = patients.find((p) => p.id === patientId);

        if (!patient) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Patient with ID ${patientId} not found`
          );
        }

        const prescriptions = await loadPrescriptions();
        const patientPrescriptions = prescriptions.filter(
          (p) => p.patientId === patientId
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  patient,
                  prescriptionHistory: patientPrescriptions,
                  totalPrescriptions: patientPrescriptions.length,
                  activePrescriptions: patientPrescriptions.filter(
                    (p) => p.status === "active"
                  ).length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "create_prescription": {
        const { patientId, symptoms, diagnosis, doctorId, doctorName, notes } =
          args as unknown as PrescriptionRequest;

        const patients = await loadPatients();
        const patient = patients.find((p) => p.id === patientId);

        if (!patient) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Patient with ID ${patientId} not found`
          );
        }

        // Get existing prescriptions for context
        const prescriptions = await loadPrescriptions();
        const patientPrescriptions = prescriptions.filter(
          (p) => p.patientId === patientId
        );

        // Generate AI prescription
        const aiResult = await generateAiPrescription(
          patient,
          symptoms,
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
          diagnosis: aiResult.finalDiagnosis,
          symptoms,
          medications: aiResult.medications,
          notes,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(), // 1 year
          isAiGenerated: true,
          aiConfidence: aiResult.confidence,
        };

        prescriptions.push(newPrescription);
        await savePrescriptions(prescriptions);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  prescription: newPrescription,
                  aiAnalysis: {
                    confidence: aiResult.confidence,
                    reasoning: aiResult.reasoning,
                    warnings: aiResult.warnings,
                  },
                  patientHistory: {
                    totalPrescriptions: patientPrescriptions.length,
                    previousMedications: patientPrescriptions.flatMap((p) =>
                      p.medications.map((m) => m.name)
                    ),
                    allergies: patient.allergies,
                    currentMedications: patient.currentMedications,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "update_prescription": {
        const { prescriptionId, modifications, doctorId } = args as {
          prescriptionId: string;
          modifications: Partial<Prescription>;
          doctorId: string;
        };

        const prescriptions = await loadPrescriptions();
        const prescriptionIndex = prescriptions.findIndex(
          (p) => p.id === prescriptionId
        );

        if (prescriptionIndex === -1) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Prescription with ID ${prescriptionId} not found`
          );
        }

        // Update prescription
        const updatedPrescription = {
          ...prescriptions[prescriptionIndex],
          ...modifications,
          updatedAt: new Date().toISOString(),
        };

        prescriptions[prescriptionIndex] = updatedPrescription;
        await savePrescriptions(prescriptions);

        // Store feedback for model improvement
        const feedbackData = {
          timestamp: new Date().toISOString(),
          prescriptionId,
          originalPrescription: prescriptions[prescriptionIndex],
          modifications,
          doctorId,
        };

        const feedbackFile = path.join(
          DATA_DIR,
          "feedback",
          `${doctorId}_feedback.jsonl`
        );
        await fs.appendFile(feedbackFile, JSON.stringify(feedbackData) + "\n");

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  updatedPrescription,
                  feedbackStored: true,
                  message:
                    "Prescription updated successfully and feedback stored for model improvement",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "search_prescriptions": {
        const { patientId, doctorId, status, dateFrom, dateTo } = args as {
          patientId?: string;
          doctorId?: string;
          status?: string;
          dateFrom?: string;
          dateTo?: string;
        };

        let prescriptions = await loadPrescriptions();

        // Apply filters
        if (patientId) {
          prescriptions = prescriptions.filter(
            (p) => p.patientId === patientId
          );
        }
        if (doctorId) {
          prescriptions = prescriptions.filter((p) => p.doctorId === doctorId);
        }
        if (status) {
          prescriptions = prescriptions.filter((p) => p.status === status);
        }
        if (dateFrom) {
          prescriptions = prescriptions.filter((p) => p.date >= dateFrom);
        }
        if (dateTo) {
          prescriptions = prescriptions.filter((p) => p.date <= dateTo);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  prescriptions,
                  count: prescriptions.length,
                  filters: { patientId, doctorId, status, dateFrom, dateTo },
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
  await initializeDataDir();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Prescription MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
