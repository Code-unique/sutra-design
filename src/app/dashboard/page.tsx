"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  ImageIcon,
  Search,
  Filter,
  Film,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

// shadcn/ui
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import EmptyState from "@/components/ui/EmptyState";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
type LessonType = {
  title: string;
  description?: string;
  videoUrl: string; // Cloudflare Stream UID or full url
  thumbnail?: string; // uploaded thumbnail (optional)
  duration?: string;
};

type ChapterType = {
  title: string;
  lessons: LessonType[];
};

type ClassType = {
  _id: string;
  title: string;
  description?: string;
  isPremium?: boolean;
  thumbnailUrl?: string; // Optional uploaded thumbnail for course card
  chapters: ChapterType[];
  progress?: number; // percent (0-100)
};

interface UserType {
  role?: string;
  isPremium?: boolean;
}

// -----------------------------------------------------------------------------
// Cloudflare Stream helpers (robust)
// -----------------------------------------------------------------------------
const CUSTOMER_CODE =
  process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE || "your-customer-code";

function isFullUrl(s?: string) {
  return !!s && (s.startsWith("http://") || s.startsWith("https://"));
}

function getThumbnailUrl(uidOrUrl?: string, time = 1, height = 360) {
  if (!uidOrUrl) return "";
  if (isFullUrl(uidOrUrl)) return uidOrUrl;
  if (uidOrUrl.includes("/")) return uidOrUrl;
  return `https://customer-${CUSTOMER_CODE}.cloudflarestream.com/${uidOrUrl}/thumbnails/thumbnail.jpg?time=${time}s&height=${height}`;
}

function getEmbedUrl(uidOrUrl?: string) {
  if (!uidOrUrl) return "";
  if (isFullUrl(uidOrUrl)) return uidOrUrl;
  if (uidOrUrl.includes("/iframe") || uidOrUrl.includes("cloudflarestream.com"))
    return uidOrUrl;
  return `https://customer-${CUSTOMER_CODE}.cloudflarestream.com/${uidOrUrl}/iframe?autoplay=1`;
}

// -----------------------------------------------------------------------------
// UI atoms
// -----------------------------------------------------------------------------
function PremiumPill() {
  return (
    <Badge
      variant="secondary"
      className="bg-purple-100 text-udemy-purple border border-purple-200"
    >
      🔐 Premium
    </Badge>
  );
}

function FreePill() {
  return (
    <Badge
      variant="outline"
      className="border-green-200 text-green-700 bg-green-50"
    >
      🌐 Free
    </Badge>
  );
}

