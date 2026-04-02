import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const normalizedUsername = String(username).trim();
    if (!normalizedUsername) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    let user = await User.findOne({ username: normalizedUsername });
    let registered = false;

    if (!user) {
      // Register new user automatically
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        username: normalizedUsername,
        password: hashedPassword,
      });
      registered = true;
    } else {
      // Existing user - verify password (invalid/corrupt hash must not become a 500)
      let isPasswordValid = false;
      try {
        isPasswordValid = await bcrypt.compare(password, user.password);
      } catch (compareErr) {
        console.error("bcrypt.compare failed:", compareErr.message);
        return res.status(401).json({
          error:
            "Invalid credentials. If this account is old test data, try another username or reset the user in MongoDB.",
        });
      }
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }

    const payload = {
      message: registered ? "Registration successful" : "Login successful",
      user: {
        _id: String(user._id),
        username: user.username,
        createdAt: user.createdAt
          ? new Date(user.createdAt).toISOString()
          : undefined,
      },
    };
    return res.json(payload);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const hint =
      process.env.NODE_ENV === "production"
        ? "Authentication failed"
        : error.message || "Authentication failed";
    return res.status(500).json({ error: "Authentication failed", details: hint });
  }
});

export default router;
