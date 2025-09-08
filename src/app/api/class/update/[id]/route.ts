import { connectDB } from "@/lib/db";
import Class from "@/models/Class";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

interface Lesson {
  title: string;
  videoUrl: string;
}

interface Chapter {
  title: string;
  lessons: Lesson[];
}

interface ClassBody {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  chapters?: Chapter[];
}

export async function PATCH(req: Request, context: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = context.params;
  await connectDB();
  const body: ClassBody = await req.json();

  if (body.chapters) {
    body.chapters = body.chapters.map((chapter) => ({
      ...chapter,
      lessons: chapter.lessons.map((lesson) => ({
        ...lesson,
        videoUrl: extractUid(lesson.videoUrl),
      })),
    }));
  }

  if (!body.thumbnailUrl && body.chapters?.[0]?.lessons?.[0]?.videoUrl) {
    body.thumbnailUrl = `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${body.chapters[0].lessons[0].videoUrl}/thumbnails/thumbnail.jpg?time=1s&height=360`;
  }

  const updated = await Class.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();

  if (!updated) {
    return NextResponse.json({ message: "Class not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

function extractUid(videoUrl: string) {
  if (!videoUrl) return "";
  const match = videoUrl.match(/([a-f0-9]{32})/);
  return match ? match[1] : videoUrl;
}
