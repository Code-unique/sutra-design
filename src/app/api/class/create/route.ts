import { connectDB } from "@/lib/db";
import Class from "@/models/Class";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  
  // Validate body to include nested chapters and lessons
  const newClass = await Class.create(body);
  return NextResponse.json(newClass);
}
