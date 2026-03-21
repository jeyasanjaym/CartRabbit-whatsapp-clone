import { Router } from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body ?? {};
    const text = typeof content === "string" ? content.trim() : "";

    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ error: "senderId and receiverId are required" });
    }
    if (!mongoose.isValidObjectId(senderId) || !mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    if (senderId === receiverId) {
      return res.status(400).json({ error: "Cannot message yourself" });
    }
    if (!text) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId),
    ]);
    if (!sender || !receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: text,
    });

    const populated = await Message.findById(message._id)
      .populate("sender", "username")
      .populate("receiver", "username")
      .lean();

    req.app.locals.emitNewMessage?.(populated);

    return res.status(201).json({ message: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { userA, userB } = req.query;
    if (!userA || !userB) {
      return res.status(400).json({ error: "userA and userB query params required" });
    }
    if (!mongoose.isValidObjectId(userA) || !mongoose.isValidObjectId(userB)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const messages = await Message.find({
      $or: [
        { sender: userA, receiver: userB },
        { sender: userB, receiver: userA },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username")
      .populate("receiver", "username")
      .lean();

    return res.json({ messages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
