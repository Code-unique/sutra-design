import { connectDB } from "@/lib/db";
import Class from "@/models/Class";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = context.params;
  await connectDB();
  const body = await req.json();

  if (!body || Object.keys(body).length === 0) {
    return NextResponse.json({ message: "No data provided" }, { status: 400 });
  }

  const updated = await Class.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ message: "Class not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

