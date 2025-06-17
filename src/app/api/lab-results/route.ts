import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";
import { ObjectId } from "mongodb";
import { createNotification } from "@/lib/notifications-server";

// POST: Add lab results and notify doctor
export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const labResultData = await request.json();

    // Validate required fields
    const requiredFields = ["patientId", "patientName", "testName", "results"];
    for (const field of requiredFields) {
      if (!labResultData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const labResultsCollection = db.collection("lab_results");

    // Generate lab result ID
    const count = await labResultsCollection.countDocuments();
    const labResultId = `LAB${String(count + 1).padStart(4, "0")}`;

    // Create lab result object
    const labResult = {
      labResultId,
      doctorId: currentUser.doctorId,
      doctorName: currentUser.name,
      patientId: labResultData.patientId,
      patientName: labResultData.patientName,
      testName: labResultData.testName,
      testType: labResultData.testType || "general",
      results: labResultData.results,
      normalRange: labResultData.normalRange || "",
      unit: labResultData.unit || "",
      status: labResultData.status || "completed",
      priority: labResultData.priority || "normal", // normal, urgent, critical
      notes: labResultData.notes || "",
      testDate: labResultData.testDate
        ? new Date(labResultData.testDate)
        : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await labResultsCollection.insertOne(labResult);

    // Create notification for lab results
    const priorityText =
      labResult.priority === "critical"
        ? " [CRITICAL]"
        : labResult.priority === "urgent"
          ? " [URGENT]"
          : "";

    await createNotification({
      doctorId: currentUser.doctorId,
      type: "lab_results",
      title: `Lab Results Available${priorityText}`,
      message: `${labResult.testName} results for ${labResult.patientName} are ready for review`,
      patientId: labResult.patientId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Lab results added successfully",
        labResultId: result.insertedId.toString(),
        labResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding lab results:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add lab results" },
      { status: 500 }
    );
  }
}

// GET: Fetch lab results for the current doctor's patients
export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db("Patient");
    const labResultsCollection = db.collection("lab_results");

    // Build query
    const query: {
      doctorId: string;
      patientId?: string;
      status?: string;
      priority?: string;
    } = {
      doctorId: currentUser.doctorId,
    };

    if (patientId) query.patientId = patientId;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const labResults = await labResultsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalCount = await labResultsCollection.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        labResults,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching lab results:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch lab results" },
      { status: 500 }
    );
  }
}

// PUT: Update lab result status
export async function PUT(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { labResultId, ...updateData } = await request.json();

    if (!labResultId) {
      return NextResponse.json(
        { success: false, message: "Lab result ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const labResultsCollection = db.collection("lab_results");

    // Update the lab result
    const result = await labResultsCollection.updateOne(
      {
        _id: new ObjectId(labResultId),
        doctorId: currentUser.doctorId, // Ensure doctor can only update their own lab results
      },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Lab result not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lab result updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating lab result:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update lab result" },
      { status: 500 }
    );
  }
}
