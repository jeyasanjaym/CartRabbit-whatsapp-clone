import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Number, default: 999 },
  },
  { versionKey: false }
);

export default mongoose.model("Counter", counterSchema);
