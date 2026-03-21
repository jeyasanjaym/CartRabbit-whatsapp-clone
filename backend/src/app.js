import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import messagesRouter from "./routes/messages.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      credentials: true,
    })
  );
  
  app.use(express.json({ limit: '10mb' }));

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/messages", messagesRouter);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found", path: _req.path });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    console.error('Stack:', err.stack);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: err.message });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Duplicate Error', details: 'Resource already exists' });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message 
    });
  });

  return app;
}
