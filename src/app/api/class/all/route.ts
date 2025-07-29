import { connectDB } from "@/lib/db";
import Class from "@/models/Class";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const classes = await Class.find().sort({ createdAt: -1 });
  return NextResponse.json(classes);
}
