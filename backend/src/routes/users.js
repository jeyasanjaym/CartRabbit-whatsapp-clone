import { Router } from "express";
import User from "../models/User.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const raw = req.body?.username ?? req.body?.email;
    const username =
      typeof raw === "string" ? raw.trim() : String(raw ?? "").trim();

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(200).json({ user: existing });
    }

    const user = await User.create({ username });
    return res.status(201).json({ user });
  } catch (err) {
    if (err.code === 11000) {
      const u = await User.findOne({ username: String(req.body?.username ?? "").trim() });
      if (u) return res.status(200).json({ user: u });
      return res.status(409).json({ error: "Username already taken" });
    }
    console.error(err);
    return res.status(500).json({ error: "Failed to create user" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const users = await User.find().sort({ username: 1 }).lean();
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
