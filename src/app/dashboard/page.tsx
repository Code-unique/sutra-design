"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ShieldCheck, Star, PlayCircle, ChevronDown, ChevronUp, Lock, Unlock } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogTitle } from "@/components/ui/dialog";

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

function VideoThumbnail({ videoUrl, title, onClick, isLocked }: { videoUrl: string; title: string; onClick: () => void; isLocked?: boolean }) {
  const videoId = getYouTubeId(videoUrl);
  if (!videoId) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      onClick={!isLocked ? onClick : undefined}
      className={`relative rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${
        isLocked 
          ? "cursor-not-allowed opacity-70 grayscale" 
          : "cursor-pointer group hover:shadow-xl hover:scale-[1.02]"
      }`}
      title={isLocked ? "Premium content - upgrade to access" : `Play: ${title}`}
      tabIndex={!isLocked ? 0 : -1}
      onKeyDown={(e) => !isLocked && e.key === "Enter" && onClick()}
      role={!isLocked ? "button" : undefined}
      aria-label={isLocked ? "Premium content locked" : `Play video for ${title}`}
    >
      <img
        src={thumbnailUrl}
        alt={`Thumbnail of ${title}`}
        className="w-full aspect-video object-cover"
        loading="lazy"
      />
      <div className={`absolute inset-0 transition ${
        isLocked ? "bg-gray-800 bg-opacity-70" : "bg-black bg-opacity-30 group-hover:bg-opacity-50"
      }`} />
      {isLocked ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
          <Lock className="w-10 h-10 mb-2 mx-auto" />
          <span className="text-sm font-medium block text-center">Premium Content</span>
        </div>
      ) : (
        <PlayCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-90 group-hover:opacity-100 w-16 h-16 drop-shadow-lg transition-transform group-hover:scale-110" />
      )}
    </div>
  );
}

function VideoModal({ videoUrl, title, open, onOpenChange }: { videoUrl: string; title: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const videoId = getYouTubeId(videoUrl);
  if (!videoId) return null;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-4xl max-h-[60vh] sm:max-h-[80vh] rounded-xl overflow-hidden bg-black border-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <iframe
          width="100%"
          height="100%"
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video"
        />
        <DialogClose className="absolute top-4 right-4 z-50 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-80 transition hover:scale-110">
          ✕
        </DialogClose>
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
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-pink-600 w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-600">Loading your classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
            📚 Sutra Design Academy
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Master the art of design with our comprehensive courses and expert-led tutorials
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3 p-4 border border-yellow-300 bg-yellow-50 rounded-lg shadow-sm">
            <ShieldCheck className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <span className="text-sm text-yellow-700 font-medium">
              Admin Mode: Viewing all classes including premium content.
            </span>
          </div>
        )}

        {!isAdmin && (
          <div className="p-4 border border-pink-200 bg-white rounded-lg shadow-sm text-center">
            {userIsPremium ? (
              <span className="text-green-700 font-medium flex justify-center items-center gap-2">
                <Star className="w-5 h-5 text-green-500" />
                Premium Access Active – Enjoy All Content!
              </span>
            ) : (
              <span className="text-gray-700">
                ⏳ Your premium status is under review.{" "}
                
              </span>
            )}
          </div>
        )}

        {visibleClasses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Unlock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No classes available yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {isAdmin 
                ? "Create some classes to get started!" 
                : "Check back soon for new content or upgrade to premium for full access."
              }
            </p>
          </div>
        )}

        <div className="grid gap-6">
          {visibleClasses.map((cls) => (
            <Card
              key={cls._id}
              className="rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden"
            >
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{cls.title}</h2>
                      <p className="text-gray-600 mt-1">{cls.description}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      cls.isPremium 
                        ? "bg-pink-100 text-pink-700" 
                        : "bg-green-100 text-green-700"
                    }`}>
                      {cls.isPremium ? (
                        <>
                          <Lock className="w-3 h-3" />
                          Premium
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3" />
                          Free
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {cls.chapters?.map((chapter, chIdx) => {
                  const key = `${cls._id}-${chIdx}`;
                  const isExpanded = expandedChapters[key];
                  const ChevronIcon = isExpanded ? ChevronUp : ChevronDown;

                  return (
                    <div key={chIdx} className="border-t pt-4">
                      <button
                        onClick={() => toggleChapter(cls._id, chIdx)}
                        className="w-full flex justify-between items-center text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        aria-expanded={isExpanded}
                        aria-controls={`chapter-content-${key}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            {chIdx + 1}
                          </div>
                          <span className="font-semibold text-gray-800">
                            {chapter.title}
                          </span>
                        </div>
                        <ChevronIcon className="w-5 h-5 text-gray-400 transition-transform" />
                      </button>

                      {isExpanded && (
                        <div id={`chapter-content-${key}`} className="mt-4 space-y-4 pl-11">
                          {chapter.lessons?.map((lesson, lsIdx) => {
                            const videoOpen = openVideo &&
                              openVideo.classId === cls._id &&
                              openVideo.chapterIdx === chIdx &&
                              openVideo.lessonIdx === lsIdx;

                            const isLessonLocked = cls.isPremium && !userIsPremium && !isAdmin;

                            return (
                              <div
                                key={lsIdx}
                                className="bg-gray-50 rounded-lg border p-4 flex flex-col md:flex-row items-start gap-4 shadow-sm hover:shadow-md transition-all"
                              >
                                <VideoThumbnail
                                  videoUrl={lesson.videoUrl}
                                  title={lesson.title}
                                  onClick={() => openLessonVideo(cls._id, chIdx, lsIdx)}
                                  isLocked={isLessonLocked}
                                />

                                <div className="flex-1 min-w-0 space-y-2">
                                  <h4 className="font-semibold text-gray-800 text-lg">{lesson.title}</h4>
                                  <p className="text-gray-600 text-sm">{lesson.description}</p>
                                  {isLessonLocked && (
                                    <p className="text-pink-600 text-sm font-medium">
                                      Upgrade to premium to access this lesson
                                    </p>
                                  )}
                                </div>

                                <VideoModal
                                  videoUrl={lesson.videoUrl}
                                  title={lesson.title}
                                  open={!!videoOpen}
                                  onOpenChange={closeVideo}
                                />
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
      </div>
    </div>
  );
}