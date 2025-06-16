// Test script for my-prescriptions API endpoint
// Run this with: node test-my-prescriptions.js

const fetch = require("node-fetch");

const testMyPrescriptionsAPI = async () => {
  try {
    console.log("Testing /api/my-prescriptions endpoint...\n");

    // Test basic fetch
    const response = await fetch("http://localhost:3000/api/my-prescriptions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Note: In a real test, you'd need to include proper authentication headers
        // 'Authorization': 'Bearer your-jwt-token'
      },
    });

    const result = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("\n✅ API call successful!");
      console.log(`Found ${result.data?.length || 0} prescriptions`);

      if (result.data && result.data.length > 0) {
        console.log("\nFirst prescription:");
        console.log("- ID:", result.data[0].id);
        console.log("- Patient:", result.data[0].patientName);
        console.log("- Doctor:", result.data[0].doctorName);
        console.log("- Status:", result.data[0].status);
        console.log("- Medications:", result.data[0].medications?.length || 0);
      }

      if (result.pagination) {
        console.log("\nPagination info:");
        console.log("- Page:", result.pagination.page);
        console.log("- Total:", result.pagination.total);
        console.log("- Pages:", result.pagination.pages);
      }
    } else {
      console.log("\n❌ API call failed:", result.message);
    }
  } catch (error) {
    console.error("\n❌ Error testing API:", error.message);
    console.log(
      "\nNote: Make sure the development server is running on localhost:3000"
    );
    console.log("and that you have proper authentication setup.");
  }
};

testMyPrescriptionsAPI();

// Test with query parameters
const testWithFilters = async () => {
  try {
    console.log("\n\nTesting with filters...");

    const response = await fetch(
      "http://localhost:3000/api/my-prescriptions?status=active&limit=5",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();
    console.log("Filtered results:", result.data?.length || 0, "prescriptions");
  } catch (error) {
    console.log("Filter test failed:", error.message);
  }
};

setTimeout(testWithFilters, 2000);
