// app/api/class/delete/[id]/route.ts

import { connectDB } from "@/lib/db";
import Class from "@/models/Class";
import { NextResponse } from "next/server";

// This handler uses the correct format for App Router dynamic routes.
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  await connectDB();

  try {
    const deletedClass = await Class.findByIdAndDelete(id);

    if (!deletedClass) {
      return NextResponse.json(
        { message: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Class deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE_CLASS_ERROR]:", error);
    return NextResponse.json(
      { message: "Server error deleting class" },
      { status: 500 }
    );
  }
}
