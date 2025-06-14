import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { MongoClient } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Types
interface Patient {
  _id?: string;
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
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
  status: 'active' | 'completed' | 'cancelled' | 'expired';
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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-care-system';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let mongoClient: MongoClient;
let genAI: GoogleGenerativeAI;

async function connectToMongoDB() {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    console.error('Connected to MongoDB');
  }
  return mongoClient.db('doctor-care-system');
}

function initializeGemini() {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI.getGenerativeModel({ model: 'gemini-pro' });
}

// Helper functions
async function getPatientHistory(patientId: string) {
  const db = await connectToMongoDB();
  
  const patient = await db.collection('patients').findOne({ id: patientId }) as Patient | null;
  if (!patient) {
    throw new Error(`Patient with ID ${patientId} not found`);
  }
  
  const prescriptions = await db.collection('prescriptions')
    .find({ patientId })
    .sort({ createdAt: -1 })
    .toArray() as Prescription[];
  
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
- Allergies: ${patient.allergies.join(', ') || 'None'}
- Current Medications: ${patient.currentMedications.join(', ') || 'None'}
- Medical History: ${patient.medicalHistory.join(', ') || 'None'}

CURRENT SYMPTOMS:
${symptoms.map(s => `- ${s}`).join('\n')}

PRELIMINARY DIAGNOSIS (if provided):
${diagnosis || 'Not provided - please determine based on symptoms'}

PREVIOUS PRESCRIPTIONS:
${previousPrescriptions.length > 0 
  ? previousPrescriptions.slice(0, 3).map(p => `
- Date: ${p.date}
- Diagnosis: ${p.diagnosis}
- Medications: ${p.medications.map(m => `${m.name} ${m.strength}`).join(', ')}
- Status: ${p.status}
`).join('\n')
  : 'No previous prescriptions found'}

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
      throw new Error('Could not parse JSON response from Gemini');
    }
    
    const geminiData = JSON.parse(jsonMatch[0]);
      // Convert to our format
    const medications: Medication[] = geminiData.medications.map((med: any, index: number) => ({
      id: `M${Date.now()}_${index}`,
      name: med.name,
      genericName: med.name.split(' ')[0],
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
      contraindications: []
    }));
    
    return {
      finalDiagnosis: geminiData.final_diagnosis,
      medications,
      confidence: geminiData.confidence_score || 0.8,
      warnings: geminiData.warnings || [],
      reasoning: geminiData.reasoning,
      geminiResponse: text
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Failed to generate prescription: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Create MCP Server
const server = new Server(
  {
    name: 'prescription-gemini-mcp-server',
    version: '1.0.0',
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
        name: 'get_patient_history',
        description: 'Get patient information and prescription history from MongoDB',
        inputSchema: {
          type: 'object',
          properties: {
            patientId: {
              type: 'string',
              description: 'Patient ID to lookup',
            },
          },
          required: ['patientId'],
        },
      },
      {
        name: 'create_prescription_with_gemini',
        description: 'Create a new prescription using Gemini AI with patient history analysis',
        inputSchema: {
          type: 'object',
          properties: {
            patientId: {
              type: 'string',
              description: 'Patient ID',
            },
            symptoms: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of patient symptoms',
            },
            diagnosis: {
              type: 'string',
              description: 'Preliminary diagnosis (optional)',
            },
            doctorId: {
              type: 'string',
              description: 'Doctor ID creating the prescription',
            },
            doctorName: {
              type: 'string',
              description: 'Doctor name creating the prescription',
            },
            notes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['patientId', 'symptoms', 'doctorId', 'doctorName'],
        },
      },
      {
        name: 'update_prescription_feedback',
        description: 'Update prescription and store doctor feedback for future learning',
        inputSchema: {
          type: 'object',
          properties: {
            prescriptionId: {
              type: 'string',
              description: 'Prescription ID to update',
            },
            modifications: {
              type: 'object',
              description: 'Doctor modifications to the prescription',
            },
            doctorId: {
              type: 'string',
              description: 'Doctor ID making the modifications',
            },
            feedback: {
              type: 'string',
              description: 'Doctor feedback on AI recommendation',
            },
          },
          required: ['prescriptionId', 'modifications', 'doctorId'],
        },
      },
      {
        name: 'search_prescriptions',
        description: 'Search prescriptions in MongoDB by various criteria',
        inputSchema: {
          type: 'object',
          properties: {
            patientId: {
              type: 'string',
              description: 'Filter by patient ID (optional)',
            },
            doctorId: {
              type: 'string',
              description: 'Filter by doctor ID (optional)',
            },
            status: {
              type: 'string',
              description: 'Filter by prescription status (optional)',
            },
            dateFrom: {
              type: 'string',
              description: 'Filter prescriptions from this date (optional)',
            },
            dateTo: {
              type: 'string',
              description: 'Filter prescriptions to this date (optional)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 50)',
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
      case 'get_patient_history': {
        const { patientId } = args as { patientId: string };
        const { patient, prescriptions } = await getPatientHistory(patientId);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                patient,
                prescriptionHistory: prescriptions,
                totalPrescriptions: prescriptions.length,
                activePrescriptions: prescriptions.filter((p: any) => p.status === 'active').length,
                recentPrescriptions: prescriptions.slice(0, 5),
              }, null, 2),
            },
          ],
        };
      }

      case 'create_prescription_with_gemini': {
        const {
          patientId,
          symptoms,
          diagnosis,
          doctorId,
          doctorName,
          notes,
        } = args as {
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
          date: new Date().toISOString().split('T')[0],
          diagnosis: geminiResult.finalDiagnosis,
          symptoms,
          medications: geminiResult.medications,
          notes,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          isAiGenerated: true,
          aiConfidence: geminiResult.confidence,
          geminiResponse: geminiResult.geminiResponse,
        };        // Save to MongoDB  
        const db = await connectToMongoDB();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...prescriptionToSave } = newPrescription;
        await db.collection('prescriptions').insertOne(prescriptionToSave);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
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
              }, null, 2),
            },
          ],
        };
      }

      case 'update_prescription_feedback': {
        const { prescriptionId, modifications, doctorId, feedback } = args as {
          prescriptionId: string;
          modifications: Partial<Prescription>;
          doctorId: string;
          feedback?: string;
        };
        
        const db = await connectToMongoDB();
        
        // Update prescription
        const updateResult = await db.collection('prescriptions').updateOne(
          { id: prescriptionId },
          {
            $set: {
              ...modifications,
              updatedAt: new Date().toISOString(),
            }
          }
        );
        
        if (updateResult.matchedCount === 0) {
          throw new McpError(ErrorCode.InvalidRequest, `Prescription with ID ${prescriptionId} not found`);
        }
        
        // Store feedback for future learning
        const feedbackData = {
          timestamp: new Date().toISOString(),
          prescriptionId,
          doctorId,
          modifications,
          feedback,
          type: 'doctor_modification',
        };
        
        await db.collection('feedback').insertOne(feedbackData);
        
        const updatedPrescription = await db.collection('prescriptions').findOne({ id: prescriptionId });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                updatedPrescription,
                feedbackStored: true,
                message: 'Prescription updated and feedback stored for future Gemini improvements',
              }, null, 2),
            },
          ],
        };
      }

      case 'search_prescriptions': {
        const { patientId, doctorId, status, dateFrom, dateTo, limit = 50 } = args as {
          patientId?: string;
          doctorId?: string;
          status?: string;
          dateFrom?: string;
          dateTo?: string;
          limit?: number;
        };
        
        const db = await connectToMongoDB();
        const query: any = {};
        
        if (patientId) query.patientId = patientId;
        if (doctorId) query.doctorId = doctorId;
        if (status) query.status = status;
        if (dateFrom || dateTo) {
          query.date = {};
          if (dateFrom) query.date.$gte = dateFrom;
          if (dateTo) query.date.$lte = dateTo;
        }
        
        const prescriptions = await db.collection('prescriptions')
          .find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
          .toArray();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                prescriptions,
                count: prescriptions.length,
                query,
                limit,
              }, null, 2),
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
    console.error('Connected to MongoDB successfully');
    
    // Test Gemini connection
    if (GEMINI_API_KEY) {
      initializeGemini();
      console.error('Gemini AI initialized successfully');
    } else {
      console.error('Warning: GEMINI_API_KEY not set');
    }
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('Prescription Gemini MCP Server running on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.error('Shutting down...');
  if (mongoClient) {
    await mongoClient.close();
  }
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
