import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);

    const client = await clientPromise;
    const db = client.db("Patient");
    const doctorsCollection = db.collection("doctors");

    // Get ALL doctors without any filters
    const allDoctors = await doctorsCollection
      .find(
        {},
        {
          projection: {
            password: 0,
            _id: 1,
            name: 1,
            email: 1,
            specialization: 1,
            isOnline: 1,
          },
        }
      )
      .toArray();

    console.log("All doctors in database:", allDoctors);
    console.log("Current user:", currentUser);

    // Check if currentUser.doctorId is valid
    let currentDoctorObjectId = null;
    try {
      if (currentUser?.doctorId) {
        currentDoctorObjectId = new ObjectId(currentUser.doctorId);
      }
    } catch (err) {
      console.log(
        "Invalid ObjectId for current user:",
        currentUser?.doctorId,
        err
      );
    }

    // Get doctors excluding current user (if valid)
    let filteredDoctors = allDoctors;
    if (currentDoctorObjectId) {
      filteredDoctors = allDoctors.filter(
        (doctor) => !doctor._id.equals(currentDoctorObjectId)
      );
    }

    return NextResponse.json({
      success: true,
      debug: {
        currentUser,
        currentDoctorId: currentUser?.doctorId,
        currentDoctorObjectId: currentDoctorObjectId?.toString(),
        allDoctorsCount: allDoctors.length,
        allDoctors: allDoctors.map((d) => ({
          _id: d._id.toString(),
          name: d.name,
          email: d.email,
        })),
        filteredDoctorsCount: filteredDoctors.length,
        filteredDoctors: filteredDoctors.map((d) => ({
          _id: d._id.toString(),
          name: d.name,
          email: d.email,
        })),
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
