import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
      ref: 'User'
    },
    receiver: {
      type: String,
      required: true,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

messageSchema.index({ sender: 1, receiver: 1, timestamp: 1 });

export default mongoose.model("Message", messageSchema);
