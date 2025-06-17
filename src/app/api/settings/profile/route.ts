import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";
import { ObjectId } from "mongodb";

interface UpdateData {
  firstName?: string;
  lastName?: string;
  specialization?: string;
  phone?: string;
  address?: string;
  licenseNumber?: string;
  experience?: string;
  name?: string;
  updatedAt: Date;
}

// GET user profile settings
export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("Patient");

    const user = await db
      .collection("doctors")
      .findOne(
        { _id: new ObjectId(currentUser.doctorId) },
        { projection: { password: 0 } }
      );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = {
      firstName: user.firstName || user.name?.split(" ")[0] || "",
      lastName: user.lastName || user.name?.split(" ")[1] || "",
      specialty: user.specialization || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      licenseNumber: user.licenseNumber || "",
      experience: user.experience || "",
      profileImage: user.profileImage || null,
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update user profile settings
export async function PUT(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();

    const client = await clientPromise;
    const db = client.db("Patient");
    const updateData: UpdateData = {
      firstName: body.firstName,
      lastName: body.lastName,
      specialization: body.specialty, // Map specialty to specialization
      phone: body.phone,
      address: body.address,
      licenseNumber: body.licenseNumber,
      experience: body.experience,
      updatedAt: new Date(),
    };

    // Update the name field as well
    if (body.firstName && body.lastName) {
      updateData.name = `${body.firstName} ${body.lastName}`;
    }

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const result = await db
      .collection("doctors")
      .updateOne(
        { _id: new ObjectId(currentUser.doctorId) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
