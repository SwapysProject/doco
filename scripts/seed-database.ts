import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Patient';

// Sample data
const samplePatients = [
  {
    id: "P001",
    name: "Sarah Johnson",
    age: 34,
    gender: "female",
    allergies: ["Penicillin"],
    currentMedications: ["Lisinopril 10mg"],
    medicalHistory: ["Hypertension"],
    phoneNumber: "+1-555-0101",
    email: "sarah.johnson@email.com"
  },
  {
    id: "P002",
    name: "Michael Chen",
    age: 45,
    gender: "male",
    allergies: [],
    currentMedications: ["Metformin 500mg"],
    medicalHistory: ["Type 2 Diabetes"],
    phoneNumber: "+1-555-0102",
    email: "michael.chen@email.com"
  },
  {
    id: "P003",
    name: "Emily Davis",
    age: 28,
    gender: "female",
    allergies: ["Sulfa drugs"],
    currentMedications: [],
    medicalHistory: ["Asthma"],
    phoneNumber: "+1-555-0103",
    email: "emily.davis@email.com"
  },
  {
    id: "P004",
    name: "Robert Wilson",
    age: 67,
    gender: "male",
    allergies: ["Iodine"],
    currentMedications: ["Atorvastatin 20mg", "Amlodipine 5mg"],
    medicalHistory: ["Cardiovascular Disease", "High Cholesterol"],
    phoneNumber: "+1-555-0104",
    email: "robert.wilson@email.com"
  },
  {
    id: "P005",
    name: "Maria Rodriguez",
    age: 38,
    gender: "female",
    allergies: ["Latex"],
    currentMedications: ["Levothyroxine 50mcg"],
    medicalHistory: ["Hypothyroidism"],
    phoneNumber: "+1-555-0105",
    email: "maria.rodriguez@email.com"
  }
];

const samplePrescriptions = [
  {
    id: "RX001",
    patientId: "P001",
    patientName: "Sarah Johnson",
    doctorId: "D001",
    doctorName: "Dr. John Smith",
    date: "2025-06-10",
    diagnosis: "Hypertension Management",
    symptoms: ["elevated blood pressure", "mild headache"],
    medications: [
      {
        id: "M001",
        name: "Lisinopril",
        genericName: "Lisinopril",
        strength: "10mg",
        form: "tablet",
        quantity: 30,
        dosage: "1 tablet",
        frequency: "once daily",
        duration: "30 days",
        instructions: "Take with or without food, preferably at the same time each day",
        refills: 3,
        cost: 15.50
      }
    ],
    notes: "Continue monitoring blood pressure. Follow up in 4 weeks.",
    status: "active",
    createdAt: "2025-06-10T09:00:00Z",
    updatedAt: "2025-06-10T09:00:00Z",
    expiresAt: "2026-06-10T09:00:00Z",
    isAiGenerated: false,
    aiConfidence: null
  },
  {
    id: "RX002",
    patientId: "P002",
    patientName: "Michael Chen",
    doctorId: "D001",
    doctorName: "Dr. John Smith",
    date: "2025-06-08",
    diagnosis: "Type 2 Diabetes Management",
    symptoms: ["elevated blood sugar", "increased thirst"],
    medications: [
      {
        id: "M002",
        name: "Metformin",
        genericName: "Metformin",
        strength: "500mg",
        form: "tablet",
        quantity: 60,
        dosage: "1 tablet",
        frequency: "twice daily with meals",
        duration: "30 days",
        instructions: "Take with breakfast and dinner to reduce stomach upset",
        refills: 2,
        cost: 12.75
      }
    ],
    notes: "Patient education on diabetes management provided. Schedule HbA1c in 3 months.",
    status: "active",
    createdAt: "2025-06-08T14:30:00Z",
    updatedAt: "2025-06-08T14:30:00Z",
    expiresAt: "2026-06-08T14:30:00Z",
    isAiGenerated: false,
    aiConfidence: null
  }
];

async function seedDatabase() {
  let client: MongoClient;
  
  try {    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('Patient');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection('patients').deleteMany({});
    await db.collection('prescriptions').deleteMany({});
    await db.collection('feedback').deleteMany({});
    
    // Insert sample patients
    console.log('Inserting sample patients...');
    await db.collection('patients').insertMany(samplePatients);
    console.log(`Inserted ${samplePatients.length} patients`);
    
    // Insert sample prescriptions
    console.log('Inserting sample prescriptions...');
    await db.collection('prescriptions').insertMany(samplePrescriptions);
    console.log(`Inserted ${samplePrescriptions.length} prescriptions`);
    
    // Create indexes for better performance
    console.log('Creating indexes...');
    await db.collection('patients').createIndex({ id: 1 }, { unique: true });
    await db.collection('prescriptions').createIndex({ id: 1 }, { unique: true });
    await db.collection('prescriptions').createIndex({ patientId: 1 });
    await db.collection('prescriptions').createIndex({ doctorId: 1 });
    await db.collection('prescriptions').createIndex({ date: -1 });
    await db.collection('feedback').createIndex({ prescriptionId: 1 });
    await db.collection('feedback').createIndex({ doctorId: 1 });
    
    console.log('Database seeded successfully!');
    console.log('\nSample data created:');
    console.log(`- ${samplePatients.length} patients`);
    console.log(`- ${samplePrescriptions.length} prescriptions`);
    console.log('- Indexes created for optimal performance');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (client!) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

seedDatabase();
