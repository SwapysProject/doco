// Test script to debug the Gemini AI prescription generation
async function testPrescriptionGeneration() {
  try {
    const testData = {
      action: "analyze_and_generate",
      patientId: "P001",
      symptoms: ["headache", "fever"],
      diagnosis: "Common cold",
      doctorId: "DOC001",
      doctorName: "Dr. Smith",
    };

    console.log("Testing prescription generation with data:", testData);

    const response = await fetch(
      "http://localhost:3004/api/ai-prescription-enhanced",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      }
    );

    const result = await response.json();
    console.log("API Response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Test error:", error);
  }
}

// Run the test
testPrescriptionGeneration();
