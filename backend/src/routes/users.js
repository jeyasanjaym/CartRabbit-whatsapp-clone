import { Router } from "express";
import User from "../models/User.js";
import Message from "../models/Message.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const currentUsername = req.query.currentUsername;
    const query = currentUsername ? { username: { $ne: currentUsername } } : {};
    const users = await User.find(query).sort({ username: 1 }).lean();

    const usersWithMeta = await Promise.all(
      users.map(async (u) => {
        if (!currentUsername) {
          return { ...u, lastMessage: null };
        }
        const lastMessage = await Message.findOne({
          $or: [
            { sender: currentUsername, receiver: u.username },
            { sender: u.username, receiver: currentUsername },
          ],
        })
          .sort({ timestamp: -1 })
          .lean();
        return { ...u, lastMessage };
      })
    );

    return res.json({ users: usersWithMeta });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/:username", async (req, res) => {
  try {
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({ error: "Invalid username" });
    }
    const user = await User.findOne({ username }).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
