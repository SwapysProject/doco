const { MongoClient } = require("mongodb");

async function getPatientIds() {
  const uri =
    "mongodb+srv://doc2025:4VyNMAvQtApjqJP7@doc.clwfyfj.mongodb.net/Patient?retryWrites=true&w=majority&appName=doc";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("Patient");
    const patients = await db
      .collection("patients")
      .find({})
      .limit(5)
      .toArray();

    console.log("Available Patient IDs for MCP Testing:");
    console.log("=====================================");

    if (patients.length === 0) {
      console.log("No patients found. Creating test patient...");

      const testPatient = {
        id: "P001",
        name: "John Doe",
        age: 45,
        gender: "male",
        allergies: ["Penicillin", "Sulfa"],
        currentMedications: ["Metformin 500mg", "Lisinopril 10mg"],
        medicalHistory: ["Type 2 Diabetes", "Hypertension"],
        email: "john.doe@example.com",
        phone: "555-0123",
      };

      await db.collection("patients").insertOne(testPatient);
      console.log("✅ Created test patient with ID: P001");
      console.log("   Name: John Doe");
      console.log("   Allergies: Penicillin, Sulfa");
      console.log("   Current Meds: Metformin, Lisinopril");
    } else {
      patients.forEach((patient, index) => {
        console.log(`${index + 1}. Patient ID: ${patient.id || patient._id}`);
        console.log(`   Name: ${patient.name}`);
        console.log(`   Age: ${patient.age}`);
        console.log(`   Allergies: ${patient.allergies?.join(", ") || "None"}`);
        console.log(
          `   Current Meds: ${patient.currentMedications?.join(", ") || "None"}`
        );
        console.log("   ---");
      });
    }

    console.log("\n🧪 MCP Testing Guide:");
    console.log("1. Start your app: npm run dev");
    console.log("2. Open Postman");
    console.log("3. Use patient IDs above for testing");
    console.log("4. Test URL: http://localhost:3000/api/mcp-prescription");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.close();
  }
}

getPatientIds();
