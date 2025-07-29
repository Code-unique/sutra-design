import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const admin = await User.findOne({ isAdmin: true });
  if (!admin) return NextResponse.json([], { status: 404 });

  const messages = await Message.find({
    $or: [
      { senderId: userId, receiverId: admin._id },
      { senderId: admin._id, receiverId: userId },
    ],
  }).sort({ createdAt: 1 });

  return NextResponse.json(messages);
}
