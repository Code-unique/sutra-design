"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2Icon, PlusIcon, EditIcon, XIcon, Upload, ImageIcon, VideoIcon } from "lucide-react";
import Image from "next/image";

interface Lesson {
  title: string;
  description: string;
  videoUrl: string; // Cloudflare uid after upload
  posterTime?: number;
  posterUrl?: string;
}

interface Chapter {
  title: string;
  lessons: Lesson[];
}

interface Class {
  _id?: string;
  title: string;
  description: string;
  isPremium: boolean;
  thumbnailUrl?: string;
  chapters: Chapter[];
}

export default function AdminPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [form, setForm] = useState<Class>({
    title: "",
    description: "",
    isPremium: false,
    thumbnailUrl: "",
    chapters: [{ title: "", lessons: [{ title: "", description: "", videoUrl: "" }] }],
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    fetchClasses(); 
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Class[]>("/api/class/all");
      setClasses(res.data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      alert("Failed to fetch classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      isPremium: false,
      thumbnailUrl: "",
      chapters: [{ title: "", lessons: [{ title: "", description: "", videoUrl: "" }] }],
    });
    setEditId(null);
    setUploadProgress({});
    setThumbnailUploading(false);
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      await axios.post("/api/class/create", form);
      resetForm();
      fetchClasses();
      alert("Class created successfully!");
    } catch (error) {
      console.error("Failed to create class:", error);
      alert("Failed to create class. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editId) return;
    try {
      setLoading(true);
      await axios.patch(`/api/class/update/${editId}`, form);
      resetForm();
      fetchClasses();
      alert("Class updated successfully!");
    } catch (error) {
      console.error("Failed to update class:", error);
      alert("Failed to update class. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    
    try {
      setLoading(true);
      await axios.delete(`/api/class/delete/${id}`);
      if (editId === id) resetForm();
      fetchClasses();
      alert("Class deleted successfully!");
    } catch (error) {
      console.error("Failed to delete class:", error);
      alert("Failed to delete class. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cls: Class) => {
    setForm({
      title: cls.title,
      description: cls.description,
      isPremium: cls.isPremium,
      thumbnailUrl: cls.thumbnailUrl || "",
      chapters: cls.chapters.length ? cls.chapters : [{ title: "", lessons: [{ title: "", description: "", videoUrl: "" }] }],
    });
    setEditId(cls._id || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file");
      return;
    }

    setThumbnailUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await axios.post("/api/upload/thumbnail", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || file.size)
          );
          setUploadProgress(prev => ({ ...prev, thumbnail: percent }));
        },
      });
      
      setForm({ ...form, thumbnailUrl: response.data.url });
      alert("Thumbnail uploaded successfully!");
    } catch (error) {
      console.error("Thumbnail upload failed:", error);
      alert("Thumbnail upload failed. Please try again.");
    } finally {
      setThumbnailUploading(false);
    }
  };

  // Handle video upload
  const handleFileSelect = async (file: File, chapterIdx: number, lessonIdx: number) => {
    const upKey = `video-${chapterIdx}-${lessonIdx}`;
    
    // Reset progress for this upload
    setUploadProgress(prev => ({ ...prev, [upKey]: 0 }));
    
    try {
      // Step 1: Get direct upload info
      const meta = { filename: file.name, contentType: file.type, filesize: file.size };
      const res = await fetch("/api/stream/direct-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meta),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Direct upload creation failed");
      }
      
      const data = await res.json();
      const { uploadURL, uid } = data;

      // Step 2: Upload directly to Cloudflare with PUT
await axios.put(uploadURL, file, {
  headers: {
    "Content-Type": file.type || "application/octet-stream",
  },
  onUploadProgress: (progressEvent) => {
    if (progressEvent.total) {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      setUploadProgress(prev => ({ ...prev, [upKey]: percent }));
    }
  },
});


      // Step 3: Set video URL in form
      const chapters = [...form.chapters];
      chapters[chapterIdx].lessons[lessonIdx].videoUrl = uid;
      setForm({ ...form, chapters });

      // Step 4: Ensure progress bar reaches 100%
      setUploadProgress(prev => ({ ...prev, [upKey]: 100 }));
      console.log("✅ Upload complete:", uid);
      alert("Video uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + (err instanceof Error ? err.message : String(err)));
      setUploadProgress(prev => ({ ...prev, [upKey]: 0 })); // reset on fail
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sutra Design Admin Dashboard</h1>
          <p className="text-gray-600">Manage your courses and content</p>
        </div>

        {/* Class Form */}
        <Card className="rounded-lg border border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editId ? "Edit Class" : "Create New Class"}
              </h2>
              {editId && (
                <Button 
                  onClick={resetForm} 
                  variant="outline" 
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <XIcon className="w-4 h-4" /> Cancel Edit
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Class Title</Label>
                  <Input 
                    id="title"
                    placeholder="e.g., Introduction to Sutra Design" 
                    value={form.title} 
                    onChange={(e) => setForm({ ...form, title: e.target.value })} 
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    placeholder="Describe what students will learn in this class..." 
                    value={form.description} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                    rows={4}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    id="premium" 
                    checked={form.isPremium} 
                    onCheckedChange={(val) => setForm({ ...form, isPremium: val })} 
                    disabled={loading}
                  />
                  <Label htmlFor="premium" className="cursor-pointer">
                    Premium Class
                  </Label>
                  {form.isPremium && (
                    <span className="text-xs bg-purple-100 text-udemy-purple px-2 py-1 rounded-full">
                      🔐 Premium
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Course Thumbnail</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {form.thumbnailUrl ? (
                      <div className="space-y-2">
                        <div className="relative w-full h-32 mx-auto rounded-md overflow-hidden">
                          <Image
                            src={form.thumbnailUrl}
                            alt="Course thumbnail"
                            fill
                            style={{ objectFit: "cover" }}
                            onError={(e) => {
                              // Fallback if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = "/default-thumbnail.jpg";
                            }}
                          />
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setForm({...form, thumbnailUrl: ""})}
                          disabled={loading}
                        >
                          Remove Thumbnail
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleThumbnailUpload(file);
                          }}
                          disabled={loading || thumbnailUploading}
                        />
                        <div className="space-y-2">
                          <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
                          <p className="text-sm text-gray-500">
                            {thumbnailUploading ? "Uploading..." : "Click to upload thumbnail"}
                          </p>
                          {uploadProgress.thumbnail > 0 && uploadProgress.thumbnail < 100 && (
                            <div className="w-full bg-gray-200 h-2 rounded mt-2 overflow-hidden">
                              <div 
                                style={{ width: `${uploadProgress.thumbnail}%` }} 
                                className="h-full bg-udemy-purple transition-all duration-300" 
                              />
                            </div>
                          )}
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chapters and Lessons */}
            <div className="space-y-6 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Course Content</h3>
              
              {form.chapters.map((chapter, chIdx) => (
                <div key={chIdx} className="border border-gray-200 p-5 rounded-lg space-y-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Chapter {chIdx + 1}</h4>
                    {form.chapters.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const chapters = [...form.chapters];
                          chapters.splice(chIdx, 1);
                          setForm({ ...form, chapters });
                        }}
                        disabled={loading}
                      >
                        <Trash2Icon className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  
                  <Input 
                    placeholder="Chapter Title" 
                    value={chapter.title} 
                    onChange={(e) => {
                      const chapters = [...form.chapters]; 
                      chapters[chIdx].title = e.target.value; 
                      setForm({ ...form, chapters });
                    }} 
                    disabled={loading}
                  />

                  {chapter.lessons.map((lesson, lsIdx) => {
                    const upKey = `video-${chIdx}-${lsIdx}`;
                    const pct = uploadProgress[upKey] || 0;
                    const isUploading = pct > 0 && pct < 100;
                    
                    return (
                      <div key={lsIdx} className="border p-4 rounded bg-white space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-gray-700">Lesson {lsIdx + 1}</h5>
                          {chapter.lessons.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const chapters = [...form.chapters];
                                chapters[chIdx].lessons.splice(lsIdx, 1);
                                setForm({ ...form, chapters });
                              }}
                              disabled={loading || isUploading}
                            >
                              <Trash2Icon className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                        
                        <Input 
                          placeholder="Lesson Title" 
                          value={lesson.title} 
                          onChange={(e) => {
                            const chapters = [...form.chapters]; 
                            chapters[chIdx].lessons[lsIdx].title = e.target.value; 
                            setForm({ ...form, chapters });
                          }} 
                          disabled={loading || isUploading}
                        />
                        
                        <Textarea 
                          placeholder="Lesson Description" 
                          value={lesson.description} 
                          onChange={(e) => {
                            const chapters = [...form.chapters]; 
                            chapters[chIdx].lessons[lsIdx].description = e.target.value; 
                            setForm({ ...form, chapters });
                          }} 
                          rows={2}
                          disabled={loading || isUploading}
                        />

                        <div className="space-y-2">
                          <Label>Video Content {isUploading && `(Uploading ${pct}%)`}</Label>
                          <div className="flex items-center gap-3">
                            <label className={`flex items-center gap-2 px-3 py-2 border rounded-md text-sm cursor-pointer ${isUploading ? 'bg-gray-100 border-gray-300 text-gray-400' : 'border-gray-300 hover:bg-gray-50'}`}>
                              <Upload className="w-4 h-4" />
                              <span>{isUploading ? 'Uploading...' : 'Upload Video'}</span>
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(ev) => {
                                  const file = ev.target.files?.[0];
                                  if (!file) return;
                                  handleFileSelect(file, chIdx, lsIdx);
                                }}
                                disabled={loading || isUploading}
                              />
                            </label>

                            <div className="flex-1 min-w-0">
                              {lesson.videoUrl ? (
                                <div className="text-xs text-green-600 flex items-center gap-1">
                                  <VideoIcon className="w-3 h-3" />
                                  <span>Uploaded: {lesson.videoUrl.substring(0, 8)}...</span>
                                </div>
                              ) : pct === 0 ? (
                                <div className="text-xs text-gray-500">No video uploaded</div>
                              ) : null}
                              
                              {/* Progress bar - always show when uploading */}
                              {pct > 0 && (
                                <div className="w-full bg-gray-200 h-2 rounded mt-2 overflow-hidden">
                                  <div 
                                    style={{ width: `${pct}%` }} 
                                    className="h-full bg-udemy-purple transition-all duration-300" 
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const chapters = [...form.chapters];
                      chapters[chIdx].lessons.push({ title: "", description: "", videoUrl: "" });
                      setForm({ ...form, chapters });
                    }}
                    className="w-full"
                    disabled={loading}
                  >
                    <PlusIcon className="w-4 h-4 mr-2" /> Add Lesson
                  </Button>
                </div>
              ))}

              <Button 
                variant="outline" 
                onClick={() => setForm({
                  ...form,
                  chapters: [...form.chapters, { title: "", lessons: [{ title: "", description: "", videoUrl: "" }] }],
                })}
                className="w-full"
                disabled={loading}
              >
                <PlusIcon className="w-4 h-4 mr-2" /> Add Chapter
              </Button>
            </div>

            {/* Submit Buttons */}
            <div className="pt-4 border-t border-gray-200">
              {editId ? (
                <div className="flex gap-4">
                  <Button 
                    onClick={handleUpdate} 
                    className="bg-udemy-purple hover:bg-udemy-purple-dark flex-1"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Class"}
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleCreate} 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Class"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Class List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Classes</h2>
          
          {loading ? (
            <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">Loading classes...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No classes created yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {classes.map((cls) => (
                <Card key={cls._id} className="rounded-lg border border-gray-200 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-40 h-32 sm:h-auto flex-shrink-0 relative">
                        {cls.thumbnailUrl ? (
                          <Image
                            src={cls.thumbnailUrl}
                            alt={cls.title}
                            fill
                            style={{ objectFit: "cover" }}
                            onError={(e) => {
                              // Fallback if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = "/default-thumbnail.jpg";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 p-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{cls.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{cls.description}</p>
                          <div className="flex items-center mt-2 gap-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              cls.isPremium 
                                ? "bg-purple-100 text-udemy-purple" 
                                : "bg-green-100 text-green-800"
                            }`}>
                              {cls.isPremium ? "Premium" : "Free"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {cls.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)} lessons
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 self-end sm:self-auto">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(cls)}
                            className="h-9 w-9 p-0"
                            disabled={loading}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => cls._id && handleDelete(cls._id)}
                            className="h-9 w-9 p-0 text-red-500 border-red-200 hover:bg-red-50"
                            disabled={loading}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}