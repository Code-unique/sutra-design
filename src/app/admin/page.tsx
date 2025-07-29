"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2Icon, PlusIcon } from "lucide-react";

interface Lesson {
  title: string;
  description: string;
  videoUrl: string;
}

interface Chapter {
  title: string;
  lessons: Lesson[];
}

interface Class {
  _id: string;
  title: string;
  description: string;
  isPremium: boolean;
  chapters: Chapter[];
}

export default function AdminPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [form, setForm] = useState<Omit<Class, "_id">>({
    title: "",
    description: "",
    isPremium: false,
    chapters: [
      {
        title: "",
        lessons: [{ title: "", description: "", videoUrl: "" }],
      },
    ],
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const res = await axios.get<Class[]>("/api/class/all");
    setClasses(res.data);
  };

  const handleCreate = async () => {
    await axios.post("/api/class/create", form);
    setForm({
      title: "",
      description: "",
      isPremium: false,
      chapters: [
        {
          title: "",
          lessons: [{ title: "", description: "", videoUrl: "" }],
        },
      ],
    });
    fetchClasses();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`/api/class/delete/${id}`);
    fetchClasses();
  };

  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-pink-700">Admin Panel — Sutra Designing</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-pink-600">Create Advanced Class</h2>
          <Input
            placeholder="Class Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            placeholder="Class Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex items-center gap-4">
            <Label>Premium?</Label>
            <Switch
              checked={form.isPremium}
              onCheckedChange={(val) => setForm({ ...form, isPremium: val })}
            />
          </div>

          {/* Chapters */}
          {form.chapters.map((chapter, chIdx) => (
            <div key={chIdx} className="border p-4 rounded-lg space-y-4 bg-pink-50">
              <Input
                placeholder={`Chapter ${chIdx + 1} Title`}
                value={chapter.title}
                onChange={(e) => {
                  const chapters = [...form.chapters];
                  chapters[chIdx].title = e.target.value;
                  setForm({ ...form, chapters });
                }}
              />
              {/* Lessons */}
              {chapter.lessons.map((lesson, lsIdx) => (
                <div key={lsIdx} className="border p-3 rounded bg-white space-y-2">
                  <Input
                    placeholder="Lesson Title"
                    value={lesson.title}
                    onChange={(e) => {
                      const chapters = [...form.chapters];
                      chapters[chIdx].lessons[lsIdx].title = e.target.value;
                      setForm({ ...form, chapters });
                    }}
                  />
                  <Textarea
                    placeholder="Lesson Description"
                    value={lesson.description}
                    onChange={(e) => {
                      const chapters = [...form.chapters];
                      chapters[chIdx].lessons[lsIdx].description = e.target.value;
                      setForm({ ...form, chapters });
                    }}
                  />
                  <Input
                    placeholder="Lesson Video URL"
                    value={lesson.videoUrl}
                    onChange={(e) => {
                      const chapters = [...form.chapters];
                      chapters[chIdx].lessons[lsIdx].videoUrl = e.target.value;
                      setForm({ ...form, chapters });
                    }}
                  />
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => {
                  const chapters = [...form.chapters];
                  chapters[chIdx].lessons.push({ title: "", description: "", videoUrl: "" });
                  setForm({ ...form, chapters });
                }}
              >
                <PlusIcon className="w-4 h-4 mr-2" /> Add Lesson
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={() =>
              setForm({
                ...form,
                chapters: [...form.chapters, { title: "", lessons: [{ title: "", description: "", videoUrl: "" }] }],
              })
            }
          >
            <PlusIcon className="w-4 h-4 mr-2" /> Add Chapter
          </Button>

          <Button onClick={handleCreate} className="bg-pink-600 hover:bg-pink-700 w-full mt-4">
            Submit Class
          </Button>
        </CardContent>
      </Card>

      {/* CLASS LIST */}
      <div className="space-y-4">
        {classes.map((cls) => (
          <Card key={cls._id}>
            <CardContent className="p-4 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{cls.title}</h3>
                <p className="text-sm text-muted-foreground">{cls.description}</p>
                <p className="text-xs text-green-600 mt-1">
                  Access: {cls.isPremium ? "Premium 🔐" : "Free 🌐"}
                </p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(cls._id)}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
