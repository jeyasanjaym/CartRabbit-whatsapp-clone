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

    let user = await User.findOne({ username });
    
    if (!user) {
      // Register new user automatically
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        username: username.trim(),
        password: hashedPassword,
      });
    } else {
      // Existing user - verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }

    return res.json({ 
      message: user.isNew ? "Registration successful" : "Login successful",
      user: { 
        _id: user._id, 
        username: user.username, 
        createdAt: user.createdAt 
      }
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Username already exists" });
    }
    return res.status(500).json({ error: "Authentication failed" });
  }
});

export default router;
