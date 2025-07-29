import { connectDB } from "@/lib/db";
import PremiumApplication from "@/models/PremiumApplication";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectDB();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const emailQuery = url.searchParams.get("email");

  let apps;

  if (token.role === "admin") {
    apps = await PremiumApplication.find().sort({ createdAt: -1 });
  } else if (emailQuery) {
    apps = await PremiumApplication.find({ email: emailQuery }).sort({ createdAt: -1 });
  } else {
    return NextResponse.json({ error: "Email query parameter is required" }, { status: 400 });
  }

  return NextResponse.json(apps);
}

export async function POST(req: Request) {
  await connectDB();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const newApplication = await PremiumApplication.create({
      ...body,
      email: token.email, // Attach user's email from token
    });

    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
