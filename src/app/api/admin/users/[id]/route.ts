import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

/** UPDATE user flags (isPremium / isAdmin) */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const body = await req.json();
  const update: Partial<{ isPremium: boolean; isAdmin: boolean }> = {};
  if (typeof body.isPremium === "boolean") update.isPremium = body.isPremium;
  if (typeof body.isAdmin === "boolean") update.isAdmin = body.isAdmin;

  // Prevent self-demotion
  if (id === token.id && update.isAdmin === false) {
    return NextResponse.json(
      { message: "You cannot remove your own admin status." },
      { status: 400 }
    );
  }

  // Optional: prevent removing last admin (uncomment if you want this on PATCH too)
  // if (update.isAdmin === false) {
  //   const remainingAdmins = await User.countDocuments({ isAdmin: true, _id: { $ne: id } });
  //   if (remainingAdmins === 0) {
  //     return NextResponse.json({ message: "At least one admin is required." }, { status: 400 });
  //   }
  // }

  const updated = await User.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true, select: "name email isPremium isAdmin createdAt updatedAt" }
  ).lean();

  if (!updated) return NextResponse.json({ message: "User not found" }, { status: 404 });
  return NextResponse.json(updated);
}

/** DELETE a user */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Prevent deleting yourself
  if (id === token.id) {
    return NextResponse.json(
      { message: "You cannot delete your own account from the admin panel." },
      { status: 400 }
    );
  }

  // Optional: prevent deleting the last remaining admin
  const userToDelete = await User.findById(id, "isAdmin").lean();
  if (!userToDelete) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (userToDelete.isAdmin) {
    const remainingAdmins = await User.countDocuments({ isAdmin: true, _id: { $ne: id } });
    if (remainingAdmins === 0) {
      return NextResponse.json(
        { message: "At least one admin is required. You cannot delete the last admin." },
        { status: 400 }
      );
    }
  }

  await User.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
