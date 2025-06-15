import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";
import { ObjectId } from "mongodb";

// Get messages for the current doctor
export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }
    const url = new URL(request.url);
    const conversationWith = url.searchParams.get("with"); // Doctor ID to chat with
    const since = url.searchParams.get("since"); // For polling - get messages since this time
    const isPolling = url.searchParams.get("polling") === "true";

    const client = await clientPromise;
    const db = client.db("Patient");
    const messagesCollection = db.collection("doctor_messages");
    let messages;
    if (conversationWith) {
      console.log(
        `🔍 Fetching messages between ${currentUser.doctorId} and ${conversationWith}${since ? ` since ${since}` : ""}`
      );

      // Build query
      const query: {
        $or: Array<{ senderId: string; receiverId: string }>;
        createdAt?: { $gt: Date };
      } = {
        $or: [
          { senderId: currentUser.doctorId, receiverId: conversationWith },
          { senderId: conversationWith, receiverId: currentUser.doctorId },
        ],
      };

      // If polling and "since" is provided, only get messages after that time
      if (isPolling && since) {
        const sinceDate = new Date(since);
        query.createdAt = { $gt: sinceDate };
        console.log(
          `📊 Polling: looking for messages since ${sinceDate.toISOString()}`
        );
      }

      // Get messages between current doctor and specified doctor
      messages = await messagesCollection
        .find(query)
        .sort({ createdAt: 1 })
        .toArray();

      console.log(
        `📨 Found ${messages.length} messages${isPolling ? " (polling)" : ""}`
      );
      if (messages.length > 0 && !isPolling) {
        console.log(
          "Sample messages:",
          messages.map((m) => ({
            from: m.senderId,
            to: m.receiverId,
            message: m.message.substring(0, 50),
            createdAt: m.createdAt,
          }))
        );
      }
    } else {
      // Get all conversations (latest message from each conversation)
      const pipeline = [
        {
          $match: {
            $or: [
              { senderId: currentUser.doctorId },
              { receiverId: currentUser.doctorId },
            ],
          },
        },
        {
          $addFields: {
            conversationWith: {
              $cond: {
                if: { $eq: ["$senderId", currentUser.doctorId] },
                then: "$receiverId",
                else: "$senderId",
              },
            },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: "$conversationWith",
            lastMessage: { $first: "$$ROOT" },
            unreadCount: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$receiverId", currentUser.doctorId] },
                      { $eq: ["$isRead", false] },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
        },
      ];

      messages = await messagesCollection.aggregate(pipeline).toArray();
    }

    return NextResponse.json({
      success: true,
      messages: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// Send a message to another doctor
export async function POST(request: NextRequest) {
  try {
    console.log("=== SENDING MESSAGE ===");

    const currentUser = getCurrentUser(request);
    console.log("Current user:", currentUser);

    if (!currentUser) {
      console.log("❌ No authentication");
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { receiverId, message, messageType = "text" } = await request.json();
    console.log("Message data:", { receiverId, message, messageType });

    if (!receiverId || !message) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { success: false, message: "Receiver ID and message are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const messagesCollection = db.collection("doctor_messages");
    const doctorsCollection = db.collection("doctors");

    // Verify receiver is a valid doctor
    console.log("🔍 Looking for receiver doctor:", receiverId);
    const receiver = await doctorsCollection.findOne({
      _id: new ObjectId(receiverId),
    });

    if (!receiver) {
      console.log("❌ Receiver doctor not found");
      return NextResponse.json(
        { success: false, message: "Receiver doctor not found" },
        { status: 404 }
      );
    }

    console.log("✅ Receiver found:", receiver.name);

    // Create message
    const messageData = {
      senderId: currentUser.doctorId,
      receiverId: receiverId,
      message: message,
      messageType: messageType,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("💾 Saving message:", messageData);

    const result = await messagesCollection.insertOne(messageData);
    console.log("✅ Message saved with ID:", result.insertedId);

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      messageId: result.insertedId,
    });
  } catch (error) {
    console.error("💥 Error sending message:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send message" },
      { status: 500 }
    );
  }
}

// Mark messages as read
export async function PUT(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { senderId } = await request.json();

    const client = await clientPromise;
    const db = client.db("Patient");
    const messagesCollection = db.collection("doctor_messages");

    // Mark all messages from senderId to current user as read
    await messagesCollection.updateMany(
      {
        senderId: senderId,
        receiverId: currentUser.doctorId,
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { success: false, message: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
