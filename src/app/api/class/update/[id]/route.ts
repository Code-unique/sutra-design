import { connectDB } from "@/lib/db";
import Class from "@/models/Class";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  await connectDB();
  const body = await req.json();

  // Minimal validation (same shape used in front-end)
  if (!body?.title || !body?.description || !Array.isArray(body?.chapters)) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const updated = await Class.findByIdAndUpdate(
    id,
    { $set: {
      title: body.title,
      description: body.description,
      isPremium: !!body.isPremium,
      chapters: body.chapters,
    }},
    { new: true }
  ).lean();

  if (!updated) return NextResponse.json({ message: "Class not found" }, { status: 404 });
  return NextResponse.json(updated);
}
