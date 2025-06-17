// Test script to verify MCP integration
const testMcpIntegration = async () => {
  console.log("🧪 Testing MCP Integration...\n");

  // Test 1: Get enhanced patient context
  console.log("1. Testing get_enhanced_patient_context...");
  try {
    const response = await fetch("http://localhost:3000/api/mcp-prescription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get_enhanced_patient_context",
        patientId: "P001",
      }),
    });
    const result = await response.json();
    console.log(
      "✅ Enhanced patient context:",
      result.success ? "SUCCESS" : "FAILED"
    );
    if (result.data)
      console.log("   Data:", JSON.stringify(result.data, null, 2));
  } catch (error) {
    console.log("❌ Enhanced patient context failed:", error.message);
  }

  // Test 2: Validate prescription safety
  console.log("\n2. Testing validate_prescription_safety...");
  try {
    const response = await fetch("http://localhost:3000/api/mcp-prescription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "validate_prescription_safety",
        patientId: "P001",
        medications: [
          { name: "Aspirin", strength: "81mg", dosage: "1 tablet" },
          { name: "Metformin", strength: "500mg", dosage: "2 tablets" },
        ],
      }),
    });
    const result = await response.json();
    console.log("✅ Safety validation:", result.success ? "SUCCESS" : "FAILED");
    if (result.data) console.log("   Safety assessment available");
  } catch (error) {
    console.log("❌ Safety validation failed:", error.message);
  }

  // Test 3: Check drug interactions
  console.log("\n3. Testing check_drug_interactions...");
  try {
    const response = await fetch("http://localhost:3000/api/mcp-prescription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "check_drug_interactions",
        patientId: "P001",
        newMedications: ["Warfarin", "Aspirin"],
      }),
    });
    const result = await response.json();
    console.log("✅ Drug interactions:", result.success ? "SUCCESS" : "FAILED");
    if (result.data) console.log("   Interaction analysis available");
  } catch (error) {
    console.log("❌ Drug interactions failed:", error.message);
  }

  console.log("\n🎯 MCP Integration Test Complete!");
  console.log(
    "If all tests show SUCCESS, MCP is ready to enhance doctor experience."
  );
};

// Run the test if this is a browser environment
if (typeof window !== "undefined") {
  testMcpIntegration();
} else {
  console.log(
    "This test should be run in a browser console when the Next.js app is running."
  );
  console.log(
    "Copy and paste the testMcpIntegration function into browser console."
  );
}

export { testMcpIntegration };
