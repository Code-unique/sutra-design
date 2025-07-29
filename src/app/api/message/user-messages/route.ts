import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = token.sub;

    const admin = await User.findOne({ isAdmin: true });
    if (!admin) return NextResponse.json([], { status: 404 });

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: admin._id },
        { senderId: admin._id, receiverId: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (err) {
    console.error("GET user-messages error:", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
