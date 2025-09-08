// models/Class.ts
import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  // legacy videoUrl used by your UI: we store Cloudflare Stream UID here (not a YouTube URL)
  videoUrl: { type: String, default: "" }, // will hold stream UID
  posterTime: { type: Number, default: 1 }, // second for thumbnail generation
  // optionally store a custom poster URL if you want to upload your own thumbnail
  posterUrl: { type: String, default: "" },
});

const chapterSchema = new mongoose.Schema({
  title: String,
  lessons: [lessonSchema],
});

const classSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    isPremium: { type: Boolean, default: false },
    chapters: [chapterSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Class || mongoose.model("Class", classSchema);
