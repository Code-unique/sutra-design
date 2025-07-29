// models/PremiumApplication.ts
import { Schema, model, models } from "mongoose";

const premiumApplicationSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }, // New phone field
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const PremiumApplication =
  models.PremiumApplication || model("PremiumApplication", premiumApplicationSchema);

export default PremiumApplication;
