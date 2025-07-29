import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, receiverId } = await req.json();
    const senderId = token.sub;

    let resolvedReceiverId = receiverId;

    // If receiverId is missing and sender is not admin, assign admin as receiver
    if (!resolvedReceiverId && token.role !== "admin") {
      const admin = await User.findOne({ isAdmin: true });
      if (!admin) {
        return NextResponse.json({ error: "Admin not found" }, { status: 404 });
      }
      resolvedReceiverId = admin._id;
    }

    if (!resolvedReceiverId) {
      return NextResponse.json({ error: "Missing receiver" }, { status: 400 });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId: resolvedReceiverId,
      content,
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (err) {
    console.error("POST send message error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