function ProgressBar({ percentage = 0 }: { percentage: number }) {
  const clamped = Math.max(0, Math.min(100, percentage));
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="h-2 rounded-full bg-udemy-purple"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3" role="listitem">
      <div className="p-2 rounded-xl bg-gray-100">
        <Icon className="w-5 h-5 text-gray-700" />
      </div>
      <div className="leading-tight">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Thumbnails: use plain <img> to avoid next/image remote-domain issues
// -----------------------------------------------------------------------------
function Thumbnail({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  const fallback = "/default-thumbnail.jpg";
  return (
    <div className={`bg-gray-100 rounded-md overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || fallback}
        alt={alt || "thumbnail"}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallback;
        }}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// CourseThumbnail - shows uploaded thumbnail if present, otherwise Cloudflare
// -----------------------------------------------------------------------------
function CourseThumbnail({
  thumbnailUrl,
  uid,
  title,
  onClick,
  locked = false,
}: {
  thumbnailUrl?: string;
  uid?: string;
  title: string;
  onClick?: () => void;
  locked?: boolean;
}) {
  const displayUrl =
    thumbnailUrl && thumbnailUrl.length > 0
      ? thumbnailUrl
      : uid
      ? getThumbnailUrl(uid, 1, 360)
      : "";

  return (
    <div
      onClick={locked ? undefined : onClick}
      title={
        locked ? "Premium content - upgrade to access" : `Open: ${title}`
      }
      className={
        `relative group rounded-2xl overflow-hidden ring-1 ring-gray-200/70 bg-white ` +
        (locked
          ? "cursor-not-allowed opacity-70 grayscale"
          : "cursor-pointer hover:shadow-xl")
      }
      role="button"
      aria-disabled={locked}
    >
      <div style={{ paddingTop: "56.25%" }} className="relative w-full">
        <div className="absolute inset-0">
          {displayUrl ? (
            <Thumbnail src={displayUrl} alt={`Thumbnail for ${title}`} />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {!locked && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      {!locked && (
        <PlayCircle className="absolute w-14 h-14 drop-shadow-md text-white/95 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90 group-hover:scale-110 transition-transform" />
      )}

      {locked && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
          <Lock className="w-8 h-8 mb-1" />
          <span className="text-xs font-medium">Premium</span>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Global VideoModal (single instance)
// -----------------------------------------------------------------------------
function VideoModal({
  uid,
  title,
  open,
  onOpenChange,
}: {
  uid?: string;
  title?: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!uid) return null;
  const embedUrl = getEmbedUrl(uid);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-5xl rounded-2xl overflow-hidden bg-black border-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div style={{ paddingTop: "56.25%" }} className="relative w-full">
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// -----------------------------------------------------------------------------
// Memoized Lesson Item
// -----------------------------------------------------------------------------
const LessonItem = React.memo(function LessonItem({
  locked,
  index,
  lesson,
  onPlay,
}: {
  locked: boolean;
  index: number;
  lesson: LessonType;
  onPlay: () => void;
}) {
  return (
    <div
      className={
        `flex items-center gap-3 rounded-lg border transition ` +
        (locked
          ? "bg-gray-50 border-gray-200"
          : "bg-white hover:bg-gray-50 border-transparent")
      }
      role="listitem"
    >
      <button
        disabled={locked}
        onClick={onPlay}
        className={
          `shrink-0 grid place-items-center w-8 h-8 rounded-full text-xs font-semibold ` +
          (locked ? "bg-gray-200 text-gray-500" : "bg-udemy-purple text-white")
        }
        aria-label={locked ? "Premium content locked" : `Play ${lesson.title}`}
      >
        {locked ? <Lock className="w-4 h-4" /> : index + 1}
      </button>

      <div className="min-w-0 flex-1 py-2">
        <div className="flex items-center gap-2">
          <p
            className={`font-medium text-sm truncate ${
              locked ? "text-gray-500" : "text-gray-900"
            }`}
          >
            {lesson.title}
          </p>
          {locked ? (
            <XCircle className="w-4 h-4 text-gray-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500/80" />
          )}
        </div>
        <p className="text-xs text-gray-500 line-clamp-1">
          {lesson.description}
        </p>
      </div>

      <div className="px-3 text-xs text-gray-500">
        {lesson.duration || "—"}
      </div>
    </div>
  );
});

// -----------------------------------------------------------------------------
// Page: dashboard with YouTube-like player + suggestions
// -----------------------------------------------------------------------------
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [classes, setClasses] = useState<ClassType[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<"all" | "in-progress" | "completed">("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "progress">("title");

  // selected video for the main player (YouTube style)
  const [selectedVideo, setSelectedVideo] = useState<{
    classId: string;
    chapterIdx: number;
    lessonIdx: number;
    uid: string;
    title: string;
    description?: string;
    thumbnail?: string;
  } | null>(null);

  // single global modal
  const [modalOpen, setModalOpen] = useState(false);

  const user = session?.user as UserType;
  const isAdmin = user?.role === "admin";
  const userIsPremium = user?.isPremium || false;

  // redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/api/class/all");
      const data: ClassType[] = Array.isArray(res.data) ? res.data : [];

      // sanitize progress (no randomization)
      const sanitized = data.map((cls) => ({
        ...cls,
        progress:
          typeof cls.progress === "number" && cls.progress >= 0 && cls.progress <= 100
            ? cls.progress
            : 0,
      }));

      setClasses(sanitized);

      // if none selected, choose first playable lesson for premium or first available
      if (!selectedVideo && sanitized.length) {
        const firstPlayable = findFirstPlayableLesson(sanitized, userIsPremium, isAdmin);
        if (firstPlayable) {
          setSelectedVideo(firstPlayable);
        }
      }
    } catch (e) {
      console.error("Failed to fetch classes", e);
      setError("Failed to load classes. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, userIsPremium, selectedVideo]);

  useEffect(() => {
    if (status === "authenticated") {
      void fetchClasses();
    }
  }, [status, fetchClasses]);

  function toggleChapter(classId: string, chapterIdx: number) {
    const key = `${classId}-${chapterIdx}`;
    setExpandedChapters((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // Open lesson in main player (YouTube style)
  const openLessonVideo = useCallback(
    (classId: string, chapterIdx: number, lessonIdx: number) => {
      const cls = classes.find((c) => c._id === classId);
      if (!cls) return;
      const lesson = cls.chapters?.[chapterIdx]?.lessons?.[lessonIdx];
      if (!lesson) return;

      const thumb =
        lesson.thumbnail ||
        cls.thumbnailUrl ||
        (lesson.videoUrl ? getThumbnailUrl(lesson.videoUrl, 1, 120) : undefined);

      setSelectedVideo({
        classId,
        chapterIdx,
        lessonIdx,
        uid: lesson.videoUrl,
        title: lesson.title,
        description: lesson.description,
        thumbnail: thumb,
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [classes]
  );

  // compute visible classes per tab & search & sort
  const visibleClasses = useMemo(() => {
    const base = isAdmin
      ? classes
      : classes.filter((c) => (c.isPremium ? userIsPremium : true));

    const byTab =
      tab === "all"
        ? base
        : tab === "in-progress"
        ? base.filter((c) => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100)
        : base.filter((c) => (c.progress ?? 0) === 100);

    const q = query.trim().toLowerCase();
    const filtered = !q
      ? byTab
      : byTab.filter((c) =>
          [c.title, c.description].some((t) => t?.toLowerCase().includes(q))
        );

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      const pa = a.progress ?? 0;
      const pb = b.progress ?? 0;
      return pb - pa; // high progress first
    });

    return sorted;
  }, [classes, isAdmin, userIsPremium, tab, query, sortBy]);

  // Build suggestions from selectedVideo (memoized)
  const suggestions = useMemo(() => {
    if (!selectedVideo) return [];
    const cls = classes.find((c) => c._id === selectedVideo.classId);
    if (!cls) return [];

    const flat: Array<{
      chapterIdx: number;
      lessonIdx: number;
      lesson: LessonType;
    }> = [];
    cls.chapters.forEach((ch, chIdx) => {
      ch.lessons.forEach((ls, lsIdx) =>
        flat.push({ chapterIdx: chIdx, lessonIdx: lsIdx, lesson: ls })
      );
    });

    const currentIndex = flat.findIndex(
      (f) =>
        f.chapterIdx === selectedVideo.chapterIdx &&
        f.lessonIdx === selectedVideo.lessonIdx
    );
    const start = currentIndex >= 0 ? currentIndex + 1 : 0;
    const max = 10;

    const out = flat.slice(start, start + max);
    if (out.length < max) {
      out.push(...flat.slice(0, Math.max(0, max - out.length)));
    }
    return out;
  }, [classes, selectedVideo]);

  // resume (first in-progress lesson within accessible classes)
  const resumeTarget = useMemo(() => {
    const source = isAdmin
      ? classes
      : classes.filter((c) => (c.isPremium ? userIsPremium : true));

    const inProgress = source.find(
      (c) => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100
    );
    if (!inProgress) return null;

    // naive resume: first lesson of first chapter
    if (inProgress.chapters?.[0]?.lessons?.[0]) {
      const l = inProgress.chapters[0].lessons[0];
      return {
        classId: inProgress._id,
        chapterIdx: 0,
        lessonIdx: 0,
        uid: l.videoUrl,
        title: l.title,
        description: l.description,
        thumbnail:
          l.thumbnail ||
          inProgress.thumbnailUrl ||
          getThumbnailUrl(l.videoUrl, 1, 120),
      };
    }
    return null;
  }, [classes, isAdmin, userIsPremium]);

  // Stats for overview (memoized)
  const stats = useMemo(() => {
    const total = classes.length;
    const completed = classes.filter((c) => (c.progress ?? 0) === 100).length;
    const inProgress = classes.filter(
      (c) => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100
    ).length;
    const premium = classes.filter((c) => c.isPremium).length;

    return (
      <>
        <Stat icon={Film} label="Total courses" value={String(total)} />
        <Stat icon={CheckCircle2} label="Completed" value={String(completed)} />
        <Stat icon={Loader2} label="In progress" value={String(inProgress)} />
        <Stat icon={Lock} label="Premium" value={String(premium)} />
      </>
    );
  }, [classes]);

  // Render loading
  if (status === "loading" || (loading && !classes.length)) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="w-10 h-10 animate-spin text-udemy-purple" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 pb-12">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur bg-white/90 border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-udemy-purple/10 grid place-items-center">
              <Film className="w-5 h-5 text-udemy-purple" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              My Learning
            </h1>
            {isAdmin && (
              <div className="ml-2 flex items-center gap-2 text-yellow-700 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-md">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-medium">Admin Mode</span>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search your courses"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 w-72"
                aria-label="Search courses"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() =>
                  setSortBy((s) => (s === "title" ? "progress" : "title"))
                }
                aria-label="Toggle sort"
              >
                <Filter className="w-4 h-4" /> Sort:{" "}
                <span className="font-semibold capitalize">{sortBy}</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-3">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "in-progress" | "completed")} className="w-full">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* If a video is selected: show YouTube-like player at top */}
      {selectedVideo && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
            <Card className="rounded-2xl overflow-hidden">
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                <iframe
                  src={getEmbedUrl(selectedVideo.uid)}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-28 h-16 flex-shrink-0">
                    <Thumbnail
                      src={selectedVideo.thumbnail}
                      alt={selectedVideo.title}
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedVideo.title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {selectedVideo.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setModalOpen(true)}
                      className="hidden sm:inline-flex"
                    >
                      Open
                    </Button>
                    <Button
                      onClick={() => setSelectedVideo(null)}
                      variant="ghost"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggestions */}
            <div className="space-y-3">
              <Card className="rounded-2xl">
                <CardContent>
                  <h3 className="font-semibold text-gray-900 mb-3">Up next</h3>
                  <ScrollArea className="max-h-[48vh]">
                    <div className="space-y-2" role="list" aria-label="Up next">
                      {suggestions.map((s, idx) => {
                        const cls = classes.find((c) => c._id === selectedVideo.classId)!;

                        return (
                          <div
                            key={`${selectedVideo.classId}-${s.chapterIdx}-${s.lessonIdx}-${idx}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() =>
                              openLessonVideo(selectedVideo.classId, s.chapterIdx, s.lessonIdx)
                            }
                            role="listitem"
                          >
                            {/* Thumbnail */}
                            <div className="w-20 h-12 shrink-0 rounded-md overflow-hidden bg-gray-100">
                              <Thumbnail
                                src={getThumbnailUrl(s.lesson.videoUrl, 1, 120)}
                                alt={s.lesson.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Lesson info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {s.lesson.title}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {cls.title} · {s.lesson.duration || "—"}
                              </p>
                            </div>

                            {/* Play icon */}
                            <PlayCircle className="w-5 h-5 text-udemy-purple shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Premium banner */}
      {!isAdmin && !userIsPremium && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-udemy-purple/90 to-udemy-purple text-black shadow-md">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" />
                <p className="font-medium">
                  ⏳ Your premium is under review.{" "}
                  <a className="underline" href="/apply">
                    Apply now
                  </a>{" "}
                  if you haven&apos;t.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="secondary" className="text-udemy-purple">
                  <a href="/apply">Apply for Premium</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content list */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* Left: Course list */}
        <div className="space-y-6">
          {/* error state */}
          {!!error && (
            <Card className="rounded-2xl border-red-200 bg-red-50">
              <CardContent className="p-5 text-sm text-red-700">
                {error}
              </CardContent>
            </Card>
          )}

          {loading && classes.length === 0 ? (
            <>
              <div className="h-40 bg-gray-100 rounded animate-pulse" />
            </>
          ) : visibleClasses.length === 0 ? (
            <EmptyState
              label={
                tab === "all"
                  ? "No classes available for your access level yet."
                  : tab === "in-progress"
                  ? "You don't have any courses in progress."
                  : "You haven't completed any courses yet."
              }
            />
          ) : (
            visibleClasses.map((cls) => (
              <motion.div
                key={cls._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-[384px_1fr]">
                      {/* Thumbnail */}
                      <div className="p-4 md:p-5">
                        <CourseThumbnail
                          thumbnailUrl={cls.thumbnailUrl}
                          uid={cls.chapters[0]?.lessons[0]?.videoUrl}
                          title={cls.title}
                          locked={cls.isPremium && !userIsPremium && !isAdmin}
                          onClick={() => {
                            if (cls.chapters?.[0]?.lessons?.[0])
                              openLessonVideo(cls._id, 0, 0);
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="p-5 md:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="min-w-0">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate hover:text-udemy-purple cursor-default">
                              {cls.title}
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                              {cls.description}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              {cls.isPremium ? <PremiumPill /> : <FreePill />}
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-700"
                              >
                                {cls.chapters.reduce(
                                  (a, ch) => a + ch.lessons.length,
                                  0
                                )}{" "}
                                lessons
                              </Badge>
                            </div>
                          </div>
                          <div className="w-full sm:w-auto">
                            <div className="flex items-center justify-between sm:justify-end gap-3 text-sm">
                              <span className="text-gray-600">
                                {cls.progress ?? 0}%
                              </span>
                              <div className="w-40">
                                <ProgressBar percentage={cls.progress || 0} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Chapters & lessons */}
                        <div className="space-y-3" role="list">
                          {cls.chapters?.map((chapter, chIdx) => {
                            const key = `${cls._id}-${chIdx}`;
                            const isExpanded = !!expandedChapters[key];
                            const totalLessons = chapter.lessons.length;
                            const premiumLocked =
                              cls.isPremium && !userIsPremium && !isAdmin;

                            return (
                              <div
                                key={chIdx}
                                className="rounded-xl border border-gray-200"
                              >
                                <button
                                  onClick={() => toggleChapter(cls._id, chIdx)}
                                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                                  aria-expanded={isExpanded}
                                  aria-controls={`chapter-content-${key}`}
                                  role="button"
                                >
                                  <div className="flex items-center gap-3">
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-500" />
                                    )}
                                    <span className="font-medium text-gray-900 truncate">
                                      Chapter {chIdx + 1}: {chapter.title}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {totalLessons} lessons
                                  </span>
                                </button>

                                {isExpanded && (
                                  <div
                                    id={`chapter-content-${key}`}
                                    className="px-4 pb-3"
                                    role="region"
                                    aria-label={`Chapter ${chIdx + 1} lessons`}
                                  >
                                    <ScrollArea className="max-h-[38vh] pr-2">
                                      <div className="space-y-2 py-2" role="list">
                                        {chapter.lessons?.map(
                                          (lesson, lsIdx) => {
                                            const lessonLocked = premiumLocked;

                                            return (
                                              <LessonItem
                                                key={`${chIdx}-${lsIdx}`}
                                                locked={lessonLocked}
                                                index={lsIdx}
                                                lesson={lesson}
                                                onPlay={() =>
                                                  openLessonVideo(
                                                    cls._id,
                                                    chIdx,
                                                    lsIdx
                                                  )
                                                }
                                              />
                                            );
                                          }
                                        )}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Right: Quick stats / tips */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-gray-200">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Overview</h3>
              <div className="grid grid-cols-2 gap-4" role="list">
                {stats}
              </div>

              <Separator />
              <div className="text-sm text-gray-600">
                Tip: Use the search bar to quickly find a course. Expand chapters
                to jump right into any lesson.
              </div>
              {resumeTarget && (
                <Button
                  className="mt-2"
                  onClick={() =>
                    openLessonVideo(
                      resumeTarget.classId,
                      resumeTarget.chapterIdx,
                      resumeTarget.lessonIdx
                    )
                  }
                >
                  Resume &quot;{resumeTarget.title}&quot;
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-gray-200">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Quick Filters</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={tab === "all" ? "default" : "outline"}
                  onClick={() => setTab("all")}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={tab === "in-progress" ? "default" : "outline"}
                  onClick={() => setTab("in-progress")}
                >
                  In Progress
                </Button>
                <Button
                  size="sm"
                  variant={tab === "completed" ? "default" : "outline"}
                  onClick={() => setTab("completed")}
                >
                  Completed
                </Button>
              </div>
              <div className="md:hidden">
                <Input
                  placeholder="Search your courses"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search courses"
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2 flex-1"
                    onClick={() =>
                      setSortBy((s) => (s === "title" ? "progress" : "title"))
                    }
                    aria-label="Toggle sort"
                  >
                    <Filter className="w-4 h-4" /> Sort:{" "}
                    <span className="font-semibold capitalize">{sortBy}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Single global modal */}
      <VideoModal
        uid={selectedVideo?.uid}
        title={selectedVideo?.title}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------------
function findFirstPlayableLesson(
  data: ClassType[],
  userIsPremium: boolean,
  isAdmin: boolean
):
  | {
      classId: string;
      chapterIdx: number;
      lessonIdx: number;
      uid: string;
      title: string;
      description?: string;
      thumbnail?: string;
    }
  | null {
  for (const cls of data) {
    const locked = cls.isPremium && !userIsPremium && !isAdmin;
    if (locked) continue;
    for (let chIdx = 0; chIdx < (cls.chapters?.length || 0); chIdx++) {
      const chapter = cls.chapters[chIdx];
      for (let lsIdx = 0; lsIdx < (chapter.lessons?.length || 0); lsIdx++) {
        const lesson = chapter.lessons[lsIdx];
        if (lesson?.videoUrl) {
          return {
            classId: cls._id,
            chapterIdx: chIdx,
            lessonIdx: lsIdx,
            uid: lesson.videoUrl,
            title: lesson.title,
            description: lesson.description,
            thumbnail:
              lesson.thumbnail ||
              cls.thumbnailUrl ||
              getThumbnailUrl(lesson.videoUrl, 1, 120),
          };
        }
      }
    }
  }
  return null;
}