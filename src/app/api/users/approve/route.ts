// app/api/users/approve/route.ts
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PremiumApplication from "@/models/PremiumApplication";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await User.findOneAndUpdate({ email }, { isPremium: true });
    await PremiumApplication.findOneAndDelete({ email });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Approval error:", err);
    return NextResponse.json({ error: "Approval failed" }, { status: 500 });
  }
}
