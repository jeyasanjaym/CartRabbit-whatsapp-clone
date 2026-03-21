import { Router } from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;

    if (!sender || !receiver || !text) {
      return res.status(400).json({ error: "sender, receiver, and text are required" });
    }

    if (sender === receiver) {
      return res.status(400).json({ error: "Cannot message yourself" });
    }

    const [senderUser, receiverUser] = await Promise.all([
      User.findOne({ username: sender }),
      User.findOne({ username: receiver }),
    ]);
    if (!senderUser || !receiverUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const message = await Message.create({
      sender,
      receiver,
      text: text.trim(),
    });

    req.app.locals.emitNewMessage?.(message.toObject());
    return res.status(201).json({ message });
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
    const messages = await Message.find({
      $or: [
        { sender: userA, receiver: userB },
        { sender: userB, receiver: userA },
      ],
    })
      .sort({ timestamp: 1 })
      .lean();

    return res.json({ messages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
