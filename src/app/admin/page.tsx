"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2Icon, PlusIcon, EditIcon, XIcon } from "lucide-react";

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

  const [editId, setEditId] = useState<string | null>(null); // Track which class is being edited

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const res = await axios.get<Class[]>("/api/class/all");
    setClasses(res.data);
  };

  const resetForm = () => {
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
    setEditId(null);
  };

  const handleCreate = async () => {
    await axios.post("/api/class/create", form);
    resetForm();
    fetchClasses();
  };

  const handleUpdate = async () => {
    if (!editId) return;
    await axios.patch(`/api/class/update/${editId}`, form);
    resetForm();
    fetchClasses();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`/api/class/delete/${id}`);
    // If deleting the currently edited item, reset form
    if (editId === id) resetForm();
    fetchClasses();
  };

  const handleEdit = (cls: Class) => {
    setForm({
      title: cls.title,
      description: cls.description,
      isPremium: cls.isPremium,
      chapters: cls.chapters.length > 0 ? cls.chapters : [{ title: "", lessons: [{ title: "", description: "", videoUrl: "" }] }],
    });
    setEditId(cls._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-pink-700">Admin Panel — Sutra Designing</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-pink-600">
            {editId ? "Edit Class" : "Create Advanced Class"}
          </h2>

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

          {editId ? (
            <div className="flex gap-4 mt-4">
              <Button
                onClick={handleUpdate}
                className="bg-pink-600 hover:bg-pink-700 flex-1"
              >
                Update Class
              </Button>
              <Button
  onClick={resetForm}
  variant="outline"
  className="flex-1 flex items-center justify-center gap-2"
>
  <XIcon className="w-4 h-4" />
  Cancel
</Button>

            </div>
          ) : (
            <Button
              onClick={handleCreate}
              className="bg-pink-600 hover:bg-pink-700 w-full mt-4"
            >
              Submit Class
            </Button>
          )}
        </CardContent>
      </Card>

      {/* CLASS LIST */}
      <div className="space-y-4">
        {classes.map((cls) => (
          <Card key={cls._id}>
            <CardContent className="p-4 flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{cls.title}</h3>
                <p className="text-sm text-muted-foreground">{cls.description}</p>
                <p className="text-xs text-green-600 mt-1">
                  Access: {cls.isPremium ? "Premium 🔐" : "Free 🌐"}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(cls)}
                  aria-label={`Edit class ${cls.title}`}
                >
                  <EditIcon className="h-4 w-4" />
                </Button>

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(cls._id)}
                  aria-label={`Delete class ${cls.title}`}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
