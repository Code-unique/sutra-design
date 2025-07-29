"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ShieldCheck, Star } from "lucide-react";

type LessonType = {
  title: string;
  description: string;
  videoUrl: string;
};

type ChapterType = {
  title: string;
  lessons: LessonType[];
};

type ClassType = {
  _id: string;
  title: string;
  description: string;
  isPremium: boolean;
  chapters: ChapterType[];
};

interface UserType {
  role?: string;
  isPremium?: boolean;
  // Add other user fields if needed
}

const convertToEmbedUrl = (url: string) => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  const videoId = ytMatch?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [classes, setClasses] = useState<ClassType[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const user = session?.user as UserType;
  const isAdmin = user?.role === "admin";
  const userIsPremium = user?.isPremium || false;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchClasses();
    }
  }, [status]);

  const fetchClasses = async () => {
    try {
      const res = await axios.get("/api/class/all");
      setClasses(res.data);
    } catch (err) {
      console.error("Failed to fetch classes", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleChapter = (classId: string, chapterIdx: number) => {
    const key = `${classId}-${chapterIdx}`;
    setExpandedChapters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const visibleClasses = isAdmin
    ? classes
    : classes.filter((cls) => (cls.isPremium ? userIsPremium : true));

  if (status === "loading" || loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-white">
        <Loader2 className="animate-spin text-pink-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-center text-pink-700 mb-6">📚 Sutra Design Classes</h1>

      {isAdmin && (
        <div className="flex items-center gap-3 p-4 border border-yellow-300 bg-yellow-50 rounded-md shadow-sm">
          <ShieldCheck className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-700 font-medium">
            Admin Mode: Viewing all classes including premium.
          </span>
        </div>
      )}

      {!isAdmin && (
        <div className="p-4 border bg-pink-50 rounded-md text-center shadow-sm">
          {userIsPremium ? (
            <span className="text-green-600 font-medium flex justify-center items-center gap-2">
              <Star className="w-4 h-4 text-green-500" />
              Premium Access Active – Enjoy All Content!
            </span>
          ) : (
            <span className="text-yellow-700 font-medium">
              ⏳ Your premium is under review.{" "}
              <a className="text-black underline hover:text-pink-600" href="/apply">Apply now</a> if you haven&apos;t.
            </span>
          )}
        </div>
      )}

      {visibleClasses.length === 0 && (
        <div className="text-center text-gray-400 py-10 text-lg">
          No classes available for your access level yet.
        </div>
      )}

      {visibleClasses.map((cls) => (
        <Card
          key={cls._id}
          className="rounded-xl border shadow-md hover:shadow-lg transition bg-white"
        >
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-pink-700">{cls.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{cls.description}</p>
              <span className="inline-block mt-2 text-xs text-pink-500 font-medium">
                {cls.isPremium ? "🔐 Premium Class" : "🌐 Free Class"}
              </span>
            </div>

            {cls.chapters?.map((chapter, chIdx) => {
              const key = `${cls._id}-${chIdx}`;
              const isExpanded = expandedChapters[key];

              return (
                <div key={chIdx} className="border-t pt-4">
                  <button
                    onClick={() => toggleChapter(cls._id, chIdx)}
                    className="w-full flex justify-between items-center text-left text-pink-600 font-semibold hover:text-pink-800"
                  >
                    <span>📁 Chapter {chIdx + 1}: {chapter.title}</span>
                    <span className="text-sm">{isExpanded ? "− Hide" : "+ Show"}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-3 pl-4">
                      {chapter.lessons?.map((lesson, lsIdx) => (
                        <div key={lsIdx} className="bg-pink-50 p-4 rounded-md border space-y-2">
                          <h4 className="font-semibold text-black">
                            📄 Lesson {lsIdx + 1}: {lesson.title}
                          </h4>
                          <p className="text-sm text-gray-600">{lesson.description}</p>
                          <iframe
                            className="w-full rounded-md border aspect-video"
                            src={convertToEmbedUrl(lesson.videoUrl)}
                            title={lesson.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
