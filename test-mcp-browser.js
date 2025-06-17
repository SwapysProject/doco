// Test MCP integration
// Run this in the browser console after loading the new prescription page

async function testMCPConnection() {
  console.log("🧪 === TESTING MCP CONNECTION ===");

  try {
    // Test 1: List Patients
    console.log("🧪 Test 1: List Patients");
    const patientsResponse = await fetch("/api/mcp-prescription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "list_patients",
        args: {
          doctorId: "DR001", // Replace with actual doctor ID
        },
      }),
    });

    const patientsResult = await patientsResponse.json();
    console.log("✅ Patients Test Result:", patientsResult);

    // Test 2: Search Prescriptions
    console.log("🧪 Test 2: Search Prescriptions");
    const prescriptionsResponse = await fetch("/api/mcp-prescription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "search_prescriptions",
        args: {
          patientId: "P001", // Replace with actual patient ID
        },
      }),
    });

    const prescriptionsResult = await prescriptionsResponse.json();
    console.log("✅ Prescriptions Test Result:", prescriptionsResult);

    console.log("🎉 === MCP TESTS COMPLETED ===");
  } catch (error) {
    console.error("❌ MCP Test Error:", error);
  }
}

// Auto-run the test
testMCPConnection();
