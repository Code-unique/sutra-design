import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const admin = await User.findOne({ isAdmin: true });

  if (!admin) {
    console.error("❌ Admin not found in DB.");
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  const senderIds = await Message.distinct("senderId", { receiverId: admin._id });
  const receiverIds = await Message.distinct("receiverId", { senderId: admin._id });

  const uniqueUserIds = [...new Set([...senderIds, ...receiverIds])]
    .filter((id) => id?.toString() !== admin._id.toString());

  const users = await User.find({ _id: { $in: uniqueUserIds } }).select("name email");

  return NextResponse.json(users);
}
