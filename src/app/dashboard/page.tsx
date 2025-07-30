"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ShieldCheck, Star, PlayCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogTitle  } from "@/components/ui/dialog"; // assuming you have shadcn dialog
import clsx from "clsx";

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
}

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

function VideoThumbnail({ videoUrl, title, onClick }: { videoUrl: string; title: string; onClick: () => void }) {
  const videoId = getYouTubeId(videoUrl);
  if (!videoId) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer group rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
      title={`Play: ${title}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      role="button"
      aria-label={`Play video for ${title}`}
    >
      <img
        src={thumbnailUrl}
        alt={`Thumbnail of ${title}`}
        className="w-full aspect-video object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition" />
      <PlayCircle
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-90 group-hover:opacity-100 w-16 h-16 drop-shadow-lg"
      />
    </div>
  );
}

function VideoModal({ videoUrl, title, open, onOpenChange }: { videoUrl: string; title: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const videoId = getYouTubeId(videoUrl);
  if (!videoId) return null;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-4xl max-h-[60vh] sm:max-h-[80vh] rounded-xl overflow-hidden bg-black">
        <DialogTitle className="sr-only">{title}</DialogTitle> {/* Visually hidden but accessible */}
        <iframe
          width="100%"
          height="100%"
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video"
        />
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [classes, setClasses] = useState<ClassType[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // For modal state (which lesson is open)
  const [openVideo, setOpenVideo] = useState<{ classId: string; chapterIdx: number; lessonIdx: number } | null>(null);

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

  const openLessonVideo = (classId: string, chapterIdx: number, lessonIdx: number) => {
    setOpenVideo({ classId, chapterIdx, lessonIdx });
  };

  const closeVideo = () => setOpenVideo(null);

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
      <h1 className="text-4xl font-bold text-center text-pink-700 mb-8">📚 Sutra Design Classes</h1>

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
              <a className="text-black underline hover:text-pink-600" href="/apply">
                Apply now
              </a>{" "}
              if you haven&apos;t.
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
              <p className="text-gray-600 mt-1">{cls.description}</p>
              <span className="inline-block mt-2 text-xs text-pink-500 font-medium select-none">
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
                    className="w-full flex justify-between items-center text-left text-pink-600 font-semibold hover:text-pink-800 transition"
                    aria-expanded={isExpanded}
                    aria-controls={`chapter-content-${key}`}
                  >
                    <span>📁 Chapter {chIdx + 1}: {chapter.title}</span>
                    <span className="text-sm select-none">{isExpanded ? "− Hide" : "+ Show"}</span>
                  </button>

                  {isExpanded && (
                    <div id={`chapter-content-${key}`} className="mt-3 space-y-4 pl-4">
                      {chapter.lessons?.map((lesson, lsIdx) => {
                        const videoOpen = openVideo &&
                          openVideo.classId === cls._id &&
                          openVideo.chapterIdx === chIdx &&
                          openVideo.lessonIdx === lsIdx;

                        return (
                          <div
                            key={lsIdx}
                            className="bg-pink-50 rounded-md border p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm hover:shadow-md transition"
                          >
                            <VideoThumbnail
                              videoUrl={lesson.videoUrl}
                              title={lesson.title}
                              onClick={() => openLessonVideo(cls._id, chIdx, lsIdx)}
                            />

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-black text-lg truncate">{lesson.title}</h4>
                              <p className="text-gray-600 text-sm line-clamp-3">{lesson.description}</p>
                            </div>

                            <Dialog open={videoOpen} onOpenChange={closeVideo}>
                              <DialogTrigger asChild>
                                {/* Invisible, since we open modal via thumbnail */}
                                <button className="sr-only">Open video modal</button>
                              </DialogTrigger>
                              <VideoModal
                                videoUrl={lesson.videoUrl}
                                title={lesson.title}
                                open={videoOpen}
                                onOpenChange={closeVideo}
                              />
                              <DialogClose asChild>
                                <button
                                  className="absolute top-4 right-4 z-50 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-80 transition"
                                  aria-label="Close video"
                                  onClick={closeVideo}
                                >
                                  ✕
                                </button>
                              </DialogClose>
                            </Dialog>
                          </div>
                        );
                      })}
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
