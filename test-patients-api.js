// Test script to check the /api/my-patients endpoint
const testPatientsAPI = async () => {
  try {
    console.log("Testing /api/my-patients endpoint...");

    const response = await fetch("http://localhost:3000/api/my-patients", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const data = await response.json();
    console.log("Response data:", JSON.stringify(data, null, 2));

    if (data.success && data.patients) {
      console.log("✅ Success! Found", data.patients.length, "patients");
      data.patients.forEach((patient, index) => {
        console.log(`Patient ${index + 1}:`, {
          id: patient._id || patient.id,
          name: patient.name || `${patient.firstName} ${patient.lastName}`,
          phone: patient.phone,
          email: patient.email,
        });
      });
    } else {
      console.log("❌ No patients found or error:", data.message);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

// Run the test
testPatientsAPI();
