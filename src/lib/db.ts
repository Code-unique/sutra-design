import mongoose from "mongoose";

export const connectDB = async () => {
  console.log("Connecting to MongoDB..."); // ✅ Add this
  if (mongoose.connections[0].readyState) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error", error);
    process.exit(1);
  }
};
