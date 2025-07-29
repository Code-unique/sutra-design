// models/Class.ts
import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,
  description: String,
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
