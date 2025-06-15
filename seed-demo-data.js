// Simple seeding script for dashboard stats demo
import clientPromise from "./src/lib/mongodb.js";

async function seedDemoData() {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");
    const doctorId = "dr_123";

    // Clear existing demo data
    await db.collection("patients").deleteMany({ doctorId });
    await db.collection("appointments").deleteMany({ doctorId });

    console.log("Cleared existing demo data");

    // Seed patients
    const patients = [
      {
        id: "P001",
        patientId: "P001",
        name: "Sarah Johnson",
        age: 34,
        phone: "+1-555-0101",
        email: "sarah.johnson@email.com",
        condition: "stable",
        status: "active",
        doctorId: doctorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "P002",
        patientId: "P002",
        name: "Michael Chen",
        age: 45,
        phone: "+1-555-0102",
        email: "michael.chen@email.com",
        condition: "critical",
        status: "active",
        doctorId: doctorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "P003",
        patientId: "P003",
        name: "Emily Davis",
        age: 28,
        phone: "+1-555-0103",
        email: "emily.davis@email.com",
        condition: "monitoring",
        status: "active",
        doctorId: doctorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "P004",
        patientId: "P004",
        name: "Robert Wilson",
        age: 52,
        phone: "+1-555-0104",
        email: "robert.wilson@email.com",
        condition: "stable",
        status: "active",
        doctorId: doctorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "P005",
        patientId: "P005",
        name: "Lisa Anderson",
        age: 39,
        phone: "+1-555-0105",
        email: "lisa.anderson@email.com",
        condition: "monitoring",
        status: "active",
        doctorId: doctorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection("patients").insertMany(patients);
    console.log(`Inserted ${patients.length} patients`);

    // Seed appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const appointments = [
      {
        id: "A001",
        appointmentId: "A001",
        patientId: "P001",
        patientName: "Sarah Johnson",
        doctorId: doctorId,
        appointmentDate: today,
        appointmentTime: "09:00",
        status: "scheduled",
        type: "checkup",
        notes: "Regular checkup",
        createdAt: new Date(),
      },
      {
        id: "A002",
        appointmentId: "A002",
        patientId: "P002",
        patientName: "Michael Chen",
        doctorId: doctorId,
        appointmentDate: today,
        appointmentTime: "14:00",
        status: "scheduled",
        type: "consultation",
        notes: "Follow-up consultation",
        createdAt: new Date(),
      },
      {
        id: "A003",
        appointmentId: "A003",
        patientId: "P003",
        patientName: "Emily Davis",
        doctorId: doctorId,
        appointmentDate: tomorrow,
        appointmentTime: "10:30",
        status: "scheduled",
        type: "checkup",
        notes: "Routine checkup",
        createdAt: new Date(),
      },
      {
        id: "A004",
        appointmentId: "A004",
        patientId: "P004",
        patientName: "Robert Wilson",
        doctorId: doctorId,
        appointmentDate: yesterday,
        appointmentTime: "11:00",
        status: "completed",
        type: "consultation",
        notes: "Completed consultation",
        createdAt: new Date(),
      },
    ];

    await db.collection("appointments").insertMany(appointments);
    console.log(`Inserted ${appointments.length} appointments`);

    // Verify the data
    const patientCount = await db
      .collection("patients")
      .countDocuments({ doctorId });
    const appointmentCount = await db
      .collection("appointments")
      .countDocuments({ doctorId });
    const todayAppointments = await db
      .collection("appointments")
      .countDocuments({
        doctorId,
        appointmentDate: {
          $gte: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          ),
          $lt: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1
          ),
        },
      });

    console.log("\\nSeeding completed successfully!");
    console.log(`Total patients: ${patientCount}`);
    console.log(`Total appointments: ${appointmentCount}`);
    console.log(`Today's appointments: ${todayAppointments}`);
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

seedDemoData();
