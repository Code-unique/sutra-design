import { connectDB } from "@/lib/db";
import PremiumApplication from "@/models/PremiumApplication";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();

  await PremiumApplication.create(data);

  return NextResponse.json({ success: true, message: "Application received" });
}
