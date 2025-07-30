import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  // Read JWT from cookies – no need to import/modify your auth options
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const users = await User.find({}, "name email isPremium isAdmin createdAt updatedAt")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(users, { headers: { "Cache-Control": "no-store" } });
}
